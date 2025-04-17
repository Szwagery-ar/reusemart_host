-- AlterTable
ALTER TABLE `bridgekategoribarang` ADD COLUMN `is_checkout` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `pengiriman` MODIFY `status_pengiriman` ENUM('IN_PROGRESS', 'IN_DELIVERY', 'PICKED_UP', 'DONE', 'FAILED') NOT NULL;
