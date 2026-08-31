import apiClient from "./ApiClient";

const EmpleadosService = {
  obtenerPorCodigo: (codigo) => apiClient.get(`/empleados/${codigo}`),
  buscarPorNombre: (nombre) => apiClient.get(`/empleados/buscar?nombre=${encodeURIComponent(nombre)}`),
};

export default EmpleadosService;
