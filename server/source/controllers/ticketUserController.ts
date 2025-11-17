import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, Role, TicketEstado, Prioridad, ModoAsignacion } from "../../generated/prisma";

export class TicketUserController {
  prisma = new PrismaClient();

  private calcularTiempoRestante(fechaLimite: Date): number {
    const ahora = new Date();
    const diffMs = fechaLimite.getTime() - ahora.getTime();
    const diffHoras = diffMs / (1000 * 60 * 60);
    return Math.round(diffHoras * 10) / 10;
  }

  private async generarConsecutivo(): Promise<string> {
    const anioActual = new Date().getFullYear();

    const secuencia = await this.prisma.secuenciaConsecutivo.upsert({
      where: { anio: anioActual },
      update: {
        ultimoConsecutivo: {
          increment: 1
        }
      },
      create: {
        anio: anioActual,
        ultimoConsecutivo: 1
      }
    });

    return `TKT-${anioActual}-${secuencia.ultimoConsecutivo.toString().padStart(6, '0')}`;
  }

  private calcularFechasSLAs(fechaCreacion: Date, categoria: any): { fechaLimiteRespuesta: Date | null, fechaLimiteResolucion: Date | null } {
    let fechaLimiteRespuesta: Date | null = null;
    let fechaLimiteResolucion: Date | null = null;

    if (categoria?.slaTiempoMaxRespuestaMin) {
      fechaLimiteRespuesta = new Date(fechaCreacion.getTime() + categoria.slaTiempoMaxRespuestaMin * 60000);
    }

    if (categoria?.slaTiempoMaxResolucionMin) {
      fechaLimiteResolucion = new Date(fechaCreacion.getTime() + categoria.slaTiempoMaxResolucionMin * 60000);
    }

    return { fechaLimiteRespuesta, fechaLimiteResolucion };
  }

  private formatearTodosLosTickets(tickets: any[]) {
    const ahora = new Date();

    return tickets.map(ticket => {
      const asignacionActiva = ticket.asignaciones && ticket.asignaciones.length > 0
        ? ticket.asignaciones[0]
        : null;

      let tiempoRestanteSLAHoras = null;
      if (ticket.fechaLimiteResolucion) {
        const diff = ticket.fechaLimiteResolucion.getTime() - ahora.getTime();
        tiempoRestanteSLAHoras = Math.ceil(diff / (1000 * 3600));
      }

      let colorUrgencia = 'info';
      if (tiempoRestanteSLAHoras !== null) {
        if (tiempoRestanteSLAHoras < 24) {
          colorUrgencia = 'danger';
        } else if (tiempoRestanteSLAHoras < 72) {
          colorUrgencia = 'warning';
        } else {
          colorUrgencia = 'success';
        }
      }

      const categoriaNombre = ticket.categoria?.nombre || "General";

      const iconosCategoria: { [key: string]: string } = {
        'Hardware': 'bi-cpu',
        'Software': 'bi-window',
        'Red': 'bi-wifi',
        'Sistema': 'bi-gear',
        'General': 'bi-ticket-perforated'
      };

      const icono = iconosCategoria[categoriaNombre] || 'bi-ticket-perforated';

      return {
        id: ticket.id,
        asignacionId: asignacionActiva?.id || null,
        consecutivo: ticket.consecutivo,
        titulo: ticket.titulo,
        categoria: categoriaNombre,
        estado: ticket.estado,
        prioridad: ticket.prioridad,
        tiempoRestanteSLAHoras: tiempoRestanteSLAHoras,
        fechaLimiteResolucion: ticket.fechaLimiteResolucion,
        fechaAsignacion: asignacionActiva?.fechaAsignacion || null,
        fechaCreacion: ticket.fechaCreacion,
        fechaActualizacion: ticket.fechaActualizacion,
        colorUrgencia: colorUrgencia,
        iconoCategoria: icono,
        solicitante: ticket.solicitante?.nombre || "Sin solicitante",
        solicitanteEmail: ticket.solicitante?.correo || "Sin email",
        tecnico: asignacionActiva?.tecnico?.nombre || "Sin asignar",
        tecnicoEmail: asignacionActiva?.tecnico?.correo || "N/A",
        tieneAsignacion: !!asignacionActiva,
        modoAsignacion: ticket.modoAsignacion,
        descripcion: ticket.descripcion,
        slaRespuesta: ticket.categoria?.slaTiempoMaxRespuestaMin,
        slaResolucion: ticket.categoria?.slaTiempoMaxResolucionMin,
        eliminadoLogico: ticket.eliminadoLogico
      };
    });
  }

  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const userRole = request.headers['user-role'] as string;

      let whereCondition: any = { eliminadoLogico: false };

      switch (userRole) {
        case 'ADM':
          break;
        case 'USR':
          const userId = parseInt(request.headers['user-id'] as string);
          if (isNaN(userId)) {
            return next(AppError.badRequest("Se requiere user-id válido para rol USR"));
          }
          whereCondition.solicitanteId = userId;
          break;
        case 'TEC':
          return next(AppError.badRequest("Se requiere user-id para rol TEC"));
        default:
          return next(AppError.badRequest("Rol no válido"));
      }

