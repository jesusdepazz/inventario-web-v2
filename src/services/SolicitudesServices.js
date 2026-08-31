import apiClient from "./ApiClient";

const SolicitudesService = {
  obtenerTodas: () => apiClient.get("/solicitudes"),

  obtenerPorId: (id) => apiClient.get(`/solicitudes/${id}`),

  crear: (data) => apiClient.post("/solicitudes", data),

  eliminar: (id) => apiClient.delete(`/solicitudes/${id}`),

  actualizarEstado: (id, estado) =>
    apiClient.put(`/solicitudes/${id}/estado`, { estado }),
};

export default SolicitudesService;
