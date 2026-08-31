import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const generarPDFHoja = async (hoja) => {
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
    if (!fecha || String(fecha).startsWith("0001-01-01")) return "—";
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  const numeroHoja = hoja.hojaNo ?? 1;
  const versionHoja = Number(hoja.version) || 0;

  const numeroTexto = `No. ${String(numeroHoja).padStart(5, "0")}`;
  const versionTexto = versionHoja > 0 ? `V${versionHoja}` : "";

  const agregarEncabezado = async (
    docInstance,
    numeroHoja,
    versionHoja,
    mostrarContador = true
  ) => {
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
    docInstance.line(
      lineMarginX,
      centerY - space * 2,
      lineMarginX + lineWidth,
      centerY - space * 2
    );
    docInstance.setLineWidth(1.2);
    docInstance.line(lineMarginX, centerY, lineMarginX + lineWidth, centerY);
    docInstance.setLineWidth(0.3);
    docInstance.line(
      lineMarginX,
      centerY + space * 2,
      lineMarginX + lineWidth,
      centerY + space * 2
    );

    docInstance.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight);

    let yStart = logoY + logoHeight + 5;

    docInstance.setFontSize(10);
    docInstance.setFont("helvetica", "bold");
    docInstance.setTextColor(0, 0, 0);
    docInstance.text("ADMINISTRACION DE ACTIVOS IT", marginX, yStart);

    if (mostrarContador) {
      const numeroTexto = `No. ${String(numeroHoja).padStart(5, "0")}`;
      const versionTexto = versionHoja > 0 ? `V${versionHoja}` : "";

      docInstance.setFont("helvetica", "bold");
      docInstance.setTextColor(255, 0, 0);
      docInstance.setFontSize(15);
      docInstance.text(numeroTexto, pageWidth - marginX, yStart, {
        align: "right",
      });
      if (versionTexto) {
        docInstance.setTextColor(0, 0, 0);
        docInstance.setFontSize(8);
        docInstance.text(versionTexto, pageWidth - marginX, yStart + 5, {
          align: "right",
        });
      }

      docInstance.setFontSize(10);
    }

    docInstance.setTextColor(0, 0, 0);
    docInstance.text("HOJA DE RESPONSABILIDAD", marginX, yStart + 4);
    docInstance.text("ACTIVOS IT, EQUIPOS Y SUMINISTROS", marginX, yStart + 8);
    docInstance.text(`FECHA DE ACTUALIZACIÓN: ${fechaActual}`, marginX, yStart + 12);

    const yTitulo = yStart + 22;
    const titulo = "HOJA DE RESPONSABILIDAD EQUIPO DE COMPUTO";
    const textWidth = docInstance.getTextWidth(titulo);
    const tituloX = (pageWidth - textWidth) / 3;
    const lineHeight = 10;

    docInstance.setFillColor(204, 229, 255);
    docInstance.rect(marginX, yTitulo, boxWidth, lineHeight, "F");

    docInstance.setFontSize(14);
    docInstance.setFont("helvetica", "bold");
    docInstance.text(titulo, tituloX, yTitulo + 7);

    return yTitulo + lineHeight + 1;
  };

  const ensureSpace = async (yActualRef, neededHeight, numeroHoja, versionHoja) => {
    if (yActualRef + neededHeight > PAGE_BOTTOM) {
      agregarFooter(doc, doc.internal.getNumberOfPages());
      doc.addPage();
      const yHeaderEnd = await agregarEncabezado(doc, numeroHoja, versionHoja, true);
      return yHeaderEnd + 10;
    }
    return yActualRef;
  };

  const getLineH = (fontSize) => fontSize * 0.45;
  const printWrappedText = (texto, x, y, maxWidth, fontSize = 6, style = {}) => {
    doc.setFontSize(fontSize);
    if (style.bold) doc.setFont("helvetica", "bold");
    else doc.setFont("helvetica", "normal");
    if (style.color) doc.setTextColor(...style.color);
    else doc.setTextColor(0, 0, 0);

    const lines = doc.splitTextToSize(texto, maxWidth);
    const lh = getLineH(fontSize);
    doc.text(lines, x, y);
    return y + lines.length * lh;
  };

  const getEquipoTableStyles = (count) => {
    if (count <= 5) return { fontSize: 8, cellPadding: 2, minCellHeight: 7 };
    if (count <= 12) return { fontSize: 7, cellPadding: 1.5, minCellHeight: 5 };
    return { fontSize: 6, cellPadding: 1, minCellHeight: 4 };
  };

  const autoTableDefault = {
    margin: { left: marginX, right: marginX, bottom: FOOTER_H + 6 },
    tableWidth: boxWidth,
    pageBreak: "auto",
  };

  let yActual = await agregarEncabezado(doc, numeroHoja, versionHoja, true);

  const empleados = hoja.empleados ?? [];
  const empleadosBody = empleados.map((emp) => [
    emp.empleadoId ?? "—",
    emp.nombre ?? "—",
    emp.puesto ?? "—",
    emp.departamento ?? "—",
  ]);

  autoTable(doc, {
    ...autoTableDefault,
    startY: yActual,
    head: [["Código", "Nombre", "Puesto", "Departamento"]],
    body: empleadosBody.length > 0 ? empleadosBody : [["—", "—", "—", "—"]],
    styles: {
      fontSize: 6,
      cellPadding: 1,
      minCellHeight: 4,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 6,
    },
  });

  yActual = doc.lastAutoTable.finalY + 1;

  const motivoLabel = "Motivo de actualización:";
  const motivoTexto = hoja.motivo ?? "—";
  const motivoTextoX = marginX + doc.getTextWidth(motivoLabel) + 4;
  const motivoTextoWidth = boxWidth - (motivoTextoX - marginX) - 4;
  const motivoHeight = 8;

  yActual = await ensureSpace(yActual, motivoHeight + 2, numeroHoja, versionHoja);

  doc.setFillColor(200, 230, 255);
  doc.setDrawColor(180);
  doc.rect(marginX, yActual, boxWidth, motivoHeight, "FD");

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(motivoLabel, marginX + 2, yActual + 5);

  doc.setFillColor(255, 255, 255);
  doc.rect(motivoTextoX, yActual + 1.5, motivoTextoWidth, motivoHeight - 3, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    doc.splitTextToSize(motivoTexto, motivoTextoWidth - 4),
    motivoTextoX + 2,
    yActual + 6
  );

  yActual += motivoHeight + 1;

  const fechaAsignacion = hoja.fechaCreacion ? formatFecha(hoja.fechaCreacion) : "—";

  const equipos = hoja.equipos ?? [];
  const equiposBody = equipos.map((eq) => [
    fechaAsignacion,
    eq.codificacion ?? "—",
    eq.tipoEquipo ?? "—",
    eq.marca ?? "—",
    eq.modelo ?? "—",
    eq.serie ?? "—",
    eq.observaciones ?? "-",
  ]);

  const equipoStyles = getEquipoTableStyles(equiposBody.length);

  autoTable(doc, {
    ...autoTableDefault,
    startY: yActual,
    head: [["Fecha", "Código", "Equipo", "Marca", "Modelo", "Serie", "Observaciones."]],
    body: equiposBody.length > 0 ? equiposBody : [["—", "—", "—", "—", "—", "—", "—"]],
    styles: {
      ...equipoStyles,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: equipoStyles.fontSize,
    },
  });

  yActual = doc.lastAutoTable.finalY + 3;

  const alturaTituloAccesorios = 6;
  yActual = await ensureSpace(yActual, alturaTituloAccesorios + 22, numeroHoja);

  doc.setFillColor(200, 230, 255);
  doc.rect(marginX, yActual, boxWidth, alturaTituloAccesorios, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("Detalle de accesorios entregados:", marginX + 2, yActual + 4.5);

  yActual += alturaTituloAccesorios + 1;

  const accesorios = [
    "Maletin",
    "Adaptador",
    "Cable USB",
    "Cargador/Cubo",
    "Audífonos",
    "Control Remoto",
    "Baterías",
    "Estuche",
    "Memoria SD",
    "Otros",
  ];

  const accesoriosSeleccionados = hoja.accesorios
    ? hoja.accesorios.split(",").map((a) => a.trim())
    : [];

  const spacingX = 35;
  const spacingY = 8;

  accesorios.forEach((acc, i) => {
    const x = marginX + (i % 5) * spacingX;
    const y = yActual + Math.floor(i / 5) * spacingY;

    doc.setDrawColor(0);
    doc.rect(x, y, 3.5, 3.5);

    if (accesoriosSeleccionados.includes(acc)) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("X", x + 0.9, y + 2.7);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(acc, x + 5.5, y + 2.7);

    if (acc === "Otros") {
      const lineStartX = x + 26;
      const lineEndX = pageWidth - marginX;
      doc.line(lineStartX, y + 2.7, lineEndX, y + 2.7);
    }
  });

  yActual += 18;

  const col1Width = boxWidth * 0.7;
  const col2Width = boxWidth * 0.3;
  const headerHeight = 6;
  const rowHeight = 12;

  yActual = await ensureSpace(yActual, headerHeight + rowHeight + 6, numeroHoja);

  doc.setFillColor(204, 229, 255);
  doc.rect(marginX, yActual, col1Width, headerHeight, "F");
  doc.rect(marginX + col1Width, yActual, col2Width, headerHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("Comentarios relacionados al estado del equipo", marginX + 2, yActual + 4);
  doc.text("Firma del responsable", marginX + col1Width + 2, yActual + 4);

  yActual += headerHeight;

  doc.setDrawColor(180);
  doc.rect(marginX, yActual, col1Width, rowHeight);
  doc.rect(marginX + col1Width, yActual, col2Width, rowHeight);

  const comentariosTexto = hoja.comentarios || "Sin comentarios";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);

  const comentariosLines = doc.splitTextToSize(comentariosTexto, col1Width - 4);
  doc.text(comentariosLines, marginX + 2, yActual + 4);

  yActual += rowHeight + 3;

  const legalEstimatedHeight = 40;
  yActual = await ensureSpace(yActual, legalEstimatedHeight, numeroHoja);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(
    "Me haré responsable del manejo óptimo de estos recursos, a través de lo siguiente:",
    marginX,
    yActual
  );
  yActual += 4;

  yActual = printWrappedText(
    "A) Conservar íntegro los recursos anteriormente descritos.",
    marginX,
    yActual,
    boxWidth,
    6,
    { bold: true, color: [0, 102, 204] }
  );
  yActual = printWrappedText(
    "B) Cualquier circunstancia adversa a mis manejos de los recursos, lo reportaré de manera inmediata a mi jefe inmediato y a Administrador de activos fijos.",
    marginX,
    yActual,
    boxWidth,
    6,
    { bold: true, color: [0, 102, 204] }
  );
  yActual = printWrappedText(
    "C) Verificar la integridad de las etiquetas de código de activos, cualquier anomalía se reportará a Administrador de Activos Fijos.",
    marginX,
    yActual,
    boxWidth,
    6,
    { bold: true, color: [0, 102, 204] }
  );
  yActual = printWrappedText(
    "D) Me comprometo a devolver los recursos en buenas condiciones, y en el momento que sean devueltos, si por circunstancias el Activo fuese destruido total o parcialmente por negligencia mía, AUTORIZO a la empresa ¨Guatemalan Candies, S.A.¨ realizar el reclamo respectivo del mismo, deduciendo la suma que cubra el valor del o los recursos de mi salario al cual tengo derecho.",
    marginX,
    yActual,
    boxWidth,
    6,
    { bold: true, color: [0, 102, 204] }
  );

  yActual += 10;

  const marginFirma = 30;

  const firmas = [
    {
      nombre: "Kleidy López",
      puesto: "Asistente IT",
      label: "Realizado por:",
    },

    ...empleados.map((e) => ({
      nombre: e.nombre,
      puesto: e.puesto,
      label: "Responsable:",
    })),

    {
      nombre: "Carlos Mazariegos",
      puesto: "Gerente de Sistemas",
      label: "Entrega de equipo:",
    },
  ];

  const firmasPorFila = 3;
  const alturaFirma = 25;
  const totalFilas = Math.ceil(firmas.length / firmasPorFila);
  const alturaTotalFirmas = totalFilas * alturaFirma + 8;

  yActual = await ensureSpace(yActual, alturaTotalFirmas, numeroHoja);

  const inicioFirmasY = yActual;

  for (let i = 0; i < firmas.length; i++) {
    const fila = Math.floor(i / firmasPorFila);
    const col = i % firmasPorFila;

    const firmasEnFila = Math.min(
      firmasPorFila,
      firmas.length - fila * firmasPorFila
    );

    let x;
    if (firmasEnFila === 1) x = pageWidth / 2;
    else if (firmasEnFila === 2) x = col === 0 ? marginFirma : pageWidth - marginFirma;
    else x = col === 0 ? marginFirma : col === 1 ? pageWidth / 2 : pageWidth - marginFirma;

    const y = inicioFirmasY + fila * alturaFirma;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("(F):________________", x, y, { align: "center" });

    doc.setFontSize(7);
    doc.text(firmas[i].label, x, y + 5, { align: "center" });

    doc.setTextColor(0, 102, 204);
    doc.setFontSize(8);
    doc.text(firmas[i].nombre ?? "", x, y + 10, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(firmas[i].puesto ?? "", x, y + 15, { align: "center", maxWidth: 45 });
  }

  yActual = inicioFirmasY + alturaTotalFirmas;

  agregarFooter(doc, doc.internal.getNumberOfPages());

  doc.save("hoja_responsabilidad.pdf");
};

export default generarPDFHoja;