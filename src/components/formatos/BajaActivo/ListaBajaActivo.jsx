import { useEffect, useMemo, useState } from "react";
import BajaActivosService from "../../../services/BajaActivosServices";
import { generarBajaPDF } from "./BajaActivoPDF";

export default function ListabajaAtivos() {
  const [bajas, setBajas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    const cargarBajas = async () => {
      try {
        const res = await BajaActivosService.obtenerTodas();
        const data = Array.isArray(res.data) ? res.data : res.data?.$values ?? [];
        setBajas(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar el historial de bajas");
      } finally {
        setLoading(false);
      }
    };

    cargarBajas();
  }, []);

  const parseMotivo = (motivoBaja) => {
    if (!motivoBaja) return "";
    try {
      const arr = JSON.parse(motivoBaja);
      return Array.isArray(arr) ? arr.join(", ") : String(motivoBaja);
    } catch {
      return String(motivoBaja);
    }
  };

  const toYmd = (d) => {
    if (!d) return "";
    try {
      return new Date(d).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const enRango = (fecha, d, h) => {
    const ymd = toYmd(fecha);
    if (!ymd) return false;
    if (d && ymd < d) return false;
    if (h && ymd > h) return false;
    return true;
  };

  const bajasFiltradas = useMemo(() => {
    const term = q.trim().toLowerCase();

    return (bajas || []).filter((b) => {
      const motivo = parseMotivo(b.motivoBaja);

      const hayTerm =
        !term ||
        String(b.codificacionEquipo || "").toLowerCase().includes(term) ||
        String(motivo || "").toLowerCase().includes(term) ||
        String(b.detallesBaja || "").toLowerCase().includes(term) ||
        String(b.ubicacionActual || "").toLowerCase().includes(term) ||
        String(b.ubicacionDestino || "").toLowerCase().includes(term) ||
        String(b.id || "").toLowerCase().includes(term);

      const okFecha = !desde && !hasta ? true : enRango(b.fechaBaja, desde, hasta);

      return hayTerm && okFecha;
    });
  }, [bajas, q, desde, hasta]);

  const limpiar = () => {
    setQ("");
    setDesde("");
    setHasta("");
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-white/80">Cargando historial de bajas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-red-200 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white shadow-md rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Bajas</h2>
            <p className="text-sm text-gray-500">Historial de bajas registradas.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-gray-50 text-gray-700">
              Total: {bajasFiltradas.length}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-gray-50 text-gray-700">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Buscar
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Codificación, motivo, detalles, ubicación..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="md:col-span-12 flex justify-end">
              <button
                type="button"
                onClick={limpiar}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 p-6">
          <div className="h-full overflow-auto rounded-2xl border border-gray-200">
            <table className="min-w-[1400px] w-full text-sm border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-blue-900 text-white">
                <tr className="text-left">
                  <th className="px-4 py-3 font-bold whitespace-nowrap">#</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Fecha Baja</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Codificación</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Motivo</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Detalles</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Ubicación Actual</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Ubicación Destino</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Acción</th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {bajasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      No hay bajas registradas.
                    </td>
                  </tr>
                ) : (
                  bajasFiltradas.map((baja, index) => {
                    const motivo = parseMotivo(baja.motivoBaja);

                    return (
                      <tr
                        key={baja.id}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="px-4 py-4 border-t border-gray-200 align-top text-center font-semibold">
                          {index + 1}
                        </td>

                        <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap">
                          {baja.fechaBaja
                            ? new Date(baja.fechaBaja).toLocaleDateString("es-ES")
                            : "-"}
                        </td>

                        <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap font-bold text-blue-800">
                          {baja.codificacionEquipo || "-"}
                        </td>

                        <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[240px] break-words">
                          {motivo || "-"}
                        </td>

                        <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[260px] break-words">
                          {baja.detallesBaja || "-"}
                        </td>

                        <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[220px] break-words">
                          {baja.ubicacionActual || "-"}
                        </td>

                        <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[220px] break-words font-semibold text-gray-900">
                          {baja.ubicacionDestino || "-"}
                        </td>

                        <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap">
                          <button
                            onClick={() => generarBajaPDF(baja.id)}
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                          >
                            Descargar PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}