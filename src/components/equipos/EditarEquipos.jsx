import React, { useEffect, useState } from "react";
import { toast } from "../../utils/toast";
import EquiposServices from "../../services/EquiposServices";
import UbicacionesService from "../../services/UbicacionesServices";
import { aLista, limpiarPayload } from "../../services/payload";
import useFamilias from "../../hooks/useFamilias";
import FormularioEquipo from "./FormularioEquipo";
import { CAMPOS_EQUIPO } from "./camposEquipo";

const mensajeError = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data) return data;
  return data?.mensaje || data?.title || fallback;
};

const EditarEquipo = () => {
  const familias = useFamilias("Equipo de cómputo");
  const [codificacion, setCodificacion] = useState("");
  const [equipo, setEquipo] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loadingBuscar, setLoadingBuscar] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    UbicacionesService.obtenerTodas()
      .then((res) => setUbicaciones(aLista(res.data).map((u) => u.nombre)))
      .catch(() => toast.error("Error al cargar ubicaciones"));
  }, []);

  const buscarEquipo = async () => {
    const cod = codificacion.trim();
    if (!cod) {
      toast.warn("Ingresá la codificación");
      return;
    }
    try {
      setLoadingBuscar(true);
      const { data } = await EquiposServices.obtenerPorCodificacion(cod);
      setEquipo(data);
    } catch {
      toast.error("Equipo no encontrado");
    } finally {
      setLoadingBuscar(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEquipo((prev) => ({ ...prev, [name]: value }));
  };

  const guardarCambios = async () => {
    if (!equipo?.id) return;
    const faltante = CAMPOS_EQUIPO.find((c) => c.requerido && !String(equipo[c.name] ?? "").trim());
    if (faltante) {
      toast.warn(`El campo "${faltante.label}" es obligatorio.`);
      return;
    }
    try {
      setSaving(true);
      await EquiposServices.editar(equipo.id, limpiarPayload(equipo, { fechas: ["fechaIngreso", "fechaActualizacion"] }));
      toast.success("Equipo actualizado correctamente");
      setEquipo(null);
      setCodificacion("");
    } catch (error) {
      console.error(error);
      toast.error(mensajeError(error, "Error al actualizar el equipo"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-52px)] overflow-y-auto bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Editar equipo de cómputo</h1>
          <p className="mt-1 text-sm text-slate-500">Buscá por codificación y actualizá todos los datos del equipo.</p>
        </div>

        <div className="p-6">
          {!equipo ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <label className="text-xs font-medium text-slate-600">Codificación</label>
              <div className="mt-1 flex flex-col gap-3 sm:flex-row">
                <input
                  value={codificacion}
                  onChange={(e) => setCodificacion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && buscarEquipo()}
                  placeholder="Ej: EQ-IT-000123"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
                <button
                  onClick={buscarEquipo}
                  disabled={loadingBuscar}
                  className="rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-950 active:scale-[0.97] disabled:opacity-60"
                >
                  {loadingBuscar ? "Buscando..." : "Buscar"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-500">
                  Equipo <span className="font-semibold text-slate-900">#{equipo.id}</span>
                  {equipo.empresa && <> · {equipo.empresa}</>}
                </p>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900 ring-1 ring-inset ring-blue-700/10">{equipo.codificacion}</span>
              </div>

              <FormularioEquipo valores={equipo} onChange={handleChange} familias={familias} ubicaciones={ubicaciones} />

              <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-100 bg-white pt-4">
                <button
                  type="button"
                  onClick={() => setEquipo(null)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.97]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={guardarCambios}
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.97] disabled:opacity-60"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditarEquipo;
