import React, { useEffect, useMemo, useState } from "react";
import { FiFilter } from "react-icons/fi";
import { toast } from "../../utils/toast";
import EquiposService from "../../services/EquiposServices";
import { useEmpresa } from "../../context/empresa";
import { TablaContenedor, Tabla, THead, Th, TBody, Tr, Td, TrCargando, TrVacia } from "../ui/Tabla";

const PAGE_SIZE = 14;

const EliminarEquipos = () => {
  const { empresa } = useEmpresa();
  const [equipos, setEquipos] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);

  const [filtros, setFiltros] = useState({
    codificacion: "",
    marca: "",
    modelo: "",
    tipo: "",
    fechaExacta: "",
  });

  const cargarEquipos = async () => {
    try {
      setLoading(true);
      const res = await EquiposService.obtenerEquipos({ empresa });
      const lista = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.$values)
        ? res.data.$values
        : [];

      setEquipos(lista);
    } catch (err) {
      console.error("Error al cargar equipos", err);
      toast.error("❌ Error al obtener los equipos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEquipos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresa]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const limpiarFiltros = () => {
    setFiltros({
      codificacion: "",
      marca: "",
      modelo: "",
      tipo: "",
      fechaExacta: "",
    });
    setPage(1);
  };

  const equiposFiltrados = useMemo(() => {
    const cod = filtros.codificacion.trim().toLowerCase();
    const marca = filtros.marca.trim().toLowerCase();
    const modelo = filtros.modelo.trim().toLowerCase();
    const tipo = filtros.tipo.trim().toLowerCase();
    const fechaExacta = filtros.fechaExacta;

    return equipos.filter((equipo) => {
      const okCod = (equipo.codificacion || "").toLowerCase().includes(cod);
      const okMarca = (equipo.marca || "").toLowerCase().includes(marca);
      const okModelo = (equipo.modelo || "").toLowerCase().includes(modelo);
      const tipoValor = (equipo.tipoEquipo || equipo.equipoTipo || equipo.tipo || "").toLowerCase();
      const okTipo = tipoValor.includes(tipo);

      const okFecha =
        !fechaExacta ||
        (equipo.fechaIngreso &&
          new Date(equipo.fechaIngreso).toISOString().split("T")[0] === fechaExacta);

      return okCod && okMarca && okModelo && okTipo && okFecha;
    });
  }, [equipos, filtros]);

  const totalPages = Math.max(1, Math.ceil(equiposFiltrados.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return equiposFiltrados.slice(start, start + PAGE_SIZE);
  }, [equiposFiltrados, pageSafe]);

  const eliminarEquipo = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este equipo?")) return;

    try {
      setDeletingId(id);
      await EquiposService.eliminar(id);
      toast.success("✅ Equipo eliminado correctamente");
      await cargarEquipos();
    } catch (err) {
      console.error("Error al eliminar equipo", err);
      toast.error("❌ No se pudo eliminar el equipo");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="h-[calc(100vh-52px)] flex items-start justify-center pt-6 overflow-y-auto">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden h-[calc(100vh-90px)] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Eliminar activos</h1>
              <p className="text-sm text-slate-600">Filtrá y eliminá equipos del inventario.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-sm text-slate-700">
                Mostrando: <b className="ml-1">{equiposFiltrados.length}</b>
              </span>

              <button
                onClick={() => setMostrarFiltros((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                title="Mostrar filtros"
              >
                <FiFilter />
                Filtros
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label className="text-xs font-semibold text-slate-600">Buscar por codificación</label>
              <input
                type="text"
                name="codificacion"
                placeholder="Ej: EQ-IT-000123"
                value={filtros.codificacion}
                onChange={handleFiltroChange}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="sm:col-span-4 flex items-end justify-end">
              <button
                onClick={limpiarFiltros}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Limpiar
              </button>
            </div>
          </div>

          {mostrarFiltros && (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {["marca", "modelo", "tipo"].map((campo) => (
                  <div key={campo} className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-600 capitalize">{campo}</label>
                    <input
                      type="text"
                      name={campo}
                      placeholder={`Filtrar por ${campo}`}
                      value={filtros[campo]}
                      onChange={handleFiltroChange}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>
                ))}

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-600">Fecha ingreso (exacta)</label>
                  <input
                    type="date"
                    name="fechaExacta"
                    value={filtros.fechaExacta}
                    onChange={handleFiltroChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 px-6 py-4 overflow-hidden">
          <TablaContenedor className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
              <Tabla>
                <THead>
                  <tr>
                    <Th className="w-20">ID</Th>
                    <Th className="min-w-[180px]">Codificación</Th>
                    <Th className="min-w-[140px]">Marca</Th>
                    <Th className="min-w-[140px]">Modelo</Th>
                    <Th className="min-w-[140px]">Serie</Th>
                    <Th className="min-w-[220px]">Ubicación</Th>
                    <Th className="min-w-[140px]">Fecha ingreso</Th>
                    <Th className="w-44 text-center">Acciones</Th>
                  </tr>
                </THead>

                <TBody>
                  {loading ? (
                    <TrCargando colSpan={8} />
                  ) : pageItems.length > 0 ? (
                    pageItems.map((equipo, i) => (
                      <Tr key={equipo.id} index={i}>
                        <Td>{equipo.id}</Td>
                        <Td destacado>{equipo.codificacion || "-"}</Td>
                        <Td>{equipo.marca || "-"}</Td>
                        <Td>{equipo.modelo || "-"}</Td>
                        <Td>{equipo.serie || "-"}</Td>
                        <Td>{equipo.ubicacion || "-"}</Td>
                        <Td>
                          {equipo.fechaIngreso ? new Date(equipo.fechaIngreso).toLocaleDateString("es-ES") : "Sin fecha"}
                        </Td>
                        <Td>
                          <div className="flex justify-center">
                            <button
                              onClick={() => eliminarEquipo(equipo.id)}
                              disabled={deletingId === equipo.id}
                              className="rounded-xl bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                            >
                              {deletingId === equipo.id ? "Eliminando..." : "Eliminar"}
                            </button>
                          </div>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <TrVacia colSpan={8}>No se encontraron equipos.</TrVacia>
                  )}
                </TBody>
              </Tabla>
            </div>

            <div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                Página <b>{pageSafe}</b> de <b>{totalPages}</b>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setPage(1)}
                  disabled={pageSafe === 1}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  « Primero
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pageSafe === 1}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  ‹ Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={pageSafe === totalPages}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Siguiente ›
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={pageSafe === totalPages}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Último »
                </button>
              </div>
            </div>
          </TablaContenedor>
        </div>

        <div className="px-6 pb-4">
          {equiposFiltrados.length > 0 && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
              Tip: Usá filtros para encontrar rápido. Eliminar es irreversible.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EliminarEquipos;