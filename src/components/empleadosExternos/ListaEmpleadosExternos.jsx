import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import EmpleadosExternosService from "../../services/EmpleadosExternosServices";

export default function ListaEmpleadosExternos() {
  const [externos, setExternos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [rol, setRol] = useState(null);
  const [filtros, setFiltros] = useState({
    codigo: "",
    nombre: "",
    documento: "",
    proyecto: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    setRol(localStorage.getItem("rol"));
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const res = await EmpleadosExternosService.listar();
      setExternos(res.data);
    } catch {
      toast.error("Error al cargar empleados externos");
    }
  };

  const desactivar = async (id, nombre) => {
    if (!confirm(`¿Desactivar a "${nombre}"?`)) return;
    try {
      await EmpleadosExternosService.desactivar(id);
      toast.success("Empleado externo desactivado");
      cargar();
    } catch {
      toast.error("Error al desactivar");
    }
  };

  const normalize = (v) =>
    (v ?? "")
      .toString()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();

  const hoyTexto = useMemo(() =>
    new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }), []);

  const filtrados = useMemo(() => {
    const q = normalize(busqueda);
    return externos.filter((e) => {
      const blob = normalize(
        `${e.codigoEmpleado} ${e.nombre} ${e.puesto} ${e.documento} ${e.telefono ?? ""} ${e.proyecto ?? ""}`
      );
      if (q && !blob.includes(q)) return false;
      if (filtros.codigo && !normalize(e.codigoEmpleado).includes(normalize(filtros.codigo))) return false;
      if (filtros.nombre && !normalize(e.nombre).includes(normalize(filtros.nombre))) return false;
      if (filtros.documento && !normalize(e.documento).includes(normalize(filtros.documento))) return false;
      if (filtros.proyecto && !normalize(e.proyecto ?? "").includes(normalize(filtros.proyecto))) return false;
      return true;
    });
  }, [externos, busqueda, filtros]);

  const limpiar = () => {
    setBusqueda("");
    setFiltros({ codigo: "", nombre: "", documento: "", proyecto: "" });
  };

  const esAdmin = rol === "Administrador";

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden h-full flex flex-col">

        {/* Encabezado */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Empleados Externos</h2>
              <p className="text-sm text-slate-500">Listado de personas externas registradas.</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-slate-50 text-slate-700">
                Total: {filtrados.length}
              </span>

              <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-slate-50 text-slate-700">
                {hoyTexto}
              </span>

              <button
                onClick={() => setMostrarFiltros((p) => !p)}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                {mostrarFiltros ? "Ocultar filtros" : "Filtros"}
              </button>

              <button
                onClick={limpiar}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Limpiar
              </button>

              {esAdmin && (
                <button
                  onClick={() => navigate("/externos/crear")}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                  + Registrar externo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Búsqueda y filtros */}
        <div className="p-6 border-b border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-12">
              <label className="block text-xs font-semibold text-slate-600 mb-2">Buscar</label>
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por código, nombre, puesto, documento, proyecto..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {mostrarFiltros && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <input
                value={filtros.codigo}
                onChange={(e) => setFiltros((p) => ({ ...p, codigo: e.target.value }))}
                placeholder="Código"
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              <input
                value={filtros.nombre}
                onChange={(e) => setFiltros((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Nombre"
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              <input
                value={filtros.documento}
                onChange={(e) => setFiltros((p) => ({ ...p, documento: e.target.value }))}
                placeholder="Documento"
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              <input
                value={filtros.proyecto}
                onChange={(e) => setFiltros((p) => ({ ...p, proyecto: e.target.value }))}
                placeholder="Proyecto"
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="flex-1 min-h-0 p-6">
          <div className="h-full overflow-auto rounded-2xl border border-slate-200">
            <table className="min-w-[1100px] w-full text-sm border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-blue-900 text-white">
                <tr className="text-left">
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Código</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Nombre</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Puesto</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Documento</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Teléfono</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Proyecto</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Fecha registro</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Estado</th>
                  {esAdmin && (
                    <th className="px-4 py-3 font-bold whitespace-nowrap text-center">Acciones</th>
                  )}
                </tr>
              </thead>

              <tbody className="bg-white">
                {filtrados.length > 0 ? (
                  filtrados.map((e, idx) => (
                    <tr key={e.id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-4 py-4 border-t border-slate-200 align-top font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {e.codigoEmpleado}
                      </td>
                      <td className="px-4 py-4 border-t border-slate-200 align-top min-w-[200px] text-slate-700">
                        {e.nombre}
                      </td>
                      <td className="px-4 py-4 border-t border-slate-200 align-top min-w-[180px] text-slate-700">
                        {e.puesto}
                      </td>
                      <td className="px-4 py-4 border-t border-slate-200 align-top whitespace-nowrap text-slate-700">
                        {e.documento}
                      </td>
                      <td className="px-4 py-4 border-t border-slate-200 align-top whitespace-nowrap text-slate-700">
                        {e.telefono || "—"}
                      </td>
                      <td className="px-4 py-4 border-t border-slate-200 align-top min-w-[180px] text-slate-700">
                        {e.proyecto || "—"}
                      </td>
                      <td className="px-4 py-4 border-t border-slate-200 align-top whitespace-nowrap text-slate-700">
                        {new Date(e.fechaRegistro).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-4 border-t border-slate-200 align-top whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            e.activo
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {e.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      {esAdmin && (
                        <td className="px-4 py-4 border-t border-slate-200 align-top text-center whitespace-nowrap">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => navigate(`/externos/editar/${e.id}`)}
                              className="rounded-xl bg-amber-500 text-white px-4 py-2 text-xs font-semibold hover:bg-amber-600 transition"
                            >
                              Editar
                            </button>
                            {e.activo && (
                              <button
                                onClick={() => desactivar(e.id, e.nombre)}
                                className="rounded-xl bg-red-500 text-white px-4 py-2 text-xs font-semibold hover:bg-red-600 transition"
                              >
                                Desactivar
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={esAdmin ? 9 : 8}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No se encontraron empleados externos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white">
          <div className="text-xs text-slate-600">
            Tip: usá la búsqueda rápida o los filtros para encontrar externos más rápido.
          </div>
        </div>
      </div>
    </div>
  );
}
