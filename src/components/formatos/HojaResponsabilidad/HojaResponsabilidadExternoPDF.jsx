import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Colores verde musgo
const MOSS_DARK  = [68, 89, 30];  
const MOSS_LIGHT = [210, 228, 175];
const MOSS_MID   = [140, 168, 80];

const generarPDFHojaExterno = async (hoja) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const marginX    = 5;
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const boxWidth   = pageWidth - marginX * 2;

  const FOOTER_H   = 12;
  const BOTTOM_PAD = 6;
  const PAGE_BOTTOM = pageHeight - FOOTER_H - BOTTOM_PAD;

  const fechaActual = new Date().toLocaleDateString("es-ES");

  const formatFecha = (fecha) => {
    if (!fecha || String(fecha).startsWith("0001-01-01")) return "—";
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  const loadImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload  = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

  const agregarFooter = (docInstance, numeroPagina) => {
    const footerY = pageHeight - 10;
    docInstance.setFontSize(8);
    docInstance.setTextColor(100);
    docInstance.text("Depto. de Sistemas", 10, footerY);
    const textoPagina = `Página ${numeroPagina}`;
    const tw = docInstance.getTextWidth(textoPagina);
    docInstance.text(textoPagina, (pageWidth - tw) / 2, footerY);
    const emision = `Emisión: ${fechaActual}`;
    const ew = docInstance.getTextWidth(emision);
    docInstance.text(emision, pageWidth - ew - 10, footerY);
  };

  const numeroHoja  = hoja.hojaNo ?? 1;
  const versionHoja = Number(hoja.version) || 0;

  const agregarEncabezado = async (docInstance, numeroHoja, versionHoja, mostrarContador = true) => {
    const logoUrl = `${window.location.origin}/logo_guandy.png`;
    const logoImg = await loadImage(logoUrl);

    const logoWidth  = 40;
    const logoHeight = 20;
    const logoX      = (pageWidth - logoWidth) / 2;
    const logoY      = 10;

    const lineMarginX = marginX;
    const lineWidth   = pageWidth - marginX * 2;
    const centerY     = logoY + logoHeight / 2;
    const space       = 0.7;

    docInstance.setDrawColor(...MOSS_DARK);
    docInstance.setLineWidth(0.3);
    docInstance.line(lineMarginX, centerY - space * 2, lineMarginX + lineWidth, centerY - space * 2);
    docInstance.setLineWidth(1.2);
    docInstance.line(lineMarginX, centerY, lineMarginX + lineWidth, centerY);
    docInstance.setLineWidth(0.3);
    docInstance.line(lineMarginX, centerY + space * 2, lineMarginX + lineWidth, centerY + space * 2);

    docInstance.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight);

    let yStart = logoY + logoHeight + 5;

    docInstance.setFontSize(10);
    docInstance.setFont("helvetica", "bold");
    docInstance.setTextColor(0, 0, 0);
    docInstance.text("ADMINISTRACION DE ACTIVOS IT", marginX, yStart);

    if (mostrarContador) {
      const numeroTexto  = `No. ${String(numeroHoja).padStart(5, "0")}`;
      const versionTexto = versionHoja > 0 ? `V${versionHoja}` : "";

      docInstance.setFont("helvetica", "bold");
      docInstance.setTextColor(255, 0, 0);
      docInstance.setFontSize(15);
      docInstance.text(numeroTexto, pageWidth - marginX, yStart, { align: "right" });

      if (versionTexto) {
        docInstance.setTextColor(0, 0, 0);
        docInstance.setFontSize(8);
        docInstance.text(versionTexto, pageWidth - marginX, yStart + 5, { align: "right" });
      }
      docInstance.setFontSize(10);
    }

    docInstance.setTextColor(0, 0, 0);
    docInstance.text("HOJA DE RESPONSABILIDAD", marginX, yStart + 4);
    docInstance.text("ACTIVOS FIJOS, EQUIPO Y SUMINISTROS", marginX, yStart + 8);

    const yTitulo    = yStart + 22;
    const titulo     = "HOJA DE RESPONSABILIDAD DE EXTERNOS - PRESTAMO DE EQUIPO";
    const lineHeight = 10;

    docInstance.setFillColor(...MOSS_LIGHT);
    docInstance.rect(marginX, yTitulo, boxWidth, lineHeight, "F");

    docInstance.setFontSize(14);
    docInstance.setFont("helvetica", "bold");
    docInstance.setTextColor(0, 0, 0);
    docInstance.text(titulo, pageWidth / 2, yTitulo + 7, { align: "center" });

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
    doc.setFont("helvetica", style.bold ? "bold" : "normal");
    doc.setTextColor(...(style.color ?? [0, 0, 0]));
    const lines = doc.splitTextToSize(texto, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * getLineH(fontSize);
  };

  const getEquipoTableStyles = (count) => {
    if (count <= 5)  return { fontSize: 8, cellPadding: 2,   minCellHeight: 7 };
    if (count <= 12) return { fontSize: 7, cellPadding: 1.5, minCellHeight: 5 };
    return                  { fontSize: 6, cellPadding: 1,   minCellHeight: 4 };
  };

  const autoTableDefault = {
    margin: { left: marginX, right: marginX, bottom: FOOTER_H + 6 },
    tableWidth: boxWidth,
    pageBreak: "auto",
  };

  // ── ENCABEZADO ──────────────────────────────────────────────────────────────
  let yActual = await agregarEncabezado(doc, numeroHoja, versionHoja, true);

  const empleados     = hoja.empleados ?? [];
  const empleadosBody = empleados.map((emp) => [
    emp.empleadoId   ?? "—",
    emp.nombre       ?? "—",
    emp.puesto       ?? "—",
    emp.departamento ?? "—",
  ]);

  autoTable(doc, {
    ...autoTableDefault,
    startY: yActual,
    head: [["Código de empleado", "Persona responsable", "Cargo", "DPI"]],
    body: empleadosBody.length > 0 ? empleadosBody : [["—", "—", "—", "—"]],
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      minCellHeight: 5,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: MOSS_DARK,
      textColor: [255, 255, 255],
      fontSize: 7,
    },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 50 },
      3: { cellWidth: 38 },
    },
  });

  yActual = doc.lastAutoTable.finalY + 1;

  // ── JEFES INMEDIATOS / FECHA DE ACTUALIZACIÓN / PROYECTO ────────────────────
  const col1W   = boxWidth * 0.55;
  const col2W   = boxWidth * 0.45;
  const rowH    = 14;
  const secH    = rowH * 2;

  yActual = await ensureSpace(yActual, secH + 2, numeroHoja, versionHoja);

  doc.setDrawColor(160);
  doc.setLineWidth(0.2);

  // Bordes exteriores
  doc.rect(marginX,          yActual, col1W, secH);
  doc.rect(marginX + col1W,  yActual, col2W, secH);
  // Divisor horizontal en columna izquierda
  doc.line(marginX, yActual + rowH, marginX + col1W, yActual + rowH);

  doc.setTextColor(0, 0, 0);

  // — Celda 1: JEFES INMEDIATOS
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("JEFES INMEDIATOS:", marginX + 2, yActual + 4);
  // línea de valor
  doc.setDrawColor(100);
  doc.line(marginX + 2, yActual + rowH - 2, marginX + col1W - 2, yActual + rowH - 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    doc.splitTextToSize(hoja.jefeInmediato ?? "—", col1W - 6),
    marginX + 2,
    yActual + rowH - 4
  );

  // — Celda 2: FECHA DE ACTUALIZACIÓN
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("FECHA DE ACTUALIZACIÓN:", marginX + 2, yActual + rowH + 4);
  doc.setDrawColor(100);
  doc.line(marginX + 2, yActual + secH - 2, marginX + col1W - 2, yActual + secH - 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(fechaActual, marginX + 2, yActual + secH - 4);

  // — Celda 3: PROYECTO (columna derecha, altura completa)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("PROYECTO:", marginX + col1W + 2, yActual + 4);
  doc.setDrawColor(100);
  doc.line(marginX + col1W + 2, yActual + secH / 2 + 2, marginX + col1W + col2W - 2, yActual + secH / 2 + 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    doc.splitTextToSize(hoja.proyecto ?? "—", col2W - 6),
    marginX + col1W + 2,
    yActual + secH / 2
  );

  doc.setDrawColor(180);
  yActual += secH + 3;

  // ── MOTIVO ───────────────────────────────────────────────────────────────────
  const motivoLabel    = "Motivo de actualización:";
  const motivoTexto    = hoja.motivo ?? "—";
  const motivoTextoX   = marginX + doc.getTextWidth(motivoLabel) + 4;
  const motivoTextoW   = boxWidth - (motivoTextoX - marginX) - 4;
  const motivoHeight   = 8;

  yActual = await ensureSpace(yActual, motivoHeight + 2, numeroHoja, versionHoja);

  doc.setFillColor(...MOSS_LIGHT);
  doc.setDrawColor(180);
  doc.rect(marginX, yActual, boxWidth, motivoHeight, "FD");

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(motivoLabel, marginX + 2, yActual + 5);

  doc.setFillColor(255, 255, 255);
  doc.rect(motivoTextoX, yActual + 1.5, motivoTextoW, motivoHeight - 3, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(doc.splitTextToSize(motivoTexto, motivoTextoW - 4), motivoTextoX + 2, yActual + 6);

  yActual += motivoHeight + 1;

  // ── TABLA EQUIPOS ────────────────────────────────────────────────────────────
  const fechaAsignacion = hoja.fechaCreacion ? formatFecha(hoja.fechaCreacion) : "—";

  const equipos     = hoja.equipos ?? [];
  const equiposBody = equipos.map((eq) => [
    fechaAsignacion,
    eq.codificacion ?? "—",
    eq.tipoEquipo   ?? "—",
    eq.marca        ?? "—",
    eq.modelo       ?? "—",
    eq.serie        ?? "—",
    eq.observaciones ?? "-",
  ]);

  const equipoStyles = getEquipoTableStyles(equiposBody.length);

  autoTable(doc, {
    ...autoTableDefault,
    startY: yActual,
    head: [["Fecha", "Código", "Equipo", "Marca", "Modelo", "Serie", "Observaciones"]],
    body: equiposBody.length > 0 ? equiposBody : [["—", "—", "—", "—", "—", "—", "—"]],
    styles: { ...equipoStyles, lineColor: [0, 0, 0], lineWidth: 0.2 },
    headStyles: { fillColor: MOSS_DARK, textColor: [255, 255, 255], fontSize: equipoStyles.fontSize },
  });

  yActual = doc.lastAutoTable.finalY + 3;

  // ── ACCESORIOS ───────────────────────────────────────────────────────────────
  const alturaTituloAccesorios = 6;
  yActual = await ensureSpace(yActual, alturaTituloAccesorios + 22, numeroHoja, versionHoja);

  doc.setFillColor(...MOSS_LIGHT);
  doc.rect(marginX, yActual, boxWidth, alturaTituloAccesorios, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("Detalle de accesorios entregados:", marginX + 2, yActual + 4.5);

  yActual += alturaTituloAccesorios + 1;

  const accesorios = [
    "Maletin", "Adaptador", "Cable USB", "Cargador/Cubo", "Audífonos",
    "Control Remoto", "Baterías", "Estuche", "Memoria SD", "Otros",
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
      doc.line(x + 26, y + 2.7, pageWidth - marginX, y + 2.7);
    }
  });

  yActual += 18;

  // ── COMENTARIOS + FIRMA DEL RESPONSABLE ──────────────────────────────────────
  const col1Width  = boxWidth * 0.7;
  const col2Width  = boxWidth * 0.3;
  const headerH    = 6;
  const rowHeight  = 12;

  yActual = await ensureSpace(yActual, headerH + rowHeight + 6, numeroHoja, versionHoja);

  doc.setFillColor(...MOSS_LIGHT);
  doc.rect(marginX,            yActual, col1Width, headerH, "F");
  doc.rect(marginX + col1Width, yActual, col2Width, headerH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("Comentarios relacionados al estado del equipo", marginX + 2,           yActual + 4);
  doc.text("Firma del responsable",                         marginX + col1Width + 2, yActual + 4);

  yActual += headerH;

  doc.setDrawColor(180);
  doc.rect(marginX,            yActual, col1Width, rowHeight);
  doc.rect(marginX + col1Width, yActual, col2Width, rowHeight);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(
    doc.splitTextToSize(hoja.comentarios || "Sin comentarios", col1Width - 4),
    marginX + 2,
    yActual + 4
  );

  yActual += rowHeight + 3;

  // ── CLÁUSULAS LEGALES ─────────────────────────────────────────────────────────
  yActual = await ensureSpace(yActual, 40, numeroHoja, versionHoja);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(
    "Me haré responsable del manejo óptimo de estos recursos, a través de lo siguiente:",
    marginX,
    yActual
  );
  yActual += 4;

  const clausulas = [
    "A) Conservar íntegro los recursos anteriormente descritos.",
    "B) Cualquier circunstancia adversa a mis manejos de los recursos, lo reportaré de manera inmediata a mi jefe inmediato y a Administrador de activos fijos.",
    "C) Verificar la integridad de las etiquetas de código de activos, cualquier anomalía se reportará a Administrador de Activos Fijos.",
    "D) Me comprometo a devolver los recursos en buenas condiciones, y en el momento que sean devueltos, si por circunstancias el Activo fuese destruido total o parcialmente por negligencia mía, AUTORIZO a la empresa ¨Guatemalan Candies, S.A.¨ realizar el reclamo respectivo del mismo, deduciendo la suma que cubra el valor del o los recursos de mi salario al cual tengo derecho.",
  ];

  for (const cl of clausulas) {
    yActual = printWrappedText(cl, marginX, yActual, boxWidth, 6, {
      bold: true,
      color: MOSS_DARK,
    });
  }

  yActual += 10;

  // ── FIRMAS ────────────────────────────────────────────────────────────────────
  const marginFirma   = 30;
  const firmasPorFila = 3;
  const alturaFirma   = 35;

  const firmas = [
    { nombre: "Kleidy López",      puesto: "Asistente IT",       label: "Realizado por:"    },
    ...empleados.map((e) => ({ nombre: e.nombre, puesto: e.puesto, label: "Responsable:" })),
    { nombre: "Carlos Mazariegos", puesto: "Gerente de Sistemas", label: "Entrega de equipo:" },
  ];

  const totalFilas        = Math.ceil(firmas.length / firmasPorFila);
  const alturaTotalFirmas = totalFilas * alturaFirma + 8;

  yActual = await ensureSpace(yActual, alturaTotalFirmas, numeroHoja, versionHoja);

  const inicioFirmasY = yActual;

  for (let i = 0; i < firmas.length; i++) {
    const fila          = Math.floor(i / firmasPorFila);
    const col           = i % firmasPorFila;
    const firmasEnFila  = Math.min(firmasPorFila, firmas.length - fila * firmasPorFila);

    let x;
    if      (firmasEnFila === 1) x = pageWidth / 2;
    else if (firmasEnFila === 2) x = col === 0 ? marginFirma : pageWidth - marginFirma;
    else                         x = col === 0 ? marginFirma : col === 1 ? pageWidth / 2 : pageWidth - marginFirma;

    const y = inicioFirmasY + fila * alturaFirma;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("(F):________________", x, y, { align: "center" });

    doc.setFontSize(7);
    doc.text(firmas[i].label, x, y + 5, { align: "center" });

    doc.setTextColor(...MOSS_DARK);
    doc.setFontSize(8);
    doc.text(firmas[i].nombre ?? "", x, y + 10, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(firmas[i].puesto ?? "", x, y + 15, { align: "center", maxWidth: 45 });
  }

  agregarFooter(doc, doc.internal.getNumberOfPages());
  doc.save("hoja_responsabilidad_externo.pdf");
};

export default generarPDFHojaExterno;
