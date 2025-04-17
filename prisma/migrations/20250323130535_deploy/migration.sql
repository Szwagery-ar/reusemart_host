/*
  Warnings:

  - Added the required column `berat_barang` to the `Barang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lokasi` to the `Pengiriman` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tambahan_poin` to the `Transaksi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `barang` ADD COLUMN `berat_barang` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `pengiriman` ADD COLUMN `lokasi` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `transaksi` ADD COLUMN `tambahan_poin` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Cart` (
    `id_cart` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pembeli` INTEGER NOT NULL,

    UNIQUE INDEX `Cart_id_pembeli_key`(`id_pembeli`),
    PRIMARY KEY (`id_cart`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BridgeBarangCart` (
    `id_bridge_barang` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cart` INTEGER NOT NULL,
    `id_barang` INTEGER NOT NULL,

    PRIMARY KEY (`id_bridge_barang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_id_pembeli_fkey` FOREIGN KEY (`id_pembeli`) REFERENCES `Pembeli`(`id_pembeli`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BridgeBarangCart` ADD CONSTRAINT `BridgeBarangCart_id_barang_fkey` FOREIGN KEY (`id_barang`) REFERENCES `Barang`(`id_barang`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BridgeBarangCart` ADD CONSTRAINT `BridgeBarangCart_id_cart_fkey` FOREIGN KEY (`id_cart`) REFERENCES `Cart`(`id_cart`) ON DELETE CASCADE ON UPDATE CASCADE;
