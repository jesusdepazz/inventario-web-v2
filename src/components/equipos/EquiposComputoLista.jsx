import React from "react";
import EquiposService from "../../services/EquiposServices";
import { aLista } from "../../services/payload";
import InventarioActivos from "../activos/InventarioActivos";
import { fecha } from "../modalEstilos";
import { CAMPOS_INGRESO_EQUIPO, PLANTILLA_EQUIPO } from "./camposEquipo";

const asignadoA = (e) => {
  const asignaciones = aLista(e.asignaciones);
  return asignaciones.length ? asignaciones.map((a) => `${a.codigoEmpleado} - ${a.nombreEmpleado}`).join(", ") : "";
};

// Todas las columnas de la entidad Equipo (Equipo.cs) + asignaciones
const columnas = [
  { key: "codificacion", label: "Codificación" },
  { key: "tipoEquipo", label: "Familia / Tipo" },
  { key: "equipoTipo", label: "Descripción" },
  { key: "marca", label: "Marca" },
  { key: "modelo", label: "Modelo" },
  { key: "serie", label: "Serie" },
  { key: "imei", label: "IMEI" },
  { key: "numeroAsignado", label: "Número asignado" },
  { key: "extension", label: "Extensión" },
  { key: "estado", label: "Estado" },
  { key: "ubicacion", label: "Ubicación" },
  { key: "asignado", label: "Asignado a", valor: asignadoA },
  { key: "responsableAnterior", label: "Responsable anterior" },
  { key: "hojaNo", label: "Hoja No." },
  { key: "ordenCompra", label: "Orden de compra" },
  { key: "factura", label: "Factura" },
  { key: "proveedor", label: "Proveedor" },
  { key: "fechaIngreso", label: "Fecha ingreso", valor: (e) => (e.fechaIngreso ? fecha(e.fechaIngreso) : "") },
  { key: "fechaActualizacion", label: "Fecha actualización", valor: (e) => (e.fechaActualizacion ? fecha(e.fechaActualizacion) : "") },
  { key: "comentarios", label: "Comentarios" },
  { key: "observaciones", label: "Observaciones" },
];

const cargar = async (empresa) => aLista((await EquiposService.obtenerEquipos({ empresa })).data);

export default function EquiposComputoLista() {
  return (
    <InventarioActivos
      titulo="Inventario de equipo de cómputo"
      subtitulo="Computadoras, servidores, monitores y periféricos administrados por IT"
      categoria="Equipo de cómputo"
      cargar={cargar}
      columnas={columnas}
      campoFamilia="tipoEquipo"
      camposIngreso={CAMPOS_INGRESO_EQUIPO}
      importar={EquiposService.importarExcel}
      plantilla={PLANTILLA_EQUIPO}
    />
  );
}
