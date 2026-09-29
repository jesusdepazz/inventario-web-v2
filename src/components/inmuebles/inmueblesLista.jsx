import React, { useState } from "react";
import InmueblesService from "../../services/InmueblesServices";
import { aLista } from "../../services/payload";
import InventarioActivos from "../activos/InventarioActivos";
import Badge from "../ui/Badge";
import InmuebleDetalleModal from "./InmuebleDetalleModal";
import { CAMPOS_INGRESO, PLANTILLA, ESTADOS_INMUEBLE } from "./config";

const polizaPorVencer = (i) =>
  aLista(i.polizas).some((p) => p.estado === "activa" && p.fechaRenovacion && (new Date(p.fechaRenovacion) - new Date()) / 86400000 <= 30);

const columnas = [
  { key: "codificacion", label: "Codificación", render: (i) => <span className="font-semibold">{i.codificacion || "-"}</span> },
  { key: "descripcion", label: "Descripción" },
  { key: "nombreCatalogoActivo", label: "Familia" },
  { key: "direccion", label: "Dirección" },
  { key: "nombreProveedor", label: "Proveedor" },
  { key: "numeroFacturaElectronica", label: "Factura" },
  { key: "estado", label: "Estado", render: (i) => (i.estado ? <Badge className="capitalize">{i.estado}</Badge> : "-") },
  { key: "polizas", label: "Pólizas", valor: (i) => aLista(i.polizas).length, render: (i) => (
    <span className={polizaPorVencer(i) ? "font-semibold text-red-600" : ""}>
      {aLista(i.polizas).length}{polizaPorVencer(i) ? " (por renovar)" : ""}
    </span>
  ) },
  { key: "archivos", label: "Archivos", valor: (i) => aLista(i.archivos).length },
];

const cargar = async (empresa) => aLista((await InmueblesService.obtenerTodos({ empresa })).data);

export default function InventarioInmuebles() {
  const [detalleId, setDetalleId] = useState(null);
  const [version, setVersion] = useState(0);

  return (
    <>
      <InventarioActivos
        titulo="Inventario de inmuebles"
        subtitulo="Bienes raíces y propiedades de la organización"
        categoria="Inmuebles"
        cargar={cargar}
        columnas={columnas}
        campoFamilia="nombreCatalogoActivo"
        camposIngreso={CAMPOS_INGRESO}
        importar={InmueblesService.importarExcel}
        plantilla={PLANTILLA}
        filtro={{ label: "Estado", key: "estado", opciones: ESTADOS_INMUEBLE }}
        version={version}
        accionesExtra={(i) => (
          <button onClick={() => setDetalleId(i.id)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition active:scale-[0.97] bg-blue-900 text-white shadow-sm hover:bg-blue-950">
            Pólizas / multimedia
          </button>
        )}
      />
      {detalleId && (
        <InmuebleDetalleModal
          inmuebleId={detalleId}
          onClose={() => {
            setDetalleId(null);
            setVersion((v) => v + 1);
          }}
        />
      )}
    </>
  );
}
