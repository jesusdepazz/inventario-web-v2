import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import EmpleadosExternosService from "../../services/EmpleadosExternosServices";

export default function EditarEmpleadoExterno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await EmpleadosExternosService.obtener(id);
        const { codigoEmpleado, nombre, puesto, documento, telefono, proyecto } = res.data;
        setForm({ codigoEmpleado, nombre, puesto, documento, telefono: telefono ?? "", proyecto: proyecto ?? "" });
      } catch {
        toast.error("No se pudo cargar el empleado externo");
        navigate("/externos/lista");
      }
    };
    cargar();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await EmpleadosExternosService.actualizar(id, {
        ...form,
        telefono: form.telefono.trim() || null,
      });
      toast.success("Empleado externo actualizado correctamente");
      navigate("/externos/lista");
    } catch (err) {
      const mensaje = err.response?.data?.mensaje || "Error al actualizar";
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  if (!form) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-500">
        Cargando...
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b border-blue-300 pb-2">
          Editar Empleado Externo
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">
                Código de empleado <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="codigoEmpleado"
                value={form.codigoEmpleado}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">
                Puesto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="puesto"
                value={form.puesto}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">
                Documento (DPI / Pasaporte) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="documento"
                value={form.documento}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">
                Teléfono <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-gray-700 text-sm">
                Proyecto <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input
                type="text"
                name="proyecto"
                value={form.proyecto}
                onChange={handleChange}
                className="input-field"
                placeholder="Nombre del proyecto"
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              type="submit"
              disabled={guardando}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Actualizar"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/externos/lista")}
              className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 text-sm font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
