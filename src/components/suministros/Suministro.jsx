import { useEffect, useMemo, useState } from "react";
import SuministrosService from "../../services/SuministrosService";
import UbicacionesService from "../../services/UbicacionesServices";
import { FaBoxOpen, FaSave, FaBroom } from "react-icons/fa";

export default function Suministros() {
  const [formData, setFormData] = useState({
    nombreProducto: "",
    ubicacionProducto: "",
    cantidadActual: "",
  });

  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(true);
  const [mensaje, setMensaje] = useState({ type: "", text: "" });

  const fechaHoy = useMemo(() => {
    return new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cantidadActual") {
      if (value === "") return setFormData((p) => ({ ...p, [name]: "" }));
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return;
      return setFormData((p) => ({ ...p, [name]: value }));
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const limpiar = () => {
    setFormData({
      nombreProducto: "",
      ubicacionProducto: "",
      cantidadActual: "",
    });
    setMensaje({ type: "", text: "" });
  };

  useEffect(() => {
    const cargarUbicaciones = async () => {
      try {
        const response = await UbicacionesService.obtenerTodas();
        setUbicaciones(response.data || []);
      } catch (error) {
        console.error("Error cargando ubicaciones", error);
        setUbicaciones([]);
        setMensaje({
          type: "error",
          text: "No se pudieron cargar las ubicaciones.",
        });
      } finally {
        setLoadingUbicaciones(false);
      }
    };

    cargarUbicaciones();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ type: "", text: "" });

    if (!formData.nombreProducto.trim()) {
      setLoading(false);
      return setMensaje({ type: "error", text: "Ingresá el nombre del producto." });
    }
    if (!formData.ubicacionProducto) {
      setLoading(false);
      return setMensaje({ type: "error", text: "Seleccioná una ubicación." });
    }
    if (formData.cantidadActual === "" || Number(formData.cantidadActual) < 0) {
      setLoading(false);
      return setMensaje({ type: "error", text: "La cantidad inicial debe ser 0 o mayor." });
    }

    try {
      await SuministrosService.crear({
        ...formData,
        nombreProducto: formData.nombreProducto.trim(),
        cantidadActual: Number(formData.cantidadActual),
      });

      setMensaje({ type: "success", text: "Suministro creado exitosamente." });
      setFormData({
        nombreProducto: "",
        ubicacionProducto: "",
        cantidadActual: "",
      });
    } catch (error) {
      console.error(error);
      setMensaje({ type: "error", text: "Error al crear el suministro." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white shadow-md rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="text-center">
              <p className="font-bold text-lg text-blue-600 flex items-center justify-center gap-2">
                <FaBoxOpen />
                Crear Suministro
              </p>
              <p className="font-semibold text-gray-600">{fechaHoy}</p>
            </div>
          </div>
          <div className="p-6">
            {mensaje?.text && (
              <div
                className={`mb-5 rounded-xl border p-4 text-sm font-semibold ${
                  mensaje.type === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {mensaje.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  name="nombreProducto"
                  value={formData.nombreProducto}
                  onChange={handleChange}
                  required
                  placeholder="Ejemplo: Tornillos de 1”"
                  className="mt-2 w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Usá un nombre claro para encontrarlo rápido.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Ubicación
                </label>

                {loadingUbicaciones ? (
                  <div className="mt-2 rounded-xl border border-gray-200 p-3 text-gray-500 bg-gray-50">
                    Cargando ubicaciones...
                  </div>
                ) : (
                  <select
                    name="ubicacionProducto"
                    value={formData.ubicacionProducto}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Seleccione una ubicación</option>
                    {ubicaciones.map((u) => (
                      <option key={u.id} value={u.nombre}>
                        {u.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Cantidad inicial
                </label>
                <input
                  type="number"
                  min="0"
                  name="cantidadActual"
                  value={formData.cantidadActual}
                  onChange={handleChange}
                  required
                  placeholder="Ejemplo: 10"
                  className="mt-2 w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={limpiar}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold transition"
                >
                  <FaBroom /> Limpiar
                </button>

                <button
                  type="submit"
                  disabled={loading || loadingUbicaciones}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition text-white ${
                    loading || loadingUbicaciones
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <FaSave />
                  {loading ? "Guardando..." : "Crear suministro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}