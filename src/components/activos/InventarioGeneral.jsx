import React from "react";
import ActivosService from "../../services/ActivosServices";
import { aLista } from "../../services/payload";
import InventarioActivos from "./InventarioActivos";
import { fecha } from "../modalEstilos";
import { CATEGORIAS_ACTIVOS } from "../equipos/catalogoActivos";

const sinGuion = (v) => (v && v !== "-" ? v : "");

// Vista consolidada de todas las categorías (endpoint unificado /api/Activos)
const columnas = [
  { key: "codificacion", label: "Codificación" },
  { key: "categoria", label: "Categoría" },
  { key: "tipoEquipo", label: "Familia", valor: (a) => sinGuion(a.tipoEquipo) },
  { key: "equipoTipo", label: "Descripción" },
  { key: "marca", label: "Marca", valor: (a) => sinGuion(a.marca) },
  { key: "modelo", label: "Modelo", valor: (a) => sinGuion(a.modelo) },
  { key: "serie", label: "Serie / VIN", valor: (a) => sinGuion(a.serie) },
  { key: "estado", label: "Estado", valor: (a) => sinGuion(a.estado) },
  { key: "ubicacion", label: "Ubicación / Dirección", valor: (a) => sinGuion(a.ubicacion) },
  { key: "ordenCompra", label: "Orden de compra" },
  { key: "factura", label: "Factura" },
  { key: "proveedor", label: "Proveedor" },
  { key: "fechaIngreso", label: "Fecha ingreso", valor: (a) => (a.fechaIngreso ? fecha(a.fechaIngreso) : "") },
];

const camposIngreso = [
  { label: "Categoría", key: "categoria" },
  ...columnas.filter((c) => c.key !== "categoria").map((c) => ({ label: c.label, key: c.key })),
];

const cargar = async (empresa) => aLista((await ActivosService.listar({ empresa })).data);

export default function InventarioGeneral() {
  return (
    <InventarioActivos
      titulo="Inventario general"
      subtitulo="Todos los activos: inmuebles, mobiliario y equipo, equipo de cómputo, vehículos y otros activos"
      categoria="Inventario general"
      cargar={cargar}
      columnas={columnas}
      campoFamilia="categoria"
      camposIngreso={camposIngreso}
      filtro={{ label: "Categoría", key: "categoria", opciones: CATEGORIAS_ACTIVOS.map((c) => c.value) }}
    />
  );
}
