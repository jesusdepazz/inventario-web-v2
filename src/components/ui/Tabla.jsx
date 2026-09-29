import React from "react";
// eslint-disable-next-line no-unused-vars -- se usa como <motion.*> en JSX
import { motion, useReducedMotion } from "motion/react";
import { FaInbox } from "react-icons/fa";

// Primitivas de tabla compartidas por todas las vistas, con estilo de hoja de cálculo:
// cuadrícula completa (columnas y filas divididas), encabezado gris fijo y celdas compactas.
// Las filas entran con un fade corto (solo las primeras, para no ralentizar listas largas)
// y se respeta "reducir movimiento".

const EASE = [0.23, 1, 0.32, 1];
const MAX_ESCALONADO = 12;

// Líneas de la cuadrícula
const LINEA_CELDA = "border-b border-r border-slate-200 last:border-r-0";
const LINEA_ENCABEZADO = "border-b border-r border-slate-300 last:border-r-0";

export function TablaContenedor({ children, className = "" }) {
  return (
    <div className={`relative overflow-auto rounded-lg border border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </div>
  );
}

export function Tabla({ children, className = "" }) {
  return <table className={`min-w-full border-separate border-spacing-0 text-[13px] tabular-nums ${className}`}>{children}</table>;
}

export function THead({ children }) {
  return <thead className="sticky top-0 z-10">{children}</thead>;
}

export function Th({ children, className = "", ...props }) {
  return (
    <th
      className={`whitespace-nowrap bg-gradient-to-b from-slate-50 to-slate-100 px-3 py-2 text-left text-xs font-semibold text-slate-700 ${LINEA_ENCABEZADO} ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function Tr({ children, index = 0, className = "", onClick, seleccionada = false }) {
  const reducir = useReducedMotion();
  return (
    <motion.tr
      initial={reducir ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: EASE, delay: reducir ? 0 : Math.min(index, MAX_ESCALONADO) * 0.02 }}
      onClick={onClick}
      className={`group transition-colors duration-100 ${seleccionada ? "bg-blue-100/70" : "even:bg-slate-50/60 hover:!bg-blue-50"} ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </motion.tr>
  );
}

export function Td({ children, className = "", destacado = false, ...props }) {
  return (
    <td
      className={`px-3 py-1.5 align-middle group-last:border-b-0 ${LINEA_CELDA} ${destacado ? "font-semibold text-slate-900" : "text-slate-700"} ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}

// Fila de encabezado de grupo (p. ej. familia)
export function TrGrupo({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="border-b border-slate-300 bg-slate-200/70 px-3 py-1.5 text-xs font-bold text-slate-800">
        {children}
      </td>
    </tr>
  );
}

export function TrCargando({ colSpan, filas = 5 }) {
  return (
    <>
      {Array.from({ length: filas }).map((_, i) => (
        <tr key={i}>
          <td colSpan={colSpan} className="border-b border-slate-200 px-3 py-2.5">
            <div className="h-3 animate-pulse rounded bg-slate-100" style={{ width: `${88 - ((i * 13) % 35)}%` }} />
          </td>
        </tr>
      ))}
    </>
  );
}

export function TrVacia({ colSpan, children = "No se encontraron registros." }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="flex flex-col items-center gap-3 text-slate-400"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-400">
            <FaInbox />
          </span>
          <span className="text-sm text-slate-500">{children}</span>
        </motion.div>
      </td>
    </tr>
  );
}
