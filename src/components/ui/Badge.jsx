import React from "react";
import { tonoEstado } from "./tonos";

const TONOS = {
  verde: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  ambar: "bg-amber-50 text-amber-700 ring-amber-600/20",
  rojo: "bg-rose-50 text-rose-700 ring-rose-600/15",
  azul: "bg-blue-50 text-blue-700 ring-blue-600/15",
  gris: "bg-slate-100 text-slate-600 ring-slate-500/15",
};

export default function Badge({ children, tono, className = "" }) {
  const t = tono || tonoEstado(children);
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONOS[t]} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}
