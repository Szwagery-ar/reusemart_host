-- DropForeignKey
ALTER TABLE `diskusi` DROP FOREIGN KEY `Diskusi_id_pembeli_fkey`;

-- DropIndex
DROP INDEX `Diskusi_id_pembeli_fkey` ON `diskusi`;

-- AlterTable
ALTER TABLE `diskusi` MODIFY `id_pembeli` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Diskusi` ADD CONSTRAINT `Diskusi_id_pembeli_fkey` FOREIGN KEY (`id_pembeli`) REFERENCES `Pembeli`(`id_pembeli`) ON DELETE SET NULL ON UPDATE CASCADE;
