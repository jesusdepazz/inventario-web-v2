import apiClient from "./ApiClient";

const MantenimientosService = {
  obtenerTodos: (codificacion = null) => {
    const params = codificacion ? { codificacion } : {};
    return apiClient.get("/mantenimientos", { params });
  },

  obtenerPorId: (id) => apiClient.get(`/mantenimientos/${id}`),

  crear: (data) => apiClient.post("/mantenimientos", data),

  eliminar: (id) => apiClient.delete(`/mantenimientos/${id}`),
};

export default MantenimientosService;
