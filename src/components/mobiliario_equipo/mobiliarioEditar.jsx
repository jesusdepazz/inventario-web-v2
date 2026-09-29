import React, { useEffect, useState } from "react";
import { toast } from "../../utils/toast";
import MobiliarioEquipoService from "../../services/MobiliarioEquipoServices";
import { limpiarPayload } from "../../services/payload";
import UbicacionesService from "../../services/UbicacionesServices";
import { useEmpresa } from "../../context/empresa";
import useFamilias from "../../hooks/useFamilias";
import { SEGMENTOS } from "./config";
import { TablaContenedor, Tabla, THead, Th, TBody, Tr, Td, TrCargando, TrVacia } from "../ui/Tabla";

export default function EditarMobiliarioEquipo() {
  const { empresa } = useEmpresa();
  const familiasCatalogo = useFamilias("Mobiliario y equipo");
  const [items, setItems] = useState([]);
  const [loadingLista, setLoadingLista] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [item, setItem] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoadingLista(true);
        const res = await MobiliarioEquipoService.obtenerTodos({ empresa });
        const lista = Array.isArray(res.data) ? res.data : res.data?.$values ?? [];
        setItems(lista);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar registros");
      } finally {
        setLoadingLista(false);
      }
    };
    cargar();

    const cargarUbicaciones = async () => {
      try {
        const res = await UbicacionesService.obtenerTodas();
        const data = Array.isArray(res.data) ? res.data : res.data?.$values ?? [];
        setUbicaciones(data);
      } catch (error) {
        console.error("Error cargando ubicaciones:", error);
      }
    };
    cargarUbicaciones();
       
  }, [empresa]);

  const filtrados = items.filter((it) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return [it.codificacion, it.marca, it.modelo].join(" ").toLowerCase().includes(q);
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prev) => ({ ...prev, [name]: value }));
  };

  const guardarCambios = async () => {
    if (!item?.id) return;

    try {
      setSaving(true);
      await MobiliarioEquipoService.editar(
        item.id,
        limpiarPayload(item, { fechas: ["fechaIngreso", "fechaActualizacion"], omitir: ["reportesDanios"] })
      );
      toast.success("Activo actualizado correctamente");
      setItem(null);
      const res = await MobiliarioEquipoService.obtenerTodos({ empresa });
      const lista = Array.isArray(res.data) ? res.data : res.data?.$values ?? [];
      setItems(lista);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el activo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-52px)] bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h1 className="text-xl font-bold text-slate-900">Editar mobiliario o equipo</h1>
          <p className="mt-1 text-sm text-slate-600">Selecciona un registro de la lista para actualizar su información.</p>
        </div>

        {!item ? (
          <div className="p-6">
            <label className="text-xs font-semibold text-slate-700">Buscar por codificación, marca o modelo</label>
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Ej: MOB-001" />

            <TablaContenedor className="mt-4 max-h-96">
              <Tabla>
                <THead>
                  <tr>
                    <Th>Codificación</Th>
                    <Th>Marca</Th>
                    <Th>Modelo</Th>
                    <Th>Ubicación</Th>
                    <Th></Th>
                  </tr>
                </THead>
                <TBody>
                  {loadingLista ? (
                    <TrCargando colSpan={5} />
                  ) : filtrados.length > 0 ? (
                    filtrados.map((it, i) => (
                      <Tr key={it.id} index={i}>
                        <Td destacado>{it.codificacion || "-"}</Td>
                        <Td>{it.marca || "-"}</Td>
                        <Td>{it.modelo || "-"}</Td>
                        <Td>{it.ubicacion || "-"}</Td>
                        <Td>
                          <button onClick={() => setItem(it)} className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white">Editar</button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <TrVacia colSpan={5}>No se encontraron registros.</TrVacia>
                  )}
                </TBody>
              </Tabla>
            </TablaContenedor>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700">Segmento</label>
                <select name="segmento" value={item.segmento || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
                  <option value="">Seleccione segmento</option>
                  {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700">Familia</label>
                <select name="tipoEquipo" value={item.tipoEquipo || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
                  <option value="">Seleccione familia</option>
                  {[...new Set([item.tipoEquipo, ...familiasCatalogo].filter(Boolean))].map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Codificación</label><input value={item.codificacion || ""} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Marca</label><input name="marca" value={item.marca || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Modelo</label><input name="modelo" value={item.modelo || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Serie</label><input name="serie" value={item.serie || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Color</label><input name="color" value={item.color || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Dimensiones</label><input name="dimensiones" value={item.dimensiones || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Número de chapa/activo</label><input name="numeroChapaActivo" value={item.numeroChapaActivo || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Control de llaves</label><input name="controlLlaves" value={item.controlLlaves || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Estado físico actual</label><input name="estadoFisicoActual" value={item.estadoFisicoActual || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Catálogo de activos</label><input name="catalogoActivos" value={item.catalogoActivos || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Orden de compra</label><input name="ordenCompra" value={item.ordenCompra || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Factura</label><input name="factura" value={item.factura || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Proveedor</label><input name="proveedor" value={item.proveedor || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Fecha ingreso</label><input type="date" name="fechaIngreso" value={item.fechaIngreso ? String(item.fechaIngreso).slice(0,10) : ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Estado</label><select name="estado" value={item.estado || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Seleccione estado</option><option value="Buen estado">Buen estado</option><option value="Regular">Regular</option><option value="Dañado">Dañado</option></select></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Ubicación</label><select name="ubicacion" value={item.ubicacion || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Seleccione ubicación</option>{ubicaciones.map((u) => <option key={u.id ?? u.nombre} value={u.nombre}>{u.nombre}</option>)}</select></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Responsable anterior</label><input name="responsableAnterior" value={item.responsableAnterior || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col md:col-span-2"><label className="text-xs font-semibold text-slate-700">Comentarios</label><textarea name="comentarios" value={item.comentarios || ""} onChange={handleChange} rows="3" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col md:col-span-2"><label className="text-xs font-semibold text-slate-700">Observaciones</label><textarea name="observaciones" value={item.observaciones || ""} onChange={handleChange} rows="2" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setItem(null)} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Cancelar</button>
              <button type="button" onClick={guardarCambios} disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Guardando..." : "Guardar cambios"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
