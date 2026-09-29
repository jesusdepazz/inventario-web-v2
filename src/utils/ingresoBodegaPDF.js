import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatearValor = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "-";
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}/.test(valor)) {
    return new Date(valor).toLocaleDateString("es-ES");
  }
  return String(valor);
};

// Genera el comprobante de recepción / ingreso a bodega de un activo.
// campos: [{ label, key }] en el orden en que se imprimen.
export const generarIngresoBodegaPDF = ({ categoria, empresa, activo, campos, numero }) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;

  try {
    doc.addImage("/logo_guandy.png", "PNG", marginX, 10, 32, 20);
  } catch {
    // el logo es opcional
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("RECEPCIÓN / INGRESO A BODEGA DE ACTIVOS", pageWidth / 2, 18, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Empresa: ${empresa || "-"}`, pageWidth / 2, 25, { align: "center" });
  doc.text(`Categoría: ${categoria}`, pageWidth / 2, 30, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.text(`No. ${numero || activo.codificacion || activo.id || "___"}`, pageWidth - marginX, 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha de impresión: ${new Date().toLocaleDateString("es-ES")}`, pageWidth - marginX, 25, { align: "right" });

  autoTable(doc, {
    startY: 38,
    head: [["Campo", "Detalle"]],
    body: campos.map((c) => [c.label, formatearValor(c.valor !== undefined ? c.valor : activo[c.key])]),
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138] },
    columnStyles: { 0: { cellWidth: 60, fontStyle: "bold" } },
    margin: { left: marginX, right: marginX },
  });

  const firmasY = Math.min(doc.lastAutoTable.finalY + 35, doc.internal.pageSize.getHeight() - 25);
  const anchoFirma = (pageWidth - marginX * 2 - 20) / 3;
  ["Entregado por (proveedor / solicitante)", "Recibido por (bodega de activos)", "Vo. Bo."].forEach((titulo, i) => {
    const x = marginX + i * (anchoFirma + 10);
    doc.line(x, firmasY, x + anchoFirma, firmasY);
    doc.setFontSize(8);
    doc.text(titulo, x + anchoFirma / 2, firmasY + 5, { align: "center" });
  });

  doc.save(`Ingreso_${categoria.replace(/\s+/g, "_")}_${activo.codificacion || activo.id || "activo"}.pdf`);
};

export const preguntarImprimirIngreso = (datos) => {
  if (window.confirm("¿Desea imprimir la recepción / ingreso a bodega?")) {
    generarIngresoBodegaPDF(datos);
  }
};
