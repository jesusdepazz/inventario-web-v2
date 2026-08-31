import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmpleadosService from "../../services/EmpleadosServices";
import EquiposService from "../../services/EquiposServices";
import AsignacionesService from "../../services/AsignacionesServices";
import EmpleadosExternosService from "../../services/EmpleadosExternosServices";
import UbicacionesService from "../../services/UbicacionesServices";

export default function CrearAsignacion() {
  const navigate = useNavigate();

  const [equiposAsignados, setEquiposAsignados] = useState([]);
  const [empleadosAsignados, setEmpleadosAsignados] = useState([]);

  const [empleadoActual, setEmpleadoActual] = useState({
    codigo: "",
    nombre: "",
    puesto: "",
    departamento: "",
  });

  const [codificacion, setCodificacion] = useState("");
  const [modoExterno, setModoExterno] = useState(false);
  const [loadingEmpleado, setLoadingEmpleado] = useState(false);
  const [loadingEquipo, setLoadingEquipo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionMasiva, setUbicacionMasiva] = useState("");

  useEffect(() => {
    const cargarUbicaciones = async () => {
      try {
        const { data } = await UbicacionesService.obtenerTodas();
        const lista = Array.isArray(data) ? data : Array.isArray(data?.$values) ? data.$values : [];
        setUbicaciones(lista);
      } catch {
        // Silencioso: el selector de ubicación queda vacío si falla la carga.
      }
    };

    cargarUbicaciones();
  }, []);

  const totalAsignaciones = useMemo(
    () => empleadosAsignados.length * equiposAsignados.length,
    [empleadosAsignados.length, equiposAsignados.length]
  );

  const buscarEmpleado = async () => {
    const codigo = empleadoActual.codigo?.trim();
    if (!codigo) return alert("Por favor ingresa un código de empleado");

    try {
      setLoadingEmpleado(true);

      if (modoExterno) {
        const response = await EmpleadosExternosService.obtenerPorCodigo(codigo);
        const data = response.data;
        setEmpleadoActual({
          codigo: data.codigoEmpleado,
          nombre: data.nombre,
          puesto: data.puesto,
          departamento: "Externo",
        });
      } else {
        const response = await EmpleadosService.obtenerPorCodigo(codigo);
        const data = response.data;
        setEmpleadoActual({
          codigo,
          nombre: data.nombre,
          puesto: data.puesto,
          departamento: data.departamento,
        });
      }
    } catch (error) {
      const msg = error?.response?.data?.mensaje
        ?? error?.response?.data
        ?? (modoExterno ? "Empleado externo no encontrado" : "Empleado no encontrado");
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoadingEmpleado(false);
    }
  };

  const agregarEmpleado = () => {
    if (!empleadoActual.codigo?.trim()) return;

    const existe = empleadosAsignados.some((e) => e.codigo === empleadoActual.codigo);
    if (existe) return alert("Este empleado ya fue agregado");
    if (!empleadoActual.nombre) return alert("Primero busca el empleado para cargar sus datos.");

    setEmpleadosAsignados((prev) => [...prev, empleadoActual]);

    setEmpleadoActual({
      codigo: "",
      nombre: "",
      puesto: "",
      departamento: "",
    });
  };

  const buscarEquipo = async () => {
    const cod = codificacion?.trim();
    if (!cod) return;

    try {
      setLoadingEquipo(true);

      const existe = equiposAsignados.some((e) => e.codificacion === cod);
      if (existe) return alert("Este equipo ya fue agregado");

      const response = await EquiposService.obtenerPorCodificacion(cod);
      const data = response.data;

      setEquiposAsignados((prev) => [
        ...prev,
        { codificacion: cod, ...data, ubicacion: data?.ubicacion || "" },
      ]);
      setCodificacion("");
    } catch (error) {
      alert("Equipo no encontrado");
    } finally {
      setLoadingEquipo(false);
    }
  };

  const guardarAsignacion = async () => {
    if (empleadosAsignados.length === 0 || equiposAsignados.length === 0) {
      return alert("Debes agregar empleados y equipos");
    }

    try {
      setSaving(true);

      const promesas = [];
      empleadosAsignados.forEach((emp) => {
        equiposAsignados.forEach((eq) => {
          promesas.push(
            AsignacionesService.crear({
              codigoEmpleado: emp.codigo,
              nombreEmpleado: emp.nombre,
              puesto: emp.puesto,
              departamento: emp.departamento,
              codificacionEquipo: eq.codificacion,
              ubicacion: eq.ubicacion || null,
            })
          );
        });
      });

      await Promise.all(promesas);

      alert("Asignaciones guardadas correctamente");
      navigate("/inicio");
    } catch (error) {
      alert("Error al guardar asignaciones");
    } finally {
      setSaving(false);
    }
  };

  const aplicarUbicacionATodos = () => {
    setEquiposAsignados((prev) => prev.map((eq) => ({ ...eq, ubicacion: ubicacionMasiva })));
  };

  const onEnterEmpleado = (e) => e.key === "Enter" && buscarEmpleado();
  const onEnterEquipo = (e) => e.key === "Enter" && buscarEquipo();

  return (
    <div className="h-[calc(100vh-52px)] flex items-start justify-center pt-10 overflow-hidden">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Crear asignaciones</h1>
              <p className="text-sm text-slate-600">
                Agregá empleados y equipos. Se creará la combinación automáticamente.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs text-slate-700">
                Empleados: <b>{empleadosAsignados.length}</b>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs text-slate-700">
                Equipos: <b>{equiposAsignados.length}</b>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs text-slate-700">
                Total: <b>{totalAsignaciones}</b>
              </span>
            </div>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Empleados</h2>
                    <p className="text-xs text-slate-600">Buscá por código y agregá.</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-xs font-medium text-slate-600">Externo</span>
                    <div
                      onClick={() => {
                        setModoExterno((v) => !v);
                        setEmpleadoActual({ codigo: "", nombre: "", puesto: "", departamento: "" });
                      }}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${modoExterno ? "bg-amber-500" : "bg-slate-300"}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${modoExterno ? "translate-x-5" : ""}`} />
                    </div>
                  </label>
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-7">
                      <label className="text-xs font-medium text-slate-600">
                        {modoExterno ? "Código externo" : "Código"}
                      </label>
                      <input
                        type="text"
                        value={empleadoActual.codigo}
                        onChange={(e) =>
                          setEmpleadoActual({ ...empleadoActual, codigo: e.target.value })
                        }
                        onKeyDown={onEnterEmpleado}
                        className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 ${modoExterno ? "border-amber-300 focus:ring-amber-500" : "border-slate-300 focus:ring-blue-800"}`}
                        placeholder={modoExterno ? "Ej: EXT-001" : "Ej: T03108"}
                      />
                    </div>

                    <div className="col-span-5 flex items-end gap-2">
                      <button
                        type="button"
                        onClick={buscarEmpleado}
                        disabled={loadingEmpleado}
                        className="w-full rounded-lg bg-blue-900 text-white px-3 py-2 text-sm font-semibold hover:bg-blue-950 disabled:opacity-60"
                      >
                        {loadingEmpleado ? "..." : "Buscar"}
                      </button>
                      <button
                        type="button"
                        onClick={agregarEmpleado}
                        className="w-full rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm font-semibold hover:bg-emerald-700"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>

                  {empleadoActual.nombre && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {empleadoActual.nombre}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {empleadoActual.puesto} · {empleadoActual.departamento}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-900">Equipos</h2>
                  <p className="text-xs text-slate-600">Agregá por codificación.</p>
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-7">
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
                    <div className="col-span-5 flex items-end">
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
            </div>
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Empleados agregados</h3>
                    <p className="text-xs text-slate-600">Selección actual</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmpleadosAsignados([])}
                    disabled={empleadosAsignados.length === 0}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40"
                  >
                    Limpiar
                  </button>
                </div>

                <div className="max-h-44 overflow-auto">
                  <table className="min-w-full text-xs">
                    <thead className="sticky top-0 bg-slate-100 border-b border-slate-200">
                      <tr className="text-left text-slate-700">
                        <th className="px-3 py-2 font-semibold">Código</th>
                        <th className="px-3 py-2 font-semibold">Nombre</th>
                        <th className="px-3 py-2 font-semibold w-16">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {empleadosAsignados.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-3 py-6 text-slate-500 text-center">
                            Vacío
                          </td>
                        </tr>
                      ) : (
                        empleadosAsignados.map((emp, idx) => (
                          <tr key={`${emp.codigo}-${idx}`} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-semibold text-slate-900">{emp.codigo}</td>
                            <td className="px-3 py-2 text-slate-700">{emp.nombre}</td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => setEmpleadosAsignados((p) => p.filter((_, i) => i !== idx))}
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

                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-slate-600">
                      Ubicación para todos los equipos
                    </label>
                    <select
                      value={ubicacionMasiva}
                      onChange={(e) => setUbicacionMasiva(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-800"
                    >
                      <option value="">Sin ubicación</option>
                      {ubicaciones.map((u) => (
                        <option key={u.id ?? u.nombre} value={u.nombre}>
                          {u.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={aplicarUbicacionATodos}
                    disabled={equiposAsignados.length === 0}
                    className="rounded-lg bg-blue-900 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-950 disabled:opacity-40"
                  >
                    Aplicar a todos
                  </button>
                </div>

                <div className="max-h-44 overflow-auto">
                  <table className="min-w-full text-xs">
                    <thead className="sticky top-0 bg-slate-100 border-b border-slate-200">
                      <tr className="text-left text-slate-700">
                        <th className="px-3 py-2 font-semibold">Codificación</th>
                        <th className="px-3 py-2 font-semibold">Modelo</th>
                        <th className="px-3 py-2 font-semibold">Ubicación</th>
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
                                onClick={() => setEquiposAsignados((p) => p.filter((_, i) => i !== idx))}
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
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-slate-700">
                    Se crearán <b>{totalAsignaciones}</b> asignaciones.
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
                      disabled={saving || totalAsignaciones === 0}
                      className="rounded-lg bg-blue-900 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-950 disabled:opacity-60"
                    >
                      {saving ? "Guardando..." : "Crear"}
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  ({empleadosAsignados.length} empleados × {equiposAsignados.length} equipos)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}