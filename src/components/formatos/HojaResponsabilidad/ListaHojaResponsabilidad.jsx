import React, { useState, useEffect, useMemo } from "react";
import HojasService from "../../../services/HojasServices";
import generarPDFHoja from "./HojaResponsabilidadPDF";
import generarPDFHojaMovil from "./HojaResponsabilidadMovilPdf";
import generarPDFHojaExterno from "./HojaResponsabilidadExternoPDF";
import { useNavigate } from "react-router-dom";
import { getRol } from "../../../services/auth"

const lowerFirst = (key) => key.charAt(0).toLowerCase() + key.slice(1);

const normalizeKeysDeep = (value) => {
  if (Array.isArray(value)) return value.map(normalizeKeysDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [lowerFirst(k), normalizeKeysDeep(v)])
    );
  }
  return value;
};

const parseSnapshot = (datosJson) => {
  try {
    return normalizeKeysDeep(JSON.parse(datosJson || "{}"));
  } catch {
    return {};
  }
};

const ListaHojasResponsabilidad = () => {
  const [hojas, setHojas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [rol, setRol] = useState("");
  const [verVersiones, setVerVersiones] = useState(null);
  const [versiones, setVersiones] = useState([]);
  const [loadingVersiones, setLoadingVersiones] = useState(false);
  const [filtros, setFiltros] = useState({
    hojaNo: "",
    codigo: "",
    responsable: "",
    departamento: "",
    estado: "",
    tipoHoja: "",
    desde: "",
    hasta: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedRol = localStorage.getItem("rol") || "";
    setRol(storedRol);
  }, []);

  useEffect(() => {
    const fetchHojas = async () => {
      try {
        const data = await HojasService.listarHojas();
        const hojasNormalizadas = data?.$values ?? data ?? [];
        setHojas(Array.isArray(hojasNormalizadas) ? hojasNormalizadas : []);
      } catch (error) {
        console.error("Error al obtener hojas:", error);
        window.alert("Error al cargar las hojas de responsabilidad");
      }
    };

    fetchHojas();
  }, []);

  const handleGenerarPDF = (hoja) => {
    if (hoja.tipoHoja === "Movil")    generarPDFHojaMovil(hoja);
    else if (hoja.tipoHoja === "Externo") generarPDFHojaExterno(hoja);
    else                              generarPDFHoja(hoja);
  };

  const imprimirVersion = (v) => {
    const datos = parseSnapshot(v.datosJson);
    handleGenerarPDF({ ...datos, version: v.numeroVersion });
  };

  const abrirVersiones = async (hoja) => {
    setVerVersiones(hoja);
    setVersiones([]);
    setLoadingVersiones(true);

    try {
      const data = await HojasService.obtenerVersiones(hoja.id);
      const lista = Array.isArray(data) ? data : Array.isArray(data?.$values) ? data.$values : [];
      setVersiones(lista);
    } catch (error) {
      console.error(error);
      window.alert("Error al cargar el historial de versiones");
    } finally {
      setLoadingVersiones(false);
    }
  };

  const cerrarVersiones = () => {
    setVerVersiones(null);
    setVersiones([]);
  };

  const eliminarVersion = async (versionId) => {
    const ok = window.confirm("¿Eliminar esta versión del historial? Esta acción no se puede deshacer.");
    if (!ok) return;

    try {
      const resultado = await HojasService.eliminarVersion(verVersiones.id, versionId);
      const nuevaVersion = resultado?.version ?? verVersiones.version;

      setVerVersiones((prev) => (prev ? { ...prev, version: nuevaVersion } : prev));
      setHojas((prev) =>
        prev.map((h) => (h.id === verVersiones.id ? { ...h, version: nuevaVersion } : h))
      );

      const data = await HojasService.obtenerVersiones(verVersiones.id);
      const lista = Array.isArray(data) ? data : Array.isArray(data?.$values) ? data.$values : [];
      setVersiones(lista);
    } catch (error) {
      console.error(error);
      window.alert("Error al eliminar la versión");
    }
  };

  const normalize = (v) =>
    (v ?? "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const hoyTexto = useMemo(() => {
    return new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const esAdmin = rol === "Administrador";

  const hojasFiltradas = useMemo(() => {
    const q = normalize(busqueda);

    const cumpleRango = (fechaStr) => {
      if (!filtros.desde && !filtros.hasta) return true;
      if (!fechaStr) return false;

      const f = new Date(fechaStr);
      if (Number.isNaN(f.getTime())) return false;

      if (filtros.desde) {
        const d = new Date(filtros.desde);
        d.setHours(0, 0, 0, 0);
        if (f < d) return false;
      }

      if (filtros.hasta) {
        const h = new Date(filtros.hasta);
        h.setHours(23, 59, 59, 999);
        if (f > h) return false;
      }

      return true;
    };

    return (hojas || []).filter((hoja) => {
      const emp0 = hoja?.empleados?.[0] ?? hoja?.empleados?.$values?.[0];
      const eq0 = hoja?.equipos?.[0] ?? hoja?.equipos?.$values?.[0];

      const hojaNo = hoja?.hojaNo ?? "";
      const fechaCreacion = hoja?.fechaCreacion ?? "";
      const codigo = emp0?.empleadoId ?? emp0?.EmpleadoId ?? "";
      const responsable = emp0?.nombre ?? emp0?.Nombre ?? "";
      const puesto = emp0?.puesto ?? emp0?.Puesto ?? "";
      const departamento = emp0?.departamento ?? emp0?.Departamento ?? "";
      const jefe = hoja?.jefeInmediato ?? "";
      const ubicacion = eq0?.ubicacion ?? eq0?.Ubicacion ?? "";
      const estado = hoja?.estado ?? "";
      const obs = hoja?.observaciones ?? "";
      const tipoHoja = hoja?.tipoHoja ?? "";

      const blob = normalize(
        `${hojaNo} ${codigo} ${responsable} ${puesto} ${departamento} ${jefe} ${ubicacion} ${estado} ${obs} ${tipoHoja}`
      );

      if (q && !blob.includes(q)) return false;
      if (filtros.hojaNo && !normalize(hojaNo).includes(normalize(filtros.hojaNo))) return false;
      if (filtros.codigo && !normalize(codigo).includes(normalize(filtros.codigo))) return false;
      if (filtros.responsable && !normalize(responsable).includes(normalize(filtros.responsable))) return false;
      if (filtros.departamento && !normalize(departamento).includes(normalize(filtros.departamento))) return false;
      if (filtros.estado && normalize(estado) !== normalize(filtros.estado)) return false;
      if (filtros.tipoHoja && normalize(tipoHoja) !== normalize(filtros.tipoHoja)) return false;
      if (!cumpleRango(fechaCreacion)) return false;

      return true;
    });
  }, [hojas, busqueda, filtros]);

  const limpiar = () => {
    setBusqueda("");
    setFiltros({
      hojaNo: "",
      codigo: "",
      responsable: "",
      departamento: "",
      estado: "",
      tipoHoja: "",
      desde: "",
      hasta: "",
    });
  };

  return (
    <>
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden h-full flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Hojas de responsabilidad</h2>
              <p className="text-sm text-slate-500">Listado de hojas de responsabilidad.</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-slate-50 text-slate-700">
                Total: {hojasFiltradas.length}
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
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-12">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Buscar
              </label>
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por hoja, código, responsable, depto, jefe, estado, tipo..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {mostrarFiltros && (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                <input
                  value={filtros.hojaNo}
                  onChange={(e) => setFiltros((p) => ({ ...p, hojaNo: e.target.value }))}
                  placeholder="Hoja No"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />

                <input
                  value={filtros.codigo}
                  onChange={(e) => setFiltros((p) => ({ ...p, codigo: e.target.value }))}
                  placeholder="Código"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />

                <input
                  value={filtros.responsable}
                  onChange={(e) => setFiltros((p) => ({ ...p, responsable: e.target.value }))}
                  placeholder="Responsable"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />

                <input
                  value={filtros.departamento}
                  onChange={(e) => setFiltros((p) => ({ ...p, departamento: e.target.value }))}
                  placeholder="Departamento"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />

                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros((p) => ({ ...p, estado: e.target.value }))}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  <option value="">Estado (Todos)</option>
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                </select>

                <select
                  value={filtros.tipoHoja}
                  onChange={(e) => setFiltros((p) => ({ ...p, tipoHoja: e.target.value }))}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  <option value="">Tipo hoja (Todos)</option>
                  <option value="Computo">Computo</option>
                  <option value="Movil">Movil</option>
                  <option value="Externo">Externo</option>
                </select>

                <input
                  type="date"
                  value={filtros.desde}
                  onChange={(e) => setFiltros((p) => ({ ...p, desde: e.target.value }))}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />

                <input
                  type="date"
                  value={filtros.hasta}
                  onChange={(e) => setFiltros((p) => ({ ...p, hasta: e.target.value }))}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 p-6">
          <div className="h-full overflow-auto rounded-2xl border border-slate-200">
            <table className="min-w-[1700px] w-full text-sm border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-blue-900 text-white">
                <tr className="text-left">
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Hoja No</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Fecha</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Código</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Responsable</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Puesto</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Departamento</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Jefe inmediato</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Ubicación</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Estado</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Fecha solvencia</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Observaciones</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">Tipo</th>
                  <th className="px-4 py-3 font-bold whitespace-nowrap text-center">Acciones</th>
                  {esAdmin && (
                    <th className="px-4 py-3 font-bold whitespace-nowrap text-center">Editar</th>
                  )}
                </tr>
              </thead>

              <tbody className="bg-white">
                {hojasFiltradas.length > 0 ? (
                  hojasFiltradas.map((hoja, idx) => {
                    const emp0 = hoja?.empleados?.[0] ?? hoja?.empleados?.$values?.[0];
                    const eq0 = hoja?.equipos?.[0] ?? hoja?.equipos?.$values?.[0];

                    const fechaCreacion = hoja?.fechaCreacion
                      ? new Date(hoja.fechaCreacion).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "-";

                    const fechaSolv = hoja?.fechaSolvencia
                      ? new Date(hoja.fechaSolvencia).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "-";

                    return (
                      <tr
                        key={hoja?.id ?? hoja?.hojaNo ?? idx}
                        className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="px-4 py-4 border-t border-slate-200 align-top font-semibold text-slate-900 whitespace-nowrap">
                          {hoja?.hojaNo ?? "-"}
                        </td>

                        <td className="px-4 py-4 border-t border-slate-200 align-top whitespace-nowrap text-slate-700">
                          {fechaCreacion}
                        </td>

                        <td className="px-4 py-4 border-t border-slate-200 align-top whitespace-nowrap text-slate-700">
                          {emp0?.empleadoId ?? emp0?.EmpleadoId ?? "-"}
                        </td>

                        <td className="px-4 py-4 border-t border-slate-200 align-top min-w-[220px] text-slate-700">
                          {emp0?.nombre ?? emp0?.Nombre ?? "-"}
                        </td>

                        <td className="px-4 py-4 border-t border-slate-200 align-top min-w-[200px] text-slate-700">
                          {emp0?.puesto ?? emp0?.Puesto ?? "-"}
                        </td>

                        <td className="px-4 py-4 border-t border-slate-200 align-top min-w-[200px] text-slate-700">
                          {emp0?.departamento ?? emp0?.Departamento ?? "-"}
                        </td>

                        <td className="px-4 py-4 border-t border-slate-200 align-top min-w-[220px] text-slate-700">
                          {hoja?.jefeInmediato ?? "-"}
                        </td>

                        <td className="px-4 py-4 border-t border-slate-200 align-top min-w-[220px] text-slate-700">
                          {eq0?.ubicacion ?? eq0?.Ubicacion ?? "-"}
                        </td>

                        <td className="px-4 py-4 border-t border-slate-200 align-top whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                              hoja?.estado === "Activa"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : hoja?.estado === "Inactiva"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            {hoja?.estado ?? "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4 border-t border-slate-200 align-top whitespace-nowrap text-slate-700">
                          {fechaSolv}
                        </td>

                        <td className="px-4 py-4 border-t border-slate-200 align-top min-w-[320px] break-words text-slate-700">
                          {hoja?.observaciones ?? "-"}
                        </td>

                        <td className="px-4 py-4 border-t border-slate-200 align-top whitespace-nowrap text-slate-700">
                          {hoja?.tipoHoja ?? "-"}
                        </td>

                        <td className="px-4 py-4 border-t border-slate-200 align-top text-center whitespace-nowrap">
                          <button
                            onClick={() => handleGenerarPDF(hoja)}
                            className="rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-semibold hover:bg-blue-700 transition"
                          >
                            PDF
                          </button>
                        </td>

                        {esAdmin && (
                          <td className="px-4 py-4 border-t border-slate-200 align-top text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => navigate(`/hojas-responsabilidad/editar/${hoja.id}`)}
                                className="rounded-xl bg-amber-500 text-white px-4 py-2 text-xs font-semibold hover:bg-amber-600 transition"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => abrirVersiones(hoja)}
                                className="rounded-xl bg-slate-600 text-white px-4 py-2 text-xs font-semibold hover:bg-slate-700 transition"
                              >
                                Versiones
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={esAdmin ? 14 : 13}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No se encontraron hojas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-white">
          <div className="text-xs text-slate-600">
            Tip: usá la búsqueda rápida o los filtros para encontrar hojas más rápido.
          </div>
        </div>
      </div>
    </div>

    {verVersiones && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={cerrarVersiones} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Historial de versiones</h2>
          <p className="text-sm text-slate-600 mb-4">
            Hoja No: <b>{verVersiones.hojaNo}</b> · Versión actual:{" "}
            <b>{verVersiones.version ?? 0}</b>
          </p>

          <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-xs">
              <thead className="sticky top-0 bg-slate-100 border-b border-slate-200">
                <tr className="text-left text-slate-700">
                  <th className="px-3 py-2 font-semibold">Versión</th>
                  <th className="px-3 py-2 font-semibold">Motivo</th>
                  <th className="px-3 py-2 font-semibold">Estado</th>
                  <th className="px-3 py-2 font-semibold">Guardado</th>
                  <th className="px-3 py-2 font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingVersiones ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                      Cargando...
                    </td>
                  </tr>
                ) : versiones.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                      Todavía no hay versiones anteriores registradas.
                    </td>
                  </tr>
                ) : (
                  versiones.map((v) => {
                    const datos = parseSnapshot(v.datosJson);
                    return (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-semibold text-slate-900">{v.numeroVersion}</td>
                        <td className="px-3 py-2 text-slate-700">{datos.motivo || "-"}</td>
                        <td className="px-3 py-2 text-slate-700">{datos.estado || "-"}</td>
                        <td className="px-3 py-2 text-slate-700">
                          {v.fechaGuardado ? new Date(v.fechaGuardado).toLocaleString() : "-"}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => imprimirVersion(v)}
                              className="text-blue-700 font-semibold hover:underline"
                            >
                              PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => eliminarVersion(v.id)}
                              className="text-red-600 font-semibold hover:underline"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={cerrarVersiones}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ListaHojasResponsabilidad;