-- AlterTable
ALTER TABLE `pengiriman` ADD COLUMN `tanggal_terima` DATETIME(3) NULL,
    MODIFY `tanggal_kirim` DATETIME(3) NULL;
