import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, Role } from "../../generated/prisma";

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
}