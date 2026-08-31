import { useEffect, useMemo, useState } from "react";
import SolvenciasService from "../../../services/HojasSolvencias";
import { PDFDownloadLink } from "@react-pdf/renderer";
import HojaSolvenciaPDF from "./HojaSolvenciaPDF";

export default function ListaHojaSolvencia() {
  const [historico, setHistorico] = useState([]);
  const [q, setQ] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await SolvenciasService.listarHistorico();
        const normalizado = Array.isArray(data?.$values) ? data.$values : data;
        setHistorico(Array.isArray(normalizado) ? normalizado : []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const parseRow = (h) => {
    const primerEmpleado = (h.empleados || "").split(",")[0]?.trim() || "";
    const partes = primerEmpleado.split(" - ").map(p => p.trim());

    const codigo = partes[0] || "";
    const nombre = partes[1] || "";
    const puesto = partes[2] || "";
    const depto = partes.slice(3).join(" - ");

    const fecha = h.fechaSolvencia ? new Date(h.fechaSolvencia) : null;
    const fechaISO = fecha ? fecha.toISOString().slice(0, 10) : "";

    return {
      solvenciaNo: h.solvenciaNo ?? "",
      hojaNo: h.hojaNo ?? "",
      jefeInmediato: h.jefeInmediato ?? "",
      observaciones: h.observaciones ?? "",
      fecha,
      fechaISO,
      codigo,
      nombre,
      puesto,
      depto,
      raw: h,
    };
  };

  const rows = useMemo(() => historico.map(parseRow), [historico]);

  const filtrados = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return rows.filter((r) => {
      if (desde && r.fechaISO && r.fechaISO < desde) return false;
      if (hasta && r.fechaISO && r.fechaISO > hasta) return false;

      if (!qq) return true;

      const blob = [
        r.solvenciaNo,
        r.hojaNo,
        r.jefeInmediato,
        r.observaciones,
        r.fechaISO,
        r.codigo,
        r.nombre,
        r.puesto,
        r.depto,
      ]
        .join(" ")
        .toLowerCase();

      return blob.includes(qq);
    });
  }, [rows, q, desde, hasta]);

  const limpiar = () => {
    setQ("");
    setDesde("");
    setHasta("");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white shadow-md rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Solvencias</h2>
            <p className="text-sm text-gray-500">Historial de solvencias generadas.</p>
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
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Buscar
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Solvencia, hoja, código, nombre, puesto, depto, observaciones..."
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
            <table className="min-w-[1450px] w-full text-sm border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-blue-900 text-white">
                <tr className="text-left">
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Solvencia No.</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Fecha</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Código</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Nombre</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Puesto</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Departamento</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Hoja No.</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Jefe Inmediato</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Observaciones</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Acciones</th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {filtrados.length > 0 ? (
                  filtrados.map((r, i) => (
                    <tr
                      key={r.raw?.id ?? `${r.solvenciaNo}-${i}`}
                      className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="px-4 py-4 border-t border-gray-200 align-top font-bold text-blue-800 whitespace-nowrap">
                        {r.solvenciaNo || "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap">
                        {r.fecha ? r.fecha.toLocaleDateString("es-ES") : "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap">
                        {r.codigo || "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[220px]">
                        {r.nombre || "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[220px]">
                        {r.puesto || "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[220px]">
                        {r.depto || "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap">
                        {r.hojaNo || "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap">
                        {r.jefeInmediato || "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[320px] break-words">
                        {r.observaciones || "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap">
                        <PDFDownloadLink
                          document={<HojaSolvenciaPDF data={r.raw} />}
                          fileName={`HojaSolvencia-${r.raw?.id ?? r.solvenciaNo}.pdf`}
                        >
                          {({ loading }) => (
                            <button
                              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                              disabled={loading}
                            >
                              {loading ? "Generando..." : "Descargar PDF"}
                            </button>
                          )}
                        </PDFDownloadLink>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-10 text-center text-gray-500">
                      No hay solvencias para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}