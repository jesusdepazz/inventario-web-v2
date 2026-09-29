export const ESTADOS_INMUEBLE = ["disponible", "reservada", "vendida", "alquilada"];

export const CAMPOS_INGRESO = [
  { label: "Codificación", key: "codificacion" },
  { label: "Familia / tipo de inmueble", key: "nombreCatalogoActivo" },
  { label: "Descripción del bien", key: "descripcion" },
  { label: "Dirección", key: "direccion" },
  { label: "Estado", key: "estado" },
  { label: "No. orden de compra", key: "numeroOrdenCompra" },
  { label: "Fecha orden de compra", key: "fechaOrdenCompra" },
  { label: "No. factura electrónica", key: "numeroFacturaElectronica" },
  { label: "Proveedor", key: "nombreProveedor" },
  { label: "Fecha factura", key: "fechaFactura" },
  { label: "Ficha técnica", key: "fichaTecnica" },
];

export const PLANTILLA = {
  encabezados: [
    "Codificacion", "Familia", "Descripcion", "Direccion", "Estado", "NumeroOrdenCompra", "FechaOrdenCompra",
    "NumeroFacturaElectronica", "NombreProveedor", "FechaFactura", "FichaTecnica",
  ],
  ejemplo: [
    "INM-001", "Bodega", "Bodega zona industrial", "Km 15 carretera al Pacífico", "disponible", "OC-1001", "2026-01-10",
    "FEL-99887", "Inmobiliaria S.A.", "2026-01-12", "1,200 m², 2 niveles",
  ],
};
