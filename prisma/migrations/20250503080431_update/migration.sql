/*
  Warnings:

  - Added the required column `jenis_user` to the `Diskusi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foto_ktp` to the `Penitip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `alamat` ADD COLUMN `note` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `diskusi` ADD COLUMN `jenis_user` ENUM('PEGAWAI', 'PENITIP', 'PEMBELI') NOT NULL,
    ADD COLUMN `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `pembeli` ADD COLUMN `is_verified` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `penitip` ADD COLUMN `foto_ktp` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `passwordresetotps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `expired_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
