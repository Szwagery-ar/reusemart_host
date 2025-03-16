-- CreateTable
CREATE TABLE `Pembeli` (
    `id_pembeli` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `no_telepon` BIGINT NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `poin_loyalitas` INTEGER NOT NULL,

    UNIQUE INDEX `Pembeli_email_key`(`email`),
    PRIMARY KEY (`id_pembeli`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Alamat` (
    `id_alamat` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_alamat` VARCHAR(191) NOT NULL,
    `lokasi` VARCHAR(191) NOT NULL,
    `id_pembeli` INTEGER NOT NULL,

    PRIMARY KEY (`id_alamat`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pegawai` (
    `id_pegawai` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `no_telepon` BIGINT NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `tanggal_lahir` DATETIME(3) NOT NULL,
    `komisi` DECIMAL(65, 30) NOT NULL DEFAULT 0.0,
    `id_jabatan` INTEGER NOT NULL,

    UNIQUE INDEX `Pegawai_email_key`(`email`),
    PRIMARY KEY (`id_pegawai`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Jabatan` (
    `id_jabatan` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_jabatan` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_jabatan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Penitip` (
    `id_penitip` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `no_ktp` BIGINT NOT NULL,
    `no_telepon` BIGINT NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `jml_barang_terjual` INTEGER NOT NULL DEFAULT 0,
    `badge_level` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Penitip_no_ktp_key`(`no_ktp`),
    UNIQUE INDEX `Penitip_email_key`(`email`),
    PRIMARY KEY (`id_penitip`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Alamat` ADD CONSTRAINT `Alamat_id_pembeli_fkey` FOREIGN KEY (`id_pembeli`) REFERENCES `Pembeli`(`id_pembeli`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pegawai` ADD CONSTRAINT `Pegawai_id_jabatan_fkey` FOREIGN KEY (`id_jabatan`) REFERENCES `Jabatan`(`id_jabatan`) ON DELETE CASCADE ON UPDATE CASCADE;
