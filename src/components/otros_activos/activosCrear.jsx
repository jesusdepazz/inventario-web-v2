import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../../utils/toast";
import UbicacionesService from "../../services/UbicacionesServices";
import OtrosActivosService from "../../services/OtrosActivosServices";
import { limpiarPayload, aLista } from "../../services/payload";
import { useEmpresa } from "../../context/empresa";
import useFamilias from "../../hooks/useFamilias";
import { preguntarImprimirIngreso } from "../../utils/ingresoBodegaPDF";
import { FORM_INICIAL, ESTADOS, CAMPOS_TEXTO, CAMPOS_INGRESO, mensajeError } from "./campos";

const inputCls =
  "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800";

export default function ActivosCrear() {
  const familias = useFamilias("Otros activos");
  const { empresa } = useEmpresa();

  const [form, setForm] = useState(FORM_INICIAL);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarUbicaciones = async () => {
      try {
        const res = await UbicacionesService.obtenerTodas();
        setUbicaciones(aLista(res.data).map((u) => u.nombre));
      } catch (error) {
        console.error("Error al cargar ubicaciones:", error);
      }
    };
    cargarUbicaciones();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const obligatorios = ["tipoEquipo", "fechaIngreso", "codificacion", "estado", "ubicacion"];
    for (const campo of obligatorios) {
      if (!form[campo]) {
        toast.warn(`El campo "${campo}" es obligatorio.`);
        return;
      }
    }

    try {
      setSaving(true);
      const payload = limpiarPayload({ ...form, empresa }, { fechas: ["fechaIngreso"] });
      const { data } = await OtrosActivosService.crear(payload);
      toast.success("Activo registrado exitosamente");
      preguntarImprimirIngreso({ categoria: "Otros activos", empresa, activo: data ?? payload, campos: CAMPOS_INGRESO });
      navigate("/activos/otros-activos/inventario");
    } catch (error) {
      toast.error(mensajeError(error, "Error al crear el activo"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-52px)] bg-slate-50 px-4 py-8 overflow-y-auto">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h1 className="text-xl font-bold text-slate-900">Crear Otro Activo</h1>
          <p className="mt-1 text-sm text-slate-600">Registro de bienes no clasificados en otras categorías · Empresa: <span className="font-semibold">{empresa}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Familia *</label>
              <select name="tipoEquipo" value={form.tipoEquipo} onChange={handleChange} className={inputCls}>
                <option value="">-- Seleccione familia --</option>
                {familias.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {CAMPOS_TEXTO.map((c) => (
              <div key={c.name} className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700">{c.label}</label>
                <input name={c.name} value={form[c.name]} onChange={handleChange} className={inputCls} />
              </div>
            ))}

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Fecha de Ingreso *</label>
              <input type="date" name="fechaIngreso" value={form.fechaIngreso} onChange={handleChange} className={inputCls} />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Ubicación *</label>
              <input list="ubicaciones-list" name="ubicacion" value={form.ubicacion} onChange={handleChange} className={inputCls} />
              <datalist id="ubicaciones-list">
                {ubicaciones.map((u, i) => <option key={i} value={u} />)}
              </datalist>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Estado *</label>
              <select name="estado" value={form.estado} onChange={handleChange} className={inputCls}>
                <option value="">-- Seleccione estado --</option>
                {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Comentarios</label>
              <textarea name="comentarios" rows="3" value={form.comentarios} onChange={handleChange} className={inputCls} />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Observaciones</label>
              <textarea name="observaciones" rows="2" value={form.observaciones} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/inicio")}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Crear activo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
