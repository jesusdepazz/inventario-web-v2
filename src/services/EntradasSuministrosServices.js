import apiClient from "./ApiClient";

const EntradaSuministroService = {
  obtenerTodas: () => apiClient.get("/EntradaSuministro"),

  obtenerPorId: (id) => apiClient.get(`/EntradaSuministro/${id}`),

  crear: (data) => apiClient.post("/EntradaSuministro", data),

  actualizar: (id, data) => apiClient.put(`/EntradaSuministro/${id}`, data),

  eliminar: (id) => apiClient.delete(`/EntradaSuministro/${id}`),
};

export default EntradaSuministroService;
