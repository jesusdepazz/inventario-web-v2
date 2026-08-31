import React, { useEffect, useMemo, useState } from "react";
import AsignacionesService from "../../services/AsignacionesServices";

const ListaAsignaciones = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await AsignacionesService.obtenerTodas();
      setAsignaciones(res.data || []);
    } catch (err) {
      console.error("Error al obtener asignaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const normalizar = (v) => (v ?? "").toString().toLowerCase().trim();

  const filtradas = useMemo(() => {
    const q = normalizar(search);
    if (!q) return asignaciones;

    return asignaciones.filter((a) => {
      const fecha = a.fechaAsignacion
        ? new Date(a.fechaAsignacion).toLocaleDateString()
        : "";
      const blob = [
        a.codigoEmpleado,
        a.nombreEmpleado,
        a.puesto,
        a.departamento,
        a.codificacionEquipo,
        a.ubicacion,
        fecha,
      ]
        .map(normalizar)
        .join(" ");
      return blob.includes(q);
    });
  }, [asignaciones, search]);

  const totalPages = Math.max(1, Math.ceil(filtradas.length / pageSize));
  const pageSafe = Math.min(page, totalPages);

  const paginadas = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return filtradas.slice(start, start + pageSize);
  }, [filtradas, pageSafe]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="h-[calc(100vh-52px)] flex items-start justify-center pt-10 overflow-hidden">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Historial de asignaciones</h1>
              <p className="text-sm text-slate-600">
                Visualizá las asignaciones registradas. Podés buscar por código, nombre o equipo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs text-slate-700">
                Total: <b>{asignaciones.length}</b>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs text-slate-700">
                Mostrando: <b>{filtradas.length}</b>
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-md">
              <label className="text-xs font-medium text-slate-600">Buscar</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Código, nombre, puesto, depto, equipo, ubicación..."
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <button
              type="button"
              onClick={cargar}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Recargar
            </button>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="max-h-[58vh] overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-slate-100 border-b border-slate-200">
                  <tr className="text-left text-slate-700">
                    <th className="px-4 py-3 font-semibold w-16">#</th>
                    <th className="px-4 py-3 font-semibold">Código</th>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Puesto</th>
                    <th className="px-4 py-3 font-semibold">Departamento</th>
                    <th className="px-4 py-3 font-semibold">Equipo</th>
                    <th className="px-4 py-3 font-semibold">Ubicación</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                        Cargando...
                      </td>
                    </tr>
                  ) : paginadas.length > 0 ? (
                    paginadas.map((asig, idx) => (
                      <tr key={asig.id ?? `${asig.codigoEmpleado}-${idx}`} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600">
                          {(pageSafe - 1) * pageSize + idx + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {asig.codigoEmpleado}
                        </td>
                        <td className="px-4 py-3 text-slate-800">{asig.nombreEmpleado}</td>
                        <td className="px-4 py-3 text-slate-700">{asig.puesto}</td>
                        <td className="px-4 py-3 text-slate-700">{asig.departamento}</td>
                        <td className="px-4 py-3 text-slate-700">{asig.codificacionEquipo}</td>
                        <td className="px-4 py-3 text-slate-700">{asig.ubicacion || "-"}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {asig.fechaAsignacion
                            ? new Date(asig.fechaAsignacion).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                        No hay asignaciones registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              Página <b>{pageSafe}</b> de <b>{totalPages}</b> ·{" "}
              Mostrando <b>{paginadas.length}</b> de <b>{filtradas.length}</b>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={pageSafe === 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                «
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe === 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageSafe === totalPages}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Siguiente
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={pageSafe === totalPages}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaAsignaciones;