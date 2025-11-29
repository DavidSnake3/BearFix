import { PrismaClient, TicketEstado, Prioridad, NotifTipo, NotifPrioridad } from '../../generated/prisma';
import { AppError } from '../errors/custom.error';

export class TicketStateService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private validarTransicionEstado(estadoOrigen: TicketEstado, estadoDestino: TicketEstado, tieneTecnico: boolean): void {
    const flujoValido: TicketEstado[] = [
      TicketEstado.PENDIENTE,
      TicketEstado.ASIGNADO,
      TicketEstado.EN_PROCESO,
      TicketEstado.RESUELTO,
      TicketEstado.CERRADO
    ];

    if (estadoDestino === TicketEstado.CANCELADO) {
      return;
    }

    const indiceOrigen = flujoValido.indexOf(estadoOrigen);
    const indiceDestino = flujoValido.indexOf(estadoDestino);

    if (indiceOrigen === -1 || indiceDestino === -1) {
      throw AppError.badRequest('Estado no válido');
    }

    if (Math.abs(indiceDestino - indiceOrigen) > 1) {
      throw AppError.badRequest('No se puede saltar etapas del flujo');
    }

    if (estadoOrigen === TicketEstado.PENDIENTE && estadoDestino === TicketEstado.ASIGNADO && !tieneTecnico) {
      throw AppError.badRequest('No se puede avanzar a ASIGNADO sin un técnico asignado');
    }
  }

  async cambiarEstado(
    ticketId: number,
    nuevoEstado: TicketEstado,
    usuarioId: number,
    observaciones: string,
    imagenes: { nombreArchivo: string; url: string; tipo?: string; tamaño?: number; descripcion?: string }[]
  ) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId },
      include: {
        asignaciones: { where: { activo: true }, include: { tecnico: true } },
        solicitante: true,
        categoria: true
      }
    });

    if (!ticket) {
      throw AppError.notFound('Ticket no encontrado');
    }

    const usuario = await this.prisma.usuario.findFirst({ where: { id: usuarioId } });
    if (!usuario) {
      throw AppError.badRequest('Usuario no válido');
    }

    if (usuario.rol === 'USR') {
      if (nuevoEstado !== TicketEstado.CANCELADO && nuevoEstado !== TicketEstado.CERRADO) {
        throw AppError.forbidden('Solo puede cancelar el ticket');
      }
      if (ticket.solicitanteId !== usuarioId) {
        throw AppError.forbidden('Solo puede cancelar su propio ticket');
      }
    }

    const tieneTecnico = ticket.asignaciones.length > 0;
    this.validarTransicionEstado(ticket.estado, nuevoEstado, tieneTecnico);

    if (!observaciones || observaciones.trim() === '') {
      throw AppError.badRequest('El comentario es obligatorio para cambiar el estado');
    }

    if ((!imagenes || imagenes.length === 0) && !(usuario.rol === 'USR' && nuevoEstado === TicketEstado.CANCELADO)) {
      throw AppError.badRequest('Se requiere al menos una imagen como evidencia');
    }

    const historial = await this.prisma.ticketHistorial.create({
      data: {
        ticketId,
        estadoOrigen: ticket.estado,
        estadoDestino: nuevoEstado,
        usuarioId,
        observaciones
      }
    });

    if (imagenes && imagenes.length > 0) {
      for (const imagen of imagenes) {
        await this.prisma.imagenHistorial.create({
          data: {
            historialId: historial.id,
            nombreArchivo: imagen.nombreArchivo,
            url: imagen.url,
            tipo: imagen.tipo,
            tamaño: imagen.tamaño,
            descripcion: imagen.descripcion
          }
        });
      }
    }

    const asignacionActiva = ticket.asignaciones[0];
    const tecnicoId = asignacionActiva?.tecnicoId;

    if (tecnicoId) {
      await this.actualizarCargaTecnico(tecnicoId, ticket.estado, nuevoEstado);
    }

    const updateData: any = {
      estado: nuevoEstado,
      fechaActualizacion: new Date()
    };

    if (nuevoEstado === TicketEstado.CERRADO || nuevoEstado === TicketEstado.CANCELADO) {
      updateData.fechaCierre = new Date();
    }

    if (nuevoEstado === TicketEstado.RESUELTO) {
      updateData.fechaRespuesta = new Date();
    }

    const ticketActualizado = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        solicitante: true,
        asignaciones: { 
          where: { activo: true },
          include: { tecnico: true }
        },
        categoria: true
      }
    });

    await this.generarNotificaciones(ticketActualizado, usuario, observaciones, nuevoEstado);

    return {
      ticket: ticketActualizado,
      historial
    };
  }

  private async actualizarCargaTecnico(tecnicoId: number, estadoOrigen: TicketEstado, estadoDestino: TicketEstado) {
    const estadosQueCuentanComoCarga: TicketEstado[] = [
      TicketEstado.ASIGNADO,
      TicketEstado.EN_PROCESO,
      TicketEstado.ESPERA_CLIENTE
    ];

    const estadosQueNoCuentanComoCarga: TicketEstado[] = [
      TicketEstado.RESUELTO,
      TicketEstado.CERRADO,
      TicketEstado.CANCELADO
    ];

    if (estadosQueCuentanComoCarga.includes(estadoOrigen) && 
        estadosQueNoCuentanComoCarga.includes(estadoDestino)) {
      await this.prisma.usuario.update({
        where: { id: tecnicoId },
        data: {
          cargosActuales: {
            decrement: 1
          }
        }
      });
    }
    else if (estadosQueNoCuentanComoCarga.includes(estadoOrigen) && 
             estadosQueCuentanComoCarga.includes(estadoDestino)) {
      await this.prisma.usuario.update({
        where: { id: tecnicoId },
        data: {
          cargosActuales: {
            increment: 1
          }
        }
      });
    }
  }

  private async generarNotificaciones(ticket: any, usuario: any, observaciones: string, nuevoEstado: TicketEstado) {
    const notificaciones = [];

    if (ticket.solicitanteId && ticket.solicitanteId !== usuario.id) {
      notificaciones.push({
        tipo: NotifTipo.CAMBIO_ESTADO,
        remitenteId: usuario.id,
        destinatarioId: ticket.solicitanteId,
        asunto: `Ticket ${ticket.consecutivo} - Estado actualizado`,
        mensaje: `El estado de tu ticket ha cambiado a ${nuevoEstado}. Observación: ${observaciones}`,
        prioridad: NotifPrioridad.MEDIA
      });
    }

    if (ticket.asignaciones.length > 0 && ticket.asignaciones[0].tecnicoId !== usuario.id) {
      notificaciones.push({
        tipo: NotifTipo.CAMBIO_ESTADO,
        remitenteId: usuario.id,
        destinatarioId: ticket.asignaciones[0].tecnicoId,
        asunto: `Ticket ${ticket.consecutivo} - Estado actualizado`,
        mensaje: `El estado del ticket ha cambiado a ${nuevoEstado}. Observación: ${observaciones}`,
        prioridad: NotifPrioridad.MEDIA
      });
    }

    if (nuevoEstado === TicketEstado.CANCELADO && usuario.rol !== 'ADM') {
      const administradores = await this.prisma.usuario.findMany({
        where: { rol: 'ADM', activo: true }
      });

      for (const admin of administradores) {
        notificaciones.push({
          tipo: NotifTipo.CAMBIO_ESTADO,
          remitenteId: usuario.id,
          destinatarioId: admin.id,
          asunto: `Ticket ${ticket.consecutivo} - Cancelado`,
          mensaje: `El ticket ha sido cancelado por el usuario. Observación: ${observaciones}`,
          prioridad: NotifPrioridad.ALTA
        });
      }
    }

    for (const notif of notificaciones) {
      await this.prisma.notificacion.create({ data: notif });
    }
  }

  async obtenerHistorialTicket(ticketId: number) {
    return this.prisma.ticketHistorial.findMany({
      where: { ticketId },
      include: {
        usuario: { select: { nombre: true, correo: true } },
        imagenes: true
      },
      orderBy: { creadoEn: 'desc' }
    });
  }
}