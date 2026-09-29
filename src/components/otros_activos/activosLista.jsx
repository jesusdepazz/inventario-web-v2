import React from "react";
import OtrosActivosService from "../../services/OtrosActivosServices";
import { aLista } from "../../services/payload";
import InventarioActivos from "../activos/InventarioActivos";
import { fecha } from "../modalEstilos";
import { CAMPOS_INGRESO, PLANTILLA } from "./campos";

const asignadoA = (a) => {
  const asignaciones = aLista(a.asignaciones);
  return asignaciones.length ? asignaciones.map((x) => x.nombreEmpleado).join(", ") : "-";
};

const columnas = [
  { key: "codificacion", label: "Codificación", render: (a) => <span className="font-semibold">{a.codificacion || "-"}</span> },
  { key: "tipoEquipo", label: "Familia" },
  { key: "equipoTipo", label: "Descripción" },
  { key: "marca", label: "Marca" },
  { key: "modelo", label: "Modelo" },
  { key: "serie", label: "Serie" },
  { key: "estado", label: "Estado" },
  { key: "ubicacion", label: "Ubicación" },
  { key: "asignado", label: "Asignado a", valor: asignadoA },
  { key: "fechaIngreso", label: "Fecha ingreso", valor: (a) => fecha(a.fechaIngreso) },
];

const cargar = async (empresa) => aLista((await OtrosActivosService.obtenerTodos({ empresa })).data);

export default function InventarioOtrosActivos() {
  return (
    <InventarioActivos
      titulo="Inventario de otros activos"
      subtitulo="Registros diversos no clasificados dentro de otras categorías"
      categoria="Otros activos"
      cargar={cargar}
      columnas={columnas}
      camposIngreso={CAMPOS_INGRESO}
      importar={OtrosActivosService.importarExcel}
      plantilla={PLANTILLA}
    />
  );
}
