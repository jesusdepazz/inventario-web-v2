import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import EquiposService from "../../services/EquiposServices";
import UbicacionesService from "../../services/UbicacionesServices";
import AsignacionesComunalesService from "../../services/AsignacionesComunalesService";

export default function CrearAsignacionComunal() {
  const navigate = useNavigate();

  const [rol, setRol] = useState("");
  const esAdmin = rol === "Administrador";

  const [correlativo, setCorrelativo] = useState("");

  const [equiposAsignados, setEquiposAsignados] = useState([]);
  const [codificacion, setCodificacion] = useState("");
  const [loadingEquipo, setLoadingEquipo] = useState(false);

  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacion, setUbicacion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRol(localStorage.getItem("rol") || "");
  }, []);

  useEffect(() => {
    const cargarUbicaciones = async () => {
      try {
        const { data } = await UbicacionesService.obtenerTodas();
        const lista = Array.isArray(data) ? data : Array.isArray(data?.$values) ? data.$values : [];
        setUbicaciones(lista);
      } catch {
        toast.error("Error al cargar ubicaciones");
      }
    };

    cargarUbicaciones();
  }, []);

  const buscarEquipo = async () => {
    const cod = codificacion?.trim();
    if (!cod) return;

    try {
      setLoadingEquipo(true);

      const existe = equiposAsignados.some((e) => e.codificacion === cod);
      if (existe) return toast.warning("Este equipo ya fue agregado");

      const response = await EquiposService.obtenerPorCodificacion(cod);
      const data = response.data;

      setEquiposAsignados((prev) => [...prev, { codificacion: cod, ...data }]);
      setCodificacion("");
    } catch {
      toast.error("Equipo no encontrado");
    } finally {
      setLoadingEquipo(false);
    }
  };

  const quitarEquipo = (idx) => {
    setEquiposAsignados((prev) => prev.filter((_, i) => i !== idx));
  };

  const onEnterEquipo = (e) => e.key === "Enter" && buscarEquipo();

  const guardarAsignacion = async () => {
    if (!correlativo.trim()) {
      return toast.error("Debes ingresar el correlativo");
    }
    if (equiposAsignados.length === 0) {
      return toast.error("Debes agregar al menos un equipo");
    }
    if (!ubicacion) {
      return toast.error("Debes seleccionar una ubicación");
    }

    try {
      setSaving(true);

      await AsignacionesComunalesService.crear({
        codificaciones: equiposAsignados.map((eq) => eq.codificacion),
        correlativo: correlativo.trim(),
        ubicacion,
        observaciones: observaciones.trim() || null,
      });

      toast.success("Asignación comunal guardada correctamente");
      navigate("/inicio");
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data;
      toast.error(typeof msg === "string" ? msg : "Error al guardar la asignación comunal");
    } finally {
      setSaving(false);
    }
  };

  const totalActivos = useMemo(() => equiposAsignados.length, [equiposAsignados]);

  if (!esAdmin) {
    return (
      <div className="h-[calc(100vh-52px)] flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-200 p-8 text-center">
          <h1 className="text-2xl font-extrabold text-blue-900">Acceso restringido</h1>
          <p className="mt-3 text-slate-600">
            Solo un administrador puede crear asignaciones comunales.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-52px)] flex items-start justify-center pt-10 overflow-hidden">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Asignación comunal</h1>
              <p className="text-sm text-slate-600">
                Asigná uno o varios equipos a una ubicación, sin un empleado responsable.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs text-slate-700">
              Activos: <b>{totalActivos}</b>
            </span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Datos generales</h2>
            </div>
            <div className="p-4">
              <label className="text-xs font-medium text-slate-600">Correlativo</label>
              <input
                type="text"
                value={correlativo}
                onChange={(e) => setCorrelativo(e.target.value)}
                className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                placeholder="Ej: AC-00001"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Activos</h2>
              <p className="text-xs text-slate-600">Agregá por codificación.</p>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-8">
                  <label className="text-xs font-medium text-slate-600">Codificación</label>
                  <input
                    type="text"
                    value={codificacion}
                    onChange={(e) => setCodificacion(e.target.value)}
                    onKeyDown={onEnterEquipo}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    placeholder="Ej: EQ-IT-000123"
                  />
                </div>
                <div className="col-span-4 flex items-end">
                  <button
                    type="button"
                    onClick={buscarEquipo}
                    disabled={loadingEquipo}
                    className="w-full rounded-lg bg-blue-900 text-white px-3 py-2 text-sm font-semibold hover:bg-blue-950 disabled:opacity-60"
                  >
                    {loadingEquipo ? "..." : "Agregar"}
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Tip: podés pegar codificaciones una por una y Enter para agregar rápido.
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Equipos agregados</h3>
                <p className="text-xs text-slate-600">Selección actual</p>
              </div>
              <button
                type="button"
                onClick={() => setEquiposAsignados([])}
                disabled={equiposAsignados.length === 0}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40"
              >
                Limpiar
              </button>
            </div>

            <div className="max-h-52 overflow-auto">
              <table className="min-w-full text-xs">
                <thead className="sticky top-0 bg-slate-100 border-b border-slate-200">
                  <tr className="text-left text-slate-700">
                    <th className="px-3 py-2 font-semibold">Codificación</th>
                    <th className="px-3 py-2 font-semibold">Modelo</th>
                    <th className="px-3 py-2 font-semibold">Ubicación actual</th>
                    <th className="px-3 py-2 font-semibold w-16">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {equiposAsignados.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-slate-500 text-center">
                        Vacío
                      </td>
                    </tr>
                  ) : (
                    equiposAsignados.map((eq, idx) => (
                      <tr key={`${eq.codificacion}-${idx}`} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-semibold text-slate-900">{eq.codificacion}</td>
                        <td className="px-3 py-2 text-slate-700">{eq.modelo || "-"}</td>
                        <td className="px-3 py-2 text-slate-700">{eq.ubicacion || "-"}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => quitarEquipo(idx)}
                            className="text-red-600 font-semibold hover:underline"
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Ubicación
                </label>
                <select
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                >
                  <option value="">Seleccione una ubicación</option>
                  {ubicaciones.map((u) => (
                    <option key={u.id ?? u.nombre} value={u.nombre}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Observaciones (opcional)
                </label>
                <input
                  type="text"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Notas adicionales..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="text-sm text-slate-700">
                Se asignarán <b>{totalActivos}</b> activos a esta ubicación.
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/inicio")}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={guardarAsignacion}
                  disabled={saving || totalActivos === 0}
                  className="rounded-lg bg-blue-900 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-950 disabled:opacity-60"
                >
                  {saving ? "Guardando..." : "Asignar ubicación"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
