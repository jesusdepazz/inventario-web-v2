export const CATEGORIAS_ACTIVOS = [
  {
    value: "Inmuebles",
    label: "Inmuebles",
    familias: ["Terreno", "Edificio", "Local", "Bodega", "Otro inmueble"],
  },
  {
    value: "Mobiliario y equipo",
    label: "Mobiliario y equipo",
    familias: ["Mobiliario administrativo", "Equipo no informático", "Otro mobiliario"],
  },
  {
    value: "Equipo de cómputo",
    label: "Equipo de cómputo",
    familias: ["Computadora portátil", "Computadora de escritorio", "Monitor", "Servidor", "Periférico", "Otro equipo de cómputo"],
  },
  {
    value: "Vehículos",
    label: "Vehículos",
    familias: ["Automóvil", "Motocicleta", "Camión", "Montacargas", "Otro vehículo"],
  },
  {
    value: "Otros activos",
    label: "Otros activos",
    familias: ["Herramienta", "Equipo especializado", "Activo diverso", "Otro activo"],
  },
];

export const obtenerCategoria = (value) =>
  CATEGORIAS_ACTIVOS.find((categoria) => categoria.value === value);
