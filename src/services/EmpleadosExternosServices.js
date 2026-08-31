import apiClient from "./ApiClient";

const EmpleadosExternosService = {
  listar: () => apiClient.get("/EmpleadosExternos"),
  obtener: (id) => apiClient.get(`/EmpleadosExternos/${id}`),
  obtenerPorCodigo: (codigo) => apiClient.get(`/EmpleadosExternos/codigo/${encodeURIComponent(codigo)}`),
  buscar: (nombre) => apiClient.get(`/EmpleadosExternos/buscar?nombre=${encodeURIComponent(nombre)}`),
  crear: (data) => apiClient.post("/EmpleadosExternos", data),
  actualizar: (id, data) => apiClient.put(`/EmpleadosExternos/${id}`, data),
  desactivar: (id) => apiClient.delete(`/EmpleadosExternos/${id}`),
};

export default EmpleadosExternosService;
