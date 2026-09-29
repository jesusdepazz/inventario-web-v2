// Todos los campos de la entidad Equipo (InventarioApi/Models/Equipo.cs), agrupados por sección.
// tipo: texto (por defecto) | fecha | area | familia | ubicacion | estado | soloLectura

export const ESTADOS_EQUIPO = ["Asignado", "Disponible", "Buen estado", "En reparación", "Obsoleto"];

export const SECCIONES_EQUIPO = [
  {
    titulo: "Datos generales",
    campos: [
      { name: "ordenCompra", label: "Orden de compra" },
      { name: "factura", label: "Factura" },
      { name: "proveedor", label: "Proveedor" },
      { name: "fechaIngreso", label: "Fecha de ingreso", tipo: "fecha", requerido: true },
    ],
  },
  {
    titulo: "Datos de usuario",
    campos: [
      { name: "hojaNo", label: "Hoja No." },
      { name: "responsableAnterior", label: "Responsable anterior" },
      { name: "fechaActualizacion", label: "Fecha de actualización", tipo: "soloLectura" },
    ],
  },
  {
    titulo: "Datos del equipo",
    campos: [
      { name: "codificacion", label: "Codificación", requerido: true },
      { name: "tipoEquipo", label: "Familia / tipo de equipo", tipo: "familia", requerido: true },
      { name: "equipoTipo", label: "Descripción del equipo" },
      { name: "marca", label: "Marca", requerido: true },
      { name: "modelo", label: "Modelo", requerido: true },
      { name: "serie", label: "Serie", requerido: true },
      { name: "imei", label: "IMEI" },
      { name: "numeroAsignado", label: "Número asignado" },
      { name: "extension", label: "Extensión" },
      { name: "estado", label: "Estado", tipo: "estado", requerido: true },
    ],
  },
  {
    titulo: "Ubicación del equipo",
    campos: [{ name: "ubicacion", label: "Ubicación", tipo: "ubicacion", requerido: true }],
  },
  {
    titulo: "Información del equipo",
    campos: [
      { name: "comentarios", label: "Comentarios / especificaciones técnicas", tipo: "area" },
      { name: "observaciones", label: "Observaciones", tipo: "area" },
    ],
  },
];

export const CAMPOS_EQUIPO = SECCIONES_EQUIPO.flatMap((s) => s.campos);

export const FORM_EQUIPO_INICIAL = Object.fromEntries(
  CAMPOS_EQUIPO.filter((c) => c.tipo !== "soloLectura").map((c) => [c.name, ""])
);

export const CAMPOS_INGRESO_EQUIPO = CAMPOS_EQUIPO
  .filter((c) => c.tipo !== "soloLectura")
  .map((c) => ({ label: c.label, key: c.name }));

// La importación de equipos lee las columnas por posición (formato original de IT + 3 opcionales al final)
export const PLANTILLA_EQUIPO = {
  encabezados: [
    "OrdenCompra", "Factura", "Proveedor", "FechaIngreso", "HojaNo", "FechaActualizacion", "Codificacion",
    "Estado", "TipoEquipo", "Marca", "Modelo", "Serie", "Extension", "Ubicacion", "ResponsableAnterior",
    "Comentarios", "Observaciones", "NumeroAsignado", "Imei", "EquipoTipo",
  ],
  ejemplo: [
    "OC-4001", "F-5001", "Distribuidora TI S.A.", "2026-03-01", "", "", "EQ-IT-000124",
    "Disponible", "Computadora portátil", "Lenovo", "ThinkPad L14", "PF3ABC12", "", "Oficinas centrales", "",
    "i7, 16GB RAM, 512GB SSD", "", "", "", "Laptop administrativa",
  ],
};
