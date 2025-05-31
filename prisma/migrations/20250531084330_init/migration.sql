/*
  Warnings:

  - You are about to drop the column `id_transaksi` on the `barang` table. All the data in the column will be lost.
  - Added the required column `tanggal_expire` to the `Barang` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `barang` DROP FOREIGN KEY `Barang_id_penitip_fkey`;

-- DropForeignKey
ALTER TABLE `barang` DROP FOREIGN KEY `Barang_id_transaksi_fkey`;

-- DropIndex
DROP INDEX `Barang_id_penitip_fkey` ON `barang`;

-- DropIndex
DROP INDEX `Barang_id_transaksi_fkey` ON `barang`;

-- AlterTable
ALTER TABLE `barang` DROP COLUMN `id_transaksi`,
    ADD COLUMN `id_penitipan` INTEGER NULL,
    ADD COLUMN `tanggal_expire` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `BridgeBarangTransaksi` (
    `id_bridge_barang_transaksi` INTEGER NOT NULL AUTO_INCREMENT,
    `id_barang` INTEGER NOT NULL,
    `id_transaksi` INTEGER NOT NULL,

    PRIMARY KEY (`id_bridge_barang_transaksi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PenitipanBarang` (
    `id_penitipan` INTEGER NOT NULL AUTO_INCREMENT,
    `id_penitip` INTEGER NOT NULL,
    `no_nota` VARCHAR(191) NOT NULL,
    `tanggal_masuk` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_penitipan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Barang` ADD CONSTRAINT `Barang_id_penitipan_fkey` FOREIGN KEY (`id_penitipan`) REFERENCES `PenitipanBarang`(`id_penitipan`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BridgeBarangTransaksi` ADD CONSTRAINT `BridgeBarangTransaksi_id_barang_fkey` FOREIGN KEY (`id_barang`) REFERENCES `Barang`(`id_barang`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BridgeBarangTransaksi` ADD CONSTRAINT `BridgeBarangTransaksi_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `Transaksi`(`id_transaksi`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PenitipanBarang` ADD CONSTRAINT `PenitipanBarang_id_penitip_fkey` FOREIGN KEY (`id_penitip`) REFERENCES `Penitip`(`id_penitip`) ON DELETE CASCADE ON UPDATE CASCADE;
