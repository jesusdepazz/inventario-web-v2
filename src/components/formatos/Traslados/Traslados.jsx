import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TrasladosServices from "../../../services/TrasladosServices";
import UbicacionesServices from "../../../services/UbicacionesServices";
import EmpleadosService from "../../../services/EmpleadosServices";
import EquiposService from "../../../services/EquiposServices";

export default function CrearTraslado() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    No: "",
    FechaEmision: "",
    Status: "Pendiente",

    PersonaEntrega: "",
    PersonaRecibe: "",

    CodigoEntrega: "",
    NombreEntrega: "",
    PuestoEntrega: "",
    DepartamentoEntrega: "",

    CodigoRecibe: "",
    NombreRecibe: "",
    PuestoRecibe: "",
    DepartamentoRecibe: "",

    Equipo: "",
    DescripcionEquipo: "",
    Marca: "",
    Modelo: "",
    Serie: "",

    Motivo: "",
    Observaciones: "",

    UbicacionDesde: "",
    UbicacionHasta: ""
  });

  const [ubicaciones, setUbicaciones] = useState([]);
  const [infoEntrega, setInfoEntrega] = useState(null);
  const [infoRecibe, setInfoRecibe] = useState(null);
  const [infoEquipo, setInfoEquipo] = useState(null);
  const [equipos, setEquipos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const res = await UbicacionesServices.obtenerTodas();
        const data = Array.isArray(res.data) ? res.data : res.data?.$values ?? [];
        setUbicaciones(data);
      } catch (err) {
        console.error("Error cargando ubicaciones:", err);
      }
    };
    fetchUbicaciones();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buscarEmpleado = async (codigo, tipo) => {
    const c = (codigo || "").trim();
    if (!c) return;

    try {
      const res = await EmpleadosService.obtenerPorCodigo(c);
      const emp = res.data;

      if (tipo === "entrega") {
        setInfoEntrega(emp);
        setForm((prev) => ({
          ...prev,
          PersonaEntrega: c,
          CodigoEntrega: c,
          NombreEntrega: emp.nombre || "",
          PuestoEntrega: emp.puesto || "",
          DepartamentoEntrega: emp.departamento || ""
        }));
      }

      if (tipo === "recibe") {
        setInfoRecibe(emp);
        setForm((prev) => ({
          ...prev,
          PersonaRecibe: c,
          CodigoRecibe: c,
          NombreRecibe: emp.nombre || "",
          PuestoRecibe: emp.puesto || "",
          DepartamentoRecibe: emp.departamento || ""
        }));
      }
    } catch (err) {
      alert("Empleado no encontrado ❌");
    }
  };

  const buscarEquipo = async (codigo) => {
    const c = (codigo || "").trim();
    if (!c) return;

    try {
      const res = await EquiposService.obtenerPorCodificacion(c);
      const eq = res.data;

      setInfoEquipo(eq);
      setForm((prev) => ({
        ...prev,
        Equipo: c,
        DescripcionEquipo: eq.tipoEquipo || "",
        Marca: eq.marca || "",
        Modelo: eq.modelo || "",
        Serie: eq.serie || "",
        UbicacionDesde: eq.ubicacion || ""
      }));
    } catch (err) {
      alert("Equipo no encontrado ❌");
    }
  };

  const agregarEquipo = () => {
    if (!form.Equipo?.trim()) {
      alert("Ingresá la codificación del equipo ❌");
      return;
    }

    if (!infoEquipo) {
      alert("Primero buscá el equipo (botón Buscar) ❌");
      return;
    }

    const existe = equipos.some((e) => (e.Equipo || "").toLowerCase() === form.Equipo.trim().toLowerCase());
    if (existe) {
      alert("Este equipo ya fue agregado ⚠️");
      return;
    }

    setEquipos((prev) => [
      ...prev,
      {
        Equipo: form.Equipo.trim(),
        DescripcionEquipo: form.DescripcionEquipo,
        Marca: form.Marca,
        Modelo: form.Modelo,
        Serie: form.Serie
      }
    ]);

    setForm((prev) => ({
      ...prev,
      Equipo: "",
      DescripcionEquipo: "",
      Marca: "",
      Modelo: "",
      Serie: ""
    }));

    setInfoEquipo(null);
  };

  const quitarEquipo = (idx) => {
    setEquipos((prev) => prev.filter((_, i) => i !== idx));
  };

  const canSubmit = useMemo(() => {
    return (
      form.No.trim() &&
      form.FechaEmision &&
      form.Motivo.trim() &&
      form.UbicacionHasta &&
      form.CodigoEntrega.trim() &&
      form.CodigoRecibe.trim() &&
      equipos.length > 0
    );
  }, [form, equipos.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (equipos.length === 0) {
      alert("Debe agregar al menos un equipo ❌");
      return;
    }

    if (!form.CodigoEntrega || !form.CodigoRecibe) {
      alert("Debe buscar empleado entrega y recibe ❌");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        No: form.No.trim(),
        FechaEmision: form.FechaEmision ? new Date(form.FechaEmision).toISOString() : null,
        Status: form.Status,

        Motivo: form.Motivo,
        Observaciones: form.Observaciones,
        UbicacionDesde: form.UbicacionDesde,
        UbicacionHasta: form.UbicacionHasta,

        Equipos: equipos,

        EmpleadoEntrega: {
          Codigo: form.CodigoEntrega,
          Nombre: form.NombreEntrega,
          Puesto: form.PuestoEntrega,
          Departamento: form.DepartamentoEntrega
        },

        EmpleadoRecibe: {
          Codigo: form.CodigoRecibe,
          Nombre: form.NombreRecibe,
          Puesto: form.PuestoRecibe,
          Departamento: form.DepartamentoRecibe
        }
      };

      await TrasladosServices.crear(payload);
      alert("Traslado creado correctamente ✅");
      navigate("/trasladosDashboard");
    } catch (err) {
      console.error("Errores de validación:", err.response?.data?.errors);
      alert("Error creando traslado ❌ (ver consola)");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex justify-center px-4 py-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col min-h-0">
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Crear Traslado</h2>
            <p className="text-sm text-gray-500">Completá los datos, agregá equipos y guardá el traslado.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-gray-50 text-gray-700">
              Equipos: {equipos.length}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-gray-50 text-gray-700">
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        <div className="px-6 py-6 overflow-y-auto min-h-0 max-h-[calc(100vh-180px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Datos Generales</h3>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {form.Status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número</label>
                  <input
                    type="text"
                    name="No"
                    value={form.No}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Emisión</label>
                  <input
                    type="date"
                    name="FechaEmision"
                    value={form.FechaEmision}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    name="Status"
                    value={form.Status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Completado">Completado</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Empleados</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Persona Entrega (código)</label>
                      <input
                        type="text"
                        name="PersonaEntrega"
                        value={form.PersonaEntrega}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => buscarEmpleado(form.PersonaEntrega, "entrega")}
                      className="px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                    >
                      Buscar
                    </button>
                  </div>

                  {infoEntrega && (
                    <div className="mt-4 text-sm text-gray-700 border-t pt-3">
                      <div className="font-bold text-gray-900">{infoEntrega.nombre}</div>
                      <div className="text-gray-600">{infoEntrega.puesto}</div>
                      <div className="text-gray-600">{infoEntrega.departamento}</div>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Persona Recibe (código)</label>
                      <input
                        type="text"
                        name="PersonaRecibe"
                        value={form.PersonaRecibe}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => buscarEmpleado(form.PersonaRecibe, "recibe")}
                      className="px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                    >
                      Buscar
                    </button>
                  </div>

                  {infoRecibe && (
                    <div className="mt-4 text-sm text-gray-700 border-t pt-3">
                      <div className="font-bold text-gray-900">{infoRecibe.nombre}</div>
                      <div className="text-gray-600">{infoRecibe.puesto}</div>
                      <div className="text-gray-600">{infoRecibe.departamento}</div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Equipo</h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Equipo (codificación)</label>
                  <input
                    type="text"
                    name="Equipo"
                    value={form.Equipo}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={() => buscarEquipo(form.Equipo)}
                    className="w-full px-5 py-3 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-950 transition"
                  >
                    Buscar
                  </button>
                </div>

                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={agregarEquipo}
                    className="w-full px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {infoEquipo && (
                <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-xs font-semibold text-gray-500">Tipo</div>
                      <div className="font-semibold text-gray-900">{form.DescripcionEquipo || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500">Marca / Modelo</div>
                      <div className="font-semibold text-gray-900">{form.Marca} {form.Modelo}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500">Serie</div>
                      <div className="font-semibold text-gray-900">{form.Serie || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500">Ubicación actual</div>
                      <div className="font-semibold text-gray-900">{form.UbicacionDesde || "-"}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="font-bold text-gray-800">Equipos agregados</div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-gray-50 text-gray-700">
                    {equipos.length}
                  </span>
                </div>

                {equipos.length === 0 ? (
                  <div className="p-5 text-sm text-gray-500">No hay equipos agregados todavía.</div>
                ) : (
                  <div className="max-h-56 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                        <tr className="text-left">
                          <th className="px-4 py-3 font-bold">Codificación</th>
                          <th className="px-4 py-3 font-bold">Descripción</th>
                          <th className="px-4 py-3 font-bold">Marca</th>
                          <th className="px-4 py-3 font-bold">Modelo</th>
                          <th className="px-4 py-3 font-bold">Serie</th>
                          <th className="px-4 py-3 font-bold"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {equipos.map((e, i) => (
                          <tr key={`${e.Equipo}-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-4 py-3 border-t border-gray-200 font-semibold text-blue-800">{e.Equipo}</td>
                            <td className="px-4 py-3 border-t border-gray-200">{e.DescripcionEquipo}</td>
                            <td className="px-4 py-3 border-t border-gray-200">{e.Marca}</td>
                            <td className="px-4 py-3 border-t border-gray-200">{e.Modelo}</td>
                            <td className="px-4 py-3 border-t border-gray-200">{e.Serie}</td>
                            <td className="px-4 py-3 border-t border-gray-200 text-right">
                              <button
                                type="button"
                                onClick={() => quitarEquipo(i)}
                                className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                              >
                                Quitar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Motivo y Ubicaciones</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo</label>
                  <textarea
                    name="Motivo"
                    value={form.Motivo}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
                  <textarea
                    name="Observaciones"
                    value={form.Observaciones}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ubicación Desde</label>
                  <input
                    type="text"
                    name="UbicacionDesde"
                    value={form.UbicacionDesde}
                    readOnly
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-100 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ubicación Hasta</label>
                  <select
                    name="UbicacionHasta"
                    value={form.UbicacionHasta}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  >
                    <option value="">Seleccione...</option>
                    {ubicaciones.map((u) => (
                      <option key={u.id} value={u.nombre}>
                        {u.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/trasladosDashboard")}
                className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                disabled={submitting}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className={`px-6 py-3 rounded-xl font-semibold text-white transition ${
                  canSubmit && !submitting ? "bg-green-600 hover:bg-green-700" : "bg-green-300 cursor-not-allowed"
                }`}
                disabled={!canSubmit || submitting}
              >
                {submitting ? "Creando..." : "Crear Traslado"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}