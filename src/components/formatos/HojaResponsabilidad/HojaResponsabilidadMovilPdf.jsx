import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const generarPDFHojaMovil = async (hoja) => {
    const doc = new jsPDF();
    const marginX = 5;
    const pageWidth = doc.internal.pageSize.getWidth();
    const boxWidth = pageWidth - marginX * 2;
    const pageHeight = doc.internal.pageSize.getHeight();

    const fechaActual = new Date().toLocaleDateString("es-ES");

    const formatFecha = (fecha) => {
        if (!fecha || fecha.startsWith("0001-01-01")) return "—";
        return new Date(fecha).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
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

    const agregarFooter = (doc, numeroPagina) => {
        const footerY = pageHeight - 10;

        doc.setFontSize(8);
        doc.setTextColor(100);

        doc.text("Depto. de Sistemas", 10, footerY);

        const textoPagina = `Página ${numeroPagina}`;
        const textWidth = doc.getTextWidth(textoPagina);
        doc.text(textoPagina, (pageWidth - textWidth) / 2, footerY);

        const emision = `Emisión: ${fechaActual}`;
        const emisionWidth = doc.getTextWidth(emision);
        doc.text(emision, pageWidth - emisionWidth - 10, footerY);
    };

    const agregarEncabezado = async (doc, numeroHoja, marginX, mostrarContador = true, yStart = 20) => {
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

        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.3);
        doc.line(lineMarginX, centerY - space * 2, lineMarginX + lineWidth, centerY - space * 2);
        doc.setLineWidth(1.2);
        doc.line(lineMarginX, centerY, lineMarginX + lineWidth, centerY);
        doc.setLineWidth(0.3);
        doc.line(lineMarginX, centerY + space * 2, lineMarginX + lineWidth, centerY + space * 2);

        doc.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight);

        yStart = logoY + logoHeight + 5;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("ADMINISTRACION DE ACTIVOS IT", marginX, yStart);

        if (mostrarContador) {
            doc.setFontSize(15);
            doc.setTextColor(255, 0, 0);
            doc.text(
                `No. ${String(numeroHoja).padStart(5, "0")}`,
                pageWidth - marginX,
                yStart,
                { align: "right" }
            );

            doc.setFontSize(10);
        }

        doc.setTextColor(0, 0, 0);
        doc.text("HOJA DE RESPONSABILIDAD", marginX, yStart + 4);
        doc.text("ACTIVOS IT, EQUIPOS Y SUMINISTROS", marginX, yStart + 8);
        doc.text(`FECHA DE ACTUALIZACIÓN: ${fechaActual}`, marginX, yStart + 12);

        const yTitulo = yStart + 22;
        const titulo = "HOJA DE RESPONSABILIDAD EQUIPO DE EQUIPO MOVIL";
        const textWidth = doc.getTextWidth(titulo);
        const tituloX = (pageWidth - textWidth) / 3;
        const lineHeight = 10;

        doc.setFillColor(230, 230, 230);
        doc.rect(marginX, yTitulo, boxWidth, lineHeight, "F");

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(titulo, tituloX, yTitulo + 7);

        return yTitulo + lineHeight + 5;
    };

    const numeroHoja = hoja.hojaNo ?? 1;
    let yActual = await agregarEncabezado(doc, numeroHoja, marginX, true);

    const empleados = hoja.empleados ?? [];
    const empleadosBody = empleados.map(emp => [
        emp.nombre ?? "—",
        emp.puesto ?? "—",
        emp.departamento ?? "—"
    ]);

    autoTable(doc, {
        startY: yActual,
        head: [["Nombre", "Puesto", "Departamento"]],
        body: empleadosBody.length > 0 ? empleadosBody : [["—", "—", "—"]],
        styles: {
            fontSize: 10,
            cellPadding: 1,
            minCellHeight: 4,
            lineColor: [0, 0, 0],
            lineWidth: 0.2
        },
        headStyles: {
            fillColor: [30, 58, 138],
            textColor: [255, 255, 255],
            fontSize: 6
        },
        margin: { left: marginX, right: marginX },
        tableWidth: boxWidth,
        pageBreak: "auto"
    });

    yActual = doc.lastAutoTable.finalY + 10;

    const jefeInfo = hoja.jefeInmediato ?? "";

    let nombreJefe = "";
    let cargoJefe = "";
    let departamentoJefe = "";

    if (jefeInfo.includes(" - ")) {
        const partes = jefeInfo.split(" - ");
        nombreJefe = partes[0] ?? "";
        cargoJefe = partes[1] ?? "";
        departamentoJefe = partes[2] ?? "";
    }

    const fechaActualizacion = hoja.fechaCreacion
        ? formatFecha(hoja.fechaCreacion)
        : "";

    doc.setFontSize(8);

    const lineHeight = 8;
    const leftX = marginX;
    const rightX = marginX + boxWidth / 2;
    const leftWidth = boxWidth / 2 - 10;
    const rightWidth = boxWidth / 2 - 10;

    doc.setFont("helvetica", "bold");
    doc.text("JEFE INMEDIATO:", leftX, yActual);

    doc.setFont("helvetica", "normal");
    doc.text(nombreJefe, leftX + 38, yActual);

    doc.line(
        leftX + 38,
        yActual + 2,
        leftX + leftWidth,
        yActual + 2
    );

    doc.setFont("helvetica", "bold");
    doc.text("CARGO:", rightX, yActual);

    doc.setFont("helvetica", "normal");
    doc.text(cargoJefe, rightX + 20, yActual);

    doc.line(
        rightX + 20,
        yActual + 2,
        rightX + rightWidth,
        yActual + 2
    );


    yActual += lineHeight;

    doc.setFont("helvetica", "bold");
    doc.text("AREA O DEPARTAMENTO:", leftX, yActual);

    doc.setFont("helvetica", "normal");
    doc.text(departamentoJefe, leftX + 55, yActual);

    doc.line(
        leftX + 55,
        yActual + 2,
        leftX + leftWidth,
        yActual + 2
    );

    yActual += lineHeight;

    doc.setFont("helvetica", "bold");
    doc.text("FECHA DE ACTUALIZACIÓN:", leftX, yActual);

    doc.setFont("helvetica", "normal");
    doc.text(fechaActualizacion, leftX + 60, yActual);

    doc.line(
        leftX + 60,
        yActual + 2,
        leftX + leftWidth,
        yActual + 2
    );

    yActual += 10;

    const equipos = hoja.equipos ?? [];
    const equiposBody = equipos.map(eq => [
        eq.fechaIngreso ? formatFecha(eq.fechaIngreso) : "—",
        eq.codificacion ?? "—",
        eq.tipoEquipo ?? "—",
        eq.marca ?? "—",
        eq.modelo ?? "—",
        eq.serie ?? "—",
        `IMEI: ${eq.imei ?? "-"}\n` +
        `Número Asignado: ${eq.numeroAsignado ?? "-"}\n` +
        `Incluye: ${hoja.accesorios ?? "-"}`
    ]);

    autoTable(doc, {
        startY: yActual,
        head: [["Fecha", "Código", "Equipo", "Marca", "Modelo", "Serie", "Observaciones."]],
        body: equiposBody.length > 0 ? equiposBody : [["—", "—", "—", "—", "—", "—", "—"]],
        styles: {
            fontSize: 10,
            cellPadding: 1,
            minCellHeight: 4,
            lineColor: [0, 0, 0],
            lineWidth: 0.2,
            overflow: "linebreak"
        },
        headStyles: {
            fillColor: [30, 58, 138],
            textColor: [255, 255, 255],
            fontSize: 6
        },
        columnStyles: {
            6: { cellWidth: 40 }
        },
        margin: { left: marginX, right: marginX },
        tableWidth: boxWidth,
        pageBreak: "auto"
    });

    yActual = doc.lastAutoTable.finalY + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Me haré responsable del manejo óptimo de estos recursos, a través de lo siguiente:', marginX, yActual);
    yActual += 4;

    const printWrappedText = (texto, x, y, maxWidth) => {
        const lines = doc.splitTextToSize(texto, maxWidth);
        doc.text(lines, x, y);
        return y + lines.length * 3;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(0, 102, 204);

    yActual = printWrappedText('A) Conservar íntegro los recursos anteriormente descritos.', marginX, yActual, boxWidth);
    yActual = printWrappedText('B) Cualquier circunstancia adversa a mis manejos de los recursos, lo reportaré de manera inmediata a mi jefe inmediato y a Administrador de activos fijos.', marginX, yActual, boxWidth);
    yActual = printWrappedText('C) Verificar la integridad de las etiquetas de código de activos, cualquier anomalía se reportará a Administrador de Activos Fijos.', marginX, yActual, boxWidth);
    yActual = printWrappedText('D) Me comprometo a devolver los recursos en buenas condiciones, y en el momento que sean devueltos, si por circunstancias el Activo fuese destruido total o parcialmente por negligencia mía, AUTORIZO a la empresa ¨Guatemalan Candies, S.A.¨ realizar el reclamo respectivo del mismo, deduciendo la suma que cubra el valor del o los recursos de mi salario al cual tengo derecho.', marginX, yActual, boxWidth);

    yActual += 10;

    const marginFirma = 30;

    const verificarSaltoPagina = async (alturaNecesaria) => {
        if (yActual + alturaNecesaria > pageHeight - 40) {
            agregarFooter(doc, doc.internal.getNumberOfPages());
            doc.addPage();
            yActual = await agregarEncabezado(doc, numeroHoja, marginX, true) + 10;
        }
    };

    const firmas = [
        ...empleados.map(e => ({
            nombre: e.nombre,
            puesto: e.puesto,
            label: "Responsable:"
        })),
        {
            nombre: "Kleidy López",
            puesto: "Asistente IT",
            label: "Realizado por:"
        },
        {
            nombre: "Carlos Mazariegos",
            puesto: "Gerente de Sistemas",
            label: "Entrega de equipo:"
        }
    ];

    const firmasPorFila = 3;
    const alturaFirma = 35;
    const totalFilas = Math.ceil(firmas.length / firmasPorFila);
    const alturaTotalFirmas = totalFilas * alturaFirma + 10;

    await verificarSaltoPagina(alturaTotalFirmas);

    const inicioFirmasY = yActual;

    for (let i = 0; i < firmas.length; i++) {
        const fila = Math.floor(i / firmasPorFila);
        const col = i % firmasPorFila;

        const firmasEnFila = Math.min(
            firmasPorFila,
            firmas.length - fila * firmasPorFila
        );

        let x;

        if (firmasEnFila === 1) {
            x = pageWidth / 2;
        } else if (firmasEnFila === 2) {
            x = col === 0 ? marginFirma : pageWidth - marginFirma;
        } else {
            if (col === 0) x = marginFirma;
            else if (col === 1) x = pageWidth / 2;
            else x = pageWidth - marginFirma;
        }

        const y = inicioFirmasY + fila * alturaFirma;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("(F):________________", x, y, { align: "center" });

        doc.setFontSize(8);
        doc.text(firmas[i].label, x, y + 6, { align: "center" });

        doc.setTextColor(0, 102, 204);
        doc.text(firmas[i].nombre ?? "", x, y + 12, { align: "center" });

        doc.setTextColor(0, 0, 0);
        doc.text(firmas[i].puesto ?? "", x, y + 18, { align: "center" });
    }

    yActual = inicioFirmasY + alturaTotalFirmas;

    agregarFooter(doc, doc.internal.getNumberOfPages());

    doc.save('hoja_responsabilidad_movil.pdf');
};

export default generarPDFHojaMovil;