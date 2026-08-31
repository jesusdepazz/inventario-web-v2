import { useEffect, useMemo, useState } from "react";
import SuministrosService from "../../services/SuministrosService";
import EntradaSuministroService from "../../services/EntradasSuministrosServices";
import SalidaSuministroService from "../../services/SalidasSuministrosServices";
import { FaFileExcel, FaArrowDown, FaArrowUp, FaBoxesStacked } from "react-icons/fa6";

export default function SuministrosInventario() {
  const [suministros, setSuministros] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [tab, setTab] = useState("inventario");
  const tipoMovimientos = tab === "salida" ? "salida" : "entrada";

  const [loadingSuministros, setLoadingSuministros] = useState(true);
  const [loadingMovimientos, setLoadingMovimientos] = useState(true);
  const [errorSuministros, setErrorSuministros] = useState("");
  const [errorMovimientos, setErrorMovimientos] = useState("");

  const [q, setQ] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const fechaHoy = useMemo(() => {
    return new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  useEffect(() => {
    const cargarSuministros = async () => {
      try {
        const response = await SuministrosService.obtenerConTotales();
        setSuministros(response.data || []);
      } catch (err) {
        console.error(err);
        setErrorSuministros("Error al cargar los suministros.");
      } finally {
        setLoadingSuministros(false);
      }
    };
    cargarSuministros();
  }, []);

  useEffect(() => {
    if (tab === "inventario") {
      setLoadingMovimientos(false);
      setErrorMovimientos("");
      return;
    }

    const cargarMovimientos = async () => {
      setLoadingMovimientos(true);
      setErrorMovimientos("");

      try {
        let response;
        if (tab === "entrada") {
          response = await EntradaSuministroService.obtenerTodas();
        } else {
          response = await SalidaSuministroService.obtenerTodos();
        }

        const raw = response?.data || [];
        const data = raw.map((m) => {
          const productoMatch = suministros.find((s) => s.id === m.suministroId);
          const fecha = m.fecha || m.Fecha || m.fechaMovimiento || m.fechaRegistro;

          return {
            ...m,
            nombreProducto: productoMatch?.nombreProducto || "Desconocido",
            fecha,
            personaResponsable: m.personaResponsable || "",
            departamentoResponsable: m.departamentoResponsable || "",
          };
        });

        setMovimientos(data);
      } catch (err) {
        console.error(err);
        setErrorMovimientos("Error al cargar los movimientos.");
      } finally {
        setLoadingMovimientos(false);
      }
    };

    if (!loadingSuministros) cargarMovimientos();
  }, [tab, loadingSuministros, suministros]);

  const exportarExcel = async () => {
    try {
      const response = await SuministrosService.exportarExcel();
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "InventarioSuministros.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("No se pudo exportar el Excel.");
    }
  };

  const limpiarFiltros = () => {
    setQ("");
    setDesde("");
    setHasta("");
  };

  const inRange = (fechaStr) => {
    if (!fechaStr) return false;
    const d = new Date(fechaStr);
    if (Number.isNaN(d.getTime())) return false;

    const fromOk = !desde || d >= new Date(desde + "T00:00:00");
    const toOk = !hasta || d <= new Date(hasta + "T23:59:59");
    return fromOk && toOk;
  };

  const suministrosFiltrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return suministros;

    return suministros.filter((s) => {
      const a = String(s.id ?? "").toLowerCase();
      const b = String(s.nombreProducto ?? "").toLowerCase();
      const c = String(s.totalEntradas ?? "").toLowerCase();
      const d = String(s.totalSalidas ?? "").toLowerCase();
      const e = String(s.existenciaActual ?? "").toLowerCase();
      return [a, b, c, d, e].some((x) => x.includes(term));
    });
  }, [suministros, q]);

  const movimientosFiltrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    return movimientos.filter((m) => {
      const fechaOk = (!desde && !hasta) || inRange(m.fecha);
      if (!fechaOk) return false;

      if (!term) return true;

      const parts = [
        m.id,
        m.nombreProducto,
        m.cantidadProducto,
        tipoMovimientos === "salida" ? m.personaResponsable : "",
        tipoMovimientos === "salida" ? m.departamentoResponsable : "",
        m.fecha ? new Date(m.fecha).toLocaleDateString("es-GT") : "",
      ]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" | ");

      return parts.includes(term);
    });
  }, [movimientos, q, desde, hasta, tipoMovimientos]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="max-w-7xl w-full mx-auto px-4 py-6 flex-1 min-h-0 flex flex-col">
        <div className="bg-white shadow-md rounded-2xl border border-gray-200 flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-200 shrink-0">
            <div className="text-center">
              <p className="font-bold text-lg">Guatemalan Candies, S.A.</p>
              <p className="font-bold text-lg text-blue-600 flex items-center justify-center gap-2">
                <FaBoxesStacked />
                Inventario de Suministros
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
                  placeholder="Producto, ID, cantidades, responsable, depto..."
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 p-3 font-semibold text-gray-800 transition"
                >
                  Limpiar
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="inline-flex rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setTab("inventario")}
                  className={`px-4 py-2 font-semibold transition flex items-center gap-2 ${
                    tab === "inventario"
                      ? "bg-blue-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FaBoxesStacked />
                  Inventario
                </button>
                <button
                  onClick={() => setTab("entrada")}
                  className={`px-4 py-2 font-semibold transition flex items-center gap-2 border-l border-gray-200 ${
                    tab === "entrada"
                      ? "bg-blue-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FaArrowDown />
                  Entradas
                </button>
                <button
                  onClick={() => setTab("salida")}
                  className={`px-4 py-2 font-semibold transition flex items-center gap-2 border-l border-gray-200 ${
                    tab === "salida"
                      ? "bg-blue-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FaArrowUp />
                  Salidas
                </button>
              </div>

              <button
                onClick={exportarExcel}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white px-5 py-2 font-semibold transition"
              >
                <FaFileExcel />
                Exportar Excel
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 p-6 overflow-hidden">
            {tab === "inventario" ? (
              <>
                {loadingSuministros && (
                  <div className="text-gray-600">Cargando suministros...</div>
                )}
                {errorSuministros && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
                    {errorSuministros}
                  </div>
                )}

                {!loadingSuministros && !errorSuministros && (
                  <div className="h-full flex flex-col bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between shrink-0">
                      <div>
                        <p className="font-bold text-gray-800">Totales por producto</p>
                        <p className="text-sm text-gray-500">
                          {suministrosFiltrados.length} registros
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 min-h-0 overflow-auto">
                      <table className="min-w-[900px] w-full text-sm">
                        <thead className="bg-blue-800 text-white sticky top-0 z-10">
                          <tr>
                            <th className="p-3 text-left">ID</th>
                            <th className="p-3 text-left">Producto</th>
                            <th className="p-3 text-left">Entradas</th>
                            <th className="p-3 text-left">Salidas</th>
                            <th className="p-3 text-left">Existencia</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {suministrosFiltrados.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-gray-500">
                                No hay suministros para mostrar.
                              </td>
                            </tr>
                          ) : (
                            suministrosFiltrados.map((s, idx) => (
                              <tr
                                key={s.id}
                                className={`border-t border-gray-100 hover:bg-blue-50 transition ${
                                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                                }`}
                              >
                                <td className="p-3 font-medium text-gray-800">{s.id}</td>
                                <td className="p-3 text-gray-800">{s.nombreProducto}</td>
                                <td className="p-3 font-bold text-green-700">
                                  {s.totalEntradas}
                                </td>
                                <td className="p-3 font-bold text-red-700">
                                  {s.totalSalidas}
                                </td>
                                <td className="p-3 font-bold text-blue-700">
                                  {s.existenciaActual}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {loadingMovimientos && (
                  <div className="text-gray-600">Cargando movimientos...</div>
                )}
                {errorMovimientos && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
                    {errorMovimientos}
                  </div>
                )}

                {!loadingMovimientos && !errorMovimientos && (
                  <div className="h-full flex flex-col bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between shrink-0">
                      <div>
                        <p className="font-bold text-gray-800">
                          Movimientos ({tipoMovimientos === "entrada" ? "Entradas" : "Salidas"})
                        </p>
                        <p className="text-sm text-gray-500">
                          {movimientosFiltrados.length} registros
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 min-h-0 overflow-auto">
                      <table className="min-w-[1100px] w-full text-sm">
                        <thead className="bg-blue-800 text-white sticky top-0 z-10">
                          <tr>
                            <th className="p-3 text-left">ID</th>
                            <th className="p-3 text-left">Producto</th>
                            <th className="p-3 text-left">Cantidad</th>
                            {tipoMovimientos === "salida" && (
                              <>
                                <th className="p-3 text-left">Responsable</th>
                                <th className="p-3 text-left">Departamento</th>
                              </>
                            )}
                            <th className="p-3 text-left">Fecha</th>
                          </tr>
                        </thead>

                        <tbody className="bg-white">
                          {movimientosFiltrados.length === 0 ? (
                            <tr>
                              <td
                                colSpan={tipoMovimientos === "salida" ? 6 : 4}
                                className="p-6 text-center text-gray-500"
                              >
                                No hay movimientos para mostrar.
                              </td>
                            </tr>
                          ) : (
                            movimientosFiltrados.map((m, idx) => (
                              <tr
                                key={m.id}
                                className={`border-t border-gray-100 hover:bg-blue-50 transition ${
                                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                                }`}
                              >
                                <td className="p-3 font-medium text-gray-800">{m.id}</td>
                                <td className="p-3 text-gray-800">{m.nombreProducto}</td>
                                <td className="p-3 font-bold text-blue-700">
                                  {m.cantidadProducto}
                                </td>

                                {tipoMovimientos === "salida" && (
                                  <>
                                    <td className="p-3 text-gray-800">{m.personaResponsable}</td>
                                    <td className="p-3 text-gray-800">{m.departamentoResponsable}</td>
                                  </>
                                )}

                                <td className="p-3 text-gray-800">
                                  {m.fecha
                                    ? new Date(m.fecha).toLocaleDateString("es-GT")
                                    : "-"}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="px-4 py-3 text-xs text-gray-500 shrink-0">
                      Tip: podés filtrar por rango de fechas y buscar por cualquier campo.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}