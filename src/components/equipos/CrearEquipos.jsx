import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../../utils/toast";
import UbicacionesService from "../../services/UbicacionesServices";
import EquiposService from "../../services/EquiposServices";
import { aLista } from "../../services/payload";
import { useEmpresa } from "../../context/empresa";
import useFamilias from "../../hooks/useFamilias";
import { preguntarImprimirIngreso } from "../../utils/ingresoBodegaPDF";
import FormularioEquipo from "./FormularioEquipo";
import { CAMPOS_EQUIPO, FORM_EQUIPO_INICIAL, CAMPOS_INGRESO_EQUIPO } from "./camposEquipo";

const CATEGORIA = "Equipo de cómputo";

const mensajeError = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data) return data;
  return data?.mensaje || data?.title || fallback;
};

const CrearEquipoComputo = () => {
  const familias = useFamilias(CATEGORIA);
  const { empresa } = useEmpresa();
  const [form, setForm] = useState(FORM_EQUIPO_INICIAL);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    UbicacionesService.obtenerTodas()
      .then((res) => setUbicaciones(aLista(res.data).map((u) => u.nombre)))
      .catch((error) => console.error("Error al cargar ubicaciones:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const faltante = CAMPOS_EQUIPO.find((c) => c.requerido && !String(form[c.name] ?? "").trim());
    if (faltante) {
      toast.warn(`El campo "${faltante.label}" es obligatorio.`);
      return;
    }

    // El endpoint recibe [FromForm] EquipoDTO
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v ?? ""));
    formData.append("empresa", empresa);

    try {
      setSaving(true);
      const { data } = await EquiposService.crear(formData);
      toast.success("Equipo de cómputo registrado exitosamente");
      preguntarImprimirIngreso({ categoria: CATEGORIA, empresa, activo: { ...form, ...(data ?? {}) }, campos: CAMPOS_INGRESO_EQUIPO });
      navigate("/activos/equipo-de-computo/inventario");
    } catch (error) {
      toast.error(mensajeError(error, "Error al crear el equipo de cómputo"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-52px)] overflow-y-auto bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Crear equipo de cómputo</h1>
          <p className="mt-1 text-sm text-slate-500">
            Hardware informático, servidores y dispositivos periféricos · Empresa: <span className="font-semibold text-slate-700">{empresa}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <FormularioEquipo valores={form} onChange={handleChange} familias={familias} ubicaciones={ubicaciones} />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/inicio")}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.97]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-950 active:scale-[0.97] disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Crear equipo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearEquipoComputo;
