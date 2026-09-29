import { useEffect, useMemo, useState } from "react";
import TrasladosServices from "../../../services/TrasladosServices";
import PdfTraslados from "./TrasladosPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { TablaContenedor, Tabla, THead, Th, TBody, Tr, Td, TrVacia } from "../../ui/Tabla";
import Badge from "../../ui/Badge";

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
    if (s.includes("pend")) return "ambar";
    if (s.includes("comp") || s.includes("final")) return "verde";
    if (s.includes("proc")) return "azul";
    return "gris";
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
          <TablaContenedor className="h-full">
            <Tabla className="min-w-[1600px]">
              <THead>
                <tr>
                  <Th>#</Th>
                  <Th>Número</Th>
                  <Th>Fecha</Th>
                  <Th>Entrega</Th>
                  <Th>Recibe</Th>
                  <Th>Activos</Th>
                  <Th>Motivo</Th>
                  <Th>Ubicación Desde</Th>
                  <Th>Ubicación Hasta</Th>
                  <Th>Estado</Th>
                  <Th>Observaciones</Th>
                  <Th>Acciones</Th>
                </tr>
              </THead>

              <TBody>
                {filtrados.length === 0 ? (
                  <TrVacia colSpan={12}>
                    No hay registros de traslados.
                  </TrVacia>
                ) : (
                  filtrados.map((t, i) => (
                    <Tr key={t.id} index={i}>
                      <Td className="align-top text-center">
                        {i + 1}
                      </Td>

                      <Td destacado className="align-top whitespace-nowrap">
                        {t.no}
                      </Td>

                      <Td className="align-top whitespace-nowrap">
                        {t.fechaEmision ? new Date(t.fechaEmision).toLocaleDateString("es-ES") : "-"}
                      </Td>

                      <Td className="align-top min-w-[220px]">
                        {t.empleadoEntrega ? (
                          <div className="leading-5">
                            <div className="font-semibold text-gray-900">{t.empleadoEntrega.codigo}</div>
                            <div className="text-gray-600">{t.empleadoEntrega.nombre}</div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </Td>

                      <Td className="align-top min-w-[220px]">
                        {t.empleadoRecibe ? (
                          <div className="leading-5">
                            <div className="font-semibold text-gray-900">{t.empleadoRecibe.codigo}</div>
                            <div className="text-gray-600">{t.empleadoRecibe.nombre}</div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </Td>

                      <Td className="align-top min-w-[320px]">
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
                      </Td>

                      <Td className="align-top min-w-[180px] break-words">
                        {t.motivo || "-"}
                      </Td>

                      <Td className="align-top min-w-[220px] break-words">
                        {t.ubicacionDesde || "-"}
                      </Td>

                      <Td className="align-top min-w-[240px] break-words">
                        {t.ubicacionHasta || "-"}
                      </Td>

                      <Td className="align-top whitespace-nowrap">
                        {t.status ? <Badge tono={badgeStatus(t.status)}>{t.status}</Badge> : "-"}
                      </Td>

                      <Td className="align-top min-w-[260px] break-words">
                        {t.observaciones || "-"}
                      </Td>

                      <Td className="align-top whitespace-nowrap">
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
                      </Td>
                    </Tr>
                  ))
                )}
              </TBody>
            </Tabla>
          </TablaContenedor>
        </div>
      </div>
    </div>
  );
}