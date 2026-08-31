import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const generarPDFAsignacionComunal = async (asignaciones = []) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const marginX = 5;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const boxWidth = pageWidth - marginX * 2;

  const FOOTER_H = 12;
  const BOTTOM_PAD = 6;
  const PAGE_BOTTOM = pageHeight - FOOTER_H - BOTTOM_PAD;

  const fechaActual = new Date().toLocaleDateString("es-ES");

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const loadImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

  const agregarFooter = (docInstance, numeroPagina) => {
    const footerY = pageHeight - 10;

    docInstance.setFontSize(8);
    docInstance.setTextColor(100);
    docInstance.text("Depto. de Sistemas", 10, footerY);

    const textoPagina = `Página ${numeroPagina}`;
    const textWidth = docInstance.getTextWidth(textoPagina);
    docInstance.text(textoPagina, (pageWidth - textWidth) / 2, footerY);

    const emision = `Emisión: ${fechaActual}`;
    const emisionWidth = docInstance.getTextWidth(emision);
    docInstance.text(emision, pageWidth - emisionWidth - 10, footerY);
  };

  const agregarEncabezado = async (docInstance, correlativo) => {
    const logoUrl = `${window.location.origin}/logo_guandy.png`;
    const logoImg = await loadImage(logoUrl);

    const logoWidth = 40;
    const logoHeight = 20;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = 10;

    const lineMarginX = marginX;
    const lineWidth = pageWidth - marginX * 2;
    const centerY = logoY + logoHeight / 2;
    const space = 0.7;

    docInstance.setDrawColor(30, 58, 138);
    docInstance.setLineWidth(0.3);
    docInstance.line(lineMarginX, centerY - space * 2, lineMarginX + lineWidth, centerY - space * 2);
    docInstance.setLineWidth(1.2);
    docInstance.line(lineMarginX, centerY, lineMarginX + lineWidth, centerY);
    docInstance.setLineWidth(0.3);
    docInstance.line(lineMarginX, centerY + space * 2, lineMarginX + lineWidth, centerY + space * 2);

    docInstance.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight);

    const yStart = logoY + logoHeight + 5;

    docInstance.setFontSize(10);
    docInstance.setFont("helvetica", "bold");
    docInstance.setTextColor(0, 0, 0);
    docInstance.text("ADMINISTRACION DE ACTIVOS IT", marginX, yStart);
    docInstance.text(`FECHA DE EMISIÓN: ${fechaActual}`, pageWidth - marginX, yStart, {
      align: "right",
    });

    const yTitulo = yStart + 10;
    const titulo = "ASIGNACIÓN COMUNAL DE EQUIPOS";
    const lineHeight = 10;

    docInstance.setFillColor(204, 229, 255);
    docInstance.rect(marginX, yTitulo, boxWidth, lineHeight, "F");

    docInstance.setFontSize(14);
    docInstance.setFont("helvetica", "bold");
    const textWidth = docInstance.getTextWidth(titulo);
    docInstance.text(titulo, (pageWidth - textWidth) / 2, yTitulo + 7);

    if (correlativo) {
      docInstance.setFontSize(11);
      docInstance.setTextColor(200, 0, 0);
      const correlativoTexto = `Correlativo: ${correlativo}`;
      const correlativoWidth = docInstance.getTextWidth(correlativoTexto);
      docInstance.text(correlativoTexto, pageWidth - marginX - correlativoWidth, yTitulo - 2);
      docInstance.setTextColor(0, 0, 0);
    }

    return yTitulo + lineHeight + 5;
  };

  const correlativo = asignaciones.find((a) => a?.correlativo)?.correlativo;

  let yActual = await agregarEncabezado(doc, correlativo);

  const bodyPrincipal = asignaciones.map((a) => [
    a.codificacionEquipo ?? "—",
    a.ubicacion ?? "—",
    formatFecha(a.fechaAsignacion),
  ]);

  autoTable(doc, {
    margin: { left: marginX, right: marginX, bottom: FOOTER_H + 6 },
    tableWidth: boxWidth,
    pageBreak: "auto",
    startY: yActual,
    head: [
      [{ content: "DATOS DEL EQUIPO", colSpan: 3, styles: { halign: "center" } }],
      ["Codificación", "Ubicación", "Fecha asignación"],
    ],
    body: bodyPrincipal.length > 0 ? bodyPrincipal : [["—", "—", "—"]],
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 8,
    },
  });

  yActual = doc.lastAutoTable.finalY + 6;

  const bodySecundario = asignaciones.map((a) => [
    a.fechaActualizacion ? formatFecha(a.fechaActualizacion) : "—",
    a.observaciones ?? "—",
  ]);

  autoTable(doc, {
    margin: { left: marginX, right: marginX, bottom: FOOTER_H + 6 },
    tableWidth: boxWidth,
    pageBreak: "auto",
    startY: yActual,
    head: [["Última actualización", "Observaciones"]],
    body: bodySecundario.length > 0 ? bodySecundario : [["—", "—"]],
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: boxWidth * 0.3 },
      1: { cellWidth: boxWidth * 0.7 },
    },
  });

  yActual = doc.lastAutoTable.finalY + 20;

  const firmas = [
    { nombre: "Carlos Mazariegos", label: "Enterado" },
    { nombre: "Kleidy López", label: "Realizado" },
    { nombre: "Giovanni Artiga", label: "Instalador" },
  ];

  const alturaFirma = 20;
  const marginFirma = 30;

  if (yActual + alturaFirma > PAGE_BOTTOM) {
    agregarFooter(doc, doc.internal.getNumberOfPages());
    doc.addPage();
    yActual = (await agregarEncabezado(doc, correlativo)) + 15;
  }

  const inicioFirmasY = yActual;

  firmas.forEach((firma, i) => {
    const x = i === 0 ? marginFirma : i === 1 ? pageWidth / 2 : pageWidth - marginFirma;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("(F):________________", x, inicioFirmasY, { align: "center" });

    doc.setFontSize(7);
    doc.text(firma.label, x, inicioFirmasY + 5, { align: "center" });

    doc.setTextColor(0, 102, 204);
    doc.setFontSize(8);
    doc.text(firma.nombre, x, inicioFirmasY + 10, { align: "center" });
    doc.setTextColor(0, 0, 0);
  });

  agregarFooter(doc, doc.internal.getNumberOfPages());

  const codigos = [...new Set(asignaciones.map((a) => a.codificacionEquipo).filter(Boolean))];
  const sufijo = codigos.length === 1 ? codigos[0] : codigos.length > 1 ? "multiple" : "sin_equipo";

  doc.save(`Asignacion_comunal_${sufijo}.pdf`);
};

export default generarPDFAsignacionComunal;
