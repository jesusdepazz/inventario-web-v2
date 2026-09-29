import React, { useEffect, useState } from "react";
import { toast } from "../../utils/toast";
import OtrosActivosService from "../../services/OtrosActivosServices";
import UbicacionesService from "../../services/UbicacionesServices";
import { limpiarPayload, aLista } from "../../services/payload";
import useFamilias from "../../hooks/useFamilias";
import { ESTADOS, CAMPOS_TEXTO, mensajeError } from "./campos";

const inputCls = "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm";

// Muestra el valor guardado aunque no esté en el catálogo (p.ej. registros importados de Excel)
const conValorActual = (opciones, actual) =>
  actual && !opciones.includes(actual) ? [actual, ...opciones] : opciones;

export default function EditarOtrosActivos() {
  const familias = useFamilias("Otros activos");
  const [codificacion, setCodificacion] = useState("");
  const [activo, setActivo] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cargarUbicaciones = async () => {
      try {
        const res = await UbicacionesService.obtenerTodas();
        setUbicaciones(aLista(res.data).map((u) => u.nombre));
      } catch (error) {
        console.error("Error cargando ubicaciones:", error);
      }
    };

    cargarUbicaciones();
  }, []);

  const buscarActivo = async () => {
    const cod = codificacion.trim();
    if (!cod) {
      toast.warn("Ingrese una codificación");
      return;
    }

    try {
      setLoading(true);
      const { data } = await OtrosActivosService.obtenerPorCodificacion(cod);
      setActivo(data);
    } catch (error) {
      console.error(error);
      toast.error("Activo no encontrado");
      setActivo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivo((prev) => ({ ...prev, [name]: value }));
  };

  const guardarCambios = async () => {
    if (!activo?.id) return;
    if (!activo.codificacion?.trim()) {
      toast.warn("La codificación es obligatoria");
      return;
    }
    try {
      setSaving(true);
      await OtrosActivosService.editar(
        activo.id,
        limpiarPayload(activo, { fechas: ["fechaIngreso", "fechaActualizacion"] })
      );
      toast.success("Activo actualizado correctamente");
      setActivo(null);
      setCodificacion("");
    } catch (error) {
      console.error(error);
      toast.error(mensajeError(error, "Error al actualizar el activo"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-52px)] bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h1 className="text-xl font-bold text-slate-900">Editar otros activos</h1>
          <p className="mt-1 text-sm text-slate-600">Busca por codificación y actualiza la información.</p>
        </div>

        {!activo ? (
          <div className="p-6">
            <label className="text-xs font-semibold text-slate-700">Codificación</label>
            <div className="mt-2 flex gap-3">
              <input value={codificacion} onChange={(e) => setCodificacion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && buscarActivo()} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Ej: OTR-001" />
              <button onClick={buscarActivo} disabled={loading} className="rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Buscando..." : "Buscar"}</button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex flex-col md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Familia</label>
                <select name="tipoEquipo" value={activo.tipoEquipo || ""} onChange={handleChange} className={`${inputCls} bg-white`}>
                  <option value="">Seleccione familia</option>
                  {conValorActual(familias, activo.tipoEquipo).map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              {CAMPOS_TEXTO.map((c) => (
                <div key={c.name} className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-700">{c.label}</label>
                  <input name={c.name} value={activo[c.name] || ""} onChange={handleChange} className={inputCls} />
                </div>
              ))}

              {/* El PUT del backend no actualiza FechaIngreso */}
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Fecha ingreso</label><input type="date" value={activo.fechaIngreso ? String(activo.fechaIngreso).slice(0, 10) : ""} readOnly className={`${inputCls} bg-slate-100`} /></div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700">Estado</label>
                <select name="estado" value={activo.estado || ""} onChange={handleChange} className={`${inputCls} bg-white`}>
                  <option value="">Seleccione estado</option>
                  {conValorActual(ESTADOS, activo.estado).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700">Ubicación</label>
                <select name="ubicacion" value={activo.ubicacion || ""} onChange={handleChange} className={`${inputCls} bg-white`}>
                  <option value="">Seleccione ubicación</option>
                  {conValorActual(ubicaciones, activo.ubicacion).map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="flex flex-col md:col-span-2"><label className="text-xs font-semibold text-slate-700">Comentarios</label><textarea name="comentarios" value={activo.comentarios || ""} onChange={handleChange} rows="3" className={inputCls} /></div>
              <div className="flex flex-col md:col-span-2"><label className="text-xs font-semibold text-slate-700">Observaciones</label><textarea name="observaciones" value={activo.observaciones || ""} onChange={handleChange} rows="2" className={inputCls} /></div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setActivo(null)} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Cancelar</button>
              <button type="button" onClick={guardarCambios} disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Guardando..." : "Guardar cambios"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
