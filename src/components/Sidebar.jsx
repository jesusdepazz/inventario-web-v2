import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars -- se usa como <motion.*> en JSX
import { motion, AnimatePresence } from "motion/react";
import { FaHome, FaLayerGroup, FaListUl, FaChevronRight, FaSignOutAlt } from "react-icons/fa";
import { EMPRESAS, useEmpresa } from "../context/empresa";
import { MODULOS, VISTAS_MODULO, FORMATOS, esAdministrador } from "./navegacion";
import useNombreUsuario from "../hooks/useNombreUsuario";

const EASE = [0.23, 1, 0.32, 1];

function ItemNav({ to, icono: Icono, children, activo }) {
  return (
    <Link
      to={to}
      className={`relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${activo ? "text-white" : "text-blue-100/70 hover:bg-white/5 hover:text-white"}`}
    >
      {activo && (
        <motion.span layoutId="nav-activo" className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-inset ring-white/10" transition={{ type: "spring", bounce: 0.15, duration: 0.4 }} />
      )}
      {Icono && <Icono className="relative shrink-0 text-[13px] opacity-80" />}
      <span className="relative truncate">{children}</span>
    </Link>
  );
}

function Grupo({ icono, titulo, abierto, onToggle, activo, children }) {
  const Icono = icono;
  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={abierto}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${activo ? "text-white" : "text-blue-100/70 hover:bg-white/5 hover:text-white"}`}
      >
        <Icono className="shrink-0 text-[13px] opacity-80" />
        <span className="flex-1 truncate text-left">{titulo}</span>
        <motion.span animate={{ rotate: abierto ? 90 : 0 }} transition={{ duration: 0.2, ease: EASE }} className="text-[10px] opacity-60">
          <FaChevronRight />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="ml-[18px] mt-0.5 flex flex-col gap-0.5 border-l border-white/10 py-1 pl-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubItem({ to, activo, children }) {
  return (
    <Link
      to={to}
      className={`rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${activo ? "bg-white/10 font-medium text-white" : "text-blue-100/60 hover:bg-white/5 hover:text-white"}`}
    >
      {children}
    </Link>
  );
}

// Contenido del menú; se usa en la barra lateral fija y en el panel móvil
export function SidebarContenido() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { empresa, setEmpresa } = useEmpresa();
  const admin = esAdministrador();
  const nombre = useNombreUsuario();
  const rol = localStorage.getItem("rol") || "";

  const grupoActual = () => {
    const m = MODULOS.find((x) => pathname.startsWith(x.base));
    if (m) return m.categoria;
    const f = FORMATOS.find((x) => pathname === x.crear || pathname === x.historial);
    return f ? f.nombre : null;
  };
  const [abierto, setAbierto] = useState(grupoActual);

  useEffect(() => {
    const g = grupoActual();
    if (g) setAbierto(g);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggle = (g) => setAbierto((a) => (a === g ? null : g));

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div className="flex h-full flex-col bg-[radial-gradient(120%_60%_at_0%_0%,#1e3a8a_0%,#0b1a3d_55%,#07122b_100%)] text-white">
      <div className="flex flex-col items-center px-5 pb-5 pt-7 text-center">
        <motion.img
          src="/logo_guandy.png"
          alt="Guandy"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="h-24 w-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
        />
        <p className="mt-3 text-base font-semibold tracking-[0.2em]">INVENTARIO</p>
        <p className="text-[11px] text-blue-200/60">Control de activos</p>
      </div>

      <div className="px-4 pb-3">
        <label className="mb-1 block px-1 text-[10px] font-semibold uppercase tracking-widest text-blue-200/50">Empresa</label>
        <select
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white outline-none transition focus:border-white/25 focus:ring-4 focus:ring-white/10 [&>option]:text-slate-900"
        >
          {EMPRESAS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        <div className="space-y-0.5">
          <ItemNav to="/inicio" icono={FaHome} activo={pathname === "/inicio"}>Inicio</ItemNav>
          <ItemNav to="/equipos/inventario" icono={FaLayerGroup} activo={pathname.startsWith("/equipos/inventario")}>Inventario general</ItemNav>
          {admin && <ItemNav to="/activos/catalogos" icono={FaListUl} activo={pathname === "/activos/catalogos"}>Catálogo de activos</ItemNav>}
        </div>

        <div>
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-blue-200/40">Módulos</p>
          <div className="space-y-0.5">
            {MODULOS.map((m) => (
              <Grupo key={m.categoria} icono={m.icono} titulo={m.categoria} abierto={abierto === m.categoria} onToggle={() => toggle(m.categoria)} activo={pathname.startsWith(m.base)}>
                {VISTAS_MODULO.filter((v) => admin || !v.admin).map((v) => (
                  <SubItem key={v.clave} to={`${m.base}/${v.clave}`} activo={pathname === `${m.base}/${v.clave}`}>{v.label}</SubItem>
                ))}
              </Grupo>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-blue-200/40">Formatos</p>
          <div className="space-y-0.5">
            {FORMATOS.map((f) => (
              <Grupo key={f.nombre} icono={f.icono} titulo={f.nombre} abierto={abierto === f.nombre} onToggle={() => toggle(f.nombre)} activo={pathname === f.crear || pathname === f.historial}>
                {admin && <SubItem to={f.crear} activo={pathname === f.crear}>Crear</SubItem>}
                <SubItem to={f.historial} activo={pathname === f.historial}>Historial</SubItem>
              </Grupo>
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-sm font-semibold uppercase">
            {nombre.trim().charAt(0) || "U"}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium">{nombre}</p>
            <p className="truncate text-[11px] text-blue-200/60">{rol || "Sin rol"}</p>
          </div>
          <button
            onClick={cerrarSesion}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="grid h-9 w-9 place-items-center rounded-lg text-blue-100/60 transition hover:bg-rose-500/15 hover:text-rose-300 active:scale-95"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </div>
  );
}

// Barra lateral fija (escritorio)
export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 shadow-2xl shadow-blue-950/20 lg:block">
      <SidebarContenido />
    </aside>
  );
}
