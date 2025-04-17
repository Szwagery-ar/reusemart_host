-- DropForeignKey
ALTER TABLE `donasi` DROP FOREIGN KEY `Donasi_id_request_fkey`;

-- AddForeignKey
ALTER TABLE `Donasi` ADD CONSTRAINT `Donasi_id_request_fkey` FOREIGN KEY (`id_request`) REFERENCES `RequestDonasi`(`id_request`) ON DELETE CASCADE ON UPDATE CASCADE;
