import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const guardar = (hojas, nombreArchivo) => {
  const libro = XLSX.utils.book_new();
  hojas.forEach(({ nombre, datos }) => {
    XLSX.utils.book_append_sheet(libro, XLSX.utils.aoa_to_sheet(datos), nombre.slice(0, 31));
  });
  const buffer = XLSX.write(libro, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buffer], { type: "application/octet-stream" }), nombreArchivo);
};

const valorCelda = (valor) => {
  if (valor === null || valor === undefined) return "";
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}T/.test(valor)) return new Date(valor).toLocaleDateString("es-ES");
  return valor;
};

// Reporte de inventario. columnas: [{ label, key, valor?(fila) }]
export const exportarInventario = (nombre, columnas, filas) => {
  const datos = [
    columnas.map((c) => c.label),
    ...filas.map((f) => columnas.map((c) => valorCelda(c.valor ? c.valor(f) : f[c.key]))),
  ];
  guardar([{ nombre, datos }], `${nombre.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

// Plantilla vacía para carga masiva con los encabezados que reconoce el backend.
export const descargarPlantilla = (nombre, encabezados, ejemplo = []) => {
  guardar([{ nombre: "Plantilla", datos: ejemplo.length ? [encabezados, ejemplo] : [encabezados] }], `Plantilla_${nombre.replace(/\s+/g, "_")}.xlsx`);
};
