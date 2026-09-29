import React, { useState } from "react";
import MobiliarioEquipoService from "../../services/MobiliarioEquipoServices";
import { aLista } from "../../services/payload";
import InventarioActivos from "../activos/InventarioActivos";
import { fecha } from "../modalEstilos";
import ReportesDaniosModal from "./ReportesDaniosModal";
import { SEGMENTOS, CAMPOS_INGRESO, PLANTILLA } from "./config";

const columnas = [
  { key: "codificacion", label: "Codificación", render: (f) => <span className="font-semibold">{f.codificacion || "-"}</span> },
  { key: "segmento", label: "Segmento" },
  { key: "tipoEquipo", label: "Familia" },
  { key: "marca", label: "Marca" },
  { key: "modelo", label: "Modelo" },
  { key: "serie", label: "Serie" },
  { key: "numeroChapaActivo", label: "No. chapa" },
  { key: "color", label: "Color" },
  { key: "dimensiones", label: "Dimensiones" },
  { key: "estadoFisicoActual", label: "Estado físico" },
  { key: "estado", label: "Estado" },
  { key: "ubicacion", label: "Ubicación" },
  { key: "fechaIngreso", label: "Fecha ingreso", valor: (f) => fecha(f.fechaIngreso) },
  { key: "reportes", label: "Incidencias", valor: (f) => aLista(f.reportesDanios).filter((r) => r.estadoReporte !== "Resuelto").length },
];

const cargar = async (empresa) => aLista((await MobiliarioEquipoService.obtenerTodos({ empresa })).data);

export default function InventarioMobiliarioEquipo() {
  const [seleccionado, setSeleccionado] = useState(null);
  const [version, setVersion] = useState(0);

  return (
    <>
      <InventarioActivos
        titulo="Inventario de mobiliario y equipo"
        subtitulo="Mobiliario administrativo y equipos por familia y ubicación"
        categoria="Mobiliario y equipo"
        cargar={cargar}
        columnas={columnas}
        camposIngreso={CAMPOS_INGRESO}
        importar={MobiliarioEquipoService.importarExcel}
        plantilla={PLANTILLA}
        filtro={{ label: "Segmento", key: "segmento", opciones: SEGMENTOS }}
        version={version}
        accionesExtra={(fila) => (
          <button onClick={() => setSeleccionado(fila)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition active:scale-[0.97] bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20 hover:bg-amber-100">
            Daños ({aLista(fila.reportesDanios).length})
          </button>
        )}
      />
      {seleccionado && (
        <ReportesDaniosModal item={seleccionado} onClose={() => setSeleccionado(null)} onGuardado={() => setVersion((v) => v + 1)} />
      )}
    </>
  );
}
