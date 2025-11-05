import { PrismaClient, TicketEstado, ModoAsignacion, Prioridad, NotifTipo, NotifPrioridad, Role } from "../generated/prisma";

const prisma = new PrismaClient();

const main = async () => {
  try {
    console.log('Iniciando seed de la base de datos...');

    await prisma.notificacion.deleteMany();
    await prisma.valoracion.deleteMany();
    await prisma.imagenTicket.deleteMany();
    await prisma.ticketHistorial.deleteMany();
    await prisma.asignacion.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.reglaAutotriage.deleteMany();
    await prisma.usuarioEspecialidad.deleteMany();
    await prisma.categoriaEspecialidad.deleteMany();
    await prisma.categoriaEtiqueta.deleteMany();
    await prisma.etiqueta.deleteMany();
    await prisma.especialidad.deleteMany();
    await prisma.categoria.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.secuenciaConsecutivo.deleteMany();

    // 1. Crear Secuencia Consecutivo
    await prisma.secuenciaConsecutivo.create({
      data: {
        anio: 2024,
        ultimoConsecutivo: 50
      }
    });

    const usuarios = [
      // Administrador (Tú)
      {
        correo: "agargore.io@gmail.com",
        contrasenaHash: "8nUqmSDYJXII6kR+oGrPZueIoWBPizXVhk9xlGkS5RCdYG8o",
        nombre: "David Josue Villegas Salas",
        telefono: "+506 6006-5817",
        rol: Role.ADM,
        activo: true,
        disponible: true,
        cargosActuales: 0,
        limiteCargaTickets: 15
      },
            // Administrador (2)
      {
        correo: "lalbertorodriguez96@gmail.com",
        contrasenaHash: "TKrW0GIwHDNvrYkSclg2Pj7ssrpOvQ9EKN6nQ9aPpigtHsiw",
        nombre: "Luis Alberto Rodriguez Herrera",
        telefono: "2223 5343",
        rol: Role.ADM,
        activo: true,
        disponible: true,
        cargosActuales: 0,
        limiteCargaTickets: 15
      },
      // Técnicos especializados
      {
        correo: "carlos.rodriguez@empresa.com",
        contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        nombre: "Carlos Rodríguez Méndez",
        telefono: "+506 8888-0001",
        rol: Role.TEC,
        activo: true,
        disponible: true,
        cargosActuales: 3,
        limiteCargaTickets: 8
      },
      {
        correo: "ana.martinez@empresa.com",
        contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        nombre: "Ana Martínez Solís",
        telefono: "+506 8888-0002",
        rol: Role.TEC,
        activo: true,
        disponible: false, // En vacaciones
        cargosActuales: 0,
        limiteCargaTickets: 8
      },
      {
        correo: "miguel.sanchez@empresa.com",
        contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        nombre: "Miguel Sánchez Vargas",
        telefono: "+506 8888-0003",
        rol: Role.TEC,
        activo: true,
        disponible: true,
        cargosActuales: 5,
        limiteCargaTickets: 10
      },
      {
        correo: "laura.gonzalez@empresa.com",
        contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        nombre: "Laura González Rojas",
        telefono: "+506 8888-0004",
        rol: Role.TEC,
        activo: true,
        disponible: true,
        cargosActuales: 2,
        limiteCargaTickets: 8
      },
      {
        correo: "javier.ramirez@empresa.com",
        contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        nombre: "Javier Ramírez Chaves",
        telefono: "+506 8888-0005",
        rol: Role.TEC,
        activo: true,
        disponible: true,
        cargosActuales: 4,
        limiteCargaTickets: 8
      },
      // Usuarios finales - Departamentos diferentes
      {
        correo: "roberto.vargas@empresa.com",
        contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        nombre: "Roberto Vargas González",
        telefono: "+506 8888-1001",
        rol: Role.USR,
        activo: true
      },
      {
        correo: "elena.ramirez@empresa.com",
        contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        nombre: "Elena Ramírez Fernández",
        telefono: "+506 8888-1002",
        rol: Role.USR,
        activo: true
      },
      {
        correo: "diego.herrera@empresa.com",
        contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        nombre: "Diego Herrera Mora",
        telefono: "+506 8888-1003",
        rol: Role.USR,
        activo: true
      },
      {
        correo: "sofia.mendoza@empresa.com",
        contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        nombre: "Sofía Mendoza Castro",
        telefono: "+506 8888-1004",
        rol: Role.USR,
        activo: true
      },
      {
        correo: "ricardo.lopez@empresa.com",
        contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        nombre: "Ricardo López Jiménez",
        telefono: "+506 8888-1005",
        rol: Role.USR,
        activo: true
      },
      {
        correo: "maria.fernandez@empresa.com",
        contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        nombre: "María Fernández Rodríguez",
        telefono: "+506 8888-1006",
        rol: Role.USR,
        activo: true
      },
      {
        correo: "jose.garcia@empresa.com",
        contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        nombre: "José García Pérez",
        telefono: "+506 8888-1007",
        rol: Role.USR,
        activo: true
      },
      {
        correo: "carmen.torres@empresa.com",
        contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        nombre: "Carmen Torres Sánchez",
        telefono: "+506 8888-1008",
        rol: Role.USR,
        activo: true
      },
      {
        correo: "antonio.diaz@empresa.com",
        contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        nombre: "Antonio Díaz Navarro",
        telefono: "+506 8888-1009",
        rol: Role.USR,
        activo: true
      },
      {
        correo: "isabel.ruiz@empresa.com",
        contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        nombre: "Isabel Ruiz Mendoza",
        telefono: "+506 8888-1010",
        rol: Role.USR,
        activo: true
      }
    ];

    for (const usuario of usuarios) {
      await prisma.usuario.create({
        data: usuario
      });
    }

    const especialidades = [
      {
        codigo: "HW_REP_CRIT",
        nombre: "Reparación Hardware Crítico",
        descripcion: "Especialista en reparación urgente de equipos críticos para la operación",
        activa: true
      },
      {
        codigo: "HW_MANT_PREV",
        nombre: "Mantenimiento Preventivo",
        descripcion: "Mantenimiento preventivo y correctivo programado de equipos",
        activa: true
      },
      {
        codigo: "SW_OFFICE",
        nombre: "Soporte Microsoft Office",
        descripcion: "Especialista en suite Office 365 y aplicaciones de productividad",
        activa: true
      },
      {
        codigo: "SW_ESPEC",
        nombre: "Software Especializado",
        descripcion: "Instalación y configuración de software especializado por departamento",
        activa: true
      },
      {
        codigo: "RED_LAN_WAN",
        nombre: "Redes LAN/WAN",
        descripcion: "Configuración y administración de infraestructura de red corporativa",
        activa: true
      },
      {
        codigo: "RED_WIFI",
        nombre: "Redes Inalámbricas",
        descripcion: "Especialista en redes WiFi y conectividad móvil",
        activa: true
      },
      {
        codigo: "SEG_AV_FW",
        nombre: "Seguridad Antivirus/Firewall",
        descripcion: "Gestión de seguridad perimetral y protección de endpoints",
        activa: true
      },
      {
        codigo: "TEL_VOIP_VID",
        nombre: "Telecomunicaciones VoIP/Video",
        descripcion: "Especialista en telefonía IP y sistemas de videoconferencia",
        activa: true
      },
      {
        codigo: "CLOUD_O365",
        nombre: "Cloud y Office 365",
        descripcion: "Administración de servicios en la nube y plataforma Office 365",
        activa: true
      },
      {
        codigo: "BACKUP_DR",
        nombre: "Backup y Recuperación",
        descripcion: "Especialista en estrategias de backup y recuperación ante desastres",
        activa: true
      }
    ];

    await prisma.especialidad.createMany({
      data: especialidades
    });

    const categorias = [
      {
        codigo: "HW_CRIT",
        nombre: "Hardware Crítico",
        descripcion: "Problemas con equipos críticos que afectan operaciones esenciales",
        activa: true,
        slaNombre: "SLA Hardware Crítico",
        slaTiempoMaxRespuestaMin: 15,
        slaTiempoMaxResolucionMin: 120,
        slaDescripcion: "Respuesta inmediata para equipos críticos de producción",
        slaNivelUrgencia: Prioridad.CRITICO
      },
      {
        codigo: "HW_EST",
        nombre: "Hardware Estándar",
        descripcion: "Problemas con equipos no críticos y periféricos",
        activa: true,
        slaNombre: "SLA Hardware Estándar",
        slaTiempoMaxRespuestaMin: 60,
        slaTiempoMaxResolucionMin: 480,
        slaDescripcion: "Tiempo estándar para equipos de uso general",
        slaNivelUrgencia: Prioridad.MEDIO
      },
      {
        codigo: "SW_URG",
        nombre: "Software Urgente",
        descripcion: "Problemas críticos con aplicaciones de negocio esenciales",
        activa: true,
        slaNombre: "SLA Software Urgente",
        slaTiempoMaxRespuestaMin: 30,
        slaTiempoMaxResolucionMin: 240,
        slaDescripcion: "Alta prioridad para aplicaciones críticas del negocio",
        slaNivelUrgencia: Prioridad.ALTO
      },
      {
        codigo: "SW_EST",
        nombre: "Software Estándar",
        descripcion: "Problemas con aplicaciones de oficina y herramientas generales",
        activa: true,
        slaNombre: "SLA Software Estándar",
        slaTiempoMaxRespuestaMin: 120,
        slaTiempoMaxResolucionMin: 1440,
        slaDescripcion: "Tiempo estándar para problemas de software no críticos",
        slaNivelUrgencia: Prioridad.MEDIO
      },
      {
        codigo: "RED_CRIT",
        nombre: "Redes Críticas",
        descripcion: "Problemas que afectan conectividad de áreas críticas o múltiples usuarios",
        activa: true,
        slaNombre: "SLA Redes Críticas",
        slaTiempoMaxRespuestaMin: 10,
        slaTiempoMaxResolucionMin: 60,
        slaDescripcion: "Máxima prioridad para problemas de conectividad masiva",
        slaNivelUrgencia: Prioridad.CRITICO
      },
      {
        codigo: "RED_EST",
        nombre: "Redes Estándar",
        descripcion: "Problemas de conectividad individual o áreas no críticas",
        activa: true,
        slaNombre: "SLA Redes Estándar",
        slaTiempoMaxRespuestaMin: 45,
        slaTiempoMaxResolucionMin: 360,
        slaDescripcion: "Tiempo estándar para problemas de red localizados",
        slaNivelUrgencia: Prioridad.MEDIO
      },
      {
        codigo: "SEG_INC",
        nombre: "Seguridad Incidente",
        descripcion: "Incidentes de seguridad, malware o accesos no autorizados",
        activa: true,
        slaNombre: "SLA Seguridad Incidente",
        slaTiempoMaxRespuestaMin: 5,
        slaTiempoMaxResolucionMin: 120,
        slaDescripcion: "Respuesta inmediata para incidentes de seguridad",
        slaNivelUrgencia: Prioridad.CRITICO
      },
      {
        codigo: "SEG_CONF",
        nombre: "Seguridad Configuración",
        descripcion: "Configuraciones de seguridad, permisos y políticas",
        activa: true,
        slaNombre: "SLA Seguridad Configuración",
        slaTiempoMaxRespuestaMin: 240,
        slaTiempoMaxResolucionMin: 2880,
        slaDescripcion: "Tiempo extendido para configuraciones de seguridad",
        slaNivelUrgencia: Prioridad.BAJO
      },
      {
        codigo: "TEL_CRIT",
        nombre: "Telecomunicaciones Críticas",
        descripcion: "Problemas con sistemas de comunicación esenciales",
        activa: true,
        slaNombre: "SLA Telecomunicaciones Críticas",
        slaTiempoMaxRespuestaMin: 20,
        slaTiempoMaxResolucionMin: 180,
        slaDescripcion: "Alta prioridad para sistemas de comunicación críticos",
        slaNivelUrgencia: Prioridad.ALTO
      },
      {
        codigo: "TEL_EST",
        nombre: "Telecomunicaciones Estándar",
        descripcion: "Problemas con teléfonos individuales o configuraciones",
        activa: true,
        slaNombre: "SLA Telecomunicaciones Estándar",
        slaTiempoMaxRespuestaMin: 90,
        slaTiempoMaxResolucionMin: 720,
        slaDescripcion: "Tiempo estándar para problemas de telecomunicaciones",
        slaNivelUrgencia: Prioridad.MEDIO
      }
    ];

    for (const categoria of categorias) {
      await prisma.categoria.create({
        data: categoria
      });
    }

    const etiquetas = [
      // Hardware
      { nombre: "Laptop Dell", descripcion: "Problemas específicos con laptops Dell", activa: true },
      { nombre: "Laptop HP", descripcion: "Problemas específicos con laptops HP", activa: true },
      { nombre: "Workstation", descripcion: "Estaciones de trabajo de alto rendimiento", activa: true },
      { nombre: "Impresora Laser", descripcion: "Impresoras láser de red", activa: true },
      { nombre: "Monitor", descripcion: "Problemas con monitores y pantallas", activa: true },
      { nombre: "Docking Station", descripcion: "Bases de conexión para laptops", activa: true },
      
      // Software
      { nombre: "Windows 11", descripcion: "Problemas con sistema operativo Windows 11", activa: true },
      { nombre: "Office 365", descripcion: "Suite completa Office 365", activa: true },
      { nombre: "Teams", descripcion: "Microsoft Teams", activa: true },
      { nombre: "Outlook", descripcion: "Cliente de correo Outlook", activa: true },
      { nombre: "ERP", descripcion: "Sistema ERP corporativo", activa: true },
      { nombre: "Antivirus", descripcion: "Software antivirus corporativo", activa: true },
      
      // Redes
      { nombre: "WiFi Corporativo", descripcion: "Red WiFi de la empresa", activa: true },
      { nombre: "VPN", descripcion: "Conexiones VPN", activa: true },
      { nombre: "Switch", descripcion: "Equipos de switching", activa: true },
      { nombre: "Firewall", descripcion: "Firewall corporativo", activa: true },
      { nombre: "Internet", descripcion: "Conectividad a Internet", activa: true },
      
      // Telecomunicaciones
      { nombre: "Teléfono IP", descripcion: "Teléfonos VoIP", activa: true },
      { nombre: "Videoconferencia", descripcion: "Sistemas de videoconferencia", activa: true },
      { nombre: "Sala Reuniones", descripcion: "Equipos de salas de reuniones", activa: true }
    ];

    await prisma.etiqueta.createMany({
      data: etiquetas
    });

    const categoriaEtiquetas = [
      // Hardware Crítico
      { categoriaId: 1, etiquetaId: 1 }, { categoriaId: 1, etiquetaId: 2 }, { categoriaId: 1, etiquetaId: 3 },
      // Hardware Estándar
      { categoriaId: 2, etiquetaId: 4 }, { categoriaId: 2, etiquetaId: 5 }, { categoriaId: 2, etiquetaId: 6 },
      // Software Urgente
      { categoriaId: 3, etiquetaId: 8 }, { categoriaId: 3, etiquetaId: 9 }, { categoriaId: 3, etiquetaId: 10 },
      // Software Estándar
      { categoriaId: 4, etiquetaId: 7 }, { categoriaId: 4, etiquetaId: 11 }, { categoriaId: 4, etiquetaId: 12 },
      // Redes Críticas
      { categoriaId: 5, etiquetaId: 13 }, { categoriaId: 5, etiquetaId: 14 }, { categoriaId: 5, etiquetaId: 15 },
      // Redes Estándar
      { categoriaId: 6, etiquetaId: 16 }, { categoriaId: 6, etiquetaId: 17 },
      // Telecomunicaciones
      { categoriaId: 9, etiquetaId: 18 }, { categoriaId: 9, etiquetaId: 19 }, { categoriaId: 9, etiquetaId: 20 },
      { categoriaId: 10, etiquetaId: 18 }, { categoriaId: 10, etiquetaId: 19 }
    ];

    await prisma.categoriaEtiqueta.createMany({
      data: categoriaEtiquetas
    });

    // 7. Crear relaciones Categoria-Especialidad
    const categoriaEspecialidades = [
      // Hardware Crítico
      { categoriaId: 1, especialidadId: 1 }, { categoriaId: 1, especialidadId: 2 },
      // Hardware Estándar
      { categoriaId: 2, especialidadId: 2 },
      // Software Urgente
      { categoriaId: 3, especialidadId: 3 }, { categoriaId: 3, especialidadId: 9 },
      // Software Estándar
      { categoriaId: 4, especialidadId: 3 }, { categoriaId: 4, especialidadId: 4 },
      // Redes Críticas
      { categoriaId: 5, especialidadId: 5 }, { categoriaId: 5, especialidadId: 6 },
      // Redes Estándar
      { categoriaId: 6, especialidadId: 5 }, { categoriaId: 6, especialidadId: 6 },
      // Seguridad Incidente
      { categoriaId: 7, especialidadId: 7 }, { categoriaId: 7, especialidadId: 10 },
      // Telecomunicaciones
      { categoriaId: 9, especialidadId: 8 }, { categoriaId: 10, especialidadId: 8 }
    ];

    await prisma.categoriaEspecialidad.createMany({
      data: categoriaEspecialidades
    });

    // 8. Crear relaciones Usuario-Especialidad
    const usuarioEspecialidades = [
      // Carlos - Especialista en Hardware y Redes
      { usuarioId: 2, especialidadId: 1 }, { usuarioId: 2, especialidadId: 2 }, { usuarioId: 2, especialidadId: 5 },
      // Ana - Especialista en Software y Office 365
      { usuarioId: 3, especialidadId: 3 }, { usuarioId: 3, especialidadId: 4 }, { usuarioId: 3, especialidadId: 9 },
      // Miguel - Especialista en Redes y Seguridad
      { usuarioId: 4, especialidadId: 5 }, { usuarioId: 4, especialidadId: 6 }, { usuarioId: 4, especialidadId: 7 },
      // Laura - Especialista en Telecomunicaciones y Software
      { usuarioId: 5, especialidadId: 8 }, { usuarioId: 5, especialidadId: 3 }, { usuarioId: 5, especialidadId: 4 },
      // Javier - Especialista en Cloud y Backup
      { usuarioId: 6, especialidadId: 9 }, { usuarioId: 6, especialidadId: 10 }, { usuarioId: 6, especialidadId: 7 }
    ];

    await prisma.usuarioEspecialidad.createMany({
      data: usuarioEspecialidades
    });

    // 9. Crear Reglas de Autotriage avanzadas
    await prisma.reglaAutotriage.createMany({
      data: [
        {
          nombre: "Hardware Crítico - Producción",
          descripcion: "Asigna equipos críticos de producción a especialistas en hardware urgente",
          criterios: JSON.stringify({ 
            categoria: "HW_CRIT", 
            prioridad: ["CRITICO", "ALTO"] as any,
            departamento: ["PRODUCCION", "OPERACIONES"]
          }),
          formulaPrioridad: "prioridad * 1500 - tiempoRestanteSLA",
          limiteCargaTecnico: 2,
          ordenPrioridad: 1,
          activo: true,
          categoriaId: 1,
          especialidadId: 1
        },
        {
          nombre: "Redes Críticas - Conectividad Masiva",
          descripcion: "Asigna problemas de conectividad que afectan múltiples usuarios",
          criterios: JSON.stringify({ 
            categoria: "RED_CRIT", 
            prioridad: ["CRITICO", "ALTO"],
            usuariosAfectados: ">5"
          }),
          formulaPrioridad: "prioridad * 1200 - tiempoRestanteSLA",
          limiteCargaTecnico: 3,
          ordenPrioridad: 2,
          activo: true,
          categoriaId: 5,
          especialidadId: 5
        },
        {
          nombre: "Software Urgente - Aplicaciones Críticas",
          descripcion: "Asigna problemas con aplicaciones críticas del negocio",
          criterios: JSON.stringify({ 
            categoria: "SW_URG", 
            prioridad: ["ALTO", "MEDIO"],
            aplicacion: ["ERP", "OFFICE365", "TEAMS"]
          }),
          formulaPrioridad: "prioridad * 1000 - tiempoRestanteSLA",
          limiteCargaTecnico: 4,
          ordenPrioridad: 3,
          activo: true,
          categoriaId: 3,
          especialidadId: 3
        },
        {
          nombre: "Seguridad Incidente - Malware",
          descripcion: "Asigna incidentes de seguridad y malware inmediatamente",
          criterios: JSON.stringify({ 
            categoria: "SEG_INC", 
            prioridad: ["CRITICO"],
            tipoIncidente: ["MALWARE", "ACCESO_NO_AUTORIZADO"]
          }),
          formulaPrioridad: "2000 - tiempoRestanteSLA",
          limiteCargaTecnico: 1,
          ordenPrioridad: 1,
          activo: true,
          categoriaId: 7,
          especialidadId: 7
        }
      ]
    });

    // 10. Crear Tickets variados y realistas
    
    // Función para calcular fechas límite correctamente
    const calcularFechaLimite = (fechaCreacion: Date, minutosSLA: number) => {
      return new Date(fechaCreacion.getTime() + (minutosSLA * 60 * 1000));
    };

    // Fecha base para testing (hace 2 horas)
    const fechaBase = new Date(Date.now() - (2 * 60 * 60 * 1000));

    // Tickets Críticos - Hardware
    const ticket1 = await prisma.ticket.create({
      data: {
        consecutivo: "TKT-2024-001",
        titulo: "Servidor de producción no inicia - Error crítico",
        descripcion: "El servidor principal de la base de datos no arranca después del mantenimiento programado. Presenta pantalla azul durante el boot. Urgente, afecta todas las operaciones.",
        solicitanteId: 7, // Roberto
        categoriaId: 1, // Hardware Crítico
        estado: TicketEstado.EN_PROCESO,
        modoAsignacion: ModoAsignacion.AUTOMATICA,
        prioridad: Prioridad.CRITICO,
        fechaCreacion: new Date(fechaBase.getTime()),
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime()), 15), // 15 min SLA
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime()), 120), // 120 min SLA
        fechaRespuesta: new Date(fechaBase.getTime() + 10 * 60 * 1000), // 10 min después
        puntajePrioridad: 10.0
      }
    });

    const ticket2 = await prisma.ticket.create({
      data: {
        consecutivo: "TKT-2024-002",
        titulo: "Laptop ejecutivo no funciona - Reunión importante",
        descripcion: "La laptop del Director General no enciende. Tiene presentación con inversionistas en 3 horas. Equipo: Dell Latitude 7420.",
        solicitanteId: 8, // Elena
        categoriaId: 1, // Hardware Crítico
        estado: TicketEstado.ASIGNADO,
        modoAsignacion: ModoAsignacion.AUTOMATICA,
        prioridad: Prioridad.CRITICO,
        fechaCreacion: new Date(fechaBase.getTime() + 30 * 60 * 1000), // 30 min después del primero
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime() + 30 * 60 * 1000), 15),
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime() + 30 * 60 * 1000), 120),
        fechaRespuesta: new Date(fechaBase.getTime() + 35 * 60 * 1000), // 5 min después
        puntajePrioridad: 9.5
      }
    });

    // Tickets Redes Críticas
    const ticket3 = await prisma.ticket.create({
      data: {
        consecutivo: "TKT-2024-003",
        titulo: "Internet caído en toda la oficina central",
        descripcion: "No hay conectividad a Internet en ninguno de los 50 equipos de la oficina central. El router principal muestra luces rojas.",
        solicitanteId: 9, // Diego
        categoriaId: 5, // Redes Críticas
        estado: TicketEstado.EN_PROCESO,
        modoAsignacion: ModoAsignacion.AUTOMATICA,
        prioridad: Prioridad.CRITICO,
        fechaCreacion: new Date(fechaBase.getTime() - 60 * 60 * 1000), // Hace 3 horas (1 hora antes de fechaBase)
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime() - 60 * 60 * 1000), 10),
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime() - 60 * 60 * 1000), 60),
        fechaRespuesta: new Date(fechaBase.getTime() - 55 * 60 * 1000), // 5 min después
        puntajePrioridad: 10.0
      }
    });

    const ticket4 = await prisma.ticket.create({
      data: {
        consecutivo: "TKT-2024-004",
        titulo: "WiFi caído en piso 3 - Área de ventas",
        descripcion: "El WiFi no funciona en todo el piso 3 donde está el equipo de ventas (15 personas). Los equipos cableados sí funcionan.",
        solicitanteId: 10, // Sofía
        categoriaId: 5, // Redes Críticas
        estado: TicketEstado.ASIGNADO,
        modoAsignacion: ModoAsignacion.AUTOMATICA,
        prioridad: Prioridad.ALTO,
        fechaCreacion: new Date(fechaBase.getTime() + 45 * 60 * 1000), // 45 min después del primero
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime() + 45 * 60 * 1000), 10),
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime() + 45 * 60 * 1000), 60),
        fechaRespuesta: new Date(fechaBase.getTime() + 50 * 60 * 1000), // 5 min después
        puntajePrioridad: 8.0
      }
    });

    // Tickets Software Urgente
    const ticket5 = await prisma.ticket.create({
      data: {
        consecutivo: "TKT-2024-005",
        titulo: "ERP corporativo no carga - Bloquea facturación",
        descripcion: "El sistema ERP no inicia, muestra error de conexión a base de datos. El departamento de facturación no puede trabajar.",
        solicitanteId: 11, // Ricardo
        categoriaId: 3, // Software Urgente
        estado: TicketEstado.EN_PROCESO,
        modoAsignacion: ModoAsignacion.AUTOMATICA,
        prioridad: Prioridad.CRITICO,
        fechaCreacion: new Date(fechaBase.getTime() + 15 * 60 * 1000), // 15 min después del primero
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime() + 15 * 60 * 1000), 30),
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime() + 15 * 60 * 1000), 240),
        fechaRespuesta: new Date(fechaBase.getTime() + 20 * 60 * 1000), // 5 min después
        puntajePrioridad: 9.8
      }
    });

    const ticket6 = await prisma.ticket.create({
      data: {
        consecutivo: "TKT-2024-006",
        titulo: "Teams no funciona - Reunión ejecutiva",
        descripcion: "Microsoft Teams no inicia en equipos de alta gerencia. Error de credenciales. Reunión importante en 1 hora.",
        solicitanteId: 12, // María
        categoriaId: 3, // Software Urgente
        estado: TicketEstado.ASIGNADO,
        modoAsignacion: ModoAsignacion.MANUAL,
        prioridad: Prioridad.ALTO,
        fechaCreacion: new Date(fechaBase.getTime() + 75 * 60 * 1000), // 1 hora 15 min después del primero
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime() + 75 * 60 * 1000), 30),
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime() + 75 * 60 * 1000), 240),
        fechaRespuesta: new Date(fechaBase.getTime() + 78 * 60 * 1000), // 3 min después
        puntajePrioridad: 8.5
      }
    });

    // Tickets Estándar - Varios estados
    const ticket7 = await prisma.ticket.create({
      data: {
        consecutivo: "TKT-2024-007",
        titulo: "Impresora atascada - Área contabilidad",
        descripcion: "La impresora HP LaserJet 500 muestra error de papel atascado. No hay papel visible en las bandejas.",
        solicitanteId: 13, // José
        categoriaId: 2, // Hardware Estándar
        estado: TicketEstado.ESPERA_CLIENTE,
        modoAsignacion: ModoAsignacion.AUTOMATICA,
        prioridad: Prioridad.MEDIO,
        fechaCreacion: new Date(fechaBase.getTime() + 90 * 60 * 1000), // 1.5 horas después del primero
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime() + 90 * 60 * 1000), 60),
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime() + 90 * 60 * 1000), 480),
        fechaRespuesta: new Date(fechaBase.getTime() + 95 * 60 * 1000), // 5 min después
        puntajePrioridad: 5.0
      }
    });

    const ticket8 = await prisma.ticket.create({
      data: {
        consecutivo: "TKT-2024-008",
        titulo: "Solicitud de software Adobe Photoshop",
        descripcion: "Necesito instalar Adobe Photoshop CC para el departamento de diseño. Ya tengo la licencia aprobada.",
        solicitanteId: 14, // Carmen
        categoriaId: 4, // Software Estándar
        estado: TicketEstado.PENDIENTE,
        modoAsignacion: ModoAsignacion.AUTOMATICA,
        prioridad: Prioridad.BAJO,
        fechaCreacion: new Date(fechaBase.getTime() + 120 * 60 * 1000), // 2 horas después del primero
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime() + 120 * 60 * 1000), 120),
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime() + 120 * 60 * 1000), 1440),
        puntajePrioridad: 2.5
      }
    });

    const ticket9 = await prisma.ticket.create({
      data: {
        consecutivo: "TKT-2024-009",
        titulo: "Configuración VPN para teletrabajo",
        descripcion: "Requiero configurar la conexión VPN en mi laptop para trabajar desde casa la próxima semana.",
        solicitanteId: 15, // Antonio
        categoriaId: 6, // Redes Estándar
        estado: TicketEstado.EN_PROCESO,
        modoAsignacion: ModoAsignacion.MANUAL,
        prioridad: Prioridad.MEDIO,
        fechaCreacion: new Date(fechaBase.getTime() - 30 * 60 * 1000), // 30 min antes del primero
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime() - 30 * 60 * 1000), 45),
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime() - 30 * 60 * 1000), 360),
        fechaRespuesta: new Date(fechaBase.getTime() - 25 * 60 * 1000), // 5 min después
        puntajePrioridad: 5.0
      }
    });

    const ticket10 = await prisma.ticket.create({
      data: {
        consecutivo: "TKT-2024-010",
        titulo: "Problema con teléfono IP - Sin audio",
        descripcion: "Mi teléfono IP Cisco no reproduce audio en llamadas entrantes. Las salientes funcionan bien.",
        solicitanteId: 16, // Isabel
        categoriaId: 10, // Telecomunicaciones Estándar
        estado: TicketEstado.ASIGNADO,
        modoAsignacion: ModoAsignacion.AUTOMATICA,
        prioridad: Prioridad.MEDIO,
        fechaCreacion: new Date(fechaBase.getTime() + 60 * 60 * 1000), // 1 hora después del primero
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime() + 60 * 60 * 1000), 90),
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime() + 60 * 60 * 1000), 720),
        fechaRespuesta: new Date(fechaBase.getTime() + 65 * 60 * 1000), // 5 min después
        puntajePrioridad: 5.0
      }
    });

    // Tickets Resueltos con valoración
    const ticket11 = await prisma.ticket.create({
      data: {
        consecutivo: "TKT-2024-011",
        titulo: "Pantalla rota en laptop - RESUELTO",
        descripcion: "La pantalla de mi laptop Dell está rota después de un accidente. Necesito reemplazo.",
        solicitanteId: 7, // Roberto
        categoriaId: 2, // Hardware Estándar
        estado: TicketEstado.RESUELTO,
        modoAsignacion: ModoAsignacion.AUTOMATICA,
        prioridad: Prioridad.ALTO,
        fechaCreacion: new Date(fechaBase.getTime() - 48 * 60 * 60 * 1000), // 2 días antes
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime() - 48 * 60 * 60 * 1000), 60),
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime() - 48 * 60 * 60 * 1000), 480),
        fechaRespuesta: new Date(fechaBase.getTime() - 47 * 60 * 60 * 1000), // 1 hora después
        fechaCierre: new Date(fechaBase.getTime() - 24 * 60 * 60 * 1000), // 1 día después
        diasResolucion: 1,
        puntajePrioridad: 7.5
      }
    });

    const ticket12 = await prisma.ticket.create({
      data: {
        consecutivo: "TKT-2024-012",
        titulo: "Outlook no sincroniza correos - RESUELTO",
        descripcion: "Outlook 365 no descarga nuevos correos del servidor. Muestra error de sincronización.",
        solicitanteId: 8, // Elena
        categoriaId: 4, // Software Estándar
        estado: TicketEstado.CERRADO,
        modoAsignacion: ModoAsignacion.MANUAL,
        prioridad: Prioridad.MEDIO,
        fechaCreacion: new Date(fechaBase.getTime() - 72 * 60 * 60 * 1000), // 3 días antes
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime() - 72 * 60 * 60 * 1000), 120),
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime() - 72 * 60 * 60 * 1000), 1440),
        fechaRespuesta: new Date(fechaBase.getTime() - 71 * 60 * 60 * 1000), // 1 hora después
        fechaCierre: new Date(fechaBase.getTime() - 48 * 60 * 60 * 1000), // 1 día después
        diasResolucion: 1,
        puntajePrioridad: 5.0
      }
    });

    // Más tickets para llenar la base de datos
    const ticketsAdicionales = [
      {
        consecutivo: "TKT-2024-013",
        titulo: "Teclado no funciona - Letras stuck",
        descripcion: "Algunas teclas del teclado no responden o se repiten constantemente.",
        solicitanteId: 9,
        categoriaId: 2,
        estado: TicketEstado.PENDIENTE,
        modoAsignacion: ModoAsignacion.AUTOMATICA,
        prioridad: Prioridad.BAJO,
        fechaCreacion: new Date(fechaBase.getTime() + 150 * 60 * 1000), // 2.5 horas después
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime() + 150 * 60 * 1000), 60),
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime() + 150 * 60 * 1000), 480),
      },
      {
        consecutivo: "TKT-2024-014",
        titulo: "Access point WiFi lento - Piso 2",
        descripcion: "La conexión WiFi en el piso 2 es extremadamente lenta, especialmente cerca de la sala de conferencias.",
        solicitanteId: 10,
        categoriaId: 6,
        estado: TicketEstado.ASIGNADO,
        modoAsignacion: ModoAsignacion.AUTOMATICA,
        prioridad: Prioridad.MEDIO,
        fechaCreacion: new Date(fechaBase.getTime() + 180 * 60 * 1000), // 3 horas después
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime() + 180 * 60 * 1000), 45),
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime() + 180 * 60 * 1000), 360),
        fechaRespuesta: new Date(fechaBase.getTime() + 185 * 60 * 1000),
      },
      {
        consecutivo: "TKT-2024-015",
        titulo: "Sistema de backup falló",
        descripcion: "El backup automático nocturno falló con error de espacio en disco.",
        solicitanteId: 11,
        categoriaId: 7,
        estado: TicketEstado.EN_PROCESO,
        modoAsignacion: ModoAsignacion.AUTOMATICA,
        prioridad: Prioridad.ALTO,
        fechaCreacion: new Date(fechaBase.getTime() + 210 * 60 * 1000), // 3.5 horas después
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime() + 210 * 60 * 1000), 5),
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime() + 210 * 60 * 1000), 120),
        fechaRespuesta: new Date(fechaBase.getTime() + 212 * 60 * 1000),
      },
      {
        consecutivo: "TKT-2024-016",
        titulo: "Firewall corporativo comprometido",
        descripcion: "Detección de intentos de intrusión en el firewall principal. Posible brecha de seguridad.",
        solicitanteId: 11,
        categoriaId: 7, // Seguridad Incidente
        estado: TicketEstado.PENDIENTE,
        modoAsignacion: ModoAsignacion.AUTOMATICA,
        prioridad: Prioridad.CRITICO,
        fechaCreacion: new Date(fechaBase.getTime() + 240 * 60 * 1000), // 4 horas después
        fechaLimiteRespuesta: calcularFechaLimite(new Date(fechaBase.getTime() + 240 * 60 * 1000), 5),
        fechaLimiteResolucion: calcularFechaLimite(new Date(fechaBase.getTime() + 240 * 60 * 1000), 120),
      }
    ];

    for (const ticketData of ticketsAdicionales) {
      await prisma.ticket.create({
        data: {
          ...ticketData,
          puntajePrioridad: ticketData.prioridad === Prioridad.CRITICO ? 10.0 : 
                           ticketData.prioridad === Prioridad.ALTO ? 7.5 :
                           ticketData.prioridad === Prioridad.MEDIO ? 5.0 : 2.5,
        }
      });
    }

    // 11. Crear Asignaciones realistas
    await prisma.asignacion.createMany({
      data: [
        // Asignaciones activas críticas
        {
          ticketId: ticket1.id,
          tecnicoId: 2, // Carlos - Hardware
          metodo: ModoAsignacion.AUTOMATICA,
          justificacion: "Asignado por regla Hardware Crítico - Producción. Especialista en servidores.",
          asignadoPorId: 1,
          reglaAutotriageId: 1,
          puntajeCalculado: 10.0,
          activo: true
        },
        {
          ticketId: ticket2.id,
          tecnicoId: 5, // Laura - Hardware/Software
          metodo: ModoAsignacion.AUTOMATICA,
          justificacion: "Asignado por regla Hardware Crítico - Producción. Disponible y con experiencia en laptops ejecutivas.",
          asignadoPorId: 1,
          reglaAutotriageId: 1,
          puntajeCalculado: 9.5,
          activo: true
        },
        {
          ticketId: ticket3.id,
          tecnicoId: 4, // Miguel - Redes
          metodo: ModoAsignacion.AUTOMATICA,
          justificacion: "Asignado por regla Redes Críticas - Conectividad Masiva. Especialista en infraestructura de red.",
          asignadoPorId: 1,
          reglaAutotriageId: 2,
          puntajeCalculado: 10.0,
          activo: true
        },
        {
          ticketId: ticket4.id,
          tecnicoId: 6, // Javier - Redes/Cloud
          metodo: ModoAsignacion.AUTOMATICA,
          justificacion: "Asignado por regla Redes Críticas - Conectividad Masiva. Experto en redes inalámbricas.",
          asignadoPorId: 1,
          reglaAutotriageId: 2,
          puntajeCalculado: 8.0,
          activo: true
        },
        {
          ticketId: ticket5.id,
          tecnicoId: 3, // Ana - Software
          metodo: ModoAsignacion.AUTOMATICA,
          justificacion: "Asignado por regla Software Urgente - Aplicaciones Críticas. Especialista en ERP y bases de datos.",
          asignadoPorId: 1,
          reglaAutotriageId: 3,
          puntajeCalculado: 9.8,
          activo: true
        },
        {
          ticketId: ticket6.id,
          tecnicoId: 5, // Laura - Software/Telecom
          metodo: ModoAsignacion.MANUAL,
          justificacion: "Asignado manualmente por experiencia en Office 365 y Teams. Disponible inmediatamente.",
          asignadoPorId: 1,
          puntajeCalculado: 8.5,
          activo: true
        },
        {
          ticketId: ticket7.id,
          tecnicoId: 2, // Carlos - Hardware
          metodo: ModoAsignacion.AUTOMATICA,
          justificacion: "Asignado automáticamente por disponibilidad y especialidad en impresoras.",
          asignadoPorId: 1,
          puntajeCalculado: 5.0,
          activo: true
        },
        {
          ticketId: ticket9.id,
          tecnicoId: 4, // Miguel - Redes
          metodo: ModoAsignacion.MANUAL,
          justificacion: "Asignado manualmente por especialidad en VPN y seguridad de red.",
          asignadoPorId: 1,
          puntajeCalculado: 5.0,
          activo: true
        },
        {
          ticketId: ticket10.id,
          tecnicoId: 5, // Laura - Telecom
          metodo: ModoAsignacion.AUTOMATICA,
          justificacion: "Asignado automáticamente por especialidad en telecomunicaciones VoIP.",
          asignadoPorId: 1,
          puntajeCalculado: 5.0,
          activo: true
        },
        // Asignaciones de tickets resueltos (no activas)
        {
          ticketId: ticket11.id,
          tecnicoId: 2, // Carlos
          metodo: ModoAsignacion.AUTOMATICA,
          justificacion: "Asignado automáticamente por especialidad en hardware y disponibilidad.",
          asignadoPorId: 1,
          puntajeCalculado: 7.5,
          activo: false
        },
        {
          ticketId: ticket12.id,
          tecnicoId: 3, // Ana
          metodo: ModoAsignacion.MANUAL,
          justificacion: "Asignado manualmente por especialidad en Office 365 y Outlook.",
          asignadoPorId: 1,
          puntajeCalculado: 5.0,
          activo: false
        }
      ]
    });

    // 12. Crear Historial de Tickets detallado
    await prisma.ticketHistorial.createMany({
      data: [
        // Ticket 1 - Servidor crítico
        {
          ticketId: ticket1.id,
          estadoOrigen: TicketEstado.PENDIENTE,
          estadoDestino: TicketEstado.ASIGNADO,
          usuarioId: 1,
          observaciones: "Ticket crítico detectado. Asignado automáticamente a especialista en hardware de servidores."
        },
        {
          ticketId: ticket1.id,
          estadoOrigen: TicketEstado.ASIGNADO,
          estadoDestino: TicketEstado.EN_PROCESO,
          usuarioId: 2,
          observaciones: "En sitio revisando servidor. Error parece ser en controlador RAID. Iniciando diagnóstico profundo."
        },
        // Ticket 2 - Laptop ejecutivo
        {
          ticketId: ticket2.id,
          estadoOrigen: TicketEstado.PENDIENTE,
          estadoDestino: TicketEstado.ASIGNADO,
          usuarioId: 1,
          observaciones: "Asignado urgentemente por reunión ejecutiva en 3 horas. Prioridad máxima."
        },
        // Ticket 3 - Internet caído
        {
          ticketId: ticket3.id,
          estadoOrigen: TicketEstado.PENDIENTE,
          estadoDestino: TicketEstado.ASIGNADO,
          usuarioId: 1,
          observaciones: "Problema de conectividad masiva. Asignado a especialista en redes con máxima prioridad."
        },
        {
          ticketId: ticket3.id,
          estadoOrigen: TicketEstado.ASIGNADO,
          estadoDestino: TicketEstado.EN_PROCESO,
          usuarioId: 4,
          observaciones: "Router principal offline. Contactando con proveedor de Internet. Implementando conexión de respaldo."
        },
        // Ticket 5 - ERP caído
        {
          ticketId: ticket5.id,
          estadoOrigen: TicketEstado.PENDIENTE,
          estadoDestino: TicketEstado.ASIGNADO,
          usuarioId: 1,
          observaciones: "Sistema crítico de negocio offline. Asignado a especialista en ERP inmediatamente."
        },
        {
          ticketId: ticket5.id,
          estadoOrigen: TicketEstado.ASIGNADO,
          estadoDestino: TicketEstado.EN_PROCESO,
          usuarioId: 3,
          observaciones: "Revisando servicios de base de datos. Servicio SQL no responde. Reiniciando servicios."
        },
        // Ticket 7 - Impresora (espera cliente)
        {
          ticketId: ticket7.id,
          estadoOrigen: TicketEstado.PENDIENTE,
          estadoDestino: TicketEstado.ASIGNADO,
          usuarioId: 1,
          observaciones: "Asignado automáticamente por disponibilidad."
        },
        {
          ticketId: ticket7.id,
          estadoOrigen: TicketEstado.ASIGNADO,
          estadoDestino: TicketEstado.EN_PROCESO,
          usuarioId: 2,
          observaciones: "Papel atascado en rodillos internos. Requiere desarme de impresora."
        },
        {
          ticketId: ticket7.id,
          estadoOrigen: TicketEstado.EN_PROCESO,
          estadoDestino: TicketEstado.ESPERA_CLIENTE,
          usuarioId: 2,
          observaciones: "Esperando autorización del cliente para proceder con desarme que puede anular garantía."
        },
        // Tickets resueltos
        {
          ticketId: ticket11.id,
          estadoOrigen: TicketEstado.PENDIENTE,
          estadoDestino: TicketEstado.ASIGNADO,
          usuarioId: 1,
          observaciones: "Asignado automáticamente por especialidad en laptops."
        },
        {
          ticketId: ticket11.id,
          estadoOrigen: TicketEstado.ASIGNADO,
          estadoDestino: TicketEstado.EN_PROCESO,
          usuarioId: 2,
          observaciones: "Pantalla LCD rota confirmada. Ordenado repuesto express."
        },
        {
          ticketId: ticket11.id,
          estadoOrigen: TicketEstado.EN_PROCESO,
          estadoDestino: TicketEstado.RESUELTO,
          usuarioId: 2,
          observaciones: "Pantalla reemplazada y calibrada. Equipo funcionando perfectamente."
        },
        {
          ticketId: ticket12.id,
          estadoOrigen: TicketEstado.PENDIENTE,
          estadoDestino: TicketEstado.ASIGNADO,
          usuarioId: 1,
          observaciones: "Asignado manualmente a especialista en Office 365."
        },
        {
          ticketId: ticket12.id,
          estadoOrigen: TicketEstado.ASIGNADO,
          estadoDestino: TicketEstado.EN_PROCESO,
          usuarioId: 3,
          observaciones: "Perfil de Outlook corrupto. Creando nuevo perfil y re-sincronizando correos."
        },
        {
          ticketId: ticket12.id,
          estadoOrigen: TicketEstado.EN_PROCESO,
          estadoDestino: TicketEstado.RESUELTO,
          usuarioId: 3,
          observaciones: "Perfil recreado exitosamente. Todos los correos sincronizados. Usuario verificado funcionamiento."
        },
        {
          ticketId: ticket12.id,
          estadoOrigen: TicketEstado.RESUELTO,
          estadoDestino: TicketEstado.CERRADO,
          usuarioId: 1,
          observaciones: "Ticket cerrado después de confirmación de satisfacción del usuario."
        }
      ]
    });

    // 13. Crear Imágenes para Tickets
    await prisma.imagenTicket.createMany({
      data: [
        {
          ticketId: ticket1.id,
          nombreArchivo: "servidor_error_bsod.jpg",
          url: "/uploads/tickets/servidor_bsod_001.jpg",
          tipo: "image/jpeg",
          tamaño: 2457600,
          descripcion: "Pantalla azul en servidor durante el boot",
          subidoPorId: 2
        },
        {
          ticketId: ticket3.id,
          nombreArchivo: "router_luces_rojas.png",
          url: "/uploads/tickets/router_luces_003.png",
          tipo: "image/png",
          tamaño: 1853200,
          descripcion: "Router principal con luces de error en rojo",
          subidoPorId: 9
        },
        {
          ticketId: ticket7.id,
          nombreArchivo: "impresora_atascada.jpg",
          url: "/uploads/tickets/impresora_atascada_007.jpg",
          tipo: "image/jpeg",
          tamaño: 2150400,
          descripcion: "Error de papel atascado en display de impresora",
          subidoPorId: 13
        },
        {
          ticketId: ticket11.id,
          nombreArchivo: "laptop_pantalla_rota.jpg",
          url: "/uploads/tickets/laptop_pantalla_011.jpg",
          tipo: "image/jpeg",
          tamaño: 2949120,
          descripcion: "Pantalla LCD rota con fracturas visibles",
          subidoPorId: 7
        }
      ]
    });

    // 14. Crear Valoraciones realistas
    await prisma.valoracion.createMany({
      data: [
        {
          ticketId: ticket11.id,
          usuarioId: 7,
          puntuacion: 5,
          comentario: "Excelente servicio! Carlos fue muy profesional y resolvió el problema rápidamente. La laptop quedó como nueva. Muy recomendado."
        },
        {
          ticketId: ticket12.id,
          usuarioId: 8,
          puntuacion: 4,
          comentario: "Buen servicio de Ana. Resolvió el problema de Outlook aunque tardó un poco más de lo esperado. Pero el resultado final fue satisfactorio."
        }
      ]
    });

    // 15. Crear Notificaciones del sistema
    await prisma.notificacion.createMany({
      data: [
        {
          tipo: NotifTipo.ASIGNACION_TICKET,
          remitenteId: 1,
          destinatarioId: 2,
          asunto: "Nuevo ticket crítico asignado - TKT-2024-001",
          mensaje: "Se te ha asignado el ticket TKT-2024-001 'Servidor de producción no inicia - Error crítico'. SLA: 2 horas restante.",
          prioridad: NotifPrioridad.ALTA,
          leida: true
        },
        {
          tipo: NotifTipo.ASIGNACION_TICKET,
          remitenteId: 1,
          destinatarioId: 4,
          asunto: "Problema de conectividad masiva - TKT-2024-003",
          mensaje: "Se te ha asignado el ticket TKT-2024-003 'Internet caído en toda la oficina central'. 50 usuarios afectados. SLA: 1 hora restante.",
          prioridad: NotifPrioridad.ALTA,
          leida: true
        },
        {
          tipo: NotifTipo.VENCIMIENTO,
          remitenteId: 1,
          destinatarioId: 3,
          asunto: "Ticket próximo a vencer - TKT-2024-005",
          mensaje: "El ticket TKT-2024-005 'ERP corporativo no carga' tiene menos de 4 horas para su resolución.",
          prioridad: NotifPrioridad.ALTA,
          leida: false
        },
        {
          tipo: NotifTipo.CAMBIO_ESTADO,
          remitenteId: 2,
          destinatarioId: 7,
          asunto: "Ticket en espera de su autorización - TKT-2024-007",
          mensaje: "El ticket TKT-2024-007 'Impresora atascada' requiere su autorización para proceder con la reparación.",
          prioridad: NotifPrioridad.MEDIA,
          leida: false
        },
        {
          tipo: NotifTipo.RECORDATORIO,
          remitenteId: 1,
          destinatarioId: 5,
          asunto: "Recordatorio: Ticket pendiente de actualización",
          mensaje: "El ticket TKT-2024-006 'Teams no funciona' requiere una actualización de estado.",
          prioridad: NotifPrioridad.BAJA,
          leida: true
        }
      ]
    });

    console.log(' Seed completado exitosamente!');
  } catch (error) {
    console.error(' Error durante el seed:', error);
    throw error;
  }
};

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })