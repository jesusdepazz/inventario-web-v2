import { useEffect, useMemo, useState } from "react";
import TrasladosServices from "../../../services/TrasladosServices";
import PdfTraslados from "./TrasladosPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";

export default function TrasladosLista() {
  const [traslados, setTraslados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    const fetchTraslados = async () => {
      try {
        const res = await TrasladosServices.obtenerTodos();
        const data = Array.isArray(res.data) ? res.data : res.data?.$values ?? [];
        setTraslados(data);
      } catch (err) {
        console.error("Error cargando traslados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTraslados();
  }, []);

  const fechaISO = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toISOString().split("T")[0];
  };

  const textoTraslado = (t) => {
    const entrega = t.empleadoEntrega ? `${t.empleadoEntrega.codigo} ${t.empleadoEntrega.nombre}` : "";
    const recibe = t.empleadoRecibe ? `${t.empleadoRecibe.codigo} ${t.empleadoRecibe.nombre}` : "";
    const equipos = Array.isArray(t.equipos)
      ? t.equipos.map((e) => `${e.equipo ?? ""} ${e.descripcionEquipo ?? ""}`).join(" ")
      : "";
    return [
      t.no,
      fechaISO(t.fechaEmision),
      entrega,
      recibe,
      equipos,
      t.motivo,
      t.ubicacionDesde,
      t.ubicacionHasta,
      t.status,
      t.observaciones,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  };

  const filtrados = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return [...traslados]
      .sort((a, b) => {
        return Number(a.no) - Number(b.no);
      })
      .filter((t) => {
        const f = fechaISO(t.fechaEmision);

        const okDesde = !desde || (f && f >= desde);
        const okHasta = !hasta || (f && f <= hasta);

        const okQ = !qq || textoTraslado(t).includes(qq);

        return okDesde && okHasta && okQ;
      });
  }, [traslados, q, desde, hasta]);

  const limpiar = () => {
    setQ("");
    setDesde("");
    setHasta("");
  };

  const badgeStatus = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("pend")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (s.includes("comp") || s.includes("final")) return "bg-green-100 text-green-800 border-green-200";
    if (s.includes("proc")) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-white/80">Cargando traslados...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white shadow-md rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Traslados</h2>
            <p className="text-sm text-gray-500">Listado de traslados - Equipo de cómputo</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-gray-50 text-gray-700">
              Total: {filtrados.length}
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
              <label className="block text-xs font-semibold text-gray-600 mb-2">Buscar</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="No, entrega, recibe, equipo, motivo, ubicaciones, estado, observaciones..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Desde</label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Hasta</label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="md:col-span-12 flex justify-end">
              <button
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
            <table className="min-w-[1600px] w-full text-sm border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-blue-900 text-white">
                <tr className="text-left">
                  <th className="px-4 py-3 font-bold whitespace-nowrap">#</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Número</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Fecha</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Entrega</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Recibe</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Equipos</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Motivo</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Ubicación Desde</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Ubicación Hasta</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Estado</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Observaciones</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Acciones</th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-10 text-center text-gray-500">
                      No hay registros de traslados.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((t, i) => (
                    <tr key={t.id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-4 py-4 border-t border-gray-200 align-top text-center font-semibold">
                        {i + 1}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap font-bold text-blue-800">
                        {t.no}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap">
                        {t.fechaEmision ? new Date(t.fechaEmision).toLocaleDateString("es-ES") : "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[220px]">
                        {t.empleadoEntrega ? (
                          <div className="leading-5">
                            <div className="font-semibold text-gray-900">{t.empleadoEntrega.codigo}</div>
                            <div className="text-gray-600">{t.empleadoEntrega.nombre}</div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[220px]">
                        {t.empleadoRecibe ? (
                          <div className="leading-5">
                            <div className="font-semibold text-gray-900">{t.empleadoRecibe.codigo}</div>
                            <div className="text-gray-600">{t.empleadoRecibe.nombre}</div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[320px]">
                        {Array.isArray(t.equipos) && t.equipos.length > 0 ? (
                          <div className="max-h-28 overflow-auto pr-2">
                            <ul className="space-y-2">
                              {t.equipos.map((eq, idx) => (
                                <li key={idx} className="text-gray-800">
                                  <div className="font-semibold">{eq.equipo}</div>
                                  <div className="text-gray-600 text-xs">{eq.descripcionEquipo}</div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[180px] break-words">
                        {t.motivo || "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[220px] break-words">
                        {t.ubicacionDesde || "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[240px] break-words">
                        {t.ubicacionHasta || "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${badgeStatus(t.status)}`}>
                          {t.status || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[260px] break-words">
                        {t.observaciones || "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap">
                        <PDFDownloadLink document={<PdfTraslados data={t} />} fileName={`Traslado-${t.id}.pdf`}>
                          {({ loading }) => (
                            <button
                              type="button"
                              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                            >
                              {loading ? "Generando..." : "Descargar PDF"}
                            </button>
                          )}
                        </PDFDownloadLink>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}