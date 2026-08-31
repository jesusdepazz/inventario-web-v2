import { useEffect, useMemo, useState } from "react";
import BajaActivosService from "../../../services/BajaActivosServices";
import UbicacionesService from "../../../services/UbicacionesServices";
import EquiposService from "../../../services/EquiposServices";

export default function BajaActivosForm() {
  const hoy = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [form, setForm] = useState({
    numeroBaja: "",
    fechaBaja: hoy,
    codificacionEquipo: "",
    motivoBaja: [],
    detallesBaja: "",
    ubicacionActual: "",
    ubicacionDestino: "",
  });

  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ type: "", text: "" });
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const res = await UbicacionesService.obtenerTodas();
        const data = Array.isArray(res.data) ? res.data : res.data?.$values ?? [];
        const filtradas = data.filter((u) => {
          const n = String(u?.nombre || "").toLowerCase();
          return (
            n === "robado" ||
            n === "donación" ||
            n === "donacion" ||
            n === "devolución" ||
            n === "devolucion"
          );
        });
        setUbicaciones(filtradas);
      } catch {
        setUbicaciones([]);
      }
    };

    fetchUbicaciones();
  }, []);

  const buscarUbicacionActual = async (codificacion) => {
    const cod = String(codificacion || "").trim();
    if (!cod) {
      setForm((prev) => ({ ...prev, ubicacionActual: "" }));
      return;
    }

    setBuscandoUbicacion(true);
    try {
      const res = await EquiposService.obtenerPorCodificacion(cod);
      const ubic = res?.data?.ubicacion ? String(res.data.ubicacion) : "No registrada";
      setForm((prev) => ({ ...prev, ubicacionActual: ubic }));
    } catch {
      setForm((prev) => ({ ...prev, ubicacionActual: "No encontrada" }));
    } finally {
      setBuscandoUbicacion(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "codificacionEquipo") {
      buscarUbicacionActual(value);
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;

    setForm((prev) => {
      const actual = Array.isArray(prev.motivoBaja) ? prev.motivoBaja : [];
      if (checked) return { ...prev, motivoBaja: [...actual, value] };
      return { ...prev, motivoBaja: actual.filter((m) => m !== value) };
    });
  };

  const limpiar = () => {
    setMensaje({ type: "", text: "" });
    setForm({
      numeroBaja: "",
      fechaBaja: hoy,
      codificacionEquipo: "",
      motivoBaja: [],
      detallesBaja: "",
      ubicacionActual: "",
      ubicacionDestino: "",
    });
  };

  const canSubmit =
    form.fechaBaja &&
    String(form.codificacionEquipo || "").trim() &&
    form.motivoBaja.length > 0 &&
    String(form.ubicacionDestino || "").trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ type: "", text: "" });

    if (!canSubmit) {
      setMensaje({
        type: "error",
        text: "Completa los campos obligatorios: Fecha, Codificación, Motivo y Ubicación destino.",
      });
      return;
    }

    setLoading(true);

    try {
      await BajaActivosService.crear({
        ...form,
        codificacionEquipo: String(form.codificacionEquipo || "").trim(),
        motivoBaja: form.motivoBaja.join(", "),
      });

      setMensaje({ type: "success", text: "Baja registrada correctamente." });
      limpiar();
    } catch (error) {
      console.error(error);
      setMensaje({ type: "error", text: "Error al registrar la baja." });
    } finally {
      setLoading(false);
    }
  };

  const motivoOptions = ["Obsolencia", "Venta", "Robo", "Donación", "Otro"];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-white shadow-md rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Registrar Baja</h2>
            <p className="text-sm text-gray-500">
              Registrá una baja y dejá trazabilidad del motivo y destino.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-gray-50 text-gray-700">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="px-6 py-6">
          {mensaje.text && (
            <div
              className={`mb-6 px-4 py-3 rounded-xl border text-sm font-semibold ${
                mensaje.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {mensaje.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  No. de Baja
                </label>
                <input
                  type="text"
                  name="numeroBaja"
                  value={form.numeroBaja}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Ej: 001"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Baja <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fechaBaja"
                  value={form.fechaBaja}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Codificación del Equipo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="codificacionEquipo"
                  value={form.codificacionEquipo}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Ej: EQ-IT-000123"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ubicación Actual
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="ubicacionActual"
                    value={form.ubicacionActual}
                    readOnly
                    className="w-full border border-gray-300 bg-gray-50 rounded-xl px-4 py-3 text-gray-700"
                    placeholder="Se completa automáticamente"
                  />
                  {buscandoUbicacion && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">
                      buscando...
                    </span>
                  )}
                </div>
              </div>

              <div className="md:col-span-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ubicación Destino <span className="text-red-500">*</span>
                </label>
                <select
                  name="ubicacionDestino"
                  value={form.ubicacionDestino}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Seleccione...</option>
                  {ubicaciones.map((u) => (
                    <option key={u.id} value={u.nombre}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Solo se muestran ubicaciones destino (Robado / Donación / Devolución).
                </p>
              </div>

              <div className="md:col-span-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motivo de Baja <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {motivoOptions.map((motivo) => (
                    <label
                      key={motivo}
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${
                        form.motivoBaja.includes(motivo)
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          value={motivo}
                          checked={form.motivoBaja.includes(motivo)}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4"
                        />
                        <span className="text-sm font-semibold text-gray-800">{motivo}</span>
                      </div>

                      {form.motivoBaja.includes(motivo) && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-600 text-white">
                          ok
                        </span>
                      )}
                    </label>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {form.motivoBaja.map((m) => (
                    <span
                      key={m}
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700 border"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-12">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Justificación / Detalles
                </label>
                <textarea
                  name="detallesBaja"
                  value={form.detallesBaja}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Escribí una justificación adicional..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={limpiar}
                className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Limpiar
              </button>

              <button
                type="submit"
                disabled={loading || !canSubmit}
                className={`px-8 py-3 rounded-xl font-semibold text-white transition ${
                  loading || !canSubmit
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Guardando..." : "Registrar Baja"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}