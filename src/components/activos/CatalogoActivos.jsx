import React, { useEffect, useState } from "react";
import { toast } from "../../utils/toast";
import CatalogoActivosService from "../../services/CatalogoActivosServices";
import { aLista } from "../../services/payload";
import { CATEGORIAS_ACTIVOS } from "../equipos/catalogoActivos";
// eslint-disable-next-line no-unused-vars -- se usa como <motion.*> en JSX
import { motion } from "motion/react";
import { TablaContenedor, Tabla, THead, Th, TBody, Tr, Td, TrCargando, TrVacia } from "../ui/Tabla";
import Badge from "../ui/Badge";

const CATEGORIAS = CATEGORIAS_ACTIVOS.map((c) => c.value);
const inputCls = "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800";

export default function CatalogoActivos() {
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevo, setNuevo] = useState({ nombre: "", descripcion: "" });
  const [editando, setEditando] = useState(null);
  const [saving, setSaving] = useState(false);

  const cargar = async (cat = categoria) => {
    try {
      setLoading(true);
      const res = await CatalogoActivosService.obtenerTodos({ categoria: cat });
      setItems(aLista(res.data));
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar el catálogo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar(categoria);
    setEditando(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria]);

  const agregar = async (e) => {
    e.preventDefault();
    if (!nuevo.nombre.trim()) {
      toast.warn("Ingrese el nombre de la familia");
      return;
    }
    try {
      setSaving(true);
      await CatalogoActivosService.crear({ categoria, nombre: nuevo.nombre, descripcion: nuevo.descripcion, activo: true });
      setNuevo({ nombre: "", descripcion: "" });
      toast.success("Elemento agregado al catálogo");
      await cargar();
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "No se pudo agregar");
    } finally {
      setSaving(false);
    }
  };

  const guardar = async (item) => {
    try {
      await CatalogoActivosService.editar(item.id, item);
      toast.success("Catálogo actualizado");
      setEditando(null);
      await cargar();
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "No se pudo actualizar");
    }
  };

  const eliminar = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.nombre}" del catálogo? Los activos ya registrados conservan su familia.`)) return;
    try {
      await CatalogoActivosService.eliminar(item.id);
      toast.success("Elemento eliminado");
      await cargar();
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "No se pudo eliminar");
    }
  };

  const btnFila = "rounded-lg px-2.5 py-1.5 text-xs font-medium transition active:scale-[0.97]";

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Catálogo de activos</h1>
        <p className="mt-1 text-sm text-slate-500">Familias disponibles por categoría para clasificar y agrupar los activos.</p>
        <div className="mt-4 inline-flex flex-wrap gap-1 rounded-2xl bg-slate-100/80 p-1">
          {CATEGORIAS.map((c) => {
            const activa = categoria === c;
            return (
              <button
                key={c}
                onClick={() => setCategoria(c)}
                className={`relative rounded-xl px-3.5 py-1.5 text-sm font-medium transition-colors ${activa ? "text-slate-900" : "text-slate-500 hover:text-slate-800"}`}
              >
                {activa && (
                  <motion.span
                    layoutId="catalogo-categoria"
                    className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                  />
                )}
                <span className="relative">{c}</span>
              </button>
            );
          })}
        </div>
      </motion.header>

      <form onSubmit={agregar} className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 md:flex-row">
        <input value={nuevo.nombre} onChange={(e) => setNuevo((p) => ({ ...p, nombre: e.target.value }))} placeholder={`Nueva familia de ${categoria}`} className={inputCls} />
        <input value={nuevo.descripcion} onChange={(e) => setNuevo((p) => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción (opcional)" className={inputCls} />
        <button type="submit" disabled={saving} className="whitespace-nowrap rounded-xl bg-blue-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-950 active:scale-[0.97] disabled:opacity-60">Agregar familia</button>
      </form>

      <TablaContenedor className="flex-1">
        <Tabla>
          <THead>
            <tr>
              <Th>Familia</Th>
              <Th>Descripción</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acciones</Th>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <TrCargando colSpan={4} />
            ) : items.length > 0 ? (
              items.map((item, i) =>
                editando?.id === item.id ? (
                  <Tr key={item.id} index={i} seleccionada>
                    <Td><input value={editando.nombre} onChange={(e) => setEditando((p) => ({ ...p, nombre: e.target.value }))} className={inputCls} /></Td>
                    <Td><input value={editando.descripcion || ""} onChange={(e) => setEditando((p) => ({ ...p, descripcion: e.target.value }))} className={inputCls} /></Td>
                    <Td>
                      <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                        <input type="checkbox" checked={editando.activo} onChange={(e) => setEditando((p) => ({ ...p, activo: e.target.checked }))} /> Activo
                      </label>
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => guardar(editando)} className={`${btnFila} bg-emerald-600 text-white hover:bg-emerald-700`}>Guardar</button>
                        <button onClick={() => setEditando(null)} className={`${btnFila} border border-slate-200 text-slate-600 hover:bg-slate-50`}>Cancelar</button>
                      </div>
                    </Td>
                  </Tr>
                ) : (
                  <Tr key={item.id} index={i} className={item.activo ? "" : "opacity-60"}>
                    <Td destacado>{item.nombre}</Td>
                    <Td>{item.descripcion || <span className="text-slate-300">—</span>}</Td>
                    <Td><Badge tono={item.activo ? "verde" : "gris"}>{item.activo ? "Activo" : "Inactivo"}</Badge></Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => setEditando({ ...item })} className={`${btnFila} border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900`}>Editar</button>
                        <button onClick={() => eliminar(item)} className={`${btnFila} text-rose-600 hover:bg-rose-50`}>Eliminar</button>
                      </div>
                    </Td>
                  </Tr>
                )
              )
            ) : (
              <TrVacia colSpan={4}>Sin elementos en el catálogo.</TrVacia>
            )}
          </TBody>
        </Tabla>
      </TablaContenedor>
    </div>
  );
}
