import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportarExcel(resultadosFiltrados) {
  const encabezados = [
    "#",
    "Orden de Compra",
    "Factura",
    "Proveedor",
    "Fecha Ingreso",
    "Hoja No.",
    "Fecha Actualizacion",
    "Asignado a",
    "Codificación",
    "Equipo",
    "Marca",
    "Modelo",
    "Serie",
    "IMEI",
    "Estado",
    "Tipo",
    "Responsable Anterior",
    "Número asignado",
    "Extensión",
    "Ubicacion",
    "Comentarios",
    "Observaciones",
  ];

  const data = resultadosFiltrados.map((equipo, index) => [
    index + 1,
    equipo.ordenCompra,
    equipo.factura,
    equipo.proveedor,
    equipo.fechaIngreso
      ? new Date(equipo.fechaIngreso).toLocaleDateString("es-ES")
      : "Sin fecha",
    equipo.hojaNo,
    equipo.fechaActualizacion
      ? new Date(equipo.fechaActualizacion).toLocaleDateString("es-ES")
      : "Sin fecha",
    equipo.asignaciones && equipo.asignaciones.length > 0
      ? equipo.asignaciones
          .map(
            (a, i) =>
              `${i + 1}. ${a.codigoEmpleado} - ${a.nombreEmpleado} (${a.puesto})`
          )
          .join("\n")
      : "Sin asignaciones",
    equipo.codificacion,
    equipo.tipoEquipo,
    equipo.marca,
    equipo.modelo,
    equipo.serie,
    equipo.imei,
    equipo.estado || "Sin estado",
    equipo.tipo,
    equipo.responsableAnterior,
    equipo.numeroAsignado,
    equipo.extension,
    equipo.ubicacion,
    equipo.comentarios,
    equipo.observaciones,
  ]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([encabezados, ...data]);

  function rgbToARGB(hex) {
    const hexClean = hex.replace("#", "");
    return "FF" + hexClean.toUpperCase();
  }

  for (let i = 0; i < data.length; i++) {
    const rowIndex = i + 2;

    const estadoCelda = ws[`P${rowIndex}`];
    if (estadoCelda) {
      let fillColor = "FFD1D5DB"; 
      let fontColor = "FF000000"; 

      if (estadoCelda.v === "Buen estado") {
        fillColor = rgbToARGB("#22c55e");
        fontColor = rgbToARGB("#ffffff"); 
      } else if (estadoCelda.v === "Inactivo") {
        fillColor = rgbToARGB("#ef4444"); 
        fontColor = rgbToARGB("#ffffff");
      } else if (estadoCelda.v === "Obsoleto") {
        fillColor = rgbToARGB("#f97316");
        fontColor = rgbToARGB("#ffffff");
      }

      estadoCelda.s = {
        fill: { fgColor: { rgb: fillColor } },
        font: { color: { rgb: fontColor }, bold: true },
        alignment: { vertical: "center", horizontal: "center" },
        border: {
          top: { style: "thin", color: { rgb: "FF000000" } },
          bottom: { style: "thin", color: { rgb: "FF000000" } },
          left: { style: "thin", color: { rgb: "FF000000" } },
          right: { style: "thin", color: { rgb: "FF000000" } },
        },
      };
    }

    const estadoStickerCelda = ws[`X${rowIndex}`];
    if (estadoStickerCelda) {
      let fillColor = "FFD1D5DB"; 
      let fontColor = "FF000000"; 

      if (estadoStickerCelda.v === "Buen estado") {
        fillColor = rgbToARGB("#22c55e");
        fontColor = rgbToARGB("#ffffff");
      } else if (estadoStickerCelda.v === "Cambio") {
        fillColor = rgbToARGB("#f97316"); 
        fontColor = rgbToARGB("#ffffff");
      }

      estadoStickerCelda.s = {
        fill: { fgColor: { rgb: fillColor } },
        font: { color: { rgb: fontColor }, bold: true },
        alignment: { vertical: "center", horizontal: "center" },
        border: {
          top: { style: "thin", color: { rgb: "FF000000" } },
          bottom: { style: "thin", color: { rgb: "FF000000" } },
          left: { style: "thin", color: { rgb: "FF000000" } },
          right: { style: "thin", color: { rgb: "FF000000" } },
        },
      };
    }
  }

  const wscols = encabezados.map(() => ({ wch: 20 }));
  ws["!cols"] = wscols;

  XLSX.utils.book_append_sheet(wb, ws, "Inventario");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "inventario.xlsx");
}
