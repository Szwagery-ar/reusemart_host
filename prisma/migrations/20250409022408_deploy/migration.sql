/*
  Warnings:

  - You are about to drop the column `is_checkout` on the `bridgekategoribarang` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `bridgebarangcart` ADD COLUMN `is_checkout` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `bridgekategoribarang` DROP COLUMN `is_checkout`;
