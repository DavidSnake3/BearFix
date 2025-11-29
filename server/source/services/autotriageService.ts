import { PrismaClient, TicketEstado, ModoAsignacion, Prioridad, NotifTipo, NotifPrioridad } from '../../generated/prisma';
import { AppError } from '../errors/custom.error';

export class AutotriageService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private calcularPuntaje(prioridad: Prioridad, tiempoRestanteSLAHoras: number): number {
    const prioridadNumerica = {
      [Prioridad.BAJO]: 1,
      [Prioridad.MEDIO]: 2,
      [Prioridad.ALTO]: 3,
      [Prioridad.CRITICO]: 4
    };

    return (prioridadNumerica[prioridad] * 1000) - tiempoRestanteSLAHoras;
  }

  async asignarAutomaticamente() {
    const ticketsPendientes = await this.prisma.ticket.findMany({
      where: { 
        estado: TicketEstado.PENDIENTE,
        eliminadoLogico: false
      },
      include: {
        categoria: {
          include: {
            categoriaEspecialidades: { 
              include: { especialidad: true }
            }
          }
        },
        solicitante: true
      }
    });

    const resultados = [];

    for (const ticket of ticketsPendientes) {
      try {
        const ahora = new Date();
        let tiempoRestanteSLAHoras = 720;

        if (ticket.fechaLimiteResolucion) {
          const diffHoras = (ticket.fechaLimiteResolucion.getTime() - ahora.getTime()) / (1000 * 60 * 60);
          tiempoRestanteSLAHoras = Math.max(0, diffHoras);
        }

        const puntaje = this.calcularPuntaje(ticket.prioridad || Prioridad.MEDIO, tiempoRestanteSLAHoras);

        const especialidadesRequeridas = ticket.categoria?.categoriaEspecialidades.map(ce => ce.especialidad.id) || [];
        
        const tecnicos = await this.prisma.usuario.findMany({
          where: {
            rol: 'TEC',
            activo: true,
            disponible: true,
            usuarioEspecialidades: {
              some: {
                especialidadId: { in: especialidadesRequeridas }
              }
            }
          },
          include: {
            asignacionesRecibidas: {
              where: {
                activo: true,
                ticket: {
                  estado: { 
                    in: [TicketEstado.ASIGNADO, TicketEstado.EN_PROCESO, TicketEstado.ESPERA_CLIENTE] 
                  }
                }
              }
            },
            usuarioEspecialidades: { 
              include: { especialidad: true } 
            }
          }
        });

        const tecnicosConPuntaje = tecnicos.map(tecnico => {
          const cargaActual = tecnico.asignacionesRecibidas.length;
          const limiteCarga = tecnico.limiteCargaTickets || 5;
          const capacidad = (limiteCarga - cargaActual) / limiteCarga;

          const puntajeFinal = (capacidad * 1000) + puntaje;

          return {
            ...tecnico,
            puntajeFinal,
            cargaActual,
            limiteCarga,
            capacidadDisponible: capacidad
          };
        }).sort((a, b) => b.puntajeFinal - a.puntajeFinal);

        const tecnicoSeleccionado = tecnicosConPuntaje[0];

        if (tecnicoSeleccionado) {
          const asignacion = await this.prisma.asignacion.create({
            data: {
              ticketId: ticket.id,
              tecnicoId: tecnicoSeleccionado.id,
              metodo: ModoAsignacion.AUTOMATICA,
              puntajeCalculado: puntaje,
              tiempoRestanteSLAHoras,
              justificacion: `Asignación automática - Puntaje: ${puntaje}, Capacidad técnico: ${tecnicoSeleccionado.capacidadDisponible.toFixed(2)}`
            }
          });

          await this.prisma.usuario.update({
            where: { id: tecnicoSeleccionado.id },
            data: {
              cargosActuales: {
                increment: 1
              }
            }
          });

          await this.prisma.ticket.update({
            where: { id: ticket.id },
            data: {
              estado: TicketEstado.ASIGNADO,
              modoAsignacion: ModoAsignacion.AUTOMATICA,
              puntajePrioridad: puntaje,
              tiempoRestanteSLAHoras
            }
          });

          await this.prisma.notificacion.create({
            data: {
              tipo: NotifTipo.ASIGNACION_TICKET,
              remitenteId: null,
              destinatarioId: tecnicoSeleccionado.id,
              asunto: `Nuevo ticket asignado: ${ticket.consecutivo}`,
              mensaje: `Se te ha asignado automáticamente el ticket "${ticket.titulo}". Prioridad: ${ticket.prioridad}`,
              prioridad: NotifPrioridad.ALTA
            }
          });

          if (ticket.solicitanteId) {
            await this.prisma.notificacion.create({
              data: {
                tipo: NotifTipo.ASIGNACION_TICKET,
                remitenteId: null,
                destinatarioId: ticket.solicitanteId,
                asunto: `Ticket ${ticket.consecutivo} asignado`,
                mensaje: `Tu ticket "${ticket.titulo}" ha sido asignado al técnico ${tecnicoSeleccionado.nombre}`,
                prioridad: NotifPrioridad.MEDIA
              }
            });
          }

          resultados.push({
            ticket: ticket.consecutivo,
            titulo: ticket.titulo,
            tecnico: tecnicoSeleccionado.nombre,
            puntaje,
            capacidadTecnico: tecnicoSeleccionado.capacidadDisponible,
            asignacionId: asignacion.id,
            exito: true
          });
        } else {
          resultados.push({
            ticket: ticket.consecutivo,
            titulo: ticket.titulo,
            error: 'No hay técnicos disponibles con la especialidad requerida',
            exito: false
          });
        }
      } catch (error: any) {
        resultados.push({
          ticket: ticket.consecutivo,
          titulo: ticket.titulo,
          error: error.message,
          exito: false
        });
      }
    }

    return resultados;
  }

  async obtenerEstadisticasAutotriage() {
    const ticketsPendientes = await this.prisma.ticket.count({
      where: { estado: TicketEstado.PENDIENTE, eliminadoLogico: false }
    });

    const tecnicosDisponibles = await this.prisma.usuario.count({
      where: { 
        rol: 'TEC', 
        activo: true, 
        disponible: true 
      }
    });

    return {
      ticketsPendientes,
      tecnicosDisponibles,
      fechaConsulta: new Date()
    };
  }
}