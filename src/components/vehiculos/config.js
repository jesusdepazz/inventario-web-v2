export const CAMPOS_INGRESO = [
  { label: "Codificación", key: "codificacion" },
  { label: "Familia", key: "tipoEquipo" },
  { label: "Marca", key: "marca" },
  { label: "Modelo", key: "modelo" },
  { label: "Modelo (año)", key: "modeloAnio" },
  { label: "Placa", key: "placa" },
  { label: "Número de chasis (VIN)", key: "vin" },
  { label: "Color", key: "color" },
  { label: "Tipo de combustible", key: "tipoCombustible" },
  { label: "Kilometraje", key: "kilometrajeActual" },
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
    "Codificacion", "Familia", "Marca", "Modelo", "ModeloAnio", "Placa", "VIN", "Color", "TipoCombustible",
    "Kilometraje", "Serie", "NumeroAsignado", "ResponsableActual", "Estado", "Ubicacion", "FechaIngreso",
    "OrdenCompra", "Factura", "Proveedor", "HojaNo", "ResponsableAnterior", "Comentarios", "Observaciones",
  ],
  ejemplo: [
    "VEH-001", "Automóvil", "Toyota", "Hilux", 2024, "P-123ABC", "MR0FB8CD0R0123456", "Blanco", "Diésel",
    15000, "", "Unidad 12", "", "Buen estado", "Planta", "2026-01-20",
    "OC-2001", "F-3001", "Autos S.A.", "", "", "", "",
  ],
};
