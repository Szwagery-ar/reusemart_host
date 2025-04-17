/*
  Warnings:

  - The values [DONATEABLE] on the enum `Barang_status_titip` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `barang` MODIFY `status_titip` ENUM('AVAILABLE', 'HOLD', 'SOLD', 'EXTENDED', 'EXPIRED', 'DONATABLE', 'DONATED') NOT NULL;