      const {
        search = '',
        categoria = '',
        estado = '',
        prioridad = '',
        page = '1',
        limit = '5',
        sortBy = 'fechaCreacion',
        sortOrder = 'desc'
      } = request.query;

      if (search && search !== '') {
        whereCondition.OR = [
          { consecutivo: { contains: search } },
          { titulo: { contains: search } },
          {
            categoria: {
              nombre: { contains: search }
            }
          },
          {
            solicitante: {
              nombre: { contains: search }
            }
          }
        ];
      }

      if (categoria && categoria !== '') {
        whereCondition.categoria = {
          nombre: categoria
        };
      }

      if (estado && estado !== '') {
        whereCondition.estado = estado;
      }

      if (prioridad && prioridad !== '') {
        whereCondition.prioridad = prioridad;
      }

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
      const skip = (pageNum - 1) * limitNum;

      const orderBy: any = {};
      if (sortBy === 'fechaCreacion') {
        orderBy.fechaCreacion = sortOrder;
      } else if (sortBy === 'consecutivo') {
        orderBy.consecutivo = sortOrder;
      } else if (sortBy === 'prioridad') {
        orderBy.prioridad = sortOrder;
      } else if (sortBy === 'estado') {
        orderBy.estado = sortOrder;
      } else {
        orderBy.fechaCreacion = 'desc';
      }

