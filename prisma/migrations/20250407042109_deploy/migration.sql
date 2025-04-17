/*
  Warnings:

  - You are about to alter the column `jenis_pengiriman` on the `pengiriman` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `pengiriman` MODIFY `jenis_pengiriman` ENUM('SELF_PICKUP', 'COURIER') NOT NULL;
