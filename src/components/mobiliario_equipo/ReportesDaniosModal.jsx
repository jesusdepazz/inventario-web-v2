import React, { useState } from "react";
import { toast } from "../../utils/toast";
import MobiliarioEquipoService from "../../services/MobiliarioEquipoServices";
import { aLista } from "../../services/payload";
import Modal from "../Modal";
import { inputCls, labelCls, fecha } from "../modalEstilos";
import { TablaContenedor, Tabla, THead, Th, TBody, Tr, Td, TrVacia } from "../ui/Tabla";
import Badge from "../ui/Badge";

const INICIAL = { tipoIncidencia: "Daño", descripcion: "", reportadoPor: "", estadoReporte: "Pendiente" };

export default function ReportesDaniosModal({ item, onClose, onGuardado }) {
  const [reportes, setReportes] = useState(aLista(item.reportesDanios));
  const [form, setForm] = useState(INICIAL);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.descripcion.trim()) {
      toast.warn("Ingrese la descripción del reporte");
      return;
    }
    try {
      setSaving(true);
      await MobiliarioEquipoService.crearReporteDanio(item.id, form);
      const { data } = await MobiliarioEquipoService.obtenerPorId(item.id);
      setReportes(aLista(data.reportesDanios));
      setForm(INICIAL);
      toast.success("Reporte registrado");
      onGuardado?.();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.mensaje || "No se pudo registrar el reporte");
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstado = async (reporte, estadoReporte) => {
    try {
      await MobiliarioEquipoService.actualizarReporteDanio(item.id, reporte.id, { ...reporte, estadoReporte, mobiliarioEquipo: null });
      setReportes((prev) => prev.map((r) => (r.id === reporte.id ? { ...r, estadoReporte } : r)));
      toast.success("Estado actualizado");
      onGuardado?.();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo actualizar el estado");
    }
  };

  return (
    <Modal titulo="Reportes de daños e incidencias" subtitulo={`${item.codificacion || ""} · ${item.tipoEquipo || ""}`} onClose={onClose}>
      <form onSubmit={guardar} className="grid grid-cols-1 gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 md:grid-cols-3">
        <div>
          <label className={labelCls}>Tipo de incidencia</label>
          <select name="tipoIncidencia" value={form.tipoIncidencia} onChange={handleChange} className={inputCls}>
            <option>Daño</option>
            <option>Pérdida</option>
            <option>Mantenimiento</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Reportado por</label>
          <input name="reportadoPor" value={form.reportadoPor} onChange={handleChange} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Estado</label>
          <select name="estadoReporte" value={form.estadoReporte} onChange={handleChange} className={inputCls}>
            <option>Pendiente</option>
            <option>En proceso</option>
            <option>Resuelto</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <label className={labelCls}>Descripción *</label>
          <textarea name="descripcion" rows="2" value={form.descripcion} onChange={handleChange} className={inputCls} />
        </div>
        <div className="md:col-span-3 flex justify-end">
          <button type="submit" disabled={saving} className="rounded-xl bg-blue-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Guardando..." : "Registrar reporte"}
          </button>
        </div>
      </form>

      <TablaContenedor>
        <Tabla>
          <THead>
            <tr>
              <Th>Fecha</Th>
              <Th>Tipo</Th>
              <Th>Descripción</Th>
              <Th>Reportado por</Th>
              <Th>Estado</Th>
            </tr>
          </THead>
          <TBody>
            {reportes.length > 0 ? (
              reportes.map((r, i) => (
                <Tr key={r.id} index={i}>
                  <Td destacado className="whitespace-nowrap">{fecha(r.fechaReporte)}</Td>
                  <Td><Badge tono={r.tipoIncidencia === "Mantenimiento" ? "azul" : "rojo"}>{r.tipoIncidencia || "-"}</Badge></Td>
                  <Td>{r.descripcion || "-"}</Td>
                  <Td>{r.reportadoPor || "-"}</Td>
                  <Td>
                    <select value={r.estadoReporte || "Pendiente"} onChange={(e) => cambiarEstado(r, e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:ring-4 focus:ring-blue-100">
                      <option>Pendiente</option>
                      <option>En proceso</option>
                      <option>Resuelto</option>
                    </select>
                  </Td>
                </Tr>
              ))
            ) : (
              <TrVacia colSpan={5}>Sin reportes registrados.</TrVacia>
            )}
          </TBody>
        </Tabla>
      </TablaContenedor>
    </Modal>
  );
}
