import apiClient from "./ApiClient";

const EquiposService = {
  obtenerEquipos: () => apiClient.get("/equipos"),

  obtenerPorId: (id) => apiClient.get(`/equipos/${id}`),

  obtenerPorCodificacion: (codificacion) =>
    apiClient.get("/equipos/por-codificacion", {
      params: { codificacion }
    }),

  crear: (formData) =>
    apiClient.post("/equipos", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  editar: (id, data) =>
    apiClient.put(`/equipos/${id}`, data),

  eliminar: (id) => apiClient.delete(`/equipos/${id}`),
};

export default EquiposService;
