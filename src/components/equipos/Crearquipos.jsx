import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UbicacionesService from "../../services/UbicacionesServices";
import EquiposService from "../../services/EquiposServices";
import { obtenerCategoria } from "./catalogoActivos";

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
    categoria: "",
    familia: "",
    descripcionBien: "",
    direccion: "",
    fichaTecnica: "",
    numeroChapa: "",
    controlLlaves: "",
    estadoFisico: "",
    color: "",
    dimensiones: "",
    placa: "",
    vin: "",
    kilometraje: "",
    tipoCombustible: "",
    caracteristicas: "",
    multimedia: [],
    polizaSeguro: "",
  });

  const [ubicaciones, setUbicaciones] = useState([]);
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const navigate = useNavigate();

  const categoriaSeleccionada = obtenerCategoria(form.categoria);

  const imprimirRecepcion = () => {
    if (!receipt) return;
    const ventana = window.open("", "_blank", "width=900,height=700");
    if (!ventana) {
      toast.warn("El navegador bloqueó la ventana de impresión.");
      return;
    }
    ventana.document.write(`
      <html><head><title>Recepción de activo</title>
      <style>body{font-family:Arial,sans-serif;margin:40px;color:#172033}h1{font-size:22px;border-bottom:2px solid #173b70;padding-bottom:12px}table{width:100%;border-collapse:collapse;margin-top:24px}td{border:1px solid #ccd3df;padding:10px}td:first-child{font-weight:bold;width:35%;background:#f3f6fa}.firma{margin-top:70px;display:flex;justify-content:space-between}.linea{border-top:1px solid #172033;width:40%;padding-top:8px;text-align:center}</style>
      </head><body><h1>Recepción / ingreso a bodega de activos</h1>
      <p><strong>Guatemalan Candies, S.A.</strong></p>
      <table><tbody>
      <tr><td>Fecha de ingreso</td><td>${receipt.fechaIngreso || "-"}</td></tr>
      <tr><td>Categoría</td><td>${receipt.categoria || "-"}</td></tr>
      <tr><td>Familia</td><td>${receipt.familia || "-"}</td></tr>
      <tr><td>Codificación</td><td>${receipt.codificacion || "-"}</td></tr>
      <tr><td>Descripción / tipo</td><td>${receipt.descripcionBien || receipt.tipoEquipo || "-"}</td></tr>
      <tr><td>Marca y modelo</td><td>${receipt.marca || "-"} / ${receipt.modelo || "-"}</td></tr>
      <tr><td>Serie</td><td>${receipt.serie || "-"}</td></tr>
      <tr><td>Proveedor</td><td>${receipt.proveedor || "-"}</td></tr>
      <tr><td>Orden de compra</td><td>${receipt.ordenCompra || "-"}</td></tr>
      <tr><td>Factura</td><td>${receipt.factura || "-"}</td></tr>
      <tr><td>Ubicación de bodega</td><td>${receipt.ubicacion || "-"}</td></tr>
      </tbody></table><div class="firma"><div class="linea">Entrega</div><div class="linea">Recibe</div></div>
      </body></html>`);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  };

  useEffect(() => {
    const categoriaInicial = new URLSearchParams(window.location.search).get("categoria");
    if (categoriaInicial) setForm((prev) => ({ ...prev, categoria: categoriaInicial }));

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
    if (files) setForm((prev) => ({ ...prev, [name]: e.target.multiple ? Array.from(files) : files?.[0] }));
    else setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const camposObligatorios = ["categoria", "familia", "estado", "ubicacion", "codificacion"];

    for (const campo of camposObligatorios) {
      if (!form[campo]) {
        toast.warn(`El campo "${campo}" es obligatorio.`);
        return;
      }
    }

    const formData = new FormData();
    for (const key in form) {
      if (key === "multimedia" && Array.isArray(form[key])) form[key].forEach((file) => formData.append(key, file));
      else formData.append(key, form[key] ?? "");
    }

    try {
      setSaving(true);
      await EquiposService.crear(formData);
      setReceipt({ ...form });
      toast.success("Activo creado exitosamente");
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
          <h1 className="text-xl font-bold text-slate-900">Ingresar activo al inventario</h1>
          <p className="text-sm text-slate-600">
            Configuración de activos. Los campos con <span className="text-red-600 font-semibold">*</span> son obligatorios.
          </p>
        </div>
        <div className="px-6 py-5 overflow-auto max-h-[calc(100vh-170px)]">
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            <section className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-900 tracking-wide">CLASIFICACIÓN DEL ACTIVO</h2>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col">
                  <label htmlFor="familia" className="text-xs font-semibold text-slate-600">Familia <span className="text-red-600">*</span></label>
                  <select id="familia" name="familia" value={form.familia} onChange={handleChange} required disabled={!categoriaSeleccionada} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800 disabled:bg-slate-100">
                    <option value="">-- Seleccione familia --</option>
                    {categoriaSeleccionada?.familias.map((familia) => <option key={familia} value={familia}>{familia}</option>)}
                  </select>
                </div>
              </div>
            </section>
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
                <h2 className="text-sm font-bold text-slate-900 tracking-wide">INSTRUCCIONES Y DATOS DEL APARTADO</h2>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col md:col-span-3"><label htmlFor="descripcionBien" className="text-xs font-semibold text-slate-600">Descripción del bien</label><input id="descripcionBien" name="descripcionBien" value={form.descripcionBien} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>
                {form.categoria === "Inmuebles" && <>
                  <div className="flex flex-col md:col-span-2"><label htmlFor="direccion" className="text-xs font-semibold text-slate-600">Dirección</label><input id="direccion" name="direccion" value={form.direccion} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>
                  <div className="flex flex-col"><label htmlFor="fichaTecnica" className="text-xs font-semibold text-slate-600">Ficha técnica</label><input id="fichaTecnica" name="fichaTecnica" value={form.fichaTecnica} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>
                  <div className="flex flex-col md:col-span-2"><label htmlFor="multimedia" className="text-xs font-semibold text-slate-600">Documentos e imágenes</label><input id="multimedia" name="multimedia" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" /></div>
                  <div className="flex flex-col"><label htmlFor="polizaSeguro" className="text-xs font-semibold text-slate-600">Póliza de seguro</label><input id="polizaSeguro" name="polizaSeguro" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" /></div>
                </>}
                {form.categoria === "Mobiliario y equipo" && <>
                  <div className="flex flex-col"><label htmlFor="numeroChapa" className="text-xs font-semibold text-slate-600">Número de chapa</label><input id="numeroChapa" name="numeroChapa" value={form.numeroChapa} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>
                  <div className="flex flex-col"><label htmlFor="controlLlaves" className="text-xs font-semibold text-slate-600">Control de llaves</label><select id="controlLlaves" name="controlLlaves" value={form.controlLlaves} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"><option value="">-- Seleccione --</option><option value="Sí">Sí</option><option value="No">No</option></select></div>
                  <div className="flex flex-col"><label htmlFor="estadoFisico" className="text-xs font-semibold text-slate-600">Estado físico actual</label><input id="estadoFisico" name="estadoFisico" value={form.estadoFisico} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>
                  <div className="flex flex-col"><label htmlFor="color" className="text-xs font-semibold text-slate-600">Color</label><input id="color" name="color" value={form.color} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>
                  <div className="flex flex-col"><label htmlFor="dimensiones" className="text-xs font-semibold text-slate-600">Dimensiones</label><input id="dimensiones" name="dimensiones" value={form.dimensiones} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>
                </>}
                {form.categoria === "Vehículos" && <>
                  <div className="flex flex-col"><label htmlFor="placa" className="text-xs font-semibold text-slate-600">Placa</label><input id="placa" name="placa" value={form.placa} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>
                  <div className="flex flex-col"><label htmlFor="vin" className="text-xs font-semibold text-slate-600">VIN / chasis</label><input id="vin" name="vin" value={form.vin} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>
                  <div className="flex flex-col"><label htmlFor="kilometraje" className="text-xs font-semibold text-slate-600">Kilometraje</label><input id="kilometraje" name="kilometraje" value={form.kilometraje} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>
                  <div className="flex flex-col"><label htmlFor="tipoCombustible" className="text-xs font-semibold text-slate-600">Tipo de combustible</label><input id="tipoCombustible" name="tipoCombustible" value={form.tipoCombustible} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>
                </>}
                {(form.categoria === "Equipo de cómputo" || form.categoria === "Otros activos") && <div className="flex flex-col md:col-span-3"><label htmlFor="caracteristicas" className="text-xs font-semibold text-slate-600">Características / ficha técnica</label><textarea id="caracteristicas" name="caracteristicas" value={form.caracteristicas} onChange={handleChange} rows="3" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>}
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
                <h2 className="text-sm font-bold text-slate-900 tracking-wide">DATOS DEL ACTIVO</h2>
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
                    {form.categoria === "Inmuebles" ? <>
                      <option value="Disponible">Disponible</option>
                      <option value="Reservada">Reservada</option>
                      <option value="Vendida">Vendida</option>
                      <option value="Alquilada">Alquilada</option>
                    </> : <>
                      <option value="Buen estado">Buen estado</option>
                      <option value="Inactivo">Reparación</option>
                      <option value="Obsoleto">Obsoleto</option>
                    </>}
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
                {saving ? "Guardando..." : "Crear activo"}
              </button>
            </div>
          </form>
          {receipt && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-bold text-emerald-900">Activo ingresado correctamente</h2>
                <p className="text-sm text-emerald-800">La recepción está lista para imprimir o descargar como PDF desde el diálogo de impresión.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={imprimirRecepcion} className="rounded-xl bg-emerald-700 text-white px-4 py-2.5 text-sm font-semibold hover:bg-emerald-800">Imprimir recepción</button>
                <button type="button" onClick={() => navigate("/equipos/inventario")} className="rounded-xl border border-emerald-300 bg-white text-emerald-900 px-4 py-2.5 text-sm font-semibold hover:bg-emerald-100">Ver inventario</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrearEquipo;