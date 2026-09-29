import { FaBuilding, FaChair, FaLaptop, FaCar, FaBoxes, FaFileSignature, FaCheckCircle, FaSignOutAlt, FaTrashAlt, FaExchangeAlt } from "react-icons/fa";

// Los 5 módulos de activos. Cada uno tiene inventario, crear, editar y eliminar.
export const MODULOS = [
  { categoria: "Inmuebles", corto: "Inmuebles", icono: FaBuilding, base: "/activos/inmuebles", color: "from-sky-500 to-blue-600" },
  { categoria: "Mobiliario y equipo", corto: "Mobiliario", icono: FaChair, base: "/activos/mobiliario-y-equipo", color: "from-amber-400 to-orange-500" },
  { categoria: "Equipo de cómputo", corto: "Cómputo", icono: FaLaptop, base: "/activos/equipo-de-computo", color: "from-violet-500 to-indigo-600" },
  { categoria: "Vehículos", corto: "Vehículos", icono: FaCar, base: "/activos/vehiculos", color: "from-emerald-500 to-teal-600" },
  { categoria: "Otros activos", corto: "Otros", icono: FaBoxes, base: "/activos/otros-activos", color: "from-rose-500 to-pink-600" },
];

export const VISTAS_MODULO = [
  { clave: "inventario", label: "Inventario", admin: false },
  { clave: "ingresar", label: "Crear", admin: true },
  { clave: "editar", label: "Editar", admin: true },
  { clave: "eliminar", label: "Eliminar", admin: true },
];

// Formatos: aplican a los activos de los 5 módulos
export const FORMATOS = [
  { nombre: "Hojas de responsabilidad", icono: FaFileSignature, crear: "/formatos/hojaderesponsabilidad", historial: "/formatos/listahojasresponsabilidad" },
  { nombre: "Solvencias", icono: FaCheckCircle, crear: "/formatos/hojasSolvencias", historial: "/formatos/listahojasSolvencias" },
  { nombre: "Pases de salida con retorno", icono: FaSignOutAlt, crear: "/formatos/trasladosRetorno/crear", historial: "/formatos/trasladosRetorno/lista" },
  { nombre: "Bajas", icono: FaTrashAlt, crear: "/formatos/bajaAtivos", historial: "/formatos/ListabajaAtivos" },
  { nombre: "Traslados", icono: FaExchangeAlt, crear: "/formatos/traslados/crear", historial: "/formatos/traslados/lista" },
];

export const esAdministrador = () => {
  try {
    return String(localStorage.getItem("rol") || "").trim().toLowerCase() === "administrador";
  } catch {
    return false;
  }
};

// Título de la página actual para el encabezado
export const tituloDeRuta = (pathname) => {
  if (pathname.startsWith("/inicio")) return "Inicio";
  if (pathname.startsWith("/equipos/inventario")) return "Inventario general";
  if (pathname.startsWith("/activos/catalogos")) return "Catálogo de activos";
  for (const m of MODULOS) {
    if (pathname.startsWith(m.base)) {
      const vista = VISTAS_MODULO.find((v) => pathname.startsWith(`${m.base}/${v.clave}`));
      return `${m.categoria}${vista ? ` · ${vista.label}` : ""}`;
    }
  }
  for (const f of FORMATOS) {
    if (pathname === f.crear) return `${f.nombre} · Crear`;
    if (pathname === f.historial) return `${f.nombre} · Historial`;
  }
  if (pathname.startsWith("/hojas-responsabilidad/editar")) return "Hojas de responsabilidad · Editar";
  return "Inventario";
};
