-- CreateTable
CREATE TABLE `Donasi` (
    `id_donasi` INTEGER NOT NULL AUTO_INCREMENT,
    `status_donasi` ENUM('PENDING', 'APPROVED', 'DONE', 'CANCELLED') NOT NULL,
    `tanggal_acc` DATETIME(3) NULL,
    `tanggal_donasi` DATETIME(3) NULL,
    `nama_penerima` VARCHAR(191) NOT NULL,
    `id_request` INTEGER NULL,

    UNIQUE INDEX `Donasi_id_request_key`(`id_request`),
    PRIMARY KEY (`id_donasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequestDonasi` (
    `id_request` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal_request` DATETIME(3) NOT NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `status_request` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL,
    `id_organisasi` INTEGER NULL,

    PRIMARY KEY (`id_request`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organisasi` (
    `id_organisasi` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `no_telepon` BIGINT NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_organisasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Merchandise` (
    `id_merchandise` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_merch` VARCHAR(191) NOT NULL,
    `deskripsi_merch` VARCHAR(191) NOT NULL,
    `jumlah_stok` INTEGER NOT NULL,

    PRIMARY KEY (`id_merchandise`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Donasi` ADD CONSTRAINT `Donasi_id_request_fkey` FOREIGN KEY (`id_request`) REFERENCES `RequestDonasi`(`id_request`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestDonasi` ADD CONSTRAINT `RequestDonasi_id_organisasi_fkey` FOREIGN KEY (`id_organisasi`) REFERENCES `Organisasi`(`id_organisasi`) ON DELETE SET NULL ON UPDATE CASCADE;