      const [tickets, totalCount] = await Promise.all([
        this.prisma.ticket.findMany({
          where: whereCondition,
          orderBy: orderBy,
          skip: skip,
          take: limitNum,
          select: {
            id: true,
            consecutivo: true,
            titulo: true,
            estado: true,
            prioridad: true,
            fechaCreacion: true,
            fechaActualizacion: true,
            fechaLimiteResolucion: true,
            modoAsignacion: true,
            descripcion: true,
            eliminadoLogico: true,
            categoria: {
              select: {
                nombre: true,
                slaTiempoMaxRespuestaMin: true,
                slaTiempoMaxResolucionMin: true
              }
            },
            solicitante: {
              select: {
                nombre: true,
                correo: true
              }
            },
            asignaciones: {
              where: {
                activo: true
              },
              include: {
                tecnico: {
                  select: {
                    nombre: true,
                    correo: true
                  }
                }
              },
              take: 1
            },
            valoracion: {
              select: {
                puntuacion: true,
                comentario: true
              }
            }
          }
        }),
        this.prisma.ticket.count({
          where: whereCondition
        })
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      const resultado = {
        tickets: this.formatearTodosLosTickets(tickets),
        pagination: {
          currentPage: pageNum,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        filters: {
          search,
          categoria,
          estado,
          prioridad,
          sortBy,
          sortOrder
        }
      };

      response.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      let idTicket = parseInt(request.params.id)
      if (isNaN(idTicket)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const objTicket = await this.prisma.ticket.findFirst({
        where: {
          id: idTicket,
          eliminadoLogico: false
        },
        include: {
          solicitante: {
            select: {
              id: true,
              nombre: true,
              correo: true
            }
          },
          categoria: {
            include: {
              categoriaEtiquetas: {
                include: {
                  etiqueta: true
                }
              }
            }
          },
          asignaciones: {
            where: {
              activo: true
            },
            include: {
              tecnico: {
                select: {
                  nombre: true,
                  correo: true
                }
              }
            }
          },
          historial: {
            include: {
              usuario: {
                select: {
                  nombre: true
                }
              }
            },
            orderBy: {
              creadoEn: 'desc'
            }
          },
          valoracion: {
            include: {
              usuario: {
                select: {
                  nombre: true,
                  correo: true
                }
              }
            }
          },
          imagenes: true
        }
      })

      if (objTicket) {
        const diasResolucion = objTicket.fechaCierre ?
          Math.ceil((objTicket.fechaCierre.getTime() - objTicket.fechaCreacion.getTime()) / (1000 * 3600 * 24)) : null;

        const cumplimientoRespuesta = objTicket.fechaRespuesta && objTicket.fechaLimiteRespuesta ?
          objTicket.fechaRespuesta <= objTicket.fechaLimiteRespuesta : null;

        const cumplimientoResolucion = objTicket.fechaCierre && objTicket.fechaLimiteResolucion ?
          objTicket.fechaCierre <= objTicket.fechaLimiteResolucion : null;

        const tecnicoAsignado = objTicket.asignaciones.length > 0 ? objTicket.asignaciones[0].tecnico : null;

        const ahora = new Date();
        let tiempoRestanteSLAHoras = null;
        if (objTicket.fechaLimiteResolucion) {
          const diff = objTicket.fechaLimiteResolucion.getTime() - ahora.getTime();
          tiempoRestanteSLAHoras = Math.ceil(diff / (1000 * 3600));
        }

        const ticketCompleto = {
          ...objTicket,
          diasResolucion,
          cumplimientoRespuesta,
          cumplimientoResolucion,
          tecnicoAsignado,
          tiempoRestanteSLAHoras,
          slaRespuesta: objTicket.categoria?.slaTiempoMaxRespuestaMin,
          slaResolucion: objTicket.categoria?.slaTiempoMaxResolucionMin,
          modoAsignacion: objTicket.modoAsignacion,
          etiquetas: objTicket.categoria?.categoriaEtiquetas?.map(ce => ce.etiqueta) || []
        }

        response.status(200).json(ticketCompleto)
      } else {
        next(AppError.notFound("No existe el ticket"))
      }

    } catch (error: any) {
      next(error)
    }
  };

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;
      const userId = parseInt(request.headers['user-id'] as string);

      if (isNaN(userId)) {
        return next(AppError.badRequest("User ID no válido"));
      }

      const categoriaId = parseInt(body.categoriaId);
      const etiquetaId = parseInt(body.etiquetaId);

      if (isNaN(categoriaId)) {
        return next(AppError.badRequest("El ID de categoría no es válido"));
      }

      if (isNaN(etiquetaId)) {
        return next(AppError.badRequest("El ID de etiqueta no es válido"));
      }

      if (!body.titulo) {
        return next(AppError.badRequest("El título es requerido"));
      }

      if (!categoriaId) {
        return next(AppError.badRequest("La categoría es requerida"));
      }

      if (!etiquetaId) {
        return next(AppError.badRequest("La etiqueta es requerida"));
      }

      const usuario = await this.prisma.usuario.findFirst({
        where: {
          id: userId,
          activo: true
        }
      });

      if (!usuario) {
        return next(AppError.badRequest("El usuario solicitante no existe o no está activo"));
      }

      const categoria = await this.prisma.categoria.findFirst({
        where: {
          id: categoriaId, 
          activa: true
        }
      });

      if (!categoria) {
        return next(AppError.badRequest("La categoría seleccionada no existe o no está activa"));
      }

      const etiquetaCategoria = await this.prisma.categoriaEtiqueta.findFirst({
        where: {
          categoriaId: categoriaId, 
          etiquetaId: etiquetaId    
        },
        include: {
          etiqueta: true
        }
      });

      if (!etiquetaCategoria) {
        return next(AppError.badRequest("La etiqueta seleccionada no existe o no pertenece a la categoría"));
      }

      const consecutivo = await this.generarConsecutivo();

      const fechaCreacion = new Date();
      const { fechaLimiteRespuesta, fechaLimiteResolucion } = this.calcularFechasSLAs(fechaCreacion, categoria);

      const newTicket = await this.prisma.ticket.create({
        data: {
          consecutivo,
          titulo: body.titulo,
          descripcion: body.descripcion,
          solicitanteId: userId,
          categoriaId: categoriaId, 
          prioridad: body.prioridad || Prioridad.MEDIO,
          fechaLimiteRespuesta,
          fechaLimiteResolucion
        },
        include: {
          solicitante: {
            select: {
              nombre: true,
              correo: true
            }
          },
          categoria: {
            include: {
              categoriaEtiquetas: {
                include: {
                  etiqueta: true
                }
              }
            }
          },
          asignaciones: {
            where: {
              activo: true
            },
            include: {
              tecnico: {
                select: {
                  nombre: true,
                  correo: true
                }
              }
            }
          },
          historial: {
            include: {
              usuario: {
                select: {
                  nombre: true
                }
              }
            }
          },
          valoracion: true,
          imagenes: true
        }
      });

      await this.prisma.ticketHistorial.create({
        data: {
          ticketId: newTicket.id,
          estadoDestino: TicketEstado.PENDIENTE,
          usuarioId: userId,
          observaciones: 'Ticket creado'
        }
      });

      const ticketCompleto = {
        ...newTicket,
        diasResolucion: null,
        cumplimientoRespuesta: null,
        cumplimientoResolucion: null,
        tecnicoAsignado: null,
        tiempoRestanteSLAHoras: this.calcularTiempoRestante(newTicket.fechaLimiteResolucion || new Date()),
        slaRespuesta: categoria.slaTiempoMaxRespuestaMin,
        slaResolucion: categoria.slaTiempoMaxResolucionMin,
        modoAsignacion: newTicket.modoAsignacion,
        etiquetas: newTicket.categoria?.categoriaEtiquetas?.map(ce => ce.etiqueta) || []
      };

      response.status(201).json(ticketCompleto);
    } catch (error) {
      console.error("Error creando ticket:", error);
      next(error);
    }
  };

  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;
      const ticketId = parseInt(request.params.id);
      const userId = parseInt(request.headers['user-id'] as string);

      if (isNaN(ticketId)) {
        return next(AppError.badRequest("El ID del ticket no es válido"));
      }

      if (isNaN(userId)) {
        return next(AppError.badRequest("User ID no válido"));
      }

      const categoriaId = parseInt(body.categoriaId);
      const etiquetaId = parseInt(body.etiquetaId);

