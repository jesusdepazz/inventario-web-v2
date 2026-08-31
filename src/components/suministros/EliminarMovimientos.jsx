import { useEffect, useMemo, useState } from "react";
import EntradaSuministroService from "../../services/EntradasSuministrosServices";
import SalidaSuministroService from "../../services/SalidasSuministrosServices";
import SuministrosService from "../../services/SuministrosService";
import { FaTrash, FaArrowDown, FaArrowUp, FaBroom } from "react-icons/fa6";

export default function EliminarSuministros() {
  const [entradas, setEntradas] = useState([]);
  const [salidas, setSalidas] = useState([]);
  const [suministros, setSuministros] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [vista, setVista] = useState("todos");

  const fechaHoy = useMemo(() => {
    return new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const cargarSuministros = async () => {
    const res = await SuministrosService.obtenerTodos();
    setSuministros(res.data || []);
  };

  const cargarDatos = async (sums) => {
    const [resEntradas, resSalidas] = await Promise.all([
      EntradaSuministroService.obtenerTodas(),
      SalidaSuministroService.obtenerTodos(),
    ]);

    const mapNombre = (suministroId) => {
      const s = sums.find((x) => x.id === suministroId);
      return s ? s.nombreProducto : "Desconocido";
    };

    const entradasMap = (resEntradas.data || []).map((e) => ({
      ...e,
      nombreProducto: mapNombre(e.suministroId),
      fechaNorm: e.fecha || e.Fecha || e.fechaMovimiento || e.fechaRegistro,
    }));

    const salidasMap = (resSalidas.data || []).map((s) => ({
      ...s,
      nombreProducto: mapNombre(s.suministroId),
      fechaNorm: s.fecha || s.Fecha || s.fechaMovimiento || s.fechaRegistro,
    }));

    setEntradas(entradasMap);
    setSalidas(salidasMap);
  };

  const refrescarTodo = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await SuministrosService.obtenerTodos();
      const sums = res.data || [];
      setSuministros(sums);
      await cargarDatos(sums);
    } catch (e) {
      console.error(e);
      setError("Error cargando datos de suministros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refrescarTodo();
  }, []);

  const inRange = (fechaStr) => {
    if (!fechaStr) return false;
    const d = new Date(fechaStr);
    if (Number.isNaN(d.getTime())) return false;

    const fromOk = !desde || d >= new Date(desde + "T00:00:00");
    const toOk = !hasta || d <= new Date(hasta + "T23:59:59");
    return fromOk && toOk;
  };

  const term = q.trim().toLowerCase();

  const entradasFiltradas = useMemo(() => {
    return entradas.filter((e) => {
      const fechaOk = (!desde && !hasta) || inRange(e.fechaNorm);
      if (!fechaOk) return false;
      if (!term) return true;

      const blob = [
        e.id,
        e.nombreProducto,
        e.cantidadProducto,
        e.fechaNorm ? new Date(e.fechaNorm).toLocaleString() : "",
      ]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" | ");

      return blob.includes(term);
    });
  }, [entradas, term, desde, hasta]);

  const salidasFiltradas = useMemo(() => {
    return salidas.filter((s) => {
      const fechaOk = (!desde && !hasta) || inRange(s.fechaNorm);
      if (!fechaOk) return false;
      if (!term) return true;

      const blob = [
        s.id,
        s.nombreProducto,
        s.cantidadProducto,
        s.fechaNorm ? new Date(s.fechaNorm).toLocaleString() : "",
      ]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" | ");

      return blob.includes(term);
    });
  }, [salidas, term, desde, hasta]);

  const limpiarFiltros = () => {
    setQ("");
    setDesde("");
    setHasta("");
  };

  const eliminarEntrada = async (id) => {
    const ok = window.confirm("¿Eliminar esta entrada?");
    if (!ok) return;

    try {
      await EntradaSuministroService.eliminar(id);
      await refrescarTodo();
    } catch (error) {
      console.error(error);
      alert("Error eliminando la entrada.");
    }
  };

  const eliminarSalida = async (id) => {
    const ok = window.confirm("¿Eliminar esta salida?");
    if (!ok) return;

    try {
      await SalidaSuministroService.eliminar(id);
      await refrescarTodo();
    } catch (error) {
      console.error(error);
      alert("Error eliminando la salida.");
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6 text-gray-600">
            Cargando movimientos...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 text-red-700 font-semibold rounded-2xl p-6">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="max-w-7xl w-full mx-auto px-4 py-6 flex-1 min-h-0 flex flex-col">
        <div className="bg-white border border-gray-200 shadow-md rounded-2xl flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-200 shrink-0">
            <div className="text-center">
              <p className="font-bold text-lg">Guatemalan Candies, S.A.</p>
              <p className="font-bold text-lg text-blue-600">
                Administración de movimientos de suministros
              </p>
              <p className="font-semibold text-gray-600">{fechaHoy}</p>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
              <div className="lg:col-span-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buscar
                </label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="ID, producto, cantidad, fecha..."
                  className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Desde
                </label>
                <input
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hasta
                </label>
                <input
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="lg:col-span-2 flex gap-2">
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 p-3 font-semibold text-gray-800 transition"
                >
                  <FaBroom />
                  Limpiar
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="inline-flex rounded-xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setVista("todos")}
                  className={`px-4 py-2 font-semibold transition ${
                    vista === "todos"
                      ? "bg-blue-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setVista("entrada")}
                  className={`px-4 py-2 font-semibold transition flex items-center gap-2 border-l border-gray-200 ${
                    vista === "entrada"
                      ? "bg-blue-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FaArrowDown />
                  Entradas
                </button>
                <button
                  type="button"
                  onClick={() => setVista("salida")}
                  className={`px-4 py-2 font-semibold transition flex items-center gap-2 border-l border-gray-200 ${
                    vista === "salida"
                      ? "bg-blue-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FaArrowUp />
                  Salidas
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">
                  Entradas: <b>{entradasFiltradas.length}</b> · Salidas:{" "}
                  <b>{salidasFiltradas.length}</b>
                </div>

                <button
                  type="button"
                  onClick={refrescarTodo}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 font-semibold transition"
                >
                  Refrescar
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 p-6 flex flex-col gap-6 overflow-hidden">
            {vista !== "salida" && (
            <div className="flex-1 min-h-0 flex flex-col bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <FaArrowDown className="text-green-700" />
                  <p className="font-bold text-gray-800">Entradas de suministros</p>
                </div>
                <span className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-2 py-1 rounded-full">
                  {entradasFiltradas.length}
                </span>
              </div>

              <div className="flex-1 min-h-0 overflow-auto">
                <table className="min-w-[900px] w-full text-sm">
                  <thead className="bg-blue-800 text-white sticky top-0 z-10">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Fecha</th>
                      <th className="p-3 text-left">Suministro</th>
                      <th className="p-3 text-left">Cantidad</th>
                      <th className="p-3 text-left">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white">
                    {entradasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500">
                          No hay entradas para mostrar.
                        </td>
                      </tr>
                    ) : (
                      entradasFiltradas.map((e, idx) => (
                        <tr
                          key={e.id}
                          className={`border-t border-gray-100 hover:bg-blue-50 transition ${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                          }`}
                        >
                          <td className="p-3 font-medium text-gray-800">{e.id}</td>
                          <td className="p-3 text-gray-700">
                            {e.fechaNorm ? new Date(e.fechaNorm).toLocaleString() : "-"}
                          </td>
                          <td className="p-3 text-gray-800">{e.nombreProducto}</td>
                          <td className="p-3 font-bold text-green-700">
                            {e.cantidadProducto}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => eliminarEntrada(e.id)}
                              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition"
                            >
                              <FaTrash />
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {vista !== "entrada" && (
            <div className="flex-1 min-h-0 flex flex-col bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <FaArrowUp className="text-blue-700" />
                  <p className="font-bold text-gray-800">Salidas de suministros</p>
                </div>
                <span className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-2 py-1 rounded-full">
                  {salidasFiltradas.length}
                </span>
              </div>

              <div className="flex-1 min-h-0 overflow-auto">
                <table className="min-w-[900px] w-full text-sm">
                  <thead className="bg-blue-800 text-white sticky top-0 z-10">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Fecha</th>
                      <th className="p-3 text-left">Suministro</th>
                      <th className="p-3 text-left">Cantidad</th>
                      <th className="p-3 text-left">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white">
                    {salidasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500">
                          No hay salidas para mostrar.
                        </td>
                      </tr>
                    ) : (
                      salidasFiltradas.map((s, idx) => (
                        <tr
                          key={s.id}
                          className={`border-t border-gray-100 hover:bg-blue-50 transition ${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                          }`}
                        >
                          <td className="p-3 font-medium text-gray-800">{s.id}</td>
                          <td className="p-3 text-gray-700">
                            {s.fechaNorm ? new Date(s.fechaNorm).toLocaleString() : "-"}
                          </td>
                          <td className="p-3 text-gray-800">{s.nombreProducto}</td>
                          <td className="p-3 font-bold text-blue-700">
                            {s.cantidadProducto}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => eliminarSalida(s.id)}
                              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition"
                            >
                              <FaTrash />
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}