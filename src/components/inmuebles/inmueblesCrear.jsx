import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../../utils/toast";
import InmueblesService from "../../services/InmueblesServices";
import { limpiarPayload } from "../../services/payload";
import { useEmpresa } from "../../context/empresa";
import useFamilias from "../../hooks/useFamilias";
import { preguntarImprimirIngreso } from "../../utils/ingresoBodegaPDF";
import { CAMPOS_INGRESO } from "./config";

export default function InmueblesCrear() {
  const familias = useFamilias("Inmuebles");
  const { empresa } = useEmpresa();

  const [form, setForm] = useState({
    codificacion: "",
    nombreCatalogoActivo: "",
    descripcion: "",
    direccion: "",
    estado: "disponible",
    numeroOrdenCompra: "",
    fechaOrdenCompra: "",
    numeroFacturaElectronica: "",
    nombreProveedor: "",
    fechaFactura: "",
    fichaTecnica: "",
  });

  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const obligatorios = ["codificacion", "nombreCatalogoActivo", "descripcion", "direccion", "estado"];
    for (const campo of obligatorios) {
      if (!form[campo]) {
        toast.warn(`El campo "${campo}" es obligatorio.`);
        return;
      }
    }

    const payload = limpiarPayload({ ...form, empresa }, { fechas: ["fechaOrdenCompra", "fechaFactura"] });

    try {
      setSaving(true);
      const { data } = await InmueblesService.crear(payload);
      toast.success("Inmueble registrado exitosamente");
      preguntarImprimirIngreso({ categoria: "Inmuebles", empresa, activo: data ?? payload, campos: CAMPOS_INGRESO, numero: data?.id });
      navigate("/activos/inmuebles/inventario");
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Error al guardar el inmueble");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-52px)] bg-slate-50 px-4 py-8 overflow-y-auto">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h1 className="text-xl font-bold text-slate-900">Registrar Inmueble</h1>
          <p className="mt-1 text-sm text-slate-600">Registro de bienes raíces y propiedades de la organización · Empresa: <span className="font-semibold">{empresa}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Familia *</label>
              <select
                name="nombreCatalogoActivo"
                value={form.nombreCatalogoActivo}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              >
                <option value="">-- Seleccione tipo de inmueble --</option>
                {familias.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Codificación * <span className="font-normal text-slate-500">(se usa en hojas, traslados, pases y bajas)</span></label>
              <input
                name="codificacion"
                value={form.codificacion}
                onChange={handleChange}
                placeholder="Ej. INM-001"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Descripción *</label>
              <input
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Ej. Oficina central piso 3 / Terreno zona industrial"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Dirección *</label>
              <input
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Dirección o zona"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Estado *</label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              >
                <option value="disponible">Disponible</option>
                <option value="reservada">Reservada</option>
                <option value="vendida">Vendida</option>
                <option value="alquilada">Alquilada</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Número de Orden de Compra</label>
              <input
                name="numeroOrdenCompra"
                value={form.numeroOrdenCompra}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Fecha de Orden de Compra</label>
              <input
                type="date"
                name="fechaOrdenCompra"
                value={form.fechaOrdenCompra}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Número de Factura Electrónica</label>
              <input
                name="numeroFacturaElectronica"
                value={form.numeroFacturaElectronica}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Fecha de Factura</label>
              <input
                type="date"
                name="fechaFactura"
                value={form.fechaFactura}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700">Nombre del Proveedor</label>
              <input
                name="nombreProveedor"
                value={form.nombreProveedor}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Ficha Técnica</label>
              <textarea
                name="fichaTecnica"
                rows="3"
                value={form.fichaTecnica}
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
              {saving ? "Guardando..." : "Registrar inmueble"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
