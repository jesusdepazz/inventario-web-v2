import React, { useEffect, useMemo, useState } from "react";
import VehiculosService from "../../services/VehiculosServices";
import { aLista } from "../../services/payload";
import { useEmpresa } from "../../context/empresa";
import InventarioActivos from "../activos/InventarioActivos";
import VehiculoDetalleModal from "./VehiculoDetalleModal";
import { CAMPOS_INGRESO, PLANTILLA } from "./config";

const columnas = [
  { key: "codificacion", label: "Codificación", render: (v) => <span className="font-semibold">{v.codificacion || "-"}</span> },
  { key: "tipoEquipo", label: "Familia" },
  { key: "marca", label: "Marca" },
  { key: "modelo", label: "Modelo" },
  { key: "modeloAnio", label: "Año" },
  { key: "placa", label: "Placa" },
  { key: "vin", label: "VIN" },
  { key: "color", label: "Color" },
  { key: "tipoCombustible", label: "Combustible" },
  { key: "kilometrajeActual", label: "Kilometraje" },
  { key: "responsableActual", label: "Responsable" },
  { key: "ubicacion", label: "Ubicación" },
  { key: "estado", label: "Estado" },
];

const cargar = async (empresa) => aLista((await VehiculosService.obtenerTodos({ empresa })).data);

export default function InventarioVehiculos() {
  const { empresa } = useEmpresa();
  const [alertas, setAlertas] = useState([]);
  const [detalleId, setDetalleId] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    VehiculosService.obtenerAlertasPendientes({ empresa })
      .then((res) => setAlertas(aLista(res.data)))
      .catch((error) => console.error("Error al cargar alertas:", error));
  }, [empresa, version]);

  const alertasPorVehiculo = useMemo(() => {
    const conteo = {};
    alertas.forEach((a) => {
      conteo[a.vehiculoId] = (conteo[a.vehiculoId] || 0) + 1;
    });
    return conteo;
  }, [alertas]);

  const aviso = alertas.length > 0 && (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-4 text-sm text-amber-900">
      <p className="font-semibold">Alertas de servicio pendientes: {alertas.length}</p>
      <ul className="mt-2 space-y-1">
        {alertas.slice(0, 6).map((a) => (
          <li key={a.id}>
            <button onClick={() => setDetalleId(a.vehiculoId)} className="font-semibold underline">
              {a.vehiculo?.codificacion || a.vehiculo?.placa || `Vehículo ${a.vehiculoId}`}
            </button>
            {" — "}{a.tipoAlerta || "Servicio"}{a.notas ? ` · ${a.notas}` : ""}
          </li>
        ))}
        {alertas.length > 6 && <li>… y {alertas.length - 6} más</li>}
      </ul>
    </div>
  );

  return (
    <>
      <InventarioActivos
        titulo="Inventario de vehículos"
        subtitulo="Control técnico, kilometraje, mantenimientos y seguros del parque automotor"
        categoria="Vehículos"
        cargar={cargar}
        columnas={columnas}
        camposIngreso={CAMPOS_INGRESO}
        importar={VehiculosService.importarExcel}
        plantilla={PLANTILLA}
        aviso={aviso}
        version={version}
        accionesExtra={(v) => (
          <button onClick={() => setDetalleId(v.id)} className="relative inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition active:scale-[0.97] bg-blue-900 text-white shadow-sm hover:bg-blue-950">
            Control del vehículo
            {alertasPorVehiculo[v.id] > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold ring-2 ring-white">{alertasPorVehiculo[v.id]}</span>
            )}
          </button>
        )}
      />
      {detalleId && (
        <VehiculoDetalleModal
          vehiculoId={detalleId}
          onClose={() => setDetalleId(null)}
          onCambio={() => setVersion((n) => n + 1)}
        />
      )}
    </>
  );
}
