-- CreateTable
CREATE TABLE `SecuenciaConsecutivo` (
    `anio` INTEGER NOT NULL,
    `ultimoConsecutivo` INTEGER NOT NULL DEFAULT 0,
    `actualizadoEn` DATETIME(3) NOT NULL,

    PRIMARY KEY (`anio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `correo` VARCHAR(191) NOT NULL,
    `contrasenaHash` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `rol` ENUM('ADM', 'TEC', 'USR') NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `ultimoInicio` DATETIME(3) NULL,
    `disponible` BOOLEAN NULL DEFAULT true,
    `cargosActuales` INTEGER NULL DEFAULT 0,
    `limiteCargaTickets` INTEGER NULL DEFAULT 5,
    `ultimaActualizacion` DATETIME(3) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,
    `refreshToken` VARCHAR(191) NULL,
    `refreshTokenExpiry` DATETIME(3) NULL,
    `resetPasswordToken` VARCHAR(191) NULL,
    `resetPasswordExpiry` DATETIME(3) NULL,

    UNIQUE INDEX `Usuario_correo_key`(`correo`),
    INDEX `Usuario_correo_idx`(`correo`),
    INDEX `Usuario_rol_idx`(`rol`),
    INDEX `Usuario_activo_idx`(`activo`),
    INDEX `Usuario_disponible_idx`(`disponible`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Especialidad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Especialidad_codigo_key`(`codigo`),
    INDEX `Especialidad_codigo_idx`(`codigo`),
    INDEX `Especialidad_activa_idx`(`activa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsuarioEspecialidad` (
    `usuarioId` INTEGER NOT NULL,
    `especialidadId` INTEGER NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UsuarioEspecialidad_usuarioId_idx`(`usuarioId`),
    INDEX `UsuarioEspecialidad_especialidadId_idx`(`especialidadId`),
    PRIMARY KEY (`usuarioId`, `especialidadId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,
    `slaNombre` VARCHAR(191) NULL,
    `slaTiempoMaxRespuestaMin` INTEGER NULL,
    `slaTiempoMaxResolucionMin` INTEGER NULL,
    `slaDescripcion` TEXT NULL,
    `slaNivelUrgencia` ENUM('BAJO', 'MEDIO', 'ALTO', 'CRITICO') NULL,

    UNIQUE INDEX `Categoria_codigo_key`(`codigo`),
    INDEX `Categoria_codigo_idx`(`codigo`),
    INDEX `Categoria_activa_idx`(`activa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Etiqueta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,

    INDEX `Etiqueta_activa_idx`(`activa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriaEtiqueta` (
    `categoriaId` INTEGER NOT NULL,
    `etiquetaId` INTEGER NOT NULL,

    INDEX `CategoriaEtiqueta_categoriaId_idx`(`categoriaId`),
    INDEX `CategoriaEtiqueta_etiquetaId_idx`(`etiquetaId`),
    PRIMARY KEY (`categoriaId`, `etiquetaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriaEspecialidad` (
    `categoriaId` INTEGER NOT NULL,
    `especialidadId` INTEGER NOT NULL,

    INDEX `CategoriaEspecialidad_categoriaId_idx`(`categoriaId`),
    INDEX `CategoriaEspecialidad_especialidadId_idx`(`especialidadId`),
    PRIMARY KEY (`categoriaId`, `especialidadId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consecutivo` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `solicitanteId` INTEGER NULL,
    `categoriaId` INTEGER NULL,
    `estado` ENUM('PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'ESPERA_CLIENTE', 'RESUELTO', 'CERRADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
    `modoAsignacion` ENUM('AUTOMATICA', 'MANUAL') NOT NULL DEFAULT 'AUTOMATICA',
    `prioridad` ENUM('BAJO', 'MEDIO', 'ALTO', 'CRITICO') NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaActualizacion` DATETIME(3) NOT NULL,
    `fechaLimiteRespuesta` DATETIME(3) NULL,
    `fechaLimiteResolucion` DATETIME(3) NULL,
    `fechaRespuesta` DATETIME(3) NULL,
    `fechaCierre` DATETIME(3) NULL,
    `eliminadoLogico` BOOLEAN NOT NULL DEFAULT false,
    `diasResolucion` INTEGER NULL,
    `puntajePrioridad` DOUBLE NULL,
    `tiempoRestanteSLAHoras` DOUBLE NULL,

    UNIQUE INDEX `Ticket_consecutivo_key`(`consecutivo`),
    INDEX `Ticket_consecutivo_idx`(`consecutivo`),
    INDEX `Ticket_solicitanteId_idx`(`solicitanteId`),
    INDEX `Ticket_categoriaId_idx`(`categoriaId`),
    INDEX `Ticket_estado_idx`(`estado`),
    INDEX `Ticket_prioridad_idx`(`prioridad`),
    INDEX `Ticket_fechaCreacion_idx`(`fechaCreacion`),
    INDEX `Ticket_eliminadoLogico_idx`(`eliminadoLogico`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImagenTicket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `nombreArchivo` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NULL,
    `tamaño` INTEGER NULL,
    `descripcion` VARCHAR(191) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,
    `subidoPorId` INTEGER NULL,

    INDEX `ImagenTicket_ticketId_idx`(`ticketId`),
    INDEX `ImagenTicket_subidoPorId_idx`(`subidoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TicketHistorial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `estadoOrigen` ENUM('PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'ESPERA_CLIENTE', 'RESUELTO', 'CERRADO', 'CANCELADO') NULL,
    `estadoDestino` ENUM('PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'ESPERA_CLIENTE', 'RESUELTO', 'CERRADO', 'CANCELADO') NOT NULL,
    `usuarioId` INTEGER NULL,
    `observaciones` TEXT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TicketHistorial_ticketId_idx`(`ticketId`),
    INDEX `TicketHistorial_usuarioId_idx`(`usuarioId`),
    INDEX `TicketHistorial_creadoEn_idx`(`creadoEn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImagenHistorial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `historialId` INTEGER NOT NULL,
    `nombreArchivo` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NULL,
    `tamaño` INTEGER NULL,
    `descripcion` VARCHAR(191) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ImagenHistorial_historialId_idx`(`historialId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReglaAutotriage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `criterios` JSON NOT NULL,
    `formulaPrioridad` VARCHAR(191) NULL,
    `limiteCargaTecnico` INTEGER NULL,
    `ordenPrioridad` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,
    `categoriaId` INTEGER NOT NULL,
    `especialidadId` INTEGER NULL,

    INDEX `ReglaAutotriage_categoriaId_idx`(`categoriaId`),
    INDEX `ReglaAutotriage_especialidadId_idx`(`especialidadId`),
    INDEX `ReglaAutotriage_activo_idx`(`activo`),
    INDEX `ReglaAutotriage_ordenPrioridad_idx`(`ordenPrioridad`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asignacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `tecnicoId` INTEGER NULL,
    `metodo` ENUM('AUTOMATICA', 'MANUAL') NOT NULL DEFAULT 'AUTOMATICA',
    `justificacion` TEXT NULL,
    `asignadoPorId` INTEGER NULL,
    `reglaAutotriageId` INTEGER NULL,
    `puntajeCalculado` DOUBLE NULL,
    `tiempoRestanteSLAHoras` DOUBLE NULL,
    `fechaAsignacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `activo` BOOLEAN NOT NULL DEFAULT true,

    INDEX `Asignacion_ticketId_idx`(`ticketId`),
    INDEX `Asignacion_tecnicoId_idx`(`tecnicoId`),
    INDEX `Asignacion_reglaAutotriageId_idx`(`reglaAutotriageId`),
    INDEX `Asignacion_fechaAsignacion_idx`(`fechaAsignacion`),
    INDEX `Asignacion_activo_idx`(`activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('ASIGNACION_TICKET', 'CAMBIO_ESTADO', 'VENCIMIENTO', 'RECORDATORIO', 'OTRO') NOT NULL,
    `remitenteId` INTEGER NULL,
    `destinatarioId` INTEGER NOT NULL,
    `asunto` VARCHAR(191) NULL,
    `mensaje` TEXT NULL,
    `datos` JSON NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `prioridad` ENUM('BAJA', 'MEDIA', 'ALTA') NOT NULL DEFAULT 'BAJA',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notificacion_destinatarioId_idx`(`destinatarioId`),
    INDEX `Notificacion_leida_idx`(`leida`),
    INDEX `Notificacion_creadoEn_idx`(`creadoEn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Valoracion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `usuarioId` INTEGER NULL,
    `puntuacion` INTEGER NOT NULL,
    `comentario` TEXT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Valoracion_ticketId_key`(`ticketId`),
    INDEX `Valoracion_usuarioId_idx`(`usuarioId`),
    INDEX `Valoracion_creadoEn_idx`(`creadoEn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UsuarioEspecialidad` ADD CONSTRAINT `UsuarioEspecialidad_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsuarioEspecialidad` ADD CONSTRAINT `UsuarioEspecialidad_especialidadId_fkey` FOREIGN KEY (`especialidadId`) REFERENCES `Especialidad`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriaEtiqueta` ADD CONSTRAINT `CategoriaEtiqueta_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriaEtiqueta` ADD CONSTRAINT `CategoriaEtiqueta_etiquetaId_fkey` FOREIGN KEY (`etiquetaId`) REFERENCES `Etiqueta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriaEspecialidad` ADD CONSTRAINT `CategoriaEspecialidad_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriaEspecialidad` ADD CONSTRAINT `CategoriaEspecialidad_especialidadId_fkey` FOREIGN KEY (`especialidadId`) REFERENCES `Especialidad`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_solicitanteId_fkey` FOREIGN KEY (`solicitanteId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImagenTicket` ADD CONSTRAINT `ImagenTicket_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImagenTicket` ADD CONSTRAINT `ImagenTicket_subidoPorId_fkey` FOREIGN KEY (`subidoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketHistorial` ADD CONSTRAINT `TicketHistorial_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketHistorial` ADD CONSTRAINT `TicketHistorial_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImagenHistorial` ADD CONSTRAINT `ImagenHistorial_historialId_fkey` FOREIGN KEY (`historialId`) REFERENCES `TicketHistorial`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReglaAutotriage` ADD CONSTRAINT `ReglaAutotriage_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReglaAutotriage` ADD CONSTRAINT `ReglaAutotriage_especialidadId_fkey` FOREIGN KEY (`especialidadId`) REFERENCES `Especialidad`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignacion` ADD CONSTRAINT `Asignacion_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignacion` ADD CONSTRAINT `Asignacion_tecnicoId_fkey` FOREIGN KEY (`tecnicoId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignacion` ADD CONSTRAINT `Asignacion_asignadoPorId_fkey` FOREIGN KEY (`asignadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignacion` ADD CONSTRAINT `Asignacion_reglaAutotriageId_fkey` FOREIGN KEY (`reglaAutotriageId`) REFERENCES `ReglaAutotriage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_remitenteId_fkey` FOREIGN KEY (`remitenteId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_destinatarioId_fkey` FOREIGN KEY (`destinatarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Valoracion` ADD CONSTRAINT `Valoracion_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Valoracion` ADD CONSTRAINT `Valoracion_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
