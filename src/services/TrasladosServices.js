import apiClient from "./ApiClient";

const TrasladosServices = {
  obtenerTodos: () => apiClient.get("/traslados"),

  obtenerPorNo: (no) => apiClient.get(`/traslados/${no}`),

  crear: (traslado) => apiClient.post("/traslados", traslado),

  actualizar: (no, traslado) => apiClient.put(`/traslados/${no}`, traslado),

  eliminar: (no) => apiClient.delete(`/traslados/${no}`),

  consultarNIT: (nit) => apiClient.get(`/traslados/consultar-nit/${nit}`)
};

export default TrasladosServices;
