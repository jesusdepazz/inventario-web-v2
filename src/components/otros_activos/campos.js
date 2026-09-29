// Campos del modelo OtrosActivos del backend.
// Según la minuta, en datos del equipo no se capturan extensión ni IMEI.
export const FORM_INICIAL = {
  tipoEquipo: "",
  equipoTipo: "",
  codificacion: "",
  marca: "",
  modelo: "",
  serie: "",
  numeroAsignado: "",
  ordenCompra: "",
  factura: "",
  proveedor: "",
  fechaIngreso: "",
  hojaNo: "",
  estado: "",
  ubicacion: "",
  responsableAnterior: "",
  comentarios: "",
  observaciones: "",
};

export const ESTADOS = ["Buen estado", "Regular", "En reparación", "Disponible", "Obsoleto"];

export const CAMPOS_TEXTO = [
  { name: "codificacion", label: "Codificación *" },
  { name: "equipoTipo", label: "Descripción / tipo de bien" },
  { name: "marca", label: "Marca / Fabricante" },
  { name: "modelo", label: "Modelo / Identificador" },
  { name: "serie", label: "Serie" },
  { name: "numeroAsignado", label: "Número asignado" },
  { name: "ordenCompra", label: "Orden de compra" },
  { name: "factura", label: "Factura" },
  { name: "proveedor", label: "Proveedor" },
  { name: "hojaNo", label: "Hoja No." },
  { name: "responsableAnterior", label: "Responsable anterior" },
];

export const CAMPOS_INGRESO = [
  { label: "Codificación", key: "codificacion" },
  { label: "Familia", key: "tipoEquipo" },
  { label: "Descripción", key: "equipoTipo" },
  { label: "Marca", key: "marca" },
  { label: "Modelo", key: "modelo" },
  { label: "Serie", key: "serie" },
  { label: "Número asignado", key: "numeroAsignado" },
  { label: "Estado", key: "estado" },
  { label: "Ubicación", key: "ubicacion" },
  { label: "Fecha de ingreso", key: "fechaIngreso" },
  { label: "Orden de compra", key: "ordenCompra" },
  { label: "Factura", key: "factura" },
  { label: "Proveedor", key: "proveedor" },
  { label: "Hoja No.", key: "hojaNo" },
  { label: "Comentarios", key: "comentarios" },
  { label: "Observaciones", key: "observaciones" },
];

// La importación de OtrosActivos lee las columnas por posición: respetar este orden.
export const PLANTILLA = {
  encabezados: [
    "OrdenCompra", "Factura", "Proveedor", "FechaIngreso", "HojaNo", "FechaActualizacion", "Codificacion",
    "Estado", "Familia", "Marca", "Modelo", "Serie", "Extension", "NumeroAsignado", "Imei", "Descripcion",
    "Ubicacion", "ResponsableAnterior", "Comentarios", "Observaciones",
  ],
  ejemplo: [
    "OC-3001", "F-4001", "Ferretería S.A.", "2026-02-01", "", "", "OTR-001",
    "Buen estado", "Herramienta", "DeWalt", "DCD771", "SN12345", "", "", "", "Taladro inalámbrico",
    "Taller", "", "", "",
  ],
};

// El backend de OtrosActivos devuelve errores como texto plano; los demás como { mensaje } o ProblemDetails
export const mensajeError = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data) return data;
  return data?.mensaje || data?.title || fallback;
};
