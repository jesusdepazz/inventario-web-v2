import apiClient from "./ApiClient";

const AsignacionesComunalesService = {
  crear: (data) => apiClient.post("/asignacionescomunales", data),

  obtenerTodas: () => apiClient.get("/asignacionescomunales"),

  actualizar: (id, data) => apiClient.put(`/asignacionescomunales/${id}`, data),

  eliminar: (id) => apiClient.delete(`/asignacionescomunales/${id}`),

  obtenerVersiones: (id) => apiClient.get(`/asignacionescomunales/${id}/versiones`),

  obtenerGrupo: (id) => apiClient.get(`/asignacionescomunales/grupo/${id}`),

  actualizarGrupo: (id, data) => apiClient.put(`/asignacionescomunales/grupo/${id}`, data),
};

export default AsignacionesComunalesService;
