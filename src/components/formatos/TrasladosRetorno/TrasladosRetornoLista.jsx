import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import TrasladosRetornoService from "../../../services/TrasladosRetornoService";
import PdfTrasladosRetorno from "./TrasladosRetornoPDF";
import { pdf } from "@react-pdf/renderer";

const TrasladosRetornoLista = () => {
  const [traslados, setTraslados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [rol, setRol] = useState("");

  const esAdmin = rol === "Administrador";

  useEffect(() => {
    setRol(localStorage.getItem("rol") || "");
  }, []);

  const cargarTraslados = () => {
    setCargando(true);

    TrasladosRetornoService.obtenerTodos()
      .then((res) => {
        const data = res?.data?.$values ?? res?.data ?? [];
        setTraslados(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error al obtener traslados");
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarTraslados();
  }, []);

  const filtrar = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return traslados;

    return traslados.filter((t) => {
      const no = String(t.no ?? "").toLowerCase();

      const empleadosTexto = Array.isArray(t.empleados)
        ? t.empleados
          .map((emp) => `${emp.empleadoId ?? ""} ${emp.nombre ?? ""}`)
          .join(" ")
          .toLowerCase()
        : "";

      const ubicacion = String(t.ubicacionRetorno ?? "").toLowerCase();
      const motivo = String(t.motivoSalida ?? "").toLowerCase();

      const equiposTexto = Array.isArray(t.equipos)
        ? t.equipos
          .map((e) => `${e.equipo ?? ""} ${e.descripcionEquipo ?? ""}`)
          .join(" ")
          .toLowerCase()
        : "";

      return (
        no.includes(q) ||
        empleadosTexto.includes(q) ||
        ubicacion.includes(q) ||
        motivo.includes(q) ||
        equiposTexto.includes(q)
      );
    });
  }, [traslados, busqueda]);

  const anularTraslado = async (id) => {
    const ok = window.confirm("¿Anular este pase de salida con retorno?");
    if (!ok) return;

    try {
      await TrasladosRetornoService.anular(id);
      toast.success("Traslado anulado correctamente");
      cargarTraslados();
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data ?? "Error al anular el traslado";
      toast.error(typeof msg === "string" ? msg : "Error al anular el traslado");
    }
  };

  const descargarPDF = async (id) => {
    try {
      const res = await TrasladosRetornoService.obtenerDetalle(id);
      const detalle = res?.data?.$values ?? res?.data ?? res?.data;

      const blob = await pdf(<PdfTrasladosRetorno data={detalle} />).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `TrasladoRetorno-${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Error al generar el PDF");
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";

    try {
      const soloFecha = String(fecha).split("T")[0];
      const [anio, mes, dia] = soloFecha.split("-");

      if (!anio || !mes || !dia) return String(fecha);

      return `${dia}/${mes}/${anio}`;
    } catch {
      return String(fecha);
    }
  };

  if (cargando && traslados.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-white/80">Cargando traslados con retorno...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white shadow-md rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Traslados con retorno
            </h2>
            <p className="text-sm text-gray-500">
              Listado de traslados con retorno - Equipo de cómputo
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-gray-50 text-gray-700">
              Total: {filtrar.length}
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
            <div className="md:col-span-8">
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="No., solicitante, equipo, ubicación o motivo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Limpiar
              </button>

              <button
                type="button"
                onClick={cargarTraslados}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 p-6">
          <div className="h-full overflow-auto rounded-2xl border border-gray-200">
            <table className="min-w-[1500px] w-full text-sm border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-blue-900 text-white">
                <tr className="text-left">
                  <th className="px-4 py-3 font-bold whitespace-nowrap">#</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Número</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Fecha Pase</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Solicitante</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Equipos</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Motivo</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Ubicación Retorno</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Fecha Retorno</th>
                  {esAdmin && (
                    <th className="px-4 py-3 font-bold whitespace-nowrap">Estado</th>
                  )}
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Acciones</th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {cargando ? (
                  <tr>
                    <td colSpan={esAdmin ? 10 : 9} className="px-6 py-10 text-center text-gray-500">
                      Cargando traslados...
                    </td>
                  </tr>
                ) : filtrar.length === 0 ? (
                  <tr>
                    <td colSpan={esAdmin ? 10 : 9} className="px-6 py-10 text-center text-gray-500">
                      No se encontraron registros.
                    </td>
                  </tr>
                ) : (
                  filtrar.map((t, idx) => (
                    <tr
                      key={t.id}
                      className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="px-4 py-4 border-t border-gray-200 align-top text-center font-semibold">
                        {idx + 1}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap font-bold text-blue-800">
                        {t.no || "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap">
                        {formatearFecha(t.fechaPase)}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[260px]">
                        {Array.isArray(t.empleados) && t.empleados.length > 0 ? (
                          <div className="space-y-3">
                            {t.empleados.map((emp, i) => (
                              <div key={i} className="leading-5">
                                <div className="font-semibold text-gray-900">
                                  {emp.empleadoId || "-"}
                                </div>
                                <div className="text-gray-600">
                                  {emp.nombre || "-"}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : t.nombreProveedor || t.personaRetira ? (
                          <div className="leading-5">
                            <div className="font-semibold text-gray-900">
                              {t.nombreProveedor || "-"}
                            </div>
                            <div className="text-gray-600">
                              {t.personaRetira || ""}
                            </div>
                            <span className="inline-block mt-1 text-[10px] font-semibold text-blue-800 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">
                              Proveedor
                            </span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[320px]">
                        {Array.isArray(t.equipos) && t.equipos.length > 0 ? (
                          <div className="max-h-28 overflow-auto pr-2">
                            <ul className="space-y-2">
                              {t.equipos.map((eq, i) => (
                                <li key={i} className="text-gray-800">
                                  <div className="font-semibold">{eq.equipo || "-"}</div>
                                  <div className="text-gray-600 text-xs">
                                    {eq.descripcionEquipo || ""}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[220px] break-words">
                        {t.motivoSalida || "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top min-w-[260px] break-words">
                        {t.ubicacionRetorno || "-"}
                      </td>

                      <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap">
                        {formatearFecha(t.fechaRetorno)}
                      </td>

                      {esAdmin && (
                        <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap">
                          <span
                            className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                              t.estado === "Anulado"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-green-50 text-green-700 border border-green-200"
                            }`}
                          >
                            {t.estado || "Vigente"}
                          </span>
                        </td>
                      )}

                      <td className="px-4 py-4 border-t border-gray-200 align-top whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => descargarPDF(t.id)}
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                          >
                            Descargar PDF
                          </button>

                          {esAdmin && t.estado !== "Anulado" && (
                            <button
                              onClick={() => anularTraslado(t.id)}
                              className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                            >
                              Anular
                            </button>
                          )}
                        </div>
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
};

export default TrasladosRetornoLista;