/*
  Warnings:

  - The values [DONE,CANCELLED] on the enum `Donasi_status_donasi` will be removed. If these variants are still used in the database, this will fail.
  - The values [REJECTED] on the enum `RequestDonasi_status_request` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `donasi` MODIFY `status_donasi` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL;

-- AlterTable
ALTER TABLE `requestdonasi` MODIFY `status_request` ENUM('PENDING', 'APPROVED', 'DONE', 'CANCELLED') NOT NULL;
