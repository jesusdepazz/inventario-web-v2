import apiClient from "./ApiClient";

// Consulta unificada de activos: inmuebles, mobiliario y equipo, equipo de cómputo,
// vehículos y otros activos. La respuesta conserva los campos de equipo
// (codificacion, tipoEquipo, marca, modelo, serie, ubicacion, estado...) más "categoria".
const ActivosService = {
  // params opcionales: { empresa, categoria, q }
  listar: (params = {}) => apiClient.get("/Activos", { params }),

  obtenerPorCodificacion: (codificacion) =>
    apiClient.get("/Activos/por-codificacion", { params: { codificacion } }),
};

export default ActivosService;
