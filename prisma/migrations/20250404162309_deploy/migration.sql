/*
  Warnings:

  - Added the required column `src_img` to the `Merchandise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `merchandise` ADD COLUMN `src_img` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `pegawai` ADD COLUMN `src_img_profile` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `pembeli` ADD COLUMN `src_img_profile` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `GambarBarang` (
    `id_gambar` INTEGER NOT NULL AUTO_INCREMENT,
    `id_barang` INTEGER NOT NULL,
    `src_img` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_gambar`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GambarBarang` ADD CONSTRAINT `GambarBarang_id_barang_fkey` FOREIGN KEY (`id_barang`) REFERENCES `Barang`(`id_barang`) ON DELETE CASCADE ON UPDATE CASCADE;
