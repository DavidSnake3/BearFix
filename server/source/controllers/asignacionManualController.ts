import { Request, Response, NextFunction } from 'express';
import { PrismaClient, ModoAsignacion, TicketEstado } from '../../generated/prisma';
import { AppError } from '../errors/custom.error';

export class AsignacionManualController {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  obtenerTicketsPendientes = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = (request as any).user;

      if (!user) {
        return next(AppError.unauthorized('Usuario no autenticado'));
      }

      if (user.role !== 'ADM') {
        return next(AppError.forbidden('Solo los administradores pueden acceder a esta funcionalidad'));
      }

      const tickets = await this.prisma.ticket.findMany({
        where: {
          estado: TicketEstado.PENDIENTE,
          eliminadoLogico: false,
          asignaciones: {
            none: {
              activo: true
            }
          }
        },
        include: {
          categoria: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          },
          solicitante: {
            select: {
              id: true,
              nombre: true,
              correo: true
            }
          }
        },
        orderBy: {
          fechaCreacion: 'desc'
        }
      });

      const ticketsFormateados = tickets.map(ticket => ({
        id: ticket.id,
        consecutivo: ticket.consecutivo,
        titulo: ticket.titulo,
        descripcion: ticket.descripcion,
        prioridad: ticket.prioridad,
        fechaCreacion: ticket.fechaCreacion,
        categoria: ticket.categoria,
        solicitante: ticket.solicitante
      }));

      response.json({
        success: true,
        data: ticketsFormateados
      });
    } catch (error) {
      next(error);
    }
  };

  obtenerTecnicosDisponibles = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = (request as any).user;

      if (!user) {
        return next(AppError.unauthorized('Usuario no autenticado'));
      }

      if (user.role !== 'ADM') {
        return next(AppError.forbidden('Solo los administradores pueden acceder a esta funcionalidad'));
      }

      const tecnicos = await this.prisma.usuario.findMany({
        where: {
          rol: 'TEC',
          activo: true,
          disponible: true
        },
        include: {
          usuarioEspecialidades: {
            include: {
              especialidad: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true
                }
              }
            }
          },
          asignacionesRecibidas: {
            where: {
              activo: true,
              ticket: {
                estado: {
                  in: [TicketEstado.ASIGNADO, TicketEstado.EN_PROCESO, TicketEstado.ESPERA_CLIENTE]
                }
              }
            }
          }
        }
      });

      const tecnicosConCarga = tecnicos.map(tecnico => {
        const cargaActual = tecnico.asignacionesRecibidas.length;
        const limiteCarga = tecnico.limiteCargaTickets || 10;
        const disponible = cargaActual < limiteCarga;

        return {
          id: tecnico.id,
          nombre: tecnico.nombre,
          correo: tecnico.correo,
          especialidades: tecnico.usuarioEspecialidades.map(ue => ue.especialidad),
          cargaActual,
          limiteCarga,
          disponible,
          telefono: tecnico.telefono
        };
      });

      response.json({
        success: true,
        data: tecnicosConCarga
      });
    } catch (error) {
      next(error);
    }
  };

  asignarManual = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { ticketId, tecnicoId, justificacion } = request.body;
      const user = (request as any).user;

      if (!user) {
        return next(AppError.unauthorized('Usuario no autenticado'));
      }

      if (user.role !== 'ADM') {
        return next(AppError.forbidden('Solo los administradores pueden realizar asignaciones manuales'));
      }

      if (!ticketId || !tecnicoId || !justificacion) {
        return next(AppError.badRequest('TicketId, tecnicoId y justificacion son requeridos'));
      }

      const ticket = await this.prisma.ticket.findFirst({
        where: { 
          id: parseInt(ticketId.toString()),
          estado: TicketEstado.PENDIENTE,
          eliminadoLogico: false
        },
        include: {
          categoria: true
        }
      });

      if (!ticket) {
        return next(AppError.badRequest('Ticket no encontrado o no está en estado PENDIENTE'));
      }

      const tecnico = await this.prisma.usuario.findFirst({
        where: { 
          id: parseInt(tecnicoId.toString()),
          rol: 'TEC',
          activo: true
        }
      });

      if (!tecnico) {
        return next(AppError.badRequest('Técnico no encontrado'));
      }

      const limiteCarga = tecnico.limiteCargaTickets || 10;
      const cargosActuales = tecnico.cargosActuales ?? 0;
      
      if (cargosActuales >= limiteCarga) {
        return next(AppError.badRequest('El técnico ha alcanzado su límite de carga de trabajo'));
      }

      const asignacion = await this.prisma.asignacion.create({
        data: {
          ticketId: parseInt(ticketId.toString()),
          tecnicoId: parseInt(tecnicoId.toString()),
          asignadoPorId: user.userId,
          metodo: ModoAsignacion.MANUAL,
          justificacion: justificacion,
          activo: true
        }
      });

      await this.prisma.usuario.update({
        where: { id: parseInt(tecnicoId.toString()) },
        data: {
          cargosActuales: {
            increment: 1
          }
        }
      });

      await this.prisma.ticket.update({
        where: { id: parseInt(ticketId.toString()) },
        data: { 
          estado: TicketEstado.ASIGNADO,
          modoAsignacion: ModoAsignacion.MANUAL
        }
      });

      await this.prisma.notificacion.create({
        data: {
          tipo: 'ASIGNACION_TICKET',
          remitenteId: user.userId,
          destinatarioId: parseInt(tecnicoId.toString()),
          asunto: `Nuevo ticket asignado: ${ticket.consecutivo}`,
          mensaje: `Se te ha asignado manualmente el ticket "${ticket.titulo}". Prioridad: ${ticket.prioridad}. Justificación: ${justificacion}`,
          prioridad: 'ALTA',
          leida: false
        }
      });

      response.json({
        success: true,
        message: 'Ticket asignado manualmente correctamente',
        data: {
          asignacionId: asignacion.id,
          ticket: ticket.consecutivo,
          tecnico: tecnico.nombre
        }
      });
    } catch (error) {
      next(error);
    }
  };
}