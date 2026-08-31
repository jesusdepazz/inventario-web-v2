import React, { useEffect, useMemo, useState } from "react";
import EquiposService from "../../services/EquiposServices";
import { exportarExcel } from "../../services/ExportExcel";

const camposFiltro = [
  { label: "Codificación", value: "codificacion", tipo: "texto" },
  { label: "Factura", value: "factura", tipo: "texto" },
  { label: "Marca", value: "marca", tipo: "texto" },
  { label: "Proveedor", value: "proveedor", tipo: "texto" },
  { label: "Modelo", value: "modelo", tipo: "texto" },
  { label: "Estado", value: "estado", tipo: "select", opciones: ["Buen estado", "Inactivo", "Obsoleto"] },
  { label: "Ubicación", value: "ubicacion", tipo: "texto" },
  { label: "Asignado a", value: "asignadoA", tipo: "texto" },
  { label: "No. de Registro Deprect", value: "noRegistroDeprect", tipo: "texto" },
  { label: "Orden de Compra", value: "ordenCompra", tipo: "texto" },
  { label: "Fecha Ingreso", value: "fechaIngreso", tipo: "fecha" },
  { label: "Hoja No.", value: "hojaNo", tipo: "texto" },
  { label: "Fecha Actualizacion", value: "fechaActualizacion", tipo: "fecha" },
  { label: "Equipo", value: "equipo", tipo: "texto" },
  { label: "Serie", value: "serie", tipo: "texto" },
  { label: "IMEI", value: "imei", tipo: "texto" },
  { label: "Tipo", value: "tipo", tipo: "texto" },
  { label: "Responsable Anterior", value: "responsableAnterior", tipo: "texto" },
  { label: "Número asignado", value: "numeroAsignado", tipo: "texto" },
  { label: "Extensión", value: "extension", tipo: "texto" },
  { label: "Revisado de toma fisica", value: "revisadoTomaFisica", tipo: "texto" },
  { label: "Fecha de toma", value: "fechaToma", tipo: "fecha" },
  { label: "Estado de Sticker", value: "estadoSticker", tipo: "select", opciones: ["Buen estado", "Cambio"] },
  { label: "Asignado a Hoja de responsabilidad", value: "asignadoHojaResponsabilidad", tipo: "texto" },
  { label: "Comentarios", value: "comentarios", tipo: "texto" },
  { label: "Observaciones", value: "observaciones", tipo: "texto" },
];

const ListaEquipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState([]);

  useEffect(() => {
    const cargarEquipos = async () => {
      try {
        setLoading(true);
        const res = await EquiposService.obtenerEquipos();
        let lista = [];

        if (Array.isArray(res.data)) lista = res.data;
        else if (Array.isArray(res.data?.$values)) lista = res.data.$values;

        setEquipos(lista);
      } catch (err) {
        console.error("Error al obtener equipos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarEquipos();
  }, []);

  const agregarFiltro = () => {
    setFiltros((prev) => [...prev, { campo: camposFiltro[0].value, valor: "" }]);
  };

  const cambiarCampoFiltro = (index, campoNuevo) => {
    setFiltros((prev) =>
      prev.map((filtro, i) => (i === index ? { campo: campoNuevo, valor: "" } : filtro))
    );
  };

  const cambiarValorFiltro = (index, valorNuevo) => {
    setFiltros((prev) =>
      prev.map((filtro, i) => (i === index ? { ...filtro, valor: valorNuevo } : filtro))
    );
  };

  const eliminarFiltro = (index) => {
    setFiltros((prev) => prev.filter((_, i) => i !== index));
  };

  const resultadosFiltrados = useMemo(() => {
    if (filtros.length === 0) return equipos;

    return equipos.filter((equipo) =>
      filtros.every(({ campo, valor }) => {
        if (!valor?.toString().trim()) return true;

        let valorCampo = "";

        if (campo === "asignaciones") {
          valorCampo =
            equipo.asignaciones
              ?.map((a) => `${a.codigoEmpleado || ""} ${a.nombreEmpleado || ""} ${a.puesto || ""}`)
              .join(" ")
              .toLowerCase() || "";
        } else {
          valorCampo =
            equipo?.[campo] !== null && equipo?.[campo] !== undefined
              ? equipo[campo].toString().toLowerCase()
              : "";
        }

        return valorCampo.includes(valor.toLowerCase());
      })
    );
  }, [equipos, filtros]);

  const limpiarFiltros = () => setFiltros([]);

  const exportar = () => {
    exportarExcel(resultadosFiltrados, "Equipos_Filtrados");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="w-full bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden h-full flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Inventario de equipos</h1>
              <p className="text-sm text-slate-500">
                Filtrá por múltiples campos y exportá a Excel.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-slate-50 text-slate-700">
                Total: {equipos.length}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-slate-50 text-slate-700">
                Mostrando: {resultadosFiltrados.length}
              </span>
              <button
                onClick={exportar}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
              >
                Exportar Excel
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 items-end">
            {filtros.map((filtro, i) => {
              const campoInfo = camposFiltro.find((c) => c.value === filtro.campo);

              return (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <select
                    value={filtro.campo}
                    onChange={(e) => cambiarCampoFiltro(i, e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {camposFiltro.map(({ label, value }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  {campoInfo?.tipo === "select" ? (
                    <select
                      value={filtro.valor}
                      onChange={(e) => cambiarValorFiltro(i, e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">-- Todos --</option>
                      {campoInfo.opciones.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={campoInfo?.tipo === "fecha" ? "date" : "text"}
                      placeholder={`Buscar ${campoInfo?.label || ""}`}
                      value={filtro.valor}
                      onChange={(e) => cambiarValorFiltro(i, e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}

                  <button
                    onClick={() => eliminarFiltro(i)}
                    className="text-red-600 hover:text-red-800 font-bold px-2"
                    title="Eliminar filtro"
                  >
                    ×
                  </button>
                </div>
              );
            })}

            <button
              onClick={agregarFiltro}
              className="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 transition"
            >
              + Añadir filtro
            </button>

            <button
              onClick={limpiarFiltros}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 p-6">
          <div className="h-full rounded-2xl border border-slate-200 overflow-auto">
            <table className="min-w-[2200px] w-full text-xs border border-gray-300 border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="text-center font-bold text-white">
                  <th colSpan="5" className="px-3 py-2 border bg-blue-700">
                    DATOS GENERALES
                  </th>
                  <th colSpan="3" className="px-3 py-2 border bg-blue-800">
                    DATOS DE USUARIO
                  </th>
                  <th colSpan="8" className="px-3 py-2 border bg-blue-900">
                    DATOS DEL EQUIPO
                  </th>
                  <th colSpan="1" className="px-3 py-2 border bg-blue-600">
                    UBICACION DEL EQUIPO
                  </th>
                  <th colSpan="2" className="px-3 py-2 border bg-blue-800">
                    INFORMACION DE EQUIPO
                  </th>
                </tr>

                <tr className="text-center text-white font-semibold">
                  <th className="px-3 py-2 border bg-blue-700 min-w-[80px]">#</th>
                  <th className="px-3 py-2 border bg-blue-700 min-w-[160px]">Orden de Compra</th>
                  <th className="px-3 py-2 border bg-blue-700 min-w-[160px]">Factura</th>
                  <th className="px-3 py-2 border bg-blue-700 min-w-[180px]">Proveedor</th>
                  <th className="px-3 py-2 border bg-blue-700 min-w-[140px]">Fecha Ingreso</th>

                  <th className="px-3 py-2 border bg-blue-800 min-w-[100px]">Hoja No.</th>
                  <th className="px-3 py-2 border bg-blue-800 min-w-[160px]">Fecha Actualizacion</th>
                  <th className="px-3 py-2 border bg-blue-800 min-w-[220px]">Asignado a</th>

                  <th className="px-3 py-2 border bg-blue-900 min-w-[180px]">Codificación</th>
                  <th className="px-3 py-2 border bg-blue-900 min-w-[140px]">Estado</th>
                  <th className="px-3 py-2 border bg-blue-900 min-w-[140px]">Equipo</th>
                  <th className="px-3 py-2 border bg-blue-900 min-w-[140px]">Marca</th>
                  <th className="px-3 py-2 border bg-blue-900 min-w-[140px]">Modelo</th>
                  <th className="px-3 py-2 border bg-blue-900 min-w-[160px]">Serie</th>
                  <th className="px-3 py-2 border bg-blue-900 min-w-[180px]">Responsable Anterior</th>
                  <th className="px-3 py-2 border bg-blue-900 min-w-[120px]">Extensión</th>

                  <th className="px-3 py-2 border bg-blue-600 min-w-[180px]">Ubicación</th>

                  <th className="px-3 py-2 border bg-blue-800 min-w-[220px]">Comentarios</th>
                  <th className="px-3 py-2 border bg-blue-800 min-w-[220px]">Observaciones</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="19" className="text-center p-6 text-gray-500">
                      Cargando equipos...
                    </td>
                  </tr>
                ) : resultadosFiltrados.length > 0 ? (
                  resultadosFiltrados.map((equipo, index) => (
                    <tr
                      key={equipo.id ?? index}
                      className="text-center even:bg-gray-50 hover:bg-blue-50"
                    >
                      <td className="px-3 py-2 border min-w-[80px]">{index + 1}</td>

                      <td className="px-3 py-2 border min-w-[160px] break-words">
                        {equipo.ordenCompra || "-"}
                      </td>
                      <td className="px-3 py-2 border min-w-[160px] break-words">
                        {equipo.factura || "-"}
                      </td>
                      <td className="px-3 py-2 border min-w-[180px] break-words">
                        {equipo.proveedor || "-"}
                      </td>

                      <td className="px-3 py-2 border min-w-[140px]">
                        {equipo.fechaIngreso
                          ? new Date(equipo.fechaIngreso).toLocaleDateString("es-ES")
                          : "Sin fecha"}
                      </td>

                      <td className="px-3 py-2 border text-red-600 font-semibold min-w-[100px]">
                        {equipo.hojaNo || "Sin asignar"}
                      </td>

                      <td className="px-3 py-2 border min-w-[140px]">
                        {equipo.fechaActualizacion
                          ? new Date(equipo.fechaActualizacion).toLocaleDateString("es-ES")
                          : "Sin fecha"}
                      </td>

                      <td className="px-3 py-2 border min-w-[220px] text-left">
                        {equipo.asignaciones?.length > 0 ? (
                          equipo.asignaciones.map((a, i) => (
                            <div key={i} className="mb-1">
                              <span className="text-blue-700 font-semibold">{a.codigoEmpleado}</span>{" "}
                              - {a.nombreEmpleado}
                              <div className="text-gray-500 italic text-[11px]">{a.puesto}</div>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 italic">Sin asignaciones</span>
                        )}
                      </td>

                      <td className="px-3 py-2 border font-bold text-blue-800 min-w-[180px]">
                        {equipo.codificacion || "-"}
                      </td>

                      <td className="px-3 py-2 border min-w-[140px]">{equipo.estado || "-"}</td>
                      <td className="px-3 py-2 border min-w-[140px]">{equipo.tipoEquipo || "-"}</td>
                      <td className="px-3 py-2 border min-w-[140px]">{equipo.marca || "-"}</td>
                      <td className="px-3 py-2 border min-w-[140px]">{equipo.modelo || "-"}</td>
                      <td className="px-3 py-2 border min-w-[160px]">{equipo.serie || "-"}</td>
                      <td className="px-3 py-2 border min-w-[180px]">{equipo.responsableAnterior || "-"}</td>
                      <td className="px-3 py-2 border min-w-[120px]">{equipo.extension || "-"}</td>

                      <td className="px-3 py-2 border min-w-[180px]">{equipo.ubicacion || "-"}</td>

                      <td className="px-3 py-2 border min-w-[220px] break-words text-left">
                        {equipo.comentarios || "-"}
                      </td>

                      <td className="px-3 py-2 border min-w-[220px] break-words text-left">
                        {equipo.observaciones || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="19" className="text-center p-6 text-gray-500">
                      No se encontraron equipos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Tip: podés agregar múltiples filtros para afinar resultados.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaEquipos;