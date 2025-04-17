/*
  Warnings:

  - You are about to alter the column `status_garansi` on the `barang` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `barang` MODIFY `status_garansi` ENUM('ACTIVE', 'EXPIRED') NOT NULL;
