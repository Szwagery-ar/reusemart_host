/*
  Warnings:

  - The values [PENDING,CANCELLED] on the enum `Donasi_status_donasi` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `donasi` MODIFY `status_donasi` ENUM('APPROVED', 'DONE', 'REJECTED') NOT NULL;
