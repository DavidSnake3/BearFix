/*
  Warnings:

  - Added the required column `actualizadoEn` to the `Valoracion` table without a default value. This is not possible if the table is not empty.
  - Made the column `usuarioId` on table `valoracion` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `valoracion` DROP FOREIGN KEY `Valoracion_usuarioId_fkey`;

-- AlterTable
ALTER TABLE `valoracion` ADD COLUMN `actualizadoEn` DATETIME(3) NOT NULL,
    MODIFY `usuarioId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `Valoracion_puntuacion_idx` ON `Valoracion`(`puntuacion`);

-- AddForeignKey
ALTER TABLE `Valoracion` ADD CONSTRAINT `Valoracion_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
