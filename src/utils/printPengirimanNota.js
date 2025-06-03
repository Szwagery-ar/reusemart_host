import jsPDF from "jspdf";

export function handlePrintPDF(transaksiDetail, formatRupiah, formatDateTime) {
  if (!transaksiDetail) return;

  const t = transaksiDetail;
  const doc = new jsPDF();
  let y = 10;

  const formatCurrency = (val) => formatRupiah(val);

  const jenisPengiriman =
    t.jenis_pengiriman === "COURIER"
      ? "dibawa oleh kurir"
      : "diambil oleh pembeli";

  const labelTanggal =
    t.jenis_pengiriman === "COURIER" ? "Tanggal kirim" : "Tanggal ambil";

  const tanggalLabel =
    t.jenis_pengiriman === "COURIER"
      ? t.tanggal_kirim
        ? formatDateTime(t.tanggal_kirim)
        : "-"
      : t.tanggal_terima
      ? formatDateTime(t.tanggal_terima)
      : "-";

  const deliveryInfo =
    t.jenis_pengiriman === "COURIER"
      ? `Delivery: Kurir ReUseMart (${t.nama_kurir || "-"})`
      : "Delivery: - (diambil sendiri)";

  const labelX = 10;
  const valueX = 190;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("ReUse Mart", labelX, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text("Jl. Green Eco Park No. 456 Yogyakarta", labelX, y);
  y += 10;

  doc.text(`No Nota               : ${t.no_nota || "-"}`, labelX, y);
  y += 6;
  doc.text(`Tanggal pesan   : ${formatDateTime(t.tanggal_pesan)}`, labelX, y);
  y += 6;
  doc.text(`Lunas pada         : ${formatDateTime(t.tanggal_lunas)}`, labelX, y);
  y += 6;
  doc.text(`${labelTanggal.padEnd(20)}: ${tanggalLabel}`, labelX, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.text(`Pembeli   : ${t.email_pembeli} / ${t.nama_pembeli}`, labelX, y);
  y += 6;
  doc.setFont("helvetica", "normal");

  if (t.alamat_pembeli) {
    const lines = doc.splitTextToSize(t.alamat_pembeli, 180);
    lines.forEach((line) => {
      doc.text(line, labelX, y);
      y += 6;
    });
  } else {
    doc.text("-", labelX, y);
    y += 6;
  }

  doc.text(deliveryInfo, labelX, y);
  y += 12;

  if (Array.isArray(t.produk)) {
    t.produk.forEach((p) => {
      doc.text(p.nama_barang || "-", labelX, y);
      doc.text(formatCurrency(p.harga_barang), valueX, y, { align: "right" });
      y += 6;
    });
    y += 4;
  }

  const hargaAwal = Number(t.harga_awal || 0);
  const ongkosKirim = Number(t.ongkos_kirim || 0);
  const subtotal = hargaAwal + ongkosKirim;
  const potongan = Number(t.diskon || 0);
  const poinDiskon = potongan / 10000;

  doc.text("Total", labelX, y);
  doc.text(formatCurrency(hargaAwal), valueX, y, { align: "right" });
  y += 6;

  doc.text("Ongkos Kirim", labelX, y);
  doc.text(formatCurrency(ongkosKirim), valueX, y, { align: "right" });
  y += 6;

  doc.text("Total", labelX, y);
  doc.text(formatCurrency(subtotal), valueX, y, { align: "right" });
  y += 6;

  doc.text(`Potongan ${poinDiskon} poin`, labelX, y);
  doc.text(`- ${formatCurrency(potongan)}`, valueX, y, { align: "right" });
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Total", labelX, y);
  doc.text(formatCurrency(t.harga_akhir), valueX, y, { align: "right" });
  y += 10;
  doc.setFont("helvetica", "normal");

  doc.text(`Poin dari pesanan ini: ${t.tambahan_poin || "-"}`, labelX, y);
  y += 6;
  doc.text(`Total poin customer  : ${t.poin_loyalitas || "-"}`, labelX, y);
  y += 10;

  doc.text(
    `QC oleh: ${t.nama_petugas_cs || "-"} (${t.kode_petugas || "-"})`,
    labelX,
    y
  );
  y += 10;
  doc.text(
    t.jenis_pengiriman === "COURIER" ? "Diterima oleh:" : "Diambil oleh:",
    labelX + 7,
    y
  );
  y += 20;

  doc.text(
    `${t.nama_pembeli || "(...........................)"}`,
    labelX + 7,
    y
  );
  y += 6;
  doc.text(
    `Tanggal: ${
      t.tanggal_terima
        ? formatDateTime(t.tanggal_terima)
        : "(...........................)"
    }`,
    labelX + 7,
    y
  );

  doc.save(`nota_${t.no_nota}.pdf`);
}