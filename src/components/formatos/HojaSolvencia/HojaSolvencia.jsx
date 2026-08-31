import React, { useState, useEffect, useMemo } from "react";
import { FaClipboardList, FaSave } from "react-icons/fa";
import HojasService from "../../../services/HojasServices";
import SolvenciasService from "../../../services/HojasSolvencias";

export default function HojaSolvencia() {
  const [hojas, setHojas] = useState([]);
  const [selectedHoja, setSelectedHoja] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [detalleHoja, setDetalleHoja] = useState(null);
  const [solvenciaNo, setSolvenciaNo] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [loadingHojas, setLoadingHojas] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchHojas = async () => {
      try {
        setLoadingHojas(true);
        const data = await HojasService.listarHojas();
        const normalizadas = data?.$values ?? data ?? [];
        setHojas(Array.isArray(normalizadas) ? normalizadas : []);
      } catch (err) {
        console.error("Error cargando hojas:", err);
        setHojas([]);
      } finally {
        setLoadingHojas(false);
      }
    };
    fetchHojas();
  }, []);

  const normalize = (v) =>
    (v ?? "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const hojasFiltradas = useMemo(() => {
    const q = normalize(busqueda);
    if (!q) return hojas;

    return (hojas || []).filter((h) => {
      const blob = normalize(
        `${h?.hojaNo ?? ""} ${h?.estado ?? ""} ${h?.jefeInmediato ?? ""} ${h?.observaciones ?? ""}`
      );
      return blob.includes(q);
    });
  }, [hojas, busqueda]);

  const handleHojaChange = (id) => {
    setSelectedHoja(id);
    const hoja = (hojas || []).find((h) => (h?.id ?? "").toString() === id);
    setDetalleHoja(hoja || null);
    setMensaje("");
  };

  const limpiar = () => {
    setObservaciones("");
    setSolvenciaNo("");
    setSelectedHoja("");
    setDetalleHoja(null);
    setMensaje("");
    setBusqueda("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!solvenciaNo.trim()) {
      setMensaje("Debes ingresar el número de solvencia.");
      return;
    }

    if (!selectedHoja) {
      setMensaje("Debes seleccionar una hoja de responsabilidad.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await SolvenciasService.crearSolvencia(
        selectedHoja,
        observaciones,
        solvenciaNo.trim()
      );

      setMensaje(`✅ Solvencia creada con No: ${res?.solvenciaNo ?? solvenciaNo.trim()}`);
      setObservaciones("");
      setSolvenciaNo("");
      setSelectedHoja("");
      setDetalleHoja(null);
    } catch (err) {
      console.error("Error creando solvencia:", err);
      setMensaje("❌ Error al crear la solvencia.");
    } finally {
      setSubmitting(false);
    }
  };

  const badgeEstado = (estado) => {
    const e = normalize(estado);
    if (e === "activa") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (e === "inactiva") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="w-full min-h-[calc(100vh-56px)] px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-600 text-white shadow">
                <FaClipboardList />
              </span>
              Crear Solvencia
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Generá la solvencia seleccionando una hoja y registrando el número correspondiente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold text-slate-700">
                  No. de Solvencia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={solvenciaNo}
                  onChange={(e) => setSolvenciaNo(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="Ej: SOLV-2026-001"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-slate-700">
                  Buscar hoja
                </label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="Buscar por hoja, estado, jefe..."
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-slate-700">
                Selecciona una Hoja de Responsabilidad <span className="text-red-500">*</span>
              </label>

              <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                  Mostrando: <span className="text-slate-900">{hojasFiltradas.length}</span>
                </span>

                <button
                  type="button"
                  onClick={limpiar}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Limpiar
                </button>
              </div>

              <select
                value={selectedHoja}
                onChange={(e) => handleHojaChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                disabled={loadingHojas}
              >
                <option value="">
                  {loadingHojas ? "Cargando hojas..." : "-- Selecciona una hoja --"}
                </option>
                {hojasFiltradas.map((h) => (
                  <option key={h.id} value={h.id}>
                    Hoja {h.hojaNo} |{" "}
                    {h.fechaCreacion ? new Date(h.fechaCreacion).toLocaleDateString("es-ES") : "—"} |{" "}
                    {h.estado ?? "—"}
                  </option>
                ))}
              </select>
            </div>

            {detalleHoja && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">Detalle de la hoja</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Verificá que sea la hoja correcta antes de generar la solvencia.
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeEstado(
                      detalleHoja.estado
                    )}`}
                  >
                    {detalleHoja.estado ?? "—"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <p className="text-[11px] font-semibold text-slate-500">Hoja No</p>
                    <p className="text-sm font-bold text-slate-900">{detalleHoja.hojaNo}</p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <p className="text-[11px] font-semibold text-slate-500">Fecha creación</p>
                    <p className="text-sm font-bold text-slate-900">
                      {detalleHoja.fechaCreacion
                        ? new Date(detalleHoja.fechaCreacion).toLocaleDateString("es-ES")
                        : "—"}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <p className="text-[11px] font-semibold text-slate-500">Tipo</p>
                    <p className="text-sm font-bold text-slate-900">{detalleHoja.tipoHoja ?? "—"}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block mb-2 font-semibold text-slate-700">
                Observaciones
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                rows={4}
                placeholder="Escribí observaciones adicionales (opcional)..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center justify-center gap-2 w-full rounded-2xl py-3 px-4 font-bold shadow transition-all ${
                submitting
                  ? "bg-slate-300 text-slate-700 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <FaSave />
              {submitting ? "Creando..." : "Crear Solvencia"}
            </button>

            {mensaje && (
              <div
                className={`rounded-2xl p-4 text-center font-semibold border ${
                  mensaje.startsWith("✅")
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : mensaje.startsWith("❌")
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {mensaje}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}