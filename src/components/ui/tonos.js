// Color de un estado según su texto (activos, pólizas, reportes, traslados, hojas...)
const REGLAS = [
  ["rojo", ["fuera de servicio", "dañado", "malo", "obsoleto", "vencid", "cancelad", "anulad", "inactiv", "baja", "pérdida", "perdida"]],
  ["ambar", ["taller", "pendiente", "reportada", "regular", "reparación", "reparacion", "proceso", "revisión", "revision", "reservad", "por renovar", "mantenimiento"]],
  ["azul", ["vendid", "alquilad", "asignad", "en uso"]],
  ["verde", ["bueno", "buen estado", "excelente", "disponible", "activ", "resuelt", "realizado", "atendida", "nuevo", "stock", "operativ", "funcional", "vigente"]],
];

export const tonoEstado = (texto) => {
  const t = String(texto ?? "").toLowerCase();
  if (!t || t === "-") return "gris";
  for (const [tono, claves] of REGLAS) {
    if (claves.some((c) => t.includes(c))) return tono;
  }
  return "gris";
};
