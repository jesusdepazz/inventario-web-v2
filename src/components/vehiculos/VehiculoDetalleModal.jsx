import React, { useEffect, useState } from "react";
import { toast } from "../../utils/toast";
import VehiculosService from "../../services/VehiculosServices";
import { aLista, limpiarPayload } from "../../services/payload";
import Modal from "../Modal";
import { inputCls, labelCls, fecha } from "../modalEstilos";
// eslint-disable-next-line no-unused-vars -- se usa como <motion.*> en JSX
import { motion } from "motion/react";
import { TablaContenedor, Tabla, THead, Th, TBody, Tr, Td, TrVacia } from "../ui/Tabla";
import Badge from "../ui/Badge";

const hoy = () => new Date().toISOString().slice(0, 10);
const moneda = (v) => (v != null ? Number(v).toLocaleString("es-GT", { style: "currency", currency: "GTQ" }) : "-");
const mensaje = (error, fallback) => error?.response?.data?.mensaje || fallback;

// Tabla + formulario de alta para un tipo de registro del vehículo.
// campos: [{ name, label, type?, opciones?, requerido?, ancho? }]
function Seccion({ columnas, filas, campos, inicial, onAgregar, onEliminar, vacio, textoBoton }) {
  const [form, setForm] = useState(inicial);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    const faltante = campos.find((c) => c.requerido && !form[c.name]);
    if (faltante) {
      toast.warn(`El campo "${faltante.label}" es obligatorio`);
      return;
    }
    try {
      setSaving(true);
      await onAgregar(form);
      setForm(inicial);
    } catch {
      // el error ya se notificó; se conserva lo capturado para corregirlo
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <TablaContenedor>
        <Tabla>
          <THead>
            <tr>
              {columnas.map((c) => <Th key={c.label}>{c.label}</Th>)}
              {onEliminar && <Th />}
            </tr>
          </THead>
          <TBody>
            {filas.length > 0 ? (
              filas.map((f, i) => (
                <Tr key={f.id} index={i}>
                  {columnas.map((c, j) => <Td key={c.label} destacado={j === 0}>{c.render(f)}</Td>)}
                  {onEliminar && (
                    <Td className="text-right">
                      <button onClick={() => onEliminar(f)} className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 focus:opacity-100">Eliminar</button>
                    </Td>
                  )}
                </Tr>
              ))
            ) : (
              <TrVacia colSpan={columnas.length + 1}>{vacio}</TrVacia>
            )}
          </TBody>
        </Tabla>
      </TablaContenedor>

      <form onSubmit={enviar} className="grid grid-cols-1 gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 md:grid-cols-3">
        {campos.map((c) => (
          <div key={c.name} className={c.ancho ? "md:col-span-3" : ""}>
            <label className={labelCls}>{c.label}{c.requerido ? " *" : ""}</label>
            {c.opciones ? (
              <select name={c.name} value={form[c.name]} onChange={handleChange} className={inputCls}>
                {c.opciones.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : c.type === "textarea" ? (
              <textarea name={c.name} rows="2" value={form[c.name]} onChange={handleChange} className={inputCls} />
            ) : (
              <input type={c.type || "text"} name={c.name} value={form[c.name]} onChange={handleChange} className={inputCls} />
            )}
          </div>
        ))}
        <div className="md:col-span-3 flex justify-end">
          <button type="submit" disabled={saving} className="rounded-xl bg-blue-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Guardando..." : textoBoton}
          </button>
        </div>
      </form>
    </div>
  );
}

const TABS = [
  { key: "kilometraje", label: "Kilometraje y asignación" },
  { key: "alertas", label: "Alertas de servicio" },
  { key: "mantenimientos", label: "Mantenimientos" },
  { key: "reparaciones", label: "Reparaciones" },
  { key: "fallas", label: "Bitácora de fallas / daños" },
  { key: "polizas", label: "Pólizas de seguro" },
  { key: "reportes-estado-fisico", label: "Estado físico" },
];

export default function VehiculoDetalleModal({ vehiculoId, onClose, onCambio }) {
  const [vehiculo, setVehiculo] = useState(null);
  const [tab, setTab] = useState("kilometraje");
  const [km, setKm] = useState("");
  const [asignacion, setAsignacion] = useState({ responsable: "", kilometraje: "", fecha: hoy() });

  const cargar = async () => {
    try {
      const { data } = await VehiculosService.obtenerPorId(vehiculoId);
      setVehiculo(data);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el vehículo");
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehiculoId]);

  // Ejecuta una acción contra la API, recarga el detalle y avisa a la lista.
  const ejecutar = async (accion, exito, fallo) => {
    try {
      await accion();
      toast.success(exito);
      await cargar();
      onCambio?.();
    } catch (error) {
      console.error(error);
      toast.error(mensaje(error, fallo));
      throw error;
    }
  };

  const eliminar = (tipo) => (registro) => {
    if (!window.confirm("¿Eliminar este registro?")) return;
    ejecutar(() => VehiculosService.eliminarRegistro(vehiculoId, tipo, registro.id), "Registro eliminado", "No se pudo eliminar").catch(() => {});
  };

  const actualizarKm = (e) => {
    e.preventDefault();
    if (km === "" || Number(km) < 0) {
      toast.warn("Ingrese un kilometraje válido");
      return;
    }
    ejecutar(() => VehiculosService.actualizarKilometraje(vehiculoId, km), "Kilometraje actualizado", "No se pudo actualizar el kilometraje")
      .then(() => setKm(""))
      .catch(() => {});
  };

  const asignar = (e) => {
    e.preventDefault();
    if (!asignacion.responsable.trim() || asignacion.kilometraje === "") {
      toast.warn("Responsable y kilometraje son obligatorios");
      return;
    }
    ejecutar(
      () => VehiculosService.asignar(vehiculoId, limpiarPayload(asignacion, { fechas: ["fecha"], numeros: ["kilometraje"] })),
      "Vehículo asignado",
      "No se pudo asignar el vehículo"
    )
      .then(() => setAsignacion({ responsable: "", kilometraje: "", fecha: hoy() }))
      .catch(() => {});
  };

  const v = vehiculo;

  const cambiarEstadoMantenimiento = (m, estado) =>
    ejecutar(
      () => VehiculosService.actualizarMantenimiento(vehiculoId, m.id, { ...m, vehiculo: null, estado, fechaRealizada: estado === "Realizado" ? new Date().toISOString() : m.fechaRealizada }),
      "Mantenimiento actualizado",
      "No se pudo actualizar"
    ).catch(() => {});

  const cambiarEstadoFalla = (f, estado) => {
    const solucion = estado === "Resuelta" ? window.prompt("Solución aplicada:", f.solucion || "") ?? f.solucion : f.solucion;
    ejecutar(() => VehiculosService.actualizarFalla(vehiculoId, f.id, { ...f, vehiculo: null, estado, solucion }), "Falla actualizada", "No se pudo actualizar").catch(() => {});
  };

  const selectEstado = (valor, opciones, onChange) => (
    <select value={valor || opciones[0]} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">
      {opciones.map((o) => <option key={o}>{o}</option>)}
    </select>
  );

  return (
    <Modal
      titulo="Control del vehículo"
      subtitulo={v ? `${v.codificacion || ""} · ${v.marca || ""} ${v.modelo || ""} ${v.modeloAnio || ""} · Placa ${v.placa || "-"} · VIN ${v.vin || "-"}` : "Cargando..."}
      onClose={onClose}
      ancho="max-w-6xl"
    >
      {v && (
        <>
          <div className="-mx-1 flex flex-wrap gap-1 rounded-2xl bg-slate-100/80 p-1">
            {TABS.map((t) => {
              const pendientes = t.key === "alertas" ? aLista(v.alertasServicio).filter((a) => !a.atendida).length : 0;
              const activa = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${activa ? "text-slate-900" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {activa && (
                    <motion.span
                      layoutId="vehiculo-tab"
                      className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    {t.label}
                    {pendientes > 0 && <span className="grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">{pendientes}</span>}
                  </span>
                </button>
              );
            })}
          </div>

          {tab === "kilometraje" && (
            <section className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-3"><p className={labelCls}>Km actual</p><p className="text-lg font-bold">{v.kilometrajeActual ?? "-"}</p><p className="text-xs text-slate-500">Actualizado: {fecha(v.fechaUltimaActualizacionKm)}</p></div>
                <div className="rounded-xl border border-slate-200 p-3"><p className={labelCls}>Km al asignar</p><p className="text-lg font-bold">{v.kilometrajeAsignacion ?? "-"}</p><p className="text-xs text-slate-500">Asignado: {fecha(v.fechaAsignacion)}</p></div>
                <div className="rounded-xl border border-slate-200 p-3"><p className={labelCls}>Responsable actual</p><p className="font-semibold">{v.responsableActual || "-"}</p><p className="text-xs text-slate-500">Anterior: {v.responsableAnterior || "-"}</p></div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <form onSubmit={actualizarKm} className="rounded-xl border border-slate-200 p-4 space-y-3">
                  <h4 className="font-semibold text-slate-900">Actualizar kilometraje</h4>
                  <div><label className={labelCls}>Nuevo kilometraje</label><input type="number" min={v.kilometrajeActual ?? 0} value={km} onChange={(e) => setKm(e.target.value)} className={inputCls} /></div>
                  <button type="submit" className="rounded-xl bg-blue-900 px-5 py-2 text-sm font-semibold text-white">Actualizar</button>
                </form>

                <form onSubmit={asignar} className="rounded-xl border border-slate-200 p-4 space-y-3">
                  <h4 className="font-semibold text-slate-900">Asignar vehículo (control de kilometraje al asignar)</h4>
                  <div><label className={labelCls}>Responsable *</label><input value={asignacion.responsable} onChange={(e) => setAsignacion((p) => ({ ...p, responsable: e.target.value }))} className={inputCls} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>Kilometraje al asignar *</label><input type="number" min={v.kilometrajeActual ?? 0} value={asignacion.kilometraje} onChange={(e) => setAsignacion((p) => ({ ...p, kilometraje: e.target.value }))} className={inputCls} /></div>
                    <div><label className={labelCls}>Fecha</label><input type="date" value={asignacion.fecha} onChange={(e) => setAsignacion((p) => ({ ...p, fecha: e.target.value }))} className={inputCls} /></div>
                  </div>
                  <button type="submit" className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white">Asignar</button>
                </form>
              </div>
            </section>
          )}

          {tab === "alertas" && (
            <Seccion
              vacio="Sin alertas. Las alertas se generan automáticamente por mantenimientos próximos y pólizas por renovar."
              filas={aLista(v.alertasServicio)}
              columnas={[
                { label: "Tipo", render: (a) => a.tipoAlerta || "-" },
                { label: "Fecha", render: (a) => fecha(a.fechaAlerta) },
                { label: "Km", render: (a) => a.kilometrajeAlerta ?? "-" },
                { label: "Notas", render: (a) => a.notas || "-" },
                { label: "Estado", render: (a) => (a.atendida ? <Badge>Atendida</Badge> : (
                  <button onClick={() => ejecutar(() => VehiculosService.atenderAlerta(a.id), "Alerta atendida", "No se pudo atender").catch(() => {})} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Atender</button>
                )) },
              ]}
              inicial={{ tipoAlerta: "Servicio", fechaAlerta: hoy(), kilometrajeAlerta: "", notas: "" }}
              campos={[
                { name: "tipoAlerta", label: "Tipo de alerta", requerido: true },
                { name: "fechaAlerta", label: "Fecha", type: "date" },
                { name: "kilometrajeAlerta", label: "Kilometraje", type: "number" },
                { name: "notas", label: "Notas", type: "textarea", ancho: true },
              ]}
              textoBoton="Crear alerta"
              onAgregar={(f) => ejecutar(() => VehiculosService.crearAlerta(vehiculoId, limpiarPayload(f, { fechas: ["fechaAlerta"], numeros: ["kilometrajeAlerta"] })), "Alerta creada", "No se pudo crear la alerta")}
              onEliminar={eliminar("alertas")}
            />
          )}

          {tab === "mantenimientos" && (
            <Seccion
              vacio="Sin mantenimientos programados."
              filas={aLista(v.mantenimientos)}
              columnas={[
                { label: "Tipo", render: (m) => m.tipoMantenimiento || "-" },
                { label: "Programado", render: (m) => fecha(m.fechaProgramada) },
                { label: "Km programado", render: (m) => m.kilometrajeProgramado ?? "-" },
                { label: "Realizado", render: (m) => fecha(m.fechaRealizada) },
                { label: "Descripción", render: (m) => m.descripcion || "-" },
                { label: "Estado", render: (m) => selectEstado(m.estado, ["Pendiente", "Vencido", "Realizado"], (e) => cambiarEstadoMantenimiento(m, e)) },
              ]}
              inicial={{ tipoMantenimiento: "Preventivo", fechaProgramada: "", kilometrajeProgramado: "", descripcion: "" }}
              campos={[
                { name: "tipoMantenimiento", label: "Tipo", opciones: ["Preventivo", "Correctivo", "Cambio de aceite", "Llantas", "Frenos", "Otro"] },
                { name: "fechaProgramada", label: "Fecha programada", type: "date" },
                { name: "kilometrajeProgramado", label: "Km programado", type: "number" },
                { name: "descripcion", label: "Descripción", type: "textarea", ancho: true },
              ]}
              textoBoton="Programar mantenimiento"
              onAgregar={(f) => {
                if (!f.fechaProgramada && !f.kilometrajeProgramado) {
                  toast.warn("Indique la fecha o el kilometraje programado");
                  return Promise.reject(new Error("validación"));
                }
                return ejecutar(() => VehiculosService.crearMantenimiento(vehiculoId, limpiarPayload(f, { fechas: ["fechaProgramada"], numeros: ["kilometrajeProgramado"] })), "Mantenimiento programado", "No se pudo programar");
              }}
              onEliminar={eliminar("mantenimientos")}
            />
          )}

          {tab === "reparaciones" && (
            <Seccion
              vacio="Sin reparaciones registradas."
              filas={aLista(v.historialReparaciones)}
              columnas={[
                { label: "Fecha", render: (h) => fecha(h.fecha) },
                { label: "Taller", render: (h) => h.taller || "-" },
                { label: "Descripción", render: (h) => h.descripcion || "-" },
                { label: "Costo", render: (h) => moneda(h.costo) },
                { label: "Km", render: (h) => h.kilometrajeEnReparacion ?? "-" },
                { label: "Factura", render: (h) => h.factura || "-" },
              ]}
              inicial={{ fecha: hoy(), taller: "", descripcion: "", costo: "", kilometrajeEnReparacion: "", factura: "" }}
              campos={[
                { name: "fecha", label: "Fecha", type: "date", requerido: true },
                { name: "taller", label: "Taller" },
                { name: "factura", label: "Factura" },
                { name: "costo", label: "Costo (Q)", type: "number" },
                { name: "kilometrajeEnReparacion", label: "Km en reparación", type: "number" },
                { name: "descripcion", label: "Descripción", type: "textarea", ancho: true, requerido: true },
              ]}
              textoBoton="Registrar reparación"
              onAgregar={(f) => ejecutar(() => VehiculosService.crearReparacion(vehiculoId, limpiarPayload(f, { numeros: ["costo", "kilometrajeEnReparacion"] })), "Reparación registrada", "No se pudo registrar")}
              onEliminar={eliminar("reparaciones")}
            />
          )}

          {tab === "fallas" && (
            <Seccion
              vacio="Sin fallas, daños ni incidencias reportadas."
              filas={aLista(v.bitacoraFallas)}
              columnas={[
                { label: "Fecha", render: (f) => fecha(f.fecha) },
                { label: "Descripción", render: (f) => f.descripcionFalla || "-" },
                { label: "Reportado por", render: (f) => f.reportadoPor || "-" },
                { label: "Solución", render: (f) => f.solucion || "-" },
                { label: "Estado", render: (f) => selectEstado(f.estado, ["Reportada", "En revisión", "Resuelta"], (e) => cambiarEstadoFalla(f, e)) },
              ]}
              inicial={{ fecha: hoy(), descripcionFalla: "", reportadoPor: "", estado: "Reportada" }}
              campos={[
                { name: "fecha", label: "Fecha", type: "date", requerido: true },
                { name: "reportadoPor", label: "Reportado por" },
                { name: "estado", label: "Estado", opciones: ["Reportada", "En revisión", "Resuelta"] },
                { name: "descripcionFalla", label: "Descripción de la falla / daño", type: "textarea", ancho: true, requerido: true },
              ]}
              textoBoton="Reportar falla"
              onAgregar={(f) => ejecutar(() => VehiculosService.crearFalla(vehiculoId, f), "Falla reportada", "No se pudo reportar")}
              onEliminar={eliminar("fallas")}
            />
          )}

          {tab === "polizas" && (
            <Seccion
              vacio="Sin pólizas registradas."
              filas={aLista(v.polizasSeguro)}
              columnas={[
                { label: "No. póliza", render: (p) => p.numeroPoliza || "-" },
                { label: "Aseguradora", render: (p) => p.aseguradora || "-" },
                { label: "Cobertura", render: (p) => p.tipoCobertura || "-" },
                { label: "Inicio", render: (p) => fecha(p.fechaInicio) },
                { label: "Renovación", render: (p) => fecha(p.fechaRenovacion) },
                { label: "Prima", render: (p) => moneda(p.prima) },
                { label: "Estado", render: (p) => (p.estado ? <Badge className="capitalize">{p.estado}</Badge> : "-") },
              ]}
              inicial={{ numeroPoliza: "", aseguradora: "", tipoCobertura: "Todo riesgo", fechaInicio: "", fechaRenovacion: "", prima: "", estado: "activa" }}
              campos={[
                { name: "numeroPoliza", label: "No. póliza", requerido: true },
                { name: "aseguradora", label: "Aseguradora", requerido: true },
                { name: "tipoCobertura", label: "Tipo de cobertura", opciones: ["Todo riesgo", "Responsabilidad civil", "Daños a terceros", "Otra"] },
                { name: "fechaInicio", label: "Fecha inicio", type: "date", requerido: true },
                { name: "fechaRenovacion", label: "Fecha renovación", type: "date", requerido: true },
                { name: "prima", label: "Prima (Q)", type: "number" },
                { name: "estado", label: "Estado", opciones: ["activa", "vencida", "cancelada"] },
              ]}
              textoBoton="Agregar póliza"
              onAgregar={(f) => ejecutar(() => VehiculosService.crearPoliza(vehiculoId, limpiarPayload(f, { fechas: ["fechaInicio", "fechaRenovacion"], numeros: ["prima"] })), "Póliza registrada", "No se pudo registrar la póliza")}
              onEliminar={eliminar("polizas")}
            />
          )}

          {tab === "reportes-estado-fisico" && (
            <Seccion
              vacio="Sin reportes de estado físico."
              filas={aLista(v.reportesEstadoFisico)}
              columnas={[
                { label: "Fecha", render: (r) => fecha(r.fecha) },
                { label: "Estado general", render: (r) => r.estadoGeneral || "-" },
                { label: "Carrocería", render: (r) => r.detalleCarroceria || "-" },
                { label: "Interior", render: (r) => r.detalleInterior || "-" },
                { label: "Mecánico", render: (r) => r.detalleMecanico || "-" },
                { label: "Evaluado por", render: (r) => r.evaluadoPor || "-" },
                { label: "Imágenes", render: (r) => (r.imagenesUrl ? <a href={r.imagenesUrl} target="_blank" rel="noreferrer" className="text-blue-800 underline">Ver</a> : "-") },
              ]}
              inicial={{ fecha: hoy(), estadoGeneral: "Bueno", detalleCarroceria: "", detalleInterior: "", detalleMecanico: "", evaluadoPor: "", imagenesUrl: "" }}
              campos={[
                { name: "fecha", label: "Fecha", type: "date", requerido: true },
                { name: "estadoGeneral", label: "Estado general", opciones: ["Excelente", "Bueno", "Regular", "Malo"] },
                { name: "evaluadoPor", label: "Evaluado por" },
                { name: "detalleCarroceria", label: "Carrocería", type: "textarea", ancho: true },
                { name: "detalleInterior", label: "Interior", type: "textarea", ancho: true },
                { name: "detalleMecanico", label: "Mecánico", type: "textarea", ancho: true },
                { name: "imagenesUrl", label: "Enlace a imágenes", ancho: true },
              ]}
              textoBoton="Registrar reporte"
              onAgregar={(f) => ejecutar(() => VehiculosService.crearReporteEstadoFisico(vehiculoId, f), "Reporte registrado", "No se pudo registrar el reporte")}
              onEliminar={eliminar("reportes-estado-fisico")}
            />
          )}
        </>
      )}
    </Modal>
  );
}
