/*
  Warnings:

  - The values [APPROVED] on the enum `Donasi_status_donasi` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `donasi` MODIFY `status_donasi` ENUM('PENDING', 'DONE', 'CANCELLED') NOT NULL;
