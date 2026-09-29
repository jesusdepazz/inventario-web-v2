import React from "react";
import { SECCIONES_EQUIPO, ESTADOS_EQUIPO } from "./camposEquipo";

const inputCls =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

const conValorActual = (opciones, actual) => (actual && !opciones.includes(actual) ? [actual, ...opciones] : opciones);

// Formulario con todos los campos de Equipo.cs, compartido por crear y editar.
export default function FormularioEquipo({ valores, onChange, familias, ubicaciones }) {
  const control = (c) => {
    const valor = valores[c.name] ?? "";
    switch (c.tipo) {
      case "fecha":
        return <input type="date" name={c.name} value={valor ? String(valor).slice(0, 10) : ""} onChange={onChange} className={inputCls} />;
      case "soloLectura":
        return <input value={valor ? new Date(valor).toLocaleString("es-ES") : "—"} readOnly className={`${inputCls} cursor-not-allowed bg-slate-50 text-slate-500`} />;
      case "area":
        return <textarea name={c.name} rows="3" value={valor} onChange={onChange} className={inputCls} />;
      case "familia":
        return (
          <select name={c.name} value={valor} onChange={onChange} className={inputCls}>
            <option value="">-- Seleccione familia --</option>
            {conValorActual(familias, valor).map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        );
      case "estado":
        return (
          <select name={c.name} value={valor} onChange={onChange} className={inputCls}>
            <option value="">-- Seleccione estado --</option>
            {conValorActual(ESTADOS_EQUIPO, valor).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        );
      case "ubicacion":
        return (
          <>
            <input list="ubicaciones-equipo" name={c.name} value={valor} onChange={onChange} className={inputCls} />
            <datalist id="ubicaciones-equipo">
              {ubicaciones.map((u) => <option key={u} value={u} />)}
            </datalist>
          </>
        );
      default:
        return <input name={c.name} value={valor} onChange={onChange} className={inputCls} />;
    }
  };

  return (
    <div className="space-y-5">
      {SECCIONES_EQUIPO.map((seccion) => (
        <section key={seccion.titulo} className="overflow-hidden rounded-2xl border border-slate-200">
          <h3 className="border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {seccion.titulo}
          </h3>
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
            {seccion.campos.map((c) => (
              <div key={c.name} className={`flex flex-col ${c.tipo === "area" ? "md:col-span-3" : ""}`}>
                <label className="text-xs font-medium text-slate-600">
                  {c.label}{c.requerido ? " *" : ""}
                </label>
                {control(c)}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
