import apiClient from "./ApiClient";

const BajaActivosService = {
  crear: (baja) => apiClient.post("/BajaActivo", baja),

  obtenerTodas: () => apiClient.get("/BajaActivo"),
  
  obtenerPorId: (id) => apiClient.get(`/BajaActivo/${id}`),

  eliminar: (id) => apiClient.delete(`/BajaActivo/${id}`),
};

export default BajaActivosService;
