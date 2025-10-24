import { Prioridad } from "../../generated/prisma";

export const categorias = [
  {
    codigo: "HW",
    nombre: "Hardware",
    descripcion: "Problemas relacionados con equipos físicos y periféricos",
    activa: true,
    slaNombre: "SLA Hardware Crítico",
    slaTiempoMaxRespuestaMin: 30,
    slaTiempoMaxResolucionMin: 240,
    slaDescripcion: "Respuesta rápida para problemas críticos de hardware",
    slaNivelUrgencia: Prioridad.CRITICO
  },
  {
    codigo: "SW",
    nombre: "Software",
    descripcion: "Problemas con aplicaciones, sistemas operativos y licencias",
    activa: true,
    slaNombre: "SLA Software Estándar",
    slaTiempoMaxRespuestaMin: 60,
    slaTiempoMaxResolucionMin: 480,
    slaDescripcion: "Tiempo estándar para resolución de problemas de software",
    slaNivelUrgencia: Prioridad.MEDIO
  },
  {
    codigo: "RED",
    nombre: "Redes",
    descripcion: "Problemas de conectividad, WiFi, servidores y infraestructura de red",
    activa: true,
    slaNombre: "SLA Redes Prioritario",
    slaTiempoMaxRespuestaMin: 15,
    slaTiempoMaxResolucionMin: 180,
    slaDescripcion: "Alta prioridad para problemas que afectan la conectividad",
    slaNivelUrgencia: Prioridad.ALTO
  },
  {
    codigo: "SEG",
    nombre: "Seguridad",
    descripcion: "Problemas de seguridad, accesos, antivirus y firewall",
    activa: true,
    slaNombre: "SLA Seguridad",
    slaTiempoMaxRespuestaMin: 120,
    slaTiempoMaxResolucionMin: 1440,
    slaDescripcion: "Tiempo extendido para problemas de seguridad no críticos",
    slaNivelUrgencia: Prioridad.BAJO
  },
  {
    codigo: "TEL",
    nombre: "Telecomunicaciones",
    descripcion: "Problemas con teléfonos, VoIP, videoconferencia y comunicaciones",
    activa: true,
    slaNombre: "SLA Telecomunicaciones",
    slaTiempoMaxRespuestaMin: 45,
    slaTiempoMaxResolucionMin: 360,
    slaDescripcion: "Tiempo balanceado para problemas de comunicaciones",
    slaNivelUrgencia: Prioridad.MEDIO
  }
];