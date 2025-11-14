import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, Role } from "../../generated/prisma";
import * as bcrypt from "bcrypt";
export class TecnicoController {
  prisma = new PrismaClient();

  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { 
        search = '', 
        disponible = '',
        page = '1', 
        limit = '5' 
      } = request.query;

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 5));
      const skip = (pageNum - 1) * limitNum;

      let whereCondition: any = {
        rol: Role.TEC,
        activo: true
      };

      if (search && search !== '') {
        whereCondition.OR = [
          { nombre: { contains: search as string } },
          { correo: { contains: search as string } }
        ];
      }

      if (disponible && disponible !== '') {
        whereCondition.disponible = disponible === 'true';
      }

      const [listado, totalCount] = await Promise.all([
        this.prisma.usuario.findMany({
          where: whereCondition,
          orderBy: {
            nombre: "asc"
          },
          skip: skip,
          take: limitNum,
          select: {
            id: true,
            nombre: true,
            correo: true,
            telefono: true,
            disponible: true
          }
        }),
        this.prisma.usuario.count({
          where: whereCondition
        })
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      const resultado = {
        tecnicos: listado,
        pagination: {
          currentPage: pageNum,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      };

      response.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      let idTecnico = parseInt(request.params.id)
      if(isNaN(idTecnico)){
        next(AppError.badRequest("El ID no es válido"))
      }

      const objTecnico = await this.prisma.usuario.findFirst({
        where: { 
          id: idTecnico,
          rol: Role.TEC,
          activo: true
        },
        include: {
          usuarioEspecialidades: {
            include: {
              especialidad: true
            }
          },
          asignacionesRecibidas: {
            where: {
              activo: true
            },
            include: {
              ticket: {
                select: {
                  id: true,
                  consecutivo: true,
                  titulo: true,
                  estado: true,
                  prioridad: true
                }
              }
            }
          }
        }
      })

      if(objTecnico){

        const cargaTrabajo = objTecnico.asignacionesRecibidas.length;
        const disponibilidad = objTecnico.disponible && (objTecnico.limiteCargaTickets ? cargaTrabajo < objTecnico.limiteCargaTickets : true);

        const tecnicoConDetalle = {
          ...objTecnico,
          cargaTrabajo,
          disponibilidad
        }

        response.status(200).json(tecnicoConDetalle)
      } else {
        next(AppError.notFound("No existe el técnico"))
      }

    } catch (error: any) {
      next(error)
    }
  };

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;

      if (!body.correo || !body.nombre) {
        next(AppError.badRequest("El correo y nombre son requeridos"));
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.correo)) {
        next(AppError.badRequest("El formato del correo electrónico no es válido"));
        return;
      }

      const usuarioExistente = await this.prisma.usuario.findUnique({
        where: { correo: body.correo }
      });

      if (usuarioExistente) {
        next(AppError.badRequest("Ya existe un usuario con este correo electrónico"));
        return;
      }

      const contrasenaPlana = body.contrasena || "TempPassword123";
      const contrasenaHash = await bcrypt.hash(contrasenaPlana, 10);

      const newTecnico = await this.prisma.usuario.create({
        data: {
          correo: body.correo,
          nombre: body.nombre,
          telefono: body.telefono,
          contrasenaHash: contrasenaHash,
          rol: Role.TEC,
          disponible: body.disponible !== undefined ? body.disponible : true,
          limiteCargaTickets: body.limiteCargaTickets || 5,
          cargosActuales: 0,
          usuarioEspecialidades: body.especialidades && body.especialidades.length > 0 ? {
            create: body.especialidades.map((espId: number) => ({
              especialidadId: espId
            }))
          } : undefined
        },
        include: {
          usuarioEspecialidades: {
            include: {
              especialidad: true
            }
          }
        }
      });

      const { contrasenaHash: hash, refreshToken, resetPasswordToken, resetPasswordExpiry, ...tecnicoResponse } = newTecnico;

      response.status(201).json(tecnicoResponse);
    } catch (error) {
      console.error("Error creando técnico:", error);
      next(error);
    }
  };

  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;
      const idTecnico = parseInt(request.params.id);

      if (isNaN(idTecnico)) {
        next(AppError.badRequest("El ID no es válido"));
        return;
      }

      const tecnicoExistente = await this.prisma.usuario.findFirst({
        where: { 
          id: idTecnico,
          rol: Role.TEC,
          activo: true
        },
        include: {
          usuarioEspecialidades: {
            select: {
              especialidadId: true
            }
          }
        }
      });

      if (!tecnicoExistente) {
        next(AppError.notFound("No existe el técnico"));
        return;
      }

      if (body.correo && body.correo !== tecnicoExistente.correo) {
        const correoExistente = await this.prisma.usuario.findUnique({
          where: { correo: body.correo }
        });

        if (correoExistente) {
          next(AppError.badRequest("Ya existe un usuario con este correo electrónico"));
          return;
        }
      }

      const updateData: any = {
        nombre: body.nombre,
        telefono: body.telefono,
        disponible: body.disponible,
        limiteCargaTickets: body.limiteCargaTickets
      };

      if (body.correo) {
        updateData.correo = body.correo;
      }

      if (body.contrasena) {
        updateData.contrasenaHash = await bcrypt.hash(body.contrasena, 10);
      }

      const updatedTecnico = await this.prisma.usuario.update({
        where: { id: idTecnico },
        data: {
          ...updateData,
          usuarioEspecialidades: {
            deleteMany: {},
            create: body.especialidades ? body.especialidades.map((espId: number) => ({
              especialidadId: espId
            })) : []
          }
        },
        include: {
          usuarioEspecialidades: {
            include: {
              especialidad: true
            }
          },
          asignacionesRecibidas: {
            where: {
              activo: true
            },
            include: {
              ticket: {
                select: {
                  id: true,
                  consecutivo: true,
                  titulo: true,
                  estado: true,
                  prioridad: true
                }
              }
            }
          }
        }
      });

      const cargaTrabajo = updatedTecnico.asignacionesRecibidas.length;
      const disponibilidad = updatedTecnico.disponible && 
        (updatedTecnico.limiteCargaTickets ? cargaTrabajo < updatedTecnico.limiteCargaTickets : true);

      const { contrasenaHash, refreshToken, resetPasswordToken, resetPasswordExpiry, ...tecnicoResponse } = {
        ...updatedTecnico,
        cargaTrabajo,
        disponibilidad
      };

      response.json(tecnicoResponse);
    } catch (error) {
      console.error("Error actualizando técnico:", error);
      next(error);
    }
  };

  delete = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idTecnico = parseInt(request.params.id);

      if (isNaN(idTecnico)) {
        next(AppError.badRequest("El ID no es válido"));
        return;
      }

      const tecnicoExistente = await this.prisma.usuario.findFirst({
        where: { 
          id: idTecnico,
          rol: Role.TEC,
          activo: true
        }
      });

      if (!tecnicoExistente) {
        next(AppError.notFound("No existe el técnico"));
        return;
      }

      const asignacionesActivas = await this.prisma.asignacion.count({
        where: {
          tecnicoId: idTecnico,
          activo: true,
          ticket: {
            eliminadoLogico: false,
            estado: {
              in: ['PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'ESPERA_CLIENTE']
            }
          }
        }
      });

      if (asignacionesActivas > 0) {
        next(AppError.badRequest("No se puede eliminar el técnico porque tiene tickets asignados activos"));
        return;
      }

      const tecnicoEliminado = await this.prisma.usuario.update({
        where: { id: idTecnico },
        data: {
          activo: false,
          disponible: false
        }
      });

      response.json({
        message: "Técnico eliminado exitosamente",
        id: tecnicoEliminado.id
      });
    } catch (error) {
      console.error("Error eliminando técnico:", error);
      next(error);
    }
  };
}