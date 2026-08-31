import apiClient from "./ApiClient";

const SalidaSuministroService = {
  obtenerTodos: () => apiClient.get("/SalidasSuministros"),

  obtenerPorId: (id) => apiClient.get(`/SalidasSuministros/${id}`),

  crear: (data) => apiClient.post("/SalidasSuministros", data),
  
  eliminar: (id) => apiClient.delete(`/SalidasSuministros/${id}`),
};

export default SalidaSuministroService;
