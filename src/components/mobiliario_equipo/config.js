export const SEGMENTOS = ["Mobiliario administrativo", "Equipo"];

export const CAMPOS_INGRESO = [
  { label: "Codificación", key: "codificacion" },
  { label: "Segmento", key: "segmento" },
  { label: "Familia", key: "tipoEquipo" },
  { label: "Marca", key: "marca" },
  { label: "Modelo", key: "modelo" },
  { label: "Serie", key: "serie" },
  { label: "Número de chapa del activo", key: "numeroChapaActivo" },
  { label: "Control de llaves", key: "controlLlaves" },
  { label: "Estado físico actual", key: "estadoFisicoActual" },
  { label: "Color", key: "color" },
  { label: "Dimensiones", key: "dimensiones" },
  { label: "Estado", key: "estado" },
  { label: "Ubicación", key: "ubicacion" },
  { label: "Fecha de ingreso", key: "fechaIngreso" },
  { label: "Orden de compra", key: "ordenCompra" },
  { label: "Factura", key: "factura" },
  { label: "Proveedor", key: "proveedor" },
  { label: "Comentarios", key: "comentarios" },
  { label: "Observaciones", key: "observaciones" },
];

export const PLANTILLA = {
  encabezados: [
    "Codificacion", "Segmento", "Familia", "Descripcion", "Marca", "Modelo", "Serie", "NumeroChapaActivo",
    "ControlLlaves", "EstadoFisicoActual", "Color", "Dimensiones", "CatalogoActivos", "Estado", "Ubicacion",
    "FechaIngreso", "OrdenCompra", "Factura", "Proveedor", "HojaNo", "ResponsableAnterior", "Comentarios", "Observaciones",
  ],
  ejemplo: [
    "MOB-001", "Mobiliario administrativo", "Mobiliario administrativo", "Escritorio ejecutivo", "Steelcase", "Series 5", "", "CH-0001",
    "Llave 12", "Bueno", "Negro", "160x80x75 cm", "", "Buen estado", "Oficinas centrales",
    "2026-01-15", "OC-1234", "F-5678", "Proveedor S.A.", "", "", "", "",
  ],
};
