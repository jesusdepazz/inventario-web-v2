import React, { useEffect, useMemo, useState } from "react";
import { toast } from "../../utils/toast";
import AsignacionesComunalesService from "../../services/AsignacionesComunalesService";
import UbicacionesService from "../../services/UbicacionesServices";
import ActivosService from "../../services/ActivosServices";
import generarPDFAsignacionComunal from "./AsignacionComunalPDF";
import { FaFilePdf, FaEdit, FaHistory } from "react-icons/fa";
import { TablaContenedor, Tabla, THead, Th, TBody, Tr, Td, TrCargando, TrVacia } from "../ui/Tabla";
import Badge from "../ui/Badge";

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

const ListaAsignacionComunal = () => {
  const [rol, setRol] = useState("");
  const esAdmin = rol === "Administrador";

  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [ubicaciones, setUbicaciones] = useState([]);

  const [editando, setEditando] = useState(null);
  const [editUbicacion, setEditUbicacion] = useState("");
  const [editObservaciones, setEditObservaciones] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [loadingGrupo, setLoadingGrupo] = useState(false);
  const [editEquiposGrupo, setEditEquiposGrupo] = useState([]);
  const [editEquiposGrupoIdsOriginal, setEditEquiposGrupoIdsOriginal] = useState([]);
  const [editNuevosEquipos, setEditNuevosEquipos] = useState([]);
  const [editNuevoCodigo, setEditNuevoCodigo] = useState("");
  const [loadingNuevoEquipo, setLoadingNuevoEquipo] = useState(false);

  const [verVersiones, setVerVersiones] = useState(null);
  const [versiones, setVersiones] = useState([]);
  const [loadingVersiones, setLoadingVersiones] = useState(false);

  useEffect(() => {
    setRol(localStorage.getItem("rol") || "");
  }, []);

  useEffect(() => {
    const cargarUbicaciones = async () => {
      try {
        const { data } = await UbicacionesService.obtenerTodas();
        const lista = Array.isArray(data) ? data : Array.isArray(data?.$values) ? data.$values : [];
        setUbicaciones(lista);
      } catch {
        // Silencioso: el selector queda vacío si falla la carga.
      }
    };

    cargarUbicaciones();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await AsignacionesComunalesService.obtenerTodas();
      const data = res?.data?.$values ?? res?.data ?? [];
      setAsignaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener asignaciones comunales:", err);
      toast.error("Error al obtener asignaciones comunales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const exportarPDF = async (asignacion) => {
    try {
      await generarPDFAsignacionComunal([asignacion]);
    } catch (err) {
      console.error(err);
      toast.error("Error al generar el PDF");
    }
  };

  const eliminar = async (id) => {
    const ok = window.confirm("¿Eliminar esta asignación comunal?");
    if (!ok) return;

    try {
      await AsignacionesComunalesService.eliminar(id);
      toast.success("Asignación comunal eliminada");
      cargar();
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar la asignación comunal");
    }
  };

  const abrirEditar = async (asig) => {
    setEditando(asig);
    setEditUbicacion(asig.ubicacion || "");
    setEditObservaciones(asig.observaciones || "");
    setEditNuevosEquipos([]);
    setEditNuevoCodigo("");
    setEditEquiposGrupo([]);
    setEditEquiposGrupoIdsOriginal([]);
    setLoadingGrupo(true);

    try {
      const { data } = await AsignacionesComunalesService.obtenerGrupo(asig.id);
      const grupo = Array.isArray(data) ? data : Array.isArray(data?.$values) ? data.$values : [asig];
      setEditEquiposGrupo(grupo);
      setEditEquiposGrupoIdsOriginal(grupo.map((g) => g.id));
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar los equipos de esta asignación");
      setEditEquiposGrupo([asig]);
      setEditEquiposGrupoIdsOriginal([asig.id]);
    } finally {
      setLoadingGrupo(false);
    }
  };

  const cerrarEditar = () => {
    setEditando(null);
    setEditUbicacion("");
    setEditObservaciones("");
    setEditEquiposGrupo([]);
    setEditEquiposGrupoIdsOriginal([]);
    setEditNuevosEquipos([]);
    setEditNuevoCodigo("");
  };

  const quitarEquipoDelGrupo = (id) => {
    setEditEquiposGrupo((prev) => prev.filter((e) => e.id !== id));
  };

  const quitarNuevoEquipo = (codificacion) => {
    setEditNuevosEquipos((prev) => prev.filter((e) => e.codificacion !== codificacion));
  };

  const agregarNuevoEquipoAlGrupo = async () => {
    const cod = editNuevoCodigo?.trim();
    if (!cod) return;

    const yaEsta =
      editEquiposGrupo.some((e) => e.codificacionEquipo === cod) ||
      editNuevosEquipos.some((e) => e.codificacion === cod);

    if (yaEsta) return toast.warning("Este equipo ya está en la asignación");

    try {
      setLoadingNuevoEquipo(true);
      const { data } = await ActivosService.obtenerPorCodificacion(cod);
      setEditNuevosEquipos((prev) => [
        ...prev,
        { codificacion: cod, modelo: data?.modelo || "" },
      ]);
      setEditNuevoCodigo("");
    } catch {
      toast.error("Activo no encontrado");
    } finally {
      setLoadingNuevoEquipo(false);
    }
  };

  const guardarEdicion = async () => {
    const totalFinal = editEquiposGrupo.length + editNuevosEquipos.length;
    if (totalFinal === 0) {
      return toast.error("Debe quedar al menos un equipo en la asignación");
    }

    const quitarIds = editEquiposGrupoIdsOriginal.filter(
      (id) => !editEquiposGrupo.some((e) => e.id === id)
    );

    try {
      setSavingEdit(true);
      await AsignacionesComunalesService.actualizarGrupo(editando.id, {
        ubicacion: editUbicacion || null,
        observaciones: editObservaciones.trim() || null,
        agregarCodificaciones: editNuevosEquipos.map((e) => e.codificacion),
        quitarIds,
      });
      toast.success("Asignación comunal actualizada");
      cerrarEditar();
      cargar();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data;
      toast.error(typeof msg === "string" ? msg : "Error al actualizar la asignación comunal");
    } finally {
      setSavingEdit(false);
    }
  };

  const abrirVersiones = async (asig) => {
    setVerVersiones(asig);
    setVersiones([]);
    setLoadingVersiones(true);

    try {
      const { data } = await AsignacionesComunalesService.obtenerVersiones(asig.id);
      const lista = Array.isArray(data) ? data : Array.isArray(data?.$values) ? data.$values : [];
      setVersiones(lista);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar el historial de versiones");
    } finally {
      setLoadingVersiones(false);
    }
  };

  const cerrarVersiones = () => {
    setVerVersiones(null);
    setVersiones([]);
  };

  const normalizar = (v) => (v ?? "").toString().toLowerCase().trim();

  const filtradas = useMemo(() => {
    const q = normalizar(search);
    if (!q) return asignaciones;

    return asignaciones.filter((a) => {
      const fecha = a.fechaAsignacion ? new Date(a.fechaAsignacion).toLocaleDateString() : "";
      const blob = [a.codificacionEquipo, a.ubicacion, a.observaciones, fecha]
        .map(normalizar)
        .join(" ");
      return blob.includes(q);
    });
  }, [asignaciones, search]);

  const totalPages = Math.max(1, Math.ceil(filtradas.length / pageSize));
  const pageSafe = Math.min(page, totalPages);

  const paginadas = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return filtradas.slice(start, start + pageSize);
  }, [filtradas, pageSafe]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (!esAdmin) {
    return (
      <div className="h-[calc(100vh-52px)] flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-200 p-8 text-center">
          <h1 className="text-2xl font-extrabold text-blue-900">Acceso restringido</h1>
          <p className="mt-3 text-slate-600">
            Solo un administrador puede ver las asignaciones comunales.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="h-[calc(100vh-52px)] flex items-start justify-center pt-10 overflow-hidden">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Asignaciones comunales</h1>
              <p className="text-sm text-slate-600">
                Equipos asignados a una ubicación sin un empleado responsable.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs text-slate-700">
                Total: <b>{asignaciones.length}</b>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs text-slate-700">
                Mostrando: <b>{filtradas.length}</b>
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-md">
              <label className="text-xs font-medium text-slate-600">Buscar</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Equipo, ubicación, observaciones..."
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <button
              type="button"
              onClick={cargar}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Recargar
            </button>
          </div>
        </div>
        <div className="px-6 py-5">
          <TablaContenedor className="max-h-[58vh]">
              <Tabla>
                <THead>
                  <tr>
                    <Th className="w-16">#</Th>
                    <Th>Correlativo</Th>
                    <Th>Equipo</Th>
                    <Th>Ubicación</Th>
                    <Th>Observaciones</Th>
                    <Th>Fecha asignación</Th>
                    <Th>Última actualización</Th>
                    <Th>Acciones</Th>
                  </tr>
                </THead>

                <TBody>
                  {loading ? (
                    <TrCargando colSpan={8} />
                  ) : paginadas.length > 0 ? (
                    paginadas.map((asig, idx) => (
                      <Tr key={asig.id ?? `${asig.codificacionEquipo}-${idx}`} index={idx}>
                        <Td>
                          {(pageSafe - 1) * pageSize + idx + 1}
                        </Td>
                        <Td destacado>{asig.correlativo || "-"}</Td>
                        <Td destacado>
                          {asig.codificacionEquipo}
                        </Td>
                        <Td>{asig.ubicacion || "-"}</Td>
                        <Td>{asig.observaciones || "-"}</Td>
                        <Td className="whitespace-nowrap">
                          {asig.fechaAsignacion
                            ? new Date(asig.fechaAsignacion).toLocaleDateString()
                            : "-"}
                        </Td>
                        <Td className="whitespace-nowrap">
                          {asig.fechaActualizacion
                            ? new Date(asig.fechaActualizacion).toLocaleDateString()
                            : "-"}
                        </Td>
                        <Td>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => abrirEditar(asig)}
                              className="inline-flex items-center gap-1 text-slate-700 font-semibold hover:underline"
                            >
                              <FaEdit /> Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => abrirVersiones(asig)}
                              className="inline-flex items-center gap-1 text-slate-700 font-semibold hover:underline"
                            >
                              <FaHistory /> Versiones
                            </button>
                            <button
                              type="button"
                              onClick={() => exportarPDF(asig)}
                              className="inline-flex items-center gap-1 text-blue-800 font-semibold hover:underline"
                            >
                              <FaFilePdf /> PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => eliminar(asig.id)}
                              className="text-red-600 font-semibold hover:underline"
                            >
                              Eliminar
                            </button>
                          </div>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <TrVacia colSpan={8}>No hay asignaciones comunales registradas.</TrVacia>
                  )}
                </TBody>
              </Tabla>
          </TablaContenedor>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              Página <b>{pageSafe}</b> de <b>{totalPages}</b> ·{" "}
              Mostrando <b>{paginadas.length}</b> de <b>{filtradas.length}</b>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={pageSafe === 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                «
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe === 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageSafe === totalPages}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Siguiente
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={pageSafe === totalPages}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {editando && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={cerrarEditar} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Editar asignación comunal</h2>
          <p className="text-sm text-slate-600 mb-4">
            Correlativo: <b>{editando.correlativo || "-"}</b>
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Los tres campos son opcionales: solo se aplica lo que cambies.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Ubicación (opcional)
                </label>
                <select
                  value={editUbicacion}
                  onChange={(e) => setEditUbicacion(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                >
                  <option value="">Sin cambio</option>
                  {ubicaciones.map((u) => (
                    <option key={u.id ?? u.nombre} value={u.nombre}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Observaciones (opcional)
                </label>
                <input
                  type="text"
                  value={editObservaciones}
                  onChange={(e) => setEditObservaciones(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-900">
                  Equipos (opcional agregar/quitar)
                </h3>
              </div>

              <div className="p-3 flex gap-2">
                <input
                  type="text"
                  value={editNuevoCodigo}
                  onChange={(e) => setEditNuevoCodigo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && agregarNuevoEquipoAlGrupo()}
                  placeholder="Codificación de equipo a agregar"
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                />
                <button
                  type="button"
                  onClick={agregarNuevoEquipoAlGrupo}
                  disabled={loadingNuevoEquipo}
                  className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loadingNuevoEquipo ? "..." : "Agregar"}
                </button>
              </div>

              <TablaContenedor className="max-h-52 mx-3 mb-3">
                <Tabla>
                  <THead>
                    <tr>
                      <Th>Codificación</Th>
                      <Th>Estado</Th>
                      <Th className="w-16">Acción</Th>
                    </tr>
                  </THead>
                  <TBody>
                    {loadingGrupo ? (
                      <TrCargando colSpan={3} filas={3} />
                    ) : editEquiposGrupo.length === 0 && editNuevosEquipos.length === 0 ? (
                      <TrVacia colSpan={3}>Sin equipos</TrVacia>
                    ) : (
                      <>
                        {editEquiposGrupo.map((eq, i) => (
                          <Tr key={eq.id} index={i}>
                            <Td destacado>
                              {eq.codificacionEquipo}
                            </Td>
                            <Td><Badge tono="gris">Actual</Badge></Td>
                            <Td>
                              <button
                                type="button"
                                onClick={() => quitarEquipoDelGrupo(eq.id)}
                                className="text-red-600 font-semibold hover:underline"
                              >
                                Quitar
                              </button>
                            </Td>
                          </Tr>
                        ))}
                        {editNuevosEquipos.map((eq, i) => (
                          <Tr key={`nuevo-${eq.codificacion}`} index={editEquiposGrupo.length + i} className="bg-emerald-50/40">
                            <Td destacado>
                              {eq.codificacion}
                            </Td>
                            <Td><Badge tono="verde">Nuevo</Badge></Td>
                            <Td>
                              <button
                                type="button"
                                onClick={() => quitarNuevoEquipo(eq.codificacion)}
                                className="text-red-600 font-semibold hover:underline"
                              >
                                Quitar
                              </button>
                            </Td>
                          </Tr>
                        ))}
                      </>
                    )}
                  </TBody>
                </Tabla>
              </TablaContenedor>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={cerrarEditar}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardarEdicion}
              disabled={savingEdit || loadingGrupo}
              className="rounded-lg bg-blue-900 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-950 disabled:opacity-60"
            >
              {savingEdit ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    )}

    {verVersiones && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={cerrarVersiones} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Historial de versiones</h2>
          <p className="text-sm text-slate-600 mb-4">
            Equipo: <b>{verVersiones.codificacionEquipo}</b> · Versión actual:{" "}
            <b>{verVersiones.version ?? 0}</b>
          </p>

          <TablaContenedor className="flex-1 min-h-0">
            <Tabla>
              <THead>
                <tr>
                  <Th>Versión</Th>
                  <Th>Ubicación</Th>
                  <Th>Observaciones</Th>
                  <Th>Guardado</Th>
                </tr>
              </THead>
              <TBody>
                {loadingVersiones ? (
                  <TrCargando colSpan={4} filas={3} />
                ) : versiones.length === 0 ? (
                  <TrVacia colSpan={4}>Todavía no hay versiones anteriores registradas.</TrVacia>
                ) : (
                  versiones.map((v, i) => {
                    const datos = parseSnapshot(v.datosJson);
                    return (
                      <Tr key={v.id} index={i}>
                        <Td destacado>{v.numeroVersion}</Td>
                        <Td>{datos.ubicacion || "-"}</Td>
                        <Td>{datos.observaciones || "-"}</Td>
                        <Td className="whitespace-nowrap">
                          {v.fechaGuardado ? new Date(v.fechaGuardado).toLocaleString() : "-"}
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </TBody>
            </Tabla>
          </TablaContenedor>

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

export default ListaAsignacionComunal;
