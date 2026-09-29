import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../../utils/toast";
import UbicacionesService from "../../services/UbicacionesServices";
import MobiliarioEquipoService from "../../services/MobiliarioEquipoServices";
import { limpiarPayload } from "../../services/payload";
import { useEmpresa } from "../../context/empresa";
import useFamilias from "../../hooks/useFamilias";
import { preguntarImprimirIngreso } from "../../utils/ingresoBodegaPDF";
import { SEGMENTOS, CAMPOS_INGRESO } from "./config";

export default function MobiliarioCrear() {
  const CATEGORIA = "Mobiliario y equipo";
  const familias = useFamilias(CATEGORIA);
  const { empresa } = useEmpresa();

  const [form, setForm] = useState({
    segmento: "",
    tipoEquipo: "",
    codificacion: "",
    marca: "",
    modelo: "",
    serie: "",
    color: "",
    dimensiones: "",
    numeroChapaActivo: "",
    controlLlaves: "",
    estadoFisicoActual: "",
    catalogoActivos: "",
    ubicacion: "",
    estado: "",
    fechaIngreso: "",
    ordenCompra: "",
    factura: "",
    proveedor: "",
    responsableAnterior: "",
    comentarios: "",
    observaciones: "",
  });

  const [ubicaciones, setUbicaciones] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarUbicaciones = async () => {
      try {
        const res = await UbicacionesService.obtenerTodas();
        let lista = Array.isArray(res.data) ? res.data : res.data?.$values || [];
        setUbicaciones(lista.map((u) => u.nombre));
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
    const obligatorios = ["segmento", "tipoEquipo", "fechaIngreso", "codificacion", "estado", "ubicacion"];
    for (const campo of obligatorios) {
      if (!form[campo]) {
        toast.warn(`El campo "${campo}" es obligatorio.`);
        return;
      }
    }

    try {
      setSaving(true);
      const { data } = await MobiliarioEquipoService.crear(limpiarPayload({ ...form, empresa }, { fechas: ["fechaIngreso"] }));
      toast.success("Mobiliario/Equipo registrado exitosamente");
      preguntarImprimirIngreso({ categoria: CATEGORIA, empresa, activo: data ?? form, campos: CAMPOS_INGRESO });
      navigate("/activos/mobiliario-y-equipo/inventario");
    } catch (error) {
      toast.error(error.response?.data?.title || "Error al crear el elemento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-52px)] bg-slate-50 px-4 py-8 overflow-y-auto">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h1 className="text-xl font-bold text-slate-900">Crear Mobiliario y Equipo</h1>
          <p className="mt-1 text-sm text-slate-600">Muebles de oficina, herramientas y enseres generales · Empresa: <span className="font-semibold">{empresa}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Segmento *</label>
              <select
                name="segmento"
                value={form.segmento}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              >
                <option value="">-- Seleccione segmento --</option>
                {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Familia *</label>
              <select
                name="tipoEquipo"
                value={form.tipoEquipo}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              >
                <option value="">-- Seleccione familia --</option>
                {familias.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Codificación *</label>
              <input
                name="codificacion"
                value={form.codificacion}
                onChange={handleChange}
                placeholder="Código de etiqueta/código de barras"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Fecha de Ingreso *</label>
              <input
                type="date"
                name="fechaIngreso"
                value={form.fechaIngreso}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Marca</label>
              <input
                name="marca"
                value={form.marca}
                onChange={handleChange}
                placeholder="Opcional"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Modelo</label>
              <input
                name="modelo"
                value={form.modelo}
                onChange={handleChange}
                placeholder="Opcional"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Serie</label>
              <input
                name="serie"
                value={form.serie}
                onChange={handleChange}
                placeholder="Opcional"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Color</label>
              <input
                name="color"
                value={form.color}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Dimensiones</label>
              <input
                name="dimensiones"
                value={form.dimensiones}
                onChange={handleChange}
                placeholder="Ej. 1.20m x 0.60m"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Número de Chapa/Activo</label>
              <input
                name="numeroChapaActivo"
                value={form.numeroChapaActivo}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Control de Llaves</label>
              <input
                name="controlLlaves"
                value={form.controlLlaves}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Estado Físico Actual</label>
              <input
                name="estadoFisicoActual"
                value={form.estadoFisicoActual}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Catálogo de Activos</label>
              <input
                name="catalogoActivos"
                value={form.catalogoActivos}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Ubicación *</label>
              <input
                list="ubicaciones-list"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
              <datalist id="ubicaciones-list">
                {ubicaciones.map((u, i) => <option key={i} value={u} />)}
              </datalist>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Estado *</label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              >
                <option value="">-- Seleccione estado --</option>
                <option value="Buen estado">Buen estado</option>
                <option value="Regular">Regular</option>
                <option value="Dañado">Dañado</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Orden de Compra</label>
              <input
                name="ordenCompra"
                value={form.ordenCompra}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Factura</label>
              <input
                name="factura"
                value={form.factura}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Proveedor</label>
              <input
                name="proveedor"
                value={form.proveedor}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Responsable Anterior</label>
              <input
                name="responsableAnterior"
                value={form.responsableAnterior}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Comentarios</label>
              <textarea
                name="comentarios"
                rows="2"
                value={form.comentarios}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Observaciones</label>
              <textarea
                name="observaciones"
                rows="2"
                value={form.observaciones}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
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
              {saving ? "Guardando..." : "Crear registro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
