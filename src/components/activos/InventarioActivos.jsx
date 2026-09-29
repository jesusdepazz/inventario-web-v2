import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "../../utils/toast";
import { useEmpresa } from "../../context/empresa";
import { exportarInventario, descargarPlantilla } from "../../utils/excelActivos";
import { generarIngresoBodegaPDF } from "../../utils/ingresoBodegaPDF";
// eslint-disable-next-line no-unused-vars -- se usa como <motion.*> en JSX
import { motion } from "motion/react";
import { FaSearch, FaLayerGroup, FaFileExcel, FaDownload, FaUpload, FaPrint } from "react-icons/fa";
import { TablaContenedor, Tabla, THead, Th, TBody, Tr, Td, TrGrupo, TrCargando, TrVacia } from "../ui/Tabla";
import Badge from "../ui/Badge";

const btnBase = "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const mensajeError = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data) return data;
  return data?.mensaje || data?.title || fallback;
};

const valorColumna = (col, fila) => (col.valor ? col.valor(fila) : fila[col.key]);

// Página de inventario genérica para una categoría de activos.
export default function InventarioActivos({
  titulo,
  subtitulo,
  categoria,
  cargar,
  columnas,
  campoFamilia = "tipoEquipo",
  camposIngreso,
  importar,
  plantilla,
  filtro,
  accionesExtra,
  aviso,
  version = 0,
}) {
  const { empresa } = useEmpresa();
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [agrupar, setAgrupar] = useState(true);
  const [valorFiltro, setValorFiltro] = useState("");
  const [importando, setImportando] = useState(false);
  const [recarga, setRecarga] = useState(0);
  const fileRef = useRef(null);

  useEffect(() => {
    let activo = true;
    setLoading(true);
    cargar(empresa)
      .then((lista) => activo && setFilas(lista))
      .catch((error) => {
        console.error(error);
        toast.error("Error al cargar el inventario");
      })
      .finally(() => activo && setLoading(false));
    return () => {
      activo = false;
    };
    // cargar es estable por página; se recarga al cambiar de empresa o al pedirlo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresa, version, recarga]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let lista = filas;
    if (filtro && valorFiltro) lista = lista.filter((f) => f[filtro.key] === valorFiltro);
    if (q) {
      lista = lista.filter((f) =>
        columnas.map((c) => valorColumna(c, f)).join(" ").toLowerCase().includes(q)
      );
    }
    if (agrupar) {
      lista = [...lista].sort((a, b) =>
        String(a[campoFamilia] || "~").localeCompare(String(b[campoFamilia] || "~"), "es")
      );
    }
    return lista;
  }, [filas, busqueda, agrupar, filtro, valorFiltro, columnas, campoFamilia]);

  const conteoFamilias = useMemo(() => {
    const conteo = {};
    visibles.forEach((f) => {
      const k = f[campoFamilia] || "Sin familia";
      conteo[k] = (conteo[k] || 0) + 1;
    });
    return conteo;
  }, [visibles, campoFamilia]);

  const onImportar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setImportando(true);
      const { data } = await importar(file, empresa);
      toast.success(data?.mensaje || "Archivo importado");
      const omitidos = data?.omitidos ?? [];
      if (omitidos.length) {
        toast.warn(`${omitidos.length} filas omitidas: ${omitidos.slice(0, 3).join("; ")}${omitidos.length > 3 ? "…" : ""}`, { autoClose: 8000 });
      }
      setRecarga((r) => r + 1);
    } catch (error) {
      console.error(error);
      toast.error(mensajeError(error, "Error al importar el Excel"));
    } finally {
      setImportando(false);
    }
  };

  const imprimir = (fila) =>
    generarIngresoBodegaPDF({ categoria: fila.categoria || categoria, empresa: fila.empresa || empresa, activo: fila, campos: camposIngreso });

  const exportar = () =>
    exportarInventario(`${categoria} ${empresa}`, columnas.filter((c) => c.exportar !== false), visibles);

  const totalColumnas = columnas.length + 2;

  const celda = (c, fila) => {
    if (c.render) return c.render(fila);
    const valor = valorColumna(c, fila);
    if (valor === null || valor === undefined || valor === "") return <span className="text-slate-300">—</span>;
    if (c.key === "estado") return <Badge>{valor}</Badge>;
    return valor;
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{titulo}</h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800 ring-1 ring-inset ring-blue-700/10">{empresa}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{subtitulo}</p>
          </div>
          <div className="relative w-full md:w-80">
            <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar en el inventario"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setAgrupar((a) => !a)}
            aria-pressed={agrupar}
            className={`${btnBase} ${agrupar ? "bg-blue-900 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            <FaLayerGroup className="text-xs" /> Agrupar por familia
          </button>
          {filtro && (
            <select
              value={valorFiltro}
              onChange={(e) => setValorFiltro(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:ring-4 focus:ring-blue-100"
            >
              <option value="">{filtro.label}: todos</option>
              {filtro.opciones.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          <div className="flex-1" />
          <button onClick={exportar} disabled={!visibles.length} className={`${btnBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}>
            <FaFileExcel className="text-emerald-600" /> Exportar
          </button>
          {importar && (
            <>
              {plantilla && (
                <button onClick={() => descargarPlantilla(categoria, plantilla.encabezados, plantilla.ejemplo)} className={`${btnBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}>
                  <FaDownload className="text-xs text-slate-400" /> Plantilla
                </button>
              )}
              <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={onImportar} className="hidden" />
              <button onClick={() => fileRef.current?.click()} disabled={importando} className={`${btnBase} bg-emerald-600 text-white shadow-sm hover:bg-emerald-700`}>
                <FaUpload className="text-xs" /> {importando ? "Importando..." : "Carga masiva"}
              </button>
            </>
          )}
        </div>
      </motion.header>

      {aviso}

      <TablaContenedor className="flex-1">
        <Tabla>
          <THead>
            <tr>
              <Th className="w-10 !px-2 text-center">#</Th>
              {columnas.map((c) => <Th key={c.key}>{c.label}</Th>)}
              <Th className="text-right">Acciones</Th>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <TrCargando colSpan={totalColumnas} filas={8} />
            ) : visibles.length > 0 ? (
              visibles.map((fila, index) => {
                const familia = fila[campoFamilia] || "Sin familia";
                const nuevaFamilia = agrupar && (index === 0 || (visibles[index - 1][campoFamilia] || "Sin familia") !== familia);
                return (
                  <React.Fragment key={`${fila.categoria ?? ""}-${fila.id ?? index}`}>
                    {nuevaFamilia && (
                      <TrGrupo colSpan={totalColumnas}>
                        {familia} <span className="ml-1 font-medium text-blue-900/50">{conteoFamilias[familia]}</span>
                      </TrGrupo>
                    )}
                    <Tr index={index}>
                      <Td className="w-10 !bg-slate-50 !px-2 text-center text-xs !text-slate-400">{index + 1}</Td>
                      {columnas.map((c, i) => (
                        <Td key={c.key} destacado={i === 0} className="whitespace-nowrap">{celda(c, fila)}</Td>
                      ))}
                      <Td className="text-right">
                        <div className="flex justify-end gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => imprimir(fila)}
                            title="Imprimir recepción / ingreso a bodega"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 active:scale-[0.97]"
                          >
                            <FaPrint className="text-[10px]" /> Ingreso
                          </button>
                          {accionesExtra?.(fila)}
                        </div>
                      </Td>
                    </Tr>
                  </React.Fragment>
                );
              })
            ) : (
              <TrVacia colSpan={totalColumnas}>
                {busqueda || valorFiltro ? "Ningún activo coincide con la búsqueda." : "Todavía no hay activos registrados para esta empresa."}
              </TrVacia>
            )}
          </TBody>
        </Tabla>
      </TablaContenedor>
      <p className="-mt-2 text-right text-xs tabular-nums text-slate-400">{visibles.length} de {filas.length} registros</p>
    </div>
  );
}