      if (isNaN(categoriaId)) {
        return next(AppError.badRequest("El ID de categoría no es válido"));
      }

      if (isNaN(etiquetaId)) {
        return next(AppError.badRequest("El ID de etiqueta no es válido"));
      }

      const ticketExistente = await this.prisma.ticket.findFirst({
        where: {
          id: ticketId,
          eliminadoLogico: false
        },
        include: {
          categoria: true
        }
      });

      if (!ticketExistente) {
        return next(AppError.notFound("No existe el ticket"));
      }

      if (!body.titulo) {
        return next(AppError.badRequest("El título es requerido"));
      }

      if (!categoriaId) {
        return next(AppError.badRequest("La categoría es requerida"));
      }

      if (!etiquetaId) {
        return next(AppError.badRequest("La etiqueta es requerida"));
      }

      const categoria = await this.prisma.categoria.findFirst({
        where: {
          id: categoriaId, 
          activa: true
        }
      });

      if (!categoria) {
        return next(AppError.badRequest("La categoría seleccionada no existe o no está activa"));
      }

      const etiquetaCategoria = await this.prisma.categoriaEtiqueta.findFirst({
        where: {
          categoriaId: categoriaId, 
          etiquetaId: etiquetaId    
        },
        include: {
          etiqueta: true
        }
      });

      if (!etiquetaCategoria) {
        return next(AppError.badRequest("La etiqueta seleccionada no existe o no pertenece a la categoría"));
      }

      let fechaLimiteRespuesta = ticketExistente.fechaLimiteRespuesta;
      let fechaLimiteResolucion = ticketExistente.fechaLimiteResolucion;

      if (categoriaId !== ticketExistente.categoriaId) {
        const { fechaLimiteRespuesta: nuevaRespuesta, fechaLimiteResolucion: nuevaResolucion } =
          this.calcularFechasSLAs(ticketExistente.fechaCreacion, categoria);
        fechaLimiteRespuesta = nuevaRespuesta;
        fechaLimiteResolucion = nuevaResolucion;
      }

      const updatedTicket = await this.prisma.ticket.update({
        where: { id: ticketId },
        data: {
          titulo: body.titulo,
          descripcion: body.descripcion,
          categoriaId: categoriaId, 
          prioridad: body.prioridad,
          estado: body.estado,
          fechaLimiteRespuesta,
          fechaLimiteResolucion,
          fechaActualizacion: new Date()
        },
        include: {
          solicitante: {
            select: {
              nombre: true,
              correo: true
            }
          },
          categoria: {
            include: {
              categoriaEtiquetas: {
                include: {
                  etiqueta: true
                }
              }
            }
          },
          asignaciones: {
            where: {
              activo: true
            },
            include: {
              tecnico: {
                select: {
                  nombre: true,
                  correo: true
                }
              }
            }
          },
          historial: {
            include: {
              usuario: {
                select: {
                  nombre: true
                }
              }
            },
            orderBy: {
              creadoEn: 'desc'
            }
          },
          valoracion: {
            include: {
              usuario: {
                select: {
                  nombre: true,
                  correo: true
                }
              }
            }
          },
          imagenes: true
        }
      });

      if (body.estado !== ticketExistente.estado) {
        await this.prisma.ticketHistorial.create({
          data: {
            ticketId: ticketId,
            estadoOrigen: ticketExistente.estado,
            estadoDestino: body.estado,
            usuarioId: userId,
            observaciones: body.observacionesCambioEstado || 'Estado actualizado'
          }
        });
      }

      const ahora = new Date();
      let tiempoRestanteSLAHoras = null;
      if (updatedTicket.fechaLimiteResolucion) {
        const diff = updatedTicket.fechaLimiteResolucion.getTime() - ahora.getTime();
        tiempoRestanteSLAHoras = Math.ceil(diff / (1000 * 3600));
      }

      const ticketCompleto = {
        ...updatedTicket,
        diasResolucion: updatedTicket.fechaCierre ?
          Math.ceil((updatedTicket.fechaCierre.getTime() - updatedTicket.fechaCreacion.getTime()) / (1000 * 3600 * 24)) : null,
        cumplimientoRespuesta: updatedTicket.fechaRespuesta && updatedTicket.fechaLimiteRespuesta ?
          updatedTicket.fechaRespuesta <= updatedTicket.fechaLimiteRespuesta : null,
        cumplimientoResolucion: updatedTicket.fechaCierre && updatedTicket.fechaLimiteResolucion ?
          updatedTicket.fechaCierre <= updatedTicket.fechaLimiteResolucion : null,
        tecnicoAsignado: updatedTicket.asignaciones.length > 0 ? updatedTicket.asignaciones[0].tecnico : null,
        tiempoRestanteSLAHoras,
        slaRespuesta: categoria.slaTiempoMaxRespuestaMin,
        slaResolucion: categoria.slaTiempoMaxResolucionMin,
        modoAsignacion: updatedTicket.modoAsignacion,
        etiquetas: updatedTicket.categoria?.categoriaEtiquetas?.map(ce => ce.etiqueta) || []
      };

      response.json(ticketCompleto);
    } catch (error) {
      console.error("Error actualizando ticket:", error);
      next(error);
    }
  };

  delete = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const ticketId = parseInt(request.params.id);
      const userId = parseInt(request.headers['user-id'] as string);

      if (isNaN(ticketId)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      if (isNaN(userId)) {
        return next(AppError.badRequest("User ID no válido"));
      }

      const ticketExistente = await this.prisma.ticket.findFirst({
        where: {
          id: ticketId,
          eliminadoLogico: false
        }
      });

      if (!ticketExistente) {
        return next(AppError.notFound("No existe el ticket"));
      }

      const userRole = request.headers['user-role'] as string;
      if (userRole !== 'ADM' && ticketExistente.solicitanteId !== userId) {
        return next(AppError.forbidden("No tienes permisos para eliminar este ticket"));
      }

      const ticketEliminado = await this.prisma.ticket.update({
        where: { id: ticketId },
        data: {
          eliminadoLogico: true,
          fechaActualizacion: new Date()
        }
      });

      response.json({
        message: "Ticket eliminado exitosamente",
        id: ticketEliminado.id,
        consecutivo: ticketEliminado.consecutivo
      });
    } catch (error) {
      console.error("Error eliminando ticket:", error);
      next(error);
    }
  };

  getPrioridades = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const prioridades = Object.values(Prioridad);
      response.json(prioridades);
    } catch (error) {
      next(error);
    }
  };

  getUsuarios = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const usuarios = await this.prisma.usuario.findMany({
        where: {
          activo: true
        },
        select: {
          id: true,
          nombre: true,
          correo: true,
          rol: true
        },
        orderBy: {
          nombre: 'asc'
        }
      });

      response.json(usuarios);
    } catch (error) {
      next(error);
    }
  };

  getCategoriasConEtiquetas = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const categorias = await this.prisma.categoria.findMany({
        where: {
          activa: true
        },
        include: {
          categoriaEtiquetas: {
            include: {
              etiqueta: true
            },
            where: {
              etiqueta: {
                activa: true
              }
            }
          }
        },
        orderBy: {
          nombre: 'asc'
        }
      });

      const categoriasFormateadas = categorias.map((categoria: any) => ({
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        etiquetas: categoria.categoriaEtiquetas
          .filter((ce: any) => ce.etiqueta !== null)
          .map((ce: any) => ce.etiqueta)
      }));

      response.json(categoriasFormateadas);
    } catch (error) {
      next(error);
    }
  };

  getMisTicketsCreados = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const userId = parseInt(request.headers['user-id'] as string);

      if (isNaN(userId)) {
        return next(AppError.badRequest("User ID no válido"));
      }

      const {
        search = '',
        estado = '',
        prioridad = '',
        page = '1',
        limit = '5',
        sortBy = 'fechaCreacion',
        sortOrder = 'desc'
      } = request.query;

      let whereCondition: any = {
        eliminadoLogico: false,
        solicitanteId: userId
      };

      if (search && search !== '') {
        whereCondition.OR = [
          { consecutivo: { contains: search } },
          { titulo: { contains: search } }
        ];
      }

      if (estado && estado !== '') {
        whereCondition.estado = estado;
      }

      if (prioridad && prioridad !== '') {
        whereCondition.prioridad = prioridad;
      }

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
      const skip = (pageNum - 1) * limitNum;

      const orderBy: any = {};

      if (sortBy === 'fechaCreacion') {
        orderBy.fechaCreacion = sortOrder;
      } else if (sortBy === 'consecutivo') {
        orderBy.consecutivo = sortOrder;
      } else if (sortBy === 'prioridad') {
        orderBy.prioridad = sortOrder;
      } else if (sortBy === 'estado') {
        orderBy.estado = sortOrder;
      } else {
        orderBy.fechaCreacion = 'desc';
      }

      const [tickets, totalCount] = await Promise.all([
        this.prisma.ticket.findMany({
          where: whereCondition,
          orderBy: orderBy,
          skip: skip,
          take: limitNum,
          select: {
            id: true,
            consecutivo: true,
            titulo: true,
            estado: true,
            prioridad: true,
            fechaCreacion: true,
            categoria: {
              select: {
                nombre: true,
                id: true
              }
            },
            solicitante: {
              select: {
                nombre: true,
                correo: true
              }
            }
          }
        }),
        this.prisma.ticket.count({
          where: whereCondition
        })
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      const resultado = {
        tickets: tickets,
        pagination: {
          currentPage: pageNum,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        filters: {
          search,
          estado,
          prioridad,
          sortBy,
          sortOrder
        }
      };

      response.json(resultado);
    } catch (error) {
      console.error('Error en getMisTicketsCreados:', error);
      next(error);
    }
  };

  getTicketsDashboard = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const userId = parseInt(request.headers['user-id'] as string);

      if (isNaN(userId)) {
        return next(AppError.badRequest("User ID no válido"));
      }

      const tickets = await this.prisma.ticket.findMany({
        where: {
          eliminadoLogico: false,
          solicitanteId: userId
        },
        orderBy: {
          fechaCreacion: 'desc'
        },
        take: 5,
        select: {
          id: true,
          consecutivo: true,
          titulo: true,
          estado: true,
          prioridad: true,
          fechaCreacion: true,
          categoria: {
            select: {
              nombre: true,
              id: true
            }
          },
          solicitante: {
            select: {
              nombre: true,
              correo: true
            }
          }
        }
      });

      const resultado = {
        success: true,
        tickets: tickets,
        total: tickets.length,
        message: `Se encontraron ${tickets.length} tickets recientes`
      };

      response.json(resultado);

    } catch (error) {
      next(error);
    }
  };

  getTodasAsignaciones = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const userRole = request.headers['user-role'] as string;

      if (userRole !== 'ADM') {
        return next(AppError.forbidden("Solo los administradores pueden ver todas las asignaciones"));
      }

      const todasAsignaciones = await this.prisma.asignacion.findMany({
        where: {
          activo: true
        },
        include: {
          ticket: {
            include: {
              categoria: {
                select: {
                  nombre: true,
                  slaTiempoMaxRespuestaMin: true,
                  slaTiempoMaxResolucionMin: true
                }
              },
              solicitante: {
                select: {
                  nombre: true,
                  correo: true
                }
              }
            }
          },
          tecnico: {
            select: {
              nombre: true,
              correo: true
            }
          }
        },
        orderBy: {
          fechaAsignacion: 'asc'
        }
      });

      const ahora = new Date();
      const asignacionesFormateadas = todasAsignaciones.map(asignacion => {
        const ticket = asignacion.ticket;

        let tiempoRestanteSLAHoras = null;
        if (ticket.fechaLimiteResolucion) {
          const diff = ticket.fechaLimiteResolucion.getTime() - ahora.getTime();
          tiempoRestanteSLAHoras = Math.ceil(diff / (1000 * 3600));
        }

        let colorUrgencia = 'info';
        if (tiempoRestanteSLAHoras !== null) {
          if (tiempoRestanteSLAHoras < 24) {
            colorUrgencia = 'danger';
          } else if (tiempoRestanteSLAHoras < 72) {
            colorUrgencia = 'warning';
          } else {
            colorUrgencia = 'success';
          }
        }

        const categoriaNombre = ticket.categoria?.nombre || "General";

        const iconosCategoria: { [key: string]: string } = {
          'Hardware': 'bi-cpu',
          'Software': 'bi-window',
          'Red': 'bi-wifi',
          'Sistema': 'bi-gear',
          'General': 'bi-ticket-perforated'
        };

        const icono = iconosCategoria[categoriaNombre] || 'bi-ticket-perforated';

        return {
          id: ticket.id,
          asignacionId: asignacion.id,
          consecutivo: ticket.consecutivo,
          titulo: ticket.titulo,
          categoria: categoriaNombre,
          estado: ticket.estado,
          prioridad: ticket.prioridad,
          tiempoRestanteSLAHoras: tiempoRestanteSLAHoras,
          fechaLimiteResolucion: ticket.fechaLimiteResolucion,
          fechaAsignacion: asignacion.fechaAsignacion,
          colorUrgencia: colorUrgencia,
          iconoCategoria: icono,
          solicitante: ticket.solicitante?.nombre || "Sin solicitante",
          tecnico: asignacion.tecnico?.nombre || "Sin técnico",
          tecnicoEmail: asignacion.tecnico?.correo || "Sin email"
        };
      });

      response.json(asignacionesFormateadas);

    } catch (error) {
      next(error);
    }
  };

  getTodasAsignacionesConFiltros = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const userRole = request.headers['user-role'] as string;

      if (userRole !== 'ADM') {
        return next(AppError.forbidden("Solo los administradores pueden ver todas las asignaciones"));
      }

      const {
        page = '1',
        limit = '5',
        search = '',
        estado = '',
        prioridad = '',
        sortBy = 'fechaCreacion',
        sortOrder = 'desc'
      } = request.query;

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
      const skip = (pageNum - 1) * limitNum;

      const whereCondition: any = {
        eliminadoLogico: false
      };

      if (search && search !== '') {
        whereCondition.OR = [
          { consecutivo: { contains: search } },
          { titulo: { contains: search } },
          {
            solicitante: {
              nombre: { contains: search }
            }
          }
        ];
      }

      if (estado && estado !== '') {
        whereCondition.estado = estado;
      }

      if (prioridad && prioridad !== '') {
        whereCondition.prioridad = prioridad;
      }

      const orderBy: any = {};
      if (sortBy === 'fechaCreacion') {
        orderBy.fechaCreacion = sortOrder;
      } else if (sortBy === 'consecutivo') {
        orderBy.consecutivo = sortOrder;
      } else if (sortBy === 'prioridad') {
        orderBy.prioridad = sortOrder;
      } else if (sortBy === 'estado') {
        orderBy.estado = sortOrder;
      } else if (sortBy === 'fechaAsignacion') {
        orderBy.asignaciones = {
          _count: sortOrder
        };
      } else {
        orderBy.fechaCreacion = 'desc';
      }

      const [tickets, totalCount] = await Promise.all([
        this.prisma.ticket.findMany({
          where: whereCondition,
          include: {
            categoria: {
              select: {
                nombre: true,
                slaTiempoMaxRespuestaMin: true,
                slaTiempoMaxResolucionMin: true
              }
            },
            solicitante: {
              select: {
                nombre: true,
                correo: true
              }
            },
            asignaciones: {
              where: {
                activo: true
              },
              include: {
                tecnico: {
                  select: {
                    nombre: true,
                    correo: true
                  }
                }
              },
              take: 1
            },
            historial: {
              orderBy: {
                creadoEn: 'desc'
              },
              take: 1
            }
          },
          orderBy: orderBy,
          skip: skip,
          take: limitNum
        }),
        this.prisma.ticket.count({
          where: whereCondition
        })
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      const resultado = {
        asignaciones: this.formatearTodosLosTickets(tickets),
        pagination: {
          currentPage: pageNum,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        filters: {
          search,
          estado,
          prioridad,
          sortBy,
          sortOrder
        }
      };

      response.json(resultado);

    } catch (error) {
      next(AppError.badRequest("Error al procesar los filtros"));
    }
  };

  getMisAsignaciones = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const userId = parseInt(request.headers['user-id'] as string);
      const userRole = request.headers['user-role'] as string;

      if (isNaN(userId)) {
        return next(AppError.badRequest("User ID no válido"));
      }

      if (userRole !== 'TEC' && userRole !== 'ADM') {
        return next(AppError.forbidden("No tienes permisos para ver asignaciones"));
      }

      const misAsignaciones = await this.prisma.asignacion.findMany({
        where: {
          activo: true,
          tecnicoId: userId
        },
        include: {
          ticket: {
            include: {
              categoria: {
                select: {
                  nombre: true,
                  slaTiempoMaxRespuestaMin: true,
                  slaTiempoMaxResolucionMin: true
                }
              },
              solicitante: {
                select: {
                  nombre: true,
                  correo: true
                }
              }
            }
          },
          tecnico: {
            select: {
              nombre: true,
              correo: true
            }
          }
        },
        orderBy: {
          fechaAsignacion: 'asc'
        }
      });

      const ahora = new Date();
      const asignacionesFormateadas = misAsignaciones.map(asignacion => {
        const ticket = asignacion.ticket;

        let tiempoRestanteSLAHoras = null;
        if (ticket.fechaLimiteResolucion) {
          const diff = ticket.fechaLimiteResolucion.getTime() - ahora.getTime();
          tiempoRestanteSLAHoras = Math.ceil(diff / (1000 * 3600));
        }

        let colorUrgencia = 'info';
        if (tiempoRestanteSLAHoras !== null) {
          if (tiempoRestanteSLAHoras < 24) {
            colorUrgencia = 'danger';
          } else if (tiempoRestanteSLAHoras < 72) {
            colorUrgencia = 'warning';
          } else {
            colorUrgencia = 'success';
          }
        }

        const categoriaNombre = ticket.categoria?.nombre || "General";

        const iconosCategoria: { [key: string]: string } = {
          'Hardware': 'bi-cpu',
          'Software': 'bi-window',
          'Red': 'bi-wifi',
          'Sistema': 'bi-gear',
          'General': 'bi-ticket-perforated'
        };

        const icono = iconosCategoria[categoriaNombre] || 'bi-ticket-perforated';

        return {
          id: ticket.id,
          asignacionId: asignacion.id,
          consecutivo: ticket.consecutivo,
          titulo: ticket.titulo,
          categoria: categoriaNombre,
          estado: ticket.estado,
          prioridad: ticket.prioridad,
          tiempoRestanteSLAHoras: tiempoRestanteSLAHoras,
          fechaLimiteResolucion: ticket.fechaLimiteResolucion,
          fechaAsignacion: asignacion.fechaAsignacion,
          colorUrgencia: colorUrgencia,
          iconoCategoria: icono,
          solicitante: ticket.solicitante?.nombre || "Sin solicitante",
          tecnico: asignacion.tecnico?.nombre || "Sin técnico"
        };
      });

      response.json(asignacionesFormateadas);

    } catch (error) {
      console.error('Error en getMisAsignaciones:', error);
      next(error);
    }
  };

  getAsignacionesByID = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const userId = parseInt(request.headers['user-id'] as string);
      const ticketId = parseInt(request.params.id);

      if (isNaN(userId)) {
        return next(AppError.badRequest("User ID no válido"));
      }

      if (isNaN(ticketId)) {
        return next(AppError.badRequest("Ticket ID no válido"));
      }

      const asignacion = await this.prisma.asignacion.findFirst({
        where: {
          tecnicoId: userId,
          ticketId: ticketId,
          activo: true
        },
        include: {
          ticket: {
            include: {
              categoria: {
                select: {
                  nombre: true,
                  slaTiempoMaxRespuestaMin: true,
                  slaTiempoMaxResolucionMin: true
                }
              },
              solicitante: {
                select: {
                  nombre: true,
                  correo: true
                }
              },
              historial: {
                include: {
                  usuario: {
                    select: {
                      nombre: true
                    }
                  }
                },
                orderBy: {
                  creadoEn: 'desc'
                }
              },
              valoracion: {
                include: {
                  usuario: {
                    select: {
                      nombre: true,
                      correo: true
                    }
                  }
                }
              },
              imagenes: true
            }
          },
          tecnico: {
            select: {
              nombre: true,
              correo: true
            }
          }
        }
      });

      if (!asignacion) {
        return next(AppError.notFound("No se encontró la asignación o no tienes permisos"));
      }

      const ahora = new Date();
      let tiempoRestanteSLAHoras = null;
      let cumplimientoRespuesta = null;
      let cumplimientoResolucion = null;

      if (asignacion.ticket.fechaLimiteResolucion) {
        const diff = asignacion.ticket.fechaLimiteResolucion.getTime() - ahora.getTime();
        tiempoRestanteSLAHoras = Math.ceil(diff / (1000 * 3600));
      }

      if (asignacion.ticket.fechaRespuesta && asignacion.ticket.fechaLimiteRespuesta) {
        cumplimientoRespuesta = asignacion.ticket.fechaRespuesta <= asignacion.ticket.fechaLimiteRespuesta;
      }

      if (asignacion.ticket.fechaCierre && asignacion.ticket.fechaLimiteResolucion) {
        cumplimientoResolucion = asignacion.ticket.fechaCierre <= asignacion.ticket.fechaLimiteResolucion;
      }

      const resultado = {
        ...asignacion,
        tiempoRestanteSLAHoras,
        cumplimientoRespuesta,
        cumplimientoResolucion,
        slaRespuesta: asignacion.ticket.categoria?.slaTiempoMaxRespuestaMin,
        slaResolucion: asignacion.ticket.categoria?.slaTiempoMaxResolucionMin
      };

      response.json(resultado);

    } catch (error) {
      console.error('Error en getAsignacionesByID:', error);
      next(error);
    }
  };

  getAsignacionByTicketIdForAdmin = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const userRole = request.headers['user-role'] as string;
      const ticketId = parseInt(request.params.id);

      if (userRole !== 'ADM') {
        return next(AppError.forbidden("Solo los administradores pueden ver asignaciones de cualquier ticket"));
      }

      if (isNaN(ticketId)) {
        return next(AppError.badRequest("Ticket ID no válido"));
      }

      const asignaciones = await this.prisma.asignacion.findMany({
        where: {
          ticketId: ticketId,
          activo: true
        },
        include: {
          ticket: {
            include: {
              categoria: {
                select: {
                  nombre: true,
                  slaTiempoMaxRespuestaMin: true,
                  slaTiempoMaxResolucionMin: true
                }
              },
              solicitante: {
                select: {
                  nombre: true,
                  correo: true
                }
              },
              historial: {
                include: {
                  usuario: {
                    select: {
                      nombre: true
                    }
                  }
                },
                orderBy: {
                  creadoEn: 'desc'
                }
              },
              valoracion: {
                include: {
                  usuario: {
                    select: {
                      nombre: true,
                      correo: true
                    }
                  }
                }
              },
              imagenes: true
            }
          },
          tecnico: {
            select: {
              nombre: true,
              correo: true
            }
          }
        }
      });

      if (!asignaciones || asignaciones.length === 0) {
        return next(AppError.notFound("No se encontraron asignaciones para este ticket"));
      }

      const asignacion = asignaciones[0];
      const ticket = asignacion.ticket;

      const ahora = new Date();
      let tiempoRestanteSLAHoras = null;
      let cumplimientoRespuesta = null;
      let cumplimientoResolucion = null;

      if (ticket.fechaLimiteResolucion) {
        tiempoRestanteSLAHoras = this.calcularTiempoRestante(ticket.fechaLimiteResolucion);
      }

      if (ticket.fechaRespuesta && ticket.fechaLimiteRespuesta) {
        cumplimientoRespuesta = ticket.fechaRespuesta <= ticket.fechaLimiteRespuesta;
      }

      if (ticket.fechaCierre && ticket.fechaLimiteResolucion) {
        cumplimientoResolucion = ticket.fechaCierre <= ticket.fechaLimiteResolucion;
      }

      const resultado = {
        ...asignacion,
        tiempoRestanteSLAHoras,
        cumplimientoRespuesta,
        cumplimientoResolucion,
        slaRespuesta: ticket.categoria?.slaTiempoMaxRespuestaMin,
        slaResolucion: ticket.categoria?.slaTiempoMaxResolucionMin
      };

      response.json(resultado);

    } catch (error) {
      next(error);
    }
  };
}