import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import BajaActivosService from "../../../services/BajaActivosServices";
import EquiposService from "../../../services/EquiposServices";
import UbicacionesService from "../../../services/UbicacionesServices";

export const generarBajaPDF = async (bajaId) => {
  try {
    const { data: baja } = await BajaActivosService.obtenerPorId(bajaId);

    const { data: equipo } =
      await EquiposService.obtenerPorCodificacion(baja.codificacionEquipo);
      
    const { data: ubicaciones } =
      await UbicacionesService.obtenerTodas();

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 5;
    const availableFooterWidth = pageWidth - marginX * 2;

    const headerY = 10;
    const logoWidth = 40;
    const logoHeight = 25;
    const cellHeight = 8;
    const cellPadding = 4;

    const formatearFechaLarga = (fecha) => {
      const opciones = {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      };

      return new Date(fecha).toLocaleDateString("es-ES", opciones)
        .replace(/^\w/, c => c.toUpperCase());
    };


    const numeroPDF = `No. ${baja.numeroBaja || '___'}`;

    doc.addImage('/logo_guandy.png', 'PNG', marginX, headerY, logoWidth, logoHeight);

    const centerX = pageWidth / 2;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Guatemala Candies, S.A.', centerX, headerY + 5, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Administración IT', centerX, headerY + 11, { align: 'center' });
    doc.text('Baja de Equipo de Cómputo', centerX, headerY + 17, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(180, 0, 0);
    const numeroX = marginX + availableFooterWidth - 20;
    doc.text(numeroPDF, numeroX, headerY + 5);

    doc.setTextColor(0, 0, 0);

    const lineaY = headerY + logoHeight + 2;
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);

    let y = lineaY + 2;

    const motivosNombres = {
      obsolencia: "Obsolescencia",
      venta: "Venta",
      robo: "Robo",
      donacion: "Donación",
      otro: "Otro",
    };

    const normalizarMotivo = (s) =>
      (s || "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    const motivosSeleccionados = String(baja.motivoBaja || "")
      .split(",")
      .map((m) => normalizarMotivo(m))
      .filter(Boolean);

    const motivos = Object.entries(motivosNombres);
    const colCount = 5;
    const availableWidth = pageWidth - marginX * 2;
    const cellWidth = availableWidth / colCount;
    const checkboxSize = 4;

    const fechaBajaTexto = formatearFechaLarga(baja.fechaBaja);
    const fechaLabelWidth = 25;
    const fechaValueWidth = availableWidth - fechaLabelWidth;
    const fechaRowHeight = cellHeight;

    doc.setFont("helvetica", "bold");
    doc.rect(marginX, y, fechaLabelWidth, fechaRowHeight);
    doc.text("FECHA:", marginX + 2, y + fechaRowHeight / 2 + 2);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 180);
    doc.rect(marginX + fechaLabelWidth, y, fechaValueWidth, fechaRowHeight);
    doc.text(
      fechaBajaTexto,
      marginX + fechaLabelWidth + 2,
      y + fechaRowHeight / 2 + 2
    );

    y += fechaRowHeight;

    doc.setDrawColor(0);
    doc.setFillColor(200, 200, 200);
    doc.rect(marginX, y, availableWidth, cellHeight, "FD");
    const titulo = "JUSTIFICACIÓN DE LA BAJA";
    const textWidth = doc.getTextWidth(titulo);
    const titleX = marginX + (availableWidth - textWidth) / 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(titulo, titleX, y + cellHeight / 2 + 2);
    y += cellHeight;

    let x = marginX;
    motivos.forEach(([motivoKey, motivoVisible], index) => {
      doc.setDrawColor(0);
      doc.rect(x, y, cellWidth, cellHeight);

      const checkboxX = x + 3;
      const checkboxY = y + cellHeight / 2 - checkboxSize / 2;

      doc.rect(checkboxX, checkboxY, checkboxSize, checkboxSize);

      if (motivosSeleccionados.includes(motivoKey)) {
        doc.setFont("helvetica", "bold");
        doc.text("X", checkboxX + 0.6, checkboxY + checkboxSize - 0.6);
      }

      doc.setFont("helvetica", "normal");
      doc.text(motivoVisible, checkboxX + checkboxSize + 3, checkboxY + checkboxSize - 0.5);

      x += cellWidth;
      if ((index + 1) % colCount === 0) {
        x = marginX;
        y += cellHeight;
      }
    });

    if (motivos.length % colCount !== 0) y += cellHeight;

    const justificacionCellHeight = cellHeight * 3;
    const labelWidth = 30;
    const textAreaWidth = availableWidth - labelWidth;

    doc.rect(marginX, y, labelWidth, justificacionCellHeight);
    doc.setFont('helvetica', 'bold');
    doc.text('Justificación\nde la baja\nde activos', marginX + 2, y + 5, { maxWidth: labelWidth - 4, lineHeightFactor: 1.2 });
    doc.rect(marginX + labelWidth, y, textAreaWidth, justificacionCellHeight);

    if (baja.detallesBaja) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const detallesLines = doc.splitTextToSize(baja.detallesBaja, textAreaWidth - 4);
      doc.text(detallesLines, marginX + labelWidth + 2, y + 5, { lineHeightFactor: 1.2 });
    }

    y += justificacionCellHeight;

    const ubicacionActualNombre = ubicaciones.find(u => u.id === baja.ubicacionActual)?.nombre || baja.ubicacionActual;
    const destinoNombre = ubicaciones.find(u => u.id === baja.ubicacionDestino)?.nombre || baja.ubicacionDestino;

    autoTable(doc, {
      startY: y,
      head: [
        [
          {
            content: 'INFORMACIÓN GENERAL',
            colSpan: 5,
            styles: {
              halign: 'center',
              fillColor: [200, 200, 200],
              fontStyle: 'bold',
              fontSize: 10,
              lineColor: [0, 0, 0],
              lineWidth: 0.2,
            },
          },
        ],
        ['Codificación', 'Equipo', 'Marca', 'Modelo', 'Serie'],
      ],
      body: [
        [
          equipo.codificacion || '',
          equipo.tipoEquipo,
          equipo.marca,
          equipo.modelo || '',
          equipo.serie || '',
        ],
        [
          { content: "Ubicación Actual", styles: { fontStyle: "bold", textColor: [0, 0, 0] } },
          { content: ubicacionActualNombre, colSpan: 5 },
        ],
        [
          { content: "Destino", styles: { fontStyle: "bold", textColor: [0, 0, 0] } },
          { content: destinoNombre, colSpan: 5 },
        ],
      ],
      margin: { left: marginX, right: marginX },
      styles: {
        fontSize: 9,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: 0,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        fontStyle: "bold",
        textColor: [0, 0, 180],
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
    });

    y = doc.lastAutoTable.finalY;

    const sectionTitleHeight = cellHeight;

    doc.setDrawColor(0);
    doc.setFillColor(200, 200, 200);
    doc.rect(marginX, y, availableWidth, sectionTitleHeight, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    const sectionTitle =
      "DETALLES DE BAJA DE ACTIVOS POR VENTA Y O DONACION";

    const sectionTextWidth = doc.getTextWidth(sectionTitle);
    const sectionTitleX = marginX + (availableWidth - sectionTextWidth) / 2;

    doc.text(
      sectionTitle,
      sectionTitleX,
      y + sectionTitleHeight / 2 + 2
    );

    y += sectionTitleHeight;

    const leftColWidth = 45;
    const rightColWidth = availableWidth - leftColWidth;
    const rowHeight = cellHeight;

    const filasDetalle = [
      "Pase de salida SR",
      "Factura",
      "Depósito",
      "Recibo",
      "Otros",
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    filasDetalle.forEach((texto) => {
      doc.rect(marginX, y, leftColWidth, rowHeight);
      doc.text(texto, marginX + 2, y + rowHeight / 2 + 2);
      doc.rect(marginX + leftColWidth, y, rightColWidth, rowHeight);

      y += rowHeight;
    });

    autoTable(doc, {
      startY: y,
      head: [
        [
          {
            content: 'NOMBRES Y FIRMAS',
            colSpan: 3,
            styles: {
              halign: 'center',
              fillColor: [200, 200, 200],
              fontStyle: 'bold',
              fontSize: 10,
              textColor: 0
            }
          }
        ]
      ],
      body: [
        [
          {
            content: 'Nombre y firma solicitante',
            styles: {
              fillColor: [200, 200, 200],
              fontStyle: 'bold',
              halign: 'center'
            }
          },
          {
            content: 'Enterado jefe inmediato',
            styles: {
              fillColor: [200, 200, 200],
              fontStyle: 'bold',
              halign: 'center'
            }
          },
          {
            content: 'Vo.Co. Contador General',
            styles: {
              fillColor: [200, 200, 200],
              fontStyle: 'bold',
              halign: 'center'
            }
          }
        ],
        [
          {
            content: '',
            styles: {
              minCellHeight: 26,
              valign: 'bottom',
              halign: 'center',
              textColor: [0, 0, 180],
              fontStyle: 'bold'
            }
          },
          {
            content: '\n\n\n',
            styles: {
              minCellHeight: 26,
              valign: 'bottom'
            }
          },
          {
            content: '',
            styles: {
              minCellHeight: 26,
              valign: 'bottom',
              halign: 'center',
              textColor: [0, 0, 180],
              fontStyle: 'bold'
            }
          }
        ],
        [
          {
            content: 'Asistente IT',
            styles: {
              fillColor: [200, 200, 200],
              fontStyle: 'bold',
              halign: 'center'
            }
          },
          {
            content: 'Recibido',
            styles: {
              fillColor: [200, 200, 200],
              fontStyle: 'bold',
              halign: 'center'
            }
          },
          {
            content: 'Autorización',
            styles: {
              fillColor: [200, 200, 200],
              fontStyle: 'bold',
              halign: 'center'
            }
          }
        ],
        [
          {
            content: '',
            styles: {
              minCellHeight: 26,
              valign: 'bottom',
              halign: 'center',
              textColor: [0, 0, 180],
              fontStyle: 'bold'
            }
          },
          {
            content: '',
            styles: {
              minCellHeight: 26,
              valign: 'bottom',
              halign: 'center',
              textColor: [0, 0, 180],
              fontStyle: 'bold'
            }
          },
          {
            content: '\n\n\nGerrardo Araneda / Vanessa Santiago',
            styles: {
              minCellHeight: 26,
              valign: 'bottom',
              halign: 'center',
              textColor: [0, 0, 180],
              fontStyle: 'bold'
            }
          }
        ]
      ],
      margin: { left: marginX, right: marginX },
      styles: {
        fontSize: 10,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        cellPadding: 4
      },
      theme: 'grid'
    });

    doc.save(`Baja_${baja.codificacionEquipo}.pdf`);
  } catch (error) {
    console.error("Error generando PDF:", error);
  }
};
