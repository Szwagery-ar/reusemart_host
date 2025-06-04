import jsPDF from "jspdf";

export function handlePrintNotaPenitipan(nota, formatRupiah, formatDate, formatDateTime) {
  if (!nota) return;

  const doc = new jsPDF();
  let y = 10;

  const labelX = 10;
  const valueX = 190;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("ReUse Mart", labelX, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text("Jl. Green Eco Park No. 456 Yogyakarta", labelX, y);
  y += 10;

  doc.text(`No Nota                        : ${nota.no_nota || "-"}`, labelX, y);
  y += 6;
  doc.text(`Tanggal penitipan         : ${formatDateTime(nota.tanggal_masuk)}`, labelX, y);
  y += 6;
  doc.text(`Masa penitipan sampai : ${formatDate(nota.tanggal_expire)}`, labelX, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.text(`Penitip : ${nota.penitip?.id || "-"} / ${nota.penitip?.nama || "-"}`, labelX, y);
  doc.setFont("helvetica", "normal");
  y += 10;

  if (Array.isArray(nota.barang)) {
    nota.barang.forEach((barang) => {
      doc.text(barang.nama_barang || "-", labelX, y);
      doc.text(formatRupiah(barang.harga_barang), valueX, y, { align: "right" });
      y += 6;

      if (
        barang.kategori?.toLowerCase().includes("elektronik") ||
        barang.kategori?.toLowerCase().includes("gadget")
      ) {
        if (barang.tanggal_garansi) {
          const garansi = new Date(barang.tanggal_garansi).toLocaleString("id-ID", {
            month: "long",
            year: "numeric",
          });
          doc.text(`Garansi ON ${garansi}`, labelX + 5, y);
          y += 6;
        }
      }

      doc.text(`Berat barang: ${barang.berat_barang} kg`, labelX + 5, y);
      y += 10;
    });
  }

  doc.setFont("helvetica", "bold");
  doc.text("Diterima dan QC oleh:", labelX, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.text(`${nota.qc?.id || "-"} - ${nota.qc?.nama || "-"}`, labelX, y);
  y += 20;

  doc.save(`nota_penitipan_${nota.no_nota}.pdf`);
}
