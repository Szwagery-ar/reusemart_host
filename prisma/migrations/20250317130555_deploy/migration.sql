-- AlterTable
ALTER TABLE `diskusi` ADD COLUMN `id_pegawai` INTEGER NULL,
    ADD COLUMN `id_penitip` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Diskusi` ADD CONSTRAINT `Diskusi_id_penitip_fkey` FOREIGN KEY (`id_penitip`) REFERENCES `Penitip`(`id_penitip`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Diskusi` ADD CONSTRAINT `Diskusi_id_pegawai_fkey` FOREIGN KEY (`id_pegawai`) REFERENCES `Pegawai`(`id_pegawai`) ON DELETE SET NULL ON UPDATE CASCADE;
