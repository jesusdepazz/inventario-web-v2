import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import EquiposServices from "../../services/EquiposServices";
import UbicacionesService from "../../services/UbicacionesServices";

const EditarEquipo = () => {
  const [codificacion, setCodificacion] = useState("");
  const [equipo, setEquipo] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loadingBuscar, setLoadingBuscar] = useState(false);
  const [saving, setSaving] = useState(false);

  const buscarEquipo = async () => {
    const cod = codificacion?.trim();
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

  const onEnterBuscar = (e) => {
    if (e.key === "Enter") buscarEquipo();
  };

  useEffect(() => {
    if (!equipo) return;

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
  }, [equipo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEquipo((prev) => ({ ...prev, [name]: value }));
  };

  const guardarCambios = async () => {
    if (!equipo?.id) return;

    try {
      setSaving(true);

      console.log("OBJETO A ENVIAR:", equipo);

      await EquiposServices.editar(equipo.id, equipo);
      toast.success("✅ Equipo actualizado correctamente");
      setEquipo(null);
      setCodificacion("");
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar equipo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-52px)] flex items-start justify-center pt-10 overflow-hidden">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-900">Editar equipo</h1>
          <p className="text-sm text-slate-600">
            Buscá por codificación y actualizá los datos del equipo.
          </p>
        </div>
        <div className="px-6 py-5 overflow-auto max-h-[calc(100vh-200px)]">
          {!equipo && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-sm font-bold text-slate-900 tracking-wide">
                BUSCAR POR CODIFICACIÓN
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Ej: <span className="font-semibold">EQ-IT-000123</span>
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="text-xs font-semibold text-slate-600">
                    Codificación
                  </label>
                  <input
                    type="text"
                    placeholder="Escribí la codificación"
                    value={codificacion}
                    onChange={(e) => setCodificacion(e.target.value)}
                    onKeyDown={onEnterBuscar}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>

                <div className="sm:col-span-4 flex items-end">
                  <button
                    onClick={buscarEquipo}
                    disabled={loadingBuscar}
                    className="w-full rounded-xl bg-blue-900 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-950 disabled:opacity-60"
                  >
                    {loadingBuscar ? "Buscando..." : "Buscar"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {equipo && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Equipo encontrado
                  </h2>
                  <p className="text-sm text-slate-600">
                    ID <span className="font-semibold">#{equipo.id}</span>
                  </p>
                </div>

                <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-950 border border-blue-100 px-3 py-1 text-xs font-semibold">
                  {equipo.codificacion}
                </span>
              </div>

              <section className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                    DATOS PRINCIPALES
                  </h3>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">

                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-600">
                      Codificación
                    </label>
                    <input
                      value={equipo.codificacion || ""}
                      readOnly
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-600">
                      Orden de Compra
                    </label>
                    <input
                      name="ordenCompra"
                      value={equipo.ordenCompra || ""}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-600">
                      Factura
                    </label>
                    <input
                      name="factura"
                      value={equipo.factura || ""}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-600">
                      Marca
                    </label>
                    <input
                      name="marca"
                      value={equipo.marca || ""}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-600">
                      Modelo
                    </label>
                    <input
                      name="modelo"
                      value={equipo.modelo || ""}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-600">
                      Serie
                    </label>
                    <input
                      name="serie"
                      value={equipo.serie || ""}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-600">
                      Ubicación
                    </label>
                    <select
                      name="ubicacion"
                      value={equipo.ubicacion || ""}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    >
                      <option value="">Seleccione ubicación</option>
                      {ubicaciones.map((u) => (
                        <option key={u.id ?? u.nombre} value={u.nombre}>
                          {u.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-600">
                      Estado
                    </label>
                    <select
                      name="estado"
                      value={equipo.estado || ""}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    >
                      <option value="">-- Seleccione estado --</option>
                      <option value="Buen estado">Buen estado</option>
                      <option value="Inactivo">Reparación</option>
                      <option value="Obsoleto">Obsoleto</option>
                    </select>
                  </div>
                </div>
              </section>
              <div className="sticky bottom-0 bg-white border-t border-slate-100 pt-4">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEquipo(null)}
                    className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={guardarCambios}
                    disabled={saving}
                    className="rounded-xl bg-emerald-600 text-white px-6 py-3 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditarEquipo;