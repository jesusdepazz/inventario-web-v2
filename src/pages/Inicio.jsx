import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars -- se usa como <motion.*> en JSX
import { motion, animate, useReducedMotion } from "motion/react";
import { FaArrowRight, FaPlus, FaCarCrash, FaShieldAlt, FaTools, FaLayerGroup, FaCheck } from "react-icons/fa";
import ActivosService from "../services/ActivosServices";
import VehiculosService from "../services/VehiculosServices";
import InmueblesService from "../services/InmueblesServices";
import MobiliarioEquipoService from "../services/MobiliarioEquipoServices";
import { aLista } from "../services/payload";
import { useEmpresa } from "../context/empresa";
import useNombreUsuario from "../hooks/useNombreUsuario";
import { MODULOS, FORMATOS, esAdministrador } from "../components/navegacion";
import Badge from "../components/ui/Badge";
import { tonoEstado } from "../components/ui/tonos";

const EASE = [0.23, 1, 0.32, 1];
const TARJETA = "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]";
const COLOR_TONO = { verde: "bg-emerald-500", ambar: "bg-amber-400", rojo: "bg-rose-500", azul: "bg-blue-500", gris: "bg-slate-300" };

const aparecer = (i = 0) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: EASE, delay: 0.04 * i },
});

const saludo = () => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
};

function Numero({ valor }) {
  const reducir = useReducedMotion();
  const [mostrado, setMostrado] = useState(reducir ? valor : 0);
  useEffect(() => {
    if (reducir) {
      setMostrado(valor);
      return undefined;
    }
    const control = animate(0, valor, { duration: 0.7, ease: EASE, onUpdate: (v) => setMostrado(Math.round(v)) });
    return () => control.stop();
  }, [valor, reducir]);
  return <span className="tabular-nums">{mostrado.toLocaleString("es-GT")}</span>;
}

function Aviso({ icono, tono, titulo, detalle, to }) {
  const Icono = icono;
  const colores = tono === "rojo" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600";
  return (
    <Link to={to} className="group flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 transition hover:border-slate-200 hover:bg-slate-50">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${colores}`}>
        <Icono className="text-sm" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{titulo}</p>
        <p className="truncate text-xs text-slate-500">{detalle}</p>
      </div>
      <FaArrowRight className="text-xs text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
    </Link>
  );
}

export default function Inicio() {
  const { empresa } = useEmpresa();
  const admin = esAdministrador();
  const nombre = useNombreUsuario().split(" ")[0];
  const [datos, setDatos] = useState({ activos: [], alertas: [], polizas: [], danios: [], cargando: true });

  useEffect(() => {
    let vigente = true;
    setDatos((d) => ({ ...d, cargando: true }));
    Promise.allSettled([
      ActivosService.listar({ empresa }),
      VehiculosService.obtenerAlertasPendientes({ empresa }),
      InmueblesService.obtenerTodos({ empresa }),
      MobiliarioEquipoService.obtenerTodos({ empresa }),
    ]).then(([activos, alertas, inmuebles, mobiliario]) => {
      if (!vigente) return;
      const lista = (r) => (r.status === "fulfilled" ? aLista(r.value.data) : []);
      const limite = Date.now() + 30 * 86400000;
      const polizas = lista(inmuebles).flatMap((i) =>
        aLista(i.polizas)
          .filter((p) => p.estado === "activa" && p.fechaRenovacion && new Date(p.fechaRenovacion).getTime() <= limite)
          .map((p) => ({ ...p, inmueble: i.descripcion || i.codificacion }))
      );
      const danios = lista(mobiliario).flatMap((m) =>
        aLista(m.reportesDanios)
          .filter((r) => r.estadoReporte !== "Resuelto")
          .map((r) => ({ ...r, activo: m.codificacion }))
      );
      setDatos({ activos: lista(activos), alertas: lista(alertas), polizas, danios, cargando: false });
    });
    return () => {
      vigente = false;
    };
  }, [empresa]);

  const porCategoria = useMemo(() => {
    const conteo = {};
    datos.activos.forEach((a) => {
      conteo[a.categoria] = (conteo[a.categoria] || 0) + 1;
    });
    return conteo;
  }, [datos.activos]);

  const porEstado = useMemo(() => {
    const conteo = {};
    datos.activos.forEach((a) => {
      const e = a.estado && a.estado !== "-" ? a.estado : "Sin estado";
      conteo[e] = (conteo[e] || 0) + 1;
    });
    return Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [datos.activos]);

  const recientes = useMemo(
    () =>
      [...datos.activos]
        .filter((a) => a.fechaIngreso)
        .sort((a, b) => new Date(b.fechaIngreso) - new Date(a.fechaIngreso))
        .slice(0, 6),
    [datos.activos]
  );

  const total = datos.activos.length;
  const avisos = datos.alertas.length + datos.polizas.length + datos.danios.length;
  const hoy = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      {/* Encabezado */}
      <motion.section
        {...aparecer(0)}
        className="relative overflow-hidden rounded-3xl bg-[radial-gradient(120%_120%_at_100%_0%,#3b82f6_0%,#1e3a8a_45%,#0b1a3d_100%)] p-6 text-white shadow-xl shadow-blue-950/10 md:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-5">
            <img src="/logo_guandy.png" alt="Guandy" className="hidden h-20 w-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)] sm:block" />
            <div>
              <p className="text-sm capitalize text-blue-100/70">{hoy}</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
                {saludo()}{nombre ? `, ${nombre}` : ""}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-blue-100/80">
                Resumen del inventario de <span className="font-semibold text-white">{empresa}</span>: activos por módulo, avisos pendientes y últimos ingresos.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {[["Activos", total], ["Avisos", avisos]].map(([etiqueta, valor]) => (
              <div key={etiqueta} className="rounded-2xl bg-white/10 px-5 py-3 ring-1 ring-inset ring-white/15 backdrop-blur">
                <p className="text-[11px] uppercase tracking-widest text-blue-100/70">{etiqueta}</p>
                <p className="text-3xl font-semibold">{datos.cargando ? "—" : <Numero valor={valor} />}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Módulos */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {MODULOS.map((m, i) => {
          const Icono = m.icono;
          return (
            <motion.div
              key={m.categoria}
              {...aparecer(i + 1)}
              className="group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
            >
              <Link to={`${m.base}/inventario`} className="flex flex-1 flex-col after:absolute after:inset-0 after:rounded-2xl" aria-label={`Inventario de ${m.categoria}`}>
                <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${m.color} text-white shadow-sm`}>
                  <Icono />
                </span>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                  {datos.cargando ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-slate-100" /> : <Numero valor={porCategoria[m.categoria] || 0} />}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">{m.categoria}</p>
                <FaArrowRight className="absolute right-4 top-5 text-xs text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
              </Link>
              {admin && (
                <Link
                  to={`${m.base}/ingresar`}
                  className="relative z-10 mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50 active:scale-[0.97]"
                >
                  <FaPlus className="text-[9px]" /> Crear
                </Link>
              )}
            </motion.div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Avisos */}
        <motion.section {...aparecer(6)} className={`${TARJETA} lg:col-span-2`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Avisos pendientes</h2>
            {avisos > 0 && <Badge tono="ambar">{avisos} por atender</Badge>}
          </div>
          <div className="mt-4 space-y-2">
            {datos.cargando ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-50" />)
            ) : avisos === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl bg-emerald-50/60 py-10 text-center">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-600"><FaCheck /></span>
                <p className="text-sm font-medium text-emerald-800">Todo al día</p>
                <p className="text-xs text-emerald-700/70">No hay alertas de servicio, pólizas por vencer ni daños sin resolver.</p>
              </div>
            ) : (
              <>
                {datos.alertas.slice(0, 4).map((a) => (
                  <Aviso key={`a-${a.id}`} icono={FaCarCrash} tono="rojo" titulo={a.tipoAlerta || "Alerta de servicio"} detalle={`${a.vehiculo?.codificacion || a.vehiculo?.placa || "Vehículo"}${a.notas ? ` · ${a.notas}` : ""}`} to="/activos/vehiculos/inventario" />
                ))}
                {datos.polizas.slice(0, 3).map((p) => (
                  <Aviso key={`p-${p.id}`} icono={FaShieldAlt} tono="ambar" titulo={`Póliza ${p.numeroPoliza} por renovar`} detalle={`${p.inmueble} · ${new Date(p.fechaRenovacion).toLocaleDateString("es-ES")}`} to="/activos/inmuebles/inventario" />
                ))}
                {datos.danios.slice(0, 3).map((r) => (
                  <Aviso key={`d-${r.id}`} icono={FaTools} tono="ambar" titulo={`${r.tipoIncidencia || "Incidencia"} · ${r.estadoReporte || "Pendiente"}`} detalle={`${r.activo || "Mobiliario"} · ${r.descripcion || ""}`} to="/activos/mobiliario-y-equipo/inventario" />
                ))}
              </>
            )}
          </div>
        </motion.section>

        {/* Estados */}
        <motion.section {...aparecer(7)} className={TARJETA}>
          <h2 className="text-sm font-semibold text-slate-900">Activos por estado</h2>
          <div className="mt-4 space-y-3">
            {datos.cargando ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-6 animate-pulse rounded bg-slate-50" />)
            ) : porEstado.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Sin activos registrados.</p>
            ) : (
              porEstado.map(([estado, cantidad], i) => (
                <div key={estado}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{estado}</span>
                    <span className="tabular-nums text-slate-400">{cantidad}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(cantidad / total) * 100}%` }}
                      transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.05 }}
                      className={`h-full rounded-full ${COLOR_TONO[tonoEstado(estado)]}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.section>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Recientes */}
        <motion.section {...aparecer(8)} className={`${TARJETA} lg:col-span-2`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Últimos ingresos</h2>
            <Link to="/equipos/inventario" className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900">
              <FaLayerGroup className="text-[10px]" /> Inventario general
            </Link>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {datos.cargando ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="my-2 h-10 animate-pulse rounded-lg bg-slate-50" />)
            ) : recientes.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Todavía no hay ingresos registrados.</p>
            ) : (
              recientes.map((a) => (
                <div key={`${a.categoria}-${a.id}`} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {a.codificacion || "Sin codificación"}{" "}
                      <span className="font-normal text-slate-400">· {[a.marca, a.modelo].filter((x) => x && x !== "-").join(" ") || a.tipoEquipo}</span>
                    </p>
                    <p className="text-xs text-slate-500">{a.categoria}</p>
                  </div>
                  {a.estado && a.estado !== "-" && <Badge>{a.estado}</Badge>}
                  <span className="hidden w-20 text-right text-xs tabular-nums text-slate-400 sm:block">{new Date(a.fechaIngreso).toLocaleDateString("es-ES")}</span>
                </div>
              ))
            )}
          </div>
        </motion.section>

        {/* Formatos */}
        <motion.section {...aparecer(9)} className={TARJETA}>
          <h2 className="text-sm font-semibold text-slate-900">Formatos</h2>
          <p className="mt-0.5 text-xs text-slate-500">Aplican a los activos de los 5 módulos.</p>
          <div className="mt-3 space-y-1">
            {FORMATOS.map((f) => {
              const Icono = f.icono;
              return (
                <div key={f.nombre} className="group flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-xs text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-700">
                    <Icono />
                  </span>
                  <Link to={f.historial} className="min-w-0 flex-1 truncate text-sm text-slate-700 hover:text-slate-900">{f.nombre}</Link>
                  {admin && (
                    <Link to={f.crear} className="rounded-lg px-2 py-1 text-xs font-medium text-blue-700 opacity-0 transition hover:bg-blue-50 group-hover:opacity-100 focus:opacity-100">
                      Crear
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
