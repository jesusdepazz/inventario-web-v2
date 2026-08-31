import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UbicacionesService from "../../services/UbicacionesServices";
import EquiposService from "../../services/EquiposServices";

const CrearEquipo = () => {
  const [form, setForm] = useState({
    ordenCompra: "",
    factura: "",
    proveedor: "",
    fechaIngreso: "",
    hojaNo: "",
    fechaActualizacion: "",
    codificacion: "",
    tipoEquipo: "",
    marca: "",
    modelo: "",
    serie: "",
    imei: "",
    numeroAsignado: "",
    extension: "",
    equipoTipo: "",
    responsableAnterior: "",
    estado: "",
    ubicacion: "",
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
        let lista = [];

        if (Array.isArray(res.data)) lista = res.data;
        else if (Array.isArray(res.data?.$values)) lista = res.data.$values;

        setUbicaciones((lista || []).map((u) => u.nombre));
      } catch (error) {
        console.error("Error al cargar ubicaciones:", error);
      }
    };

    cargarUbicaciones();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen") setForm((prev) => ({ ...prev, imagen: files?.[0] }));
    else setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const camposObligatorios = ["equipoTipo", "estado", "marca", "modelo", "ubicacion", "codificacion"];

    for (const campo of camposObligatorios) {
      if (!form[campo]) {
        toast.warn(`El campo "${campo}" es obligatorio.`);
        return;
      }
    }

    const formData = new FormData();
    for (const key in form) formData.append(key, form[key] ?? "");

    try {
      setSaving(true);
      await EquiposService.crear(formData);
      toast.success("✅ Equipo creado exitosamente");
      navigate("/inicio");
    } catch (error) {
      console.error("Error al crear el equipo:", error);

      if (error.response) {
        const data = error.response.data;
        if (data.errors) {
          const mensajes = Object.values(data.errors).flat().join("\n");
          toast.error(mensajes);
        } else if (data.title) toast.error(data.title);
        else if (typeof data === "string") toast.error(data);
        else toast.error("Error desconocido del servidor.");
      } else {
        toast.error("No se pudo conectar con el servidor.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-52px)] flex justify-center pt-6 pb-6 overflow-hidden">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-900">Crear equipo</h1>
          <p className="text-sm text-slate-600">
            Ingresá los datos del equipo. Los campos con <span className="text-red-600 font-semibold">*</span> son obligatorios.
          </p>
        </div>
        <div className="px-6 py-5 overflow-auto max-h-[calc(100vh-170px)]">
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            <section className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-900 tracking-wide">DATOS DE COMPRA</h2>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col">
                  <label htmlFor="ordenCompra" className="text-xs font-semibold text-slate-600">
                    Orden de compra
                  </label>
                  <input
                    type="text"
                    id="ordenCompra"
                    name="ordenCompra"
                    value={form.ordenCompra}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    placeholder="Orden de compra"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="factura" className="text-xs font-semibold text-slate-600">
                    Factura
                  </label>
                  <input
                    type="text"
                    id="factura"
                    name="factura"
                    value={form.factura}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    placeholder="Número de factura"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="proveedor" className="text-xs font-semibold text-slate-600">
                    Proveedor
                  </label>
                  <input
                    type="text"
                    id="proveedor"
                    name="proveedor"
                    value={form.proveedor}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    placeholder="Proveedor"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="fechaIngreso" className="text-xs font-semibold text-slate-600">
                    Fecha Ingreso <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    id="fechaIngreso"
                    name="fechaIngreso"
                    value={form.fechaIngreso}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
              </div>
            </section>
            <section className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-900 tracking-wide">DATOS DE USUARIO</h2>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col">
                  <label htmlFor="hojaNo" className="text-xs font-semibold text-slate-600">
                    Hoja No.
                  </label>
                  <input
                    type="text"
                    id="hojaNo"
                    name="hojaNo"
                    value={form.hojaNo}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    placeholder="Hoja No."
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="fechaActualizacion" className="text-xs font-semibold text-slate-600">
                    Fecha Actualización <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    id="fechaActualizacion"
                    name="fechaActualizacion"
                    value={form.fechaActualizacion}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
              </div>
            </section>
            <section className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-900 tracking-wide">DATOS DE EQUIPO</h2>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col">
                  <label htmlFor="codificacion" className="text-xs font-semibold text-slate-600">
                    Codificación <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="codificacion"
                    name="codificacion"
                    value={form.codificacion}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    placeholder="Codificación"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="tipoEquipo" className="text-xs font-semibold text-slate-600">
                    Equipo
                  </label>
                  <input
                    type="text"
                    id="tipoEquipo"
                    name="tipoEquipo"
                    value={form.tipoEquipo}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    placeholder="Equipo"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="marca" className="text-xs font-semibold text-slate-600">
                    Marca <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="marca"
                    name="marca"
                    value={form.marca}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    placeholder="Marca"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="modelo" className="text-xs font-semibold text-slate-600">
                    Modelo <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="modelo"
                    name="modelo"
                    value={form.modelo}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    placeholder="Modelo"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="serie" className="text-xs font-semibold text-slate-600">
                    Serie
                  </label>
                  <input
                    type="text"
                    id="serie"
                    name="serie"
                    value={form.serie}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    placeholder="Serie"
                  />
                </div>

                {form.equipoTipo === "Equipo móvil" && (
                  <>
                    <div className="flex flex-col">
                      <label htmlFor="imei" className="text-xs font-semibold text-slate-600">
                        IMEI
                      </label>
                      <input
                        type="text"
                        id="imei"
                        name="imei"
                        value={form.imei}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                        placeholder="IMEI"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor="numeroAsignado" className="text-xs font-semibold text-slate-600">
                        Número asignado
                      </label>
                      <input
                        type="text"
                        id="numeroAsignado"
                        name="numeroAsignado"
                        value={form.numeroAsignado}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                        placeholder="Número asignado"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor="extension" className="text-xs font-semibold text-slate-600">
                        Extensión
                      </label>
                      <input
                        type="text"
                        id="extension"
                        name="extension"
                        value={form.extension}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                        placeholder="Extensión"
                      />
                    </div>
                  </>
                )}

                <div className="flex flex-col">
                  <label htmlFor="estado" className="text-xs font-semibold text-slate-600">
                    Estado <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                  >
                    <option value="">-- Seleccione estado --</option>
                    <option value="Buen estado">Buen estado</option>
                    <option value="Inactivo">Reparación</option>
                    <option value="Obsoleto">Obsoleto</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="equipoTipo" className="text-xs font-semibold text-slate-600">
                    Equipo tipo <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="equipoTipo"
                    name="equipoTipo"
                    value={form.equipoTipo}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                  >
                    <option value="">-- Seleccione tipo --</option>
                    <option value="Equipo móvil">Equipo móvil</option>
                    <option value="Equipo de escritorio">Equipo de escritorio</option>
                    <option value="Equipo comunal">Equipo comunal</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="responsableAnterior" className="text-xs font-semibold text-slate-600">
                    Responsable Anterior
                  </label>
                  <input
                    type="text"
                    id="responsableAnterior"
                    name="responsableAnterior"
                    value={form.responsableAnterior}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    placeholder="Responsable Anterior"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="ubicacion" className="text-xs font-semibold text-slate-600">
                    Ubicación <span className="text-red-600">*</span>
                  </label>
                  <input
                    list="ubicaciones-list"
                    id="ubicacion"
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    placeholder="Ubicación"
                  />
                  <datalist id="ubicaciones-list">
                    {ubicaciones.map((u, i) => (
                      <option key={i} value={u} />
                    ))}
                  </datalist>
                </div>

                <div className="flex flex-col md:col-span-3">
                  <label htmlFor="comentarios" className="text-xs font-semibold text-slate-600">
                    Comentarios
                  </label>
                  <input
                    type="text"
                    id="comentarios"
                    name="comentarios"
                    value={form.comentarios}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    placeholder="Comentarios"
                  />
                </div>

                <div className="flex flex-col md:col-span-3">
                  <label htmlFor="observaciones" className="text-xs font-semibold text-slate-600">
                    Observaciones
                  </label>
                  <input
                    type="text"
                    id="observaciones"
                    name="observaciones"
                    value={form.observaciones}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
                    placeholder="Observaciones"
                  />
                </div>
              </div>
            </section>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/inicio")}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-900 text-white px-6 py-3 text-sm font-semibold hover:bg-blue-950 disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Crear Equipo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearEquipo;