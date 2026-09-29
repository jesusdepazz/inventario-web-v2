import apiClient from "./ApiClient";

const CatalogoActivosService = {
  // params opcionales: { categoria, soloActivos }
  obtenerTodos: (params = {}) => apiClient.get("/CatalogoActivos", { params }),

  obtenerPorId: (id) => apiClient.get(`/CatalogoActivos/${id}`),

  crear: (data) => apiClient.post("/CatalogoActivos", data),

  editar: (id, data) => apiClient.put(`/CatalogoActivos/${id}`, data),

  eliminar: (id) => apiClient.delete(`/CatalogoActivos/${id}`),
};

export default CatalogoActivosService;
