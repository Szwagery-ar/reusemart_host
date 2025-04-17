-- CreateTable
CREATE TABLE `Pembeli` (
    `id_pembeli` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `no_telepon` BIGINT NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `poin_loyalitas` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Pembeli_email_key`(`email`),
    PRIMARY KEY (`id_pembeli`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Alamat` (
    `id_alamat` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pembeli` INTEGER NULL,
    `nama_alamat` VARCHAR(191) NOT NULL,
    `lokasi` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_alamat`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pengiriman` (
    `id_pengiriman` INTEGER NOT NULL AUTO_INCREMENT,
    `id_transaksi` INTEGER NULL,
    `id_petugas_kurir` INTEGER NULL,
    `id_alamat` INTEGER NULL,
    `jenis_pengiriman` VARCHAR(191) NOT NULL,
    `tanggal_kirim` DATETIME(3) NOT NULL,
    `status_pengiriman` ENUM('IN_PROGRESS', 'IN_DELIVERY', 'PICKED_UP', 'DONE') NOT NULL,

    UNIQUE INDEX `Pengiriman_id_transaksi_key`(`id_transaksi`),
    PRIMARY KEY (`id_pengiriman`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pegawai` (
    `id_pegawai` INTEGER NOT NULL AUTO_INCREMENT,
    `id` VARCHAR(191) NOT NULL DEFAULT '',
    `nama` VARCHAR(191) NOT NULL,
    `no_telepon` BIGINT NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `tanggal_lahir` DATETIME(3) NOT NULL,
    `komisi` DECIMAL(65, 30) NOT NULL DEFAULT 0.0,
    `id_jabatan` INTEGER NOT NULL,

    UNIQUE INDEX `Pegawai_id_key`(`id`),
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
    `id` VARCHAR(191) NOT NULL DEFAULT '',
    `nama` VARCHAR(191) NOT NULL,
    `no_ktp` BIGINT NOT NULL,
    `no_telepon` BIGINT NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `jml_barang_terjual` INTEGER NOT NULL DEFAULT 0,
    `badge_level` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Penitip_id_key`(`id`),
    UNIQUE INDEX `Penitip_no_ktp_key`(`no_ktp`),
    UNIQUE INDEX `Penitip_email_key`(`email`),
    PRIMARY KEY (`id_penitip`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Barang` (
    `id_barang` INTEGER NOT NULL AUTO_INCREMENT,
    `id_penitip` INTEGER NOT NULL,
    `id_petugas_qc` INTEGER NULL,
    `id_petugas_hunter` INTEGER NULL,
    `id_transaksi` INTEGER NULL,
    `id_donasi` INTEGER NULL,
    `kode_produk` VARCHAR(191) NOT NULL,
    `nama_barang` VARCHAR(191) NOT NULL,
    `deskripsi_barang` VARCHAR(191) NOT NULL,
    `harga_barang` DECIMAL(65, 30) NOT NULL,
    `status_garansi` DATETIME(3) NOT NULL,
    `status_titip` ENUM('AVAILABLE', 'HOLD', 'SOLD', 'EXTENDED', 'EXPIRED', 'DONATEABLE', 'DONATED') NOT NULL,
    `tanggal_masuk` DATETIME(3) NOT NULL,
    `tanggal_keluar` DATETIME(3) NULL,

    PRIMARY KEY (`id_barang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KategoriBarang` (
    `id_kategori` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_kategori` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_kategori`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BridgeKategoriBarang` (
    `id_barang_kategori` INTEGER NOT NULL AUTO_INCREMENT,
    `id_barang` INTEGER NOT NULL,
    `id_kategori` INTEGER NOT NULL,

    PRIMARY KEY (`id_barang_kategori`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Diskusi` (
    `id_diskusi` INTEGER NOT NULL AUTO_INCREMENT,
    `id_barang` INTEGER NOT NULL,
    `id_pembeli` INTEGER NOT NULL,
    `isi_diskusi` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_diskusi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaksi` (
    `id_transaksi` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pembeli` INTEGER NOT NULL,
    `status_transaksi` ENUM('PENDING', 'PAID', 'ON_PROGRESS', 'DONE', 'CANCELLED') NOT NULL,
    `tanggal_pesan` DATETIME(3) NOT NULL,
    `tanggal_lunas` DATETIME(3) NOT NULL,
    `no_nota` VARCHAR(191) NOT NULL,
    `harga_awal` DECIMAL(65, 30) NOT NULL,
    `ongkos_kirim` DECIMAL(65, 30) NOT NULL,
    `diskon` DECIMAL(65, 30) NOT NULL,
    `harga_akhir` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`id_transaksi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Komisi` (
    `id_komisi` INTEGER NOT NULL AUTO_INCREMENT,
    `id_transaksi` INTEGER NOT NULL,
    `id_penitip` INTEGER NOT NULL,
    `id_petugas_hunter` INTEGER NOT NULL,
    `komisi_penitip` DECIMAL(65, 30) NOT NULL,
    `komisi_reusemart` DECIMAL(65, 30) NOT NULL,
    `komisi_hunter` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`id_komisi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pembayaran` (
    `id_pembayaran` INTEGER NOT NULL AUTO_INCREMENT,
    `id_transaksi` INTEGER NOT NULL,
    `id_petugas_cs` INTEGER NULL,
    `status_pembayaran` ENUM('PENDING', 'CONFIRMED', 'FAILED') NOT NULL,
    `img_bukti_transfer` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Pembayaran_id_transaksi_key`(`id_transaksi`),
    PRIMARY KEY (`id_pembayaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Donasi` (
    `id_donasi` INTEGER NOT NULL AUTO_INCREMENT,
    `status_donasi` ENUM('PENDING', 'APPROVED', 'CANCELLED') NOT NULL,
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
    `status_request` ENUM('PENDING', 'APPROVED', 'DONE', 'CANCELLED') NOT NULL,
    `id_organisasi` INTEGER NULL,

    PRIMARY KEY (`id_request`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organisasi` (
    `id_organisasi` INTEGER NOT NULL AUTO_INCREMENT,
    `id` VARCHAR(191) NOT NULL DEFAULT '',
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `no_telepon` BIGINT NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Organisasi_id_key`(`id`),
    PRIMARY KEY (`id_organisasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Merchandise` (
    `id_merchandise` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_merch` VARCHAR(191) NOT NULL,
    `deskripsi_merch` VARCHAR(191) NOT NULL,
    `jumlah_stok` INTEGER NOT NULL,
    `jumlah_poin` INTEGER NOT NULL,

    PRIMARY KEY (`id_merchandise`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Klaim` (
    `id_klaim` INTEGER NOT NULL AUTO_INCREMENT,
    `id_merchandise` INTEGER NOT NULL,
    `id_pembeli` INTEGER NOT NULL,
    `jml_merch_diklaim` INTEGER NOT NULL,
    `total_poin` INTEGER NOT NULL,

    PRIMARY KEY (`id_klaim`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Alamat` ADD CONSTRAINT `Alamat_id_pembeli_fkey` FOREIGN KEY (`id_pembeli`) REFERENCES `Pembeli`(`id_pembeli`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengiriman` ADD CONSTRAINT `Pengiriman_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `Transaksi`(`id_transaksi`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengiriman` ADD CONSTRAINT `Pengiriman_id_petugas_kurir_fkey` FOREIGN KEY (`id_petugas_kurir`) REFERENCES `Pegawai`(`id_pegawai`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengiriman` ADD CONSTRAINT `Pengiriman_id_alamat_fkey` FOREIGN KEY (`id_alamat`) REFERENCES `Alamat`(`id_alamat`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pegawai` ADD CONSTRAINT `Pegawai_id_jabatan_fkey` FOREIGN KEY (`id_jabatan`) REFERENCES `Jabatan`(`id_jabatan`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Barang` ADD CONSTRAINT `Barang_id_penitip_fkey` FOREIGN KEY (`id_penitip`) REFERENCES `Penitip`(`id_penitip`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Barang` ADD CONSTRAINT `Barang_id_petugas_qc_fkey` FOREIGN KEY (`id_petugas_qc`) REFERENCES `Pegawai`(`id_pegawai`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Barang` ADD CONSTRAINT `Barang_id_petugas_hunter_fkey` FOREIGN KEY (`id_petugas_hunter`) REFERENCES `Pegawai`(`id_pegawai`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Barang` ADD CONSTRAINT `Barang_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `Transaksi`(`id_transaksi`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Barang` ADD CONSTRAINT `Barang_id_donasi_fkey` FOREIGN KEY (`id_donasi`) REFERENCES `Donasi`(`id_donasi`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BridgeKategoriBarang` ADD CONSTRAINT `BridgeKategoriBarang_id_barang_fkey` FOREIGN KEY (`id_barang`) REFERENCES `Barang`(`id_barang`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BridgeKategoriBarang` ADD CONSTRAINT `BridgeKategoriBarang_id_kategori_fkey` FOREIGN KEY (`id_kategori`) REFERENCES `KategoriBarang`(`id_kategori`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Diskusi` ADD CONSTRAINT `Diskusi_id_barang_fkey` FOREIGN KEY (`id_barang`) REFERENCES `Barang`(`id_barang`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Diskusi` ADD CONSTRAINT `Diskusi_id_pembeli_fkey` FOREIGN KEY (`id_pembeli`) REFERENCES `Pembeli`(`id_pembeli`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_id_pembeli_fkey` FOREIGN KEY (`id_pembeli`) REFERENCES `Pembeli`(`id_pembeli`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Komisi` ADD CONSTRAINT `Komisi_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `Transaksi`(`id_transaksi`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Komisi` ADD CONSTRAINT `Komisi_id_penitip_fkey` FOREIGN KEY (`id_penitip`) REFERENCES `Penitip`(`id_penitip`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Komisi` ADD CONSTRAINT `Komisi_id_petugas_hunter_fkey` FOREIGN KEY (`id_petugas_hunter`) REFERENCES `Pegawai`(`id_pegawai`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pembayaran` ADD CONSTRAINT `Pembayaran_id_petugas_cs_fkey` FOREIGN KEY (`id_petugas_cs`) REFERENCES `Pegawai`(`id_pegawai`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pembayaran` ADD CONSTRAINT `Pembayaran_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `Transaksi`(`id_transaksi`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Donasi` ADD CONSTRAINT `Donasi_id_request_fkey` FOREIGN KEY (`id_request`) REFERENCES `RequestDonasi`(`id_request`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestDonasi` ADD CONSTRAINT `RequestDonasi_id_organisasi_fkey` FOREIGN KEY (`id_organisasi`) REFERENCES `Organisasi`(`id_organisasi`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Klaim` ADD CONSTRAINT `Klaim_id_pembeli_fkey` FOREIGN KEY (`id_pembeli`) REFERENCES `Pembeli`(`id_pembeli`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Klaim` ADD CONSTRAINT `Klaim_id_merchandise_fkey` FOREIGN KEY (`id_merchandise`) REFERENCES `Merchandise`(`id_merchandise`) ON DELETE CASCADE ON UPDATE CASCADE;
