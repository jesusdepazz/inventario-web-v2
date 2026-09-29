import apiClient from "./ApiClient";
import { subirExcel } from "./excelUpload";

const OtrosActivosService = {
  // params opcionales: { empresa }
  obtenerTodos: (params = {}) => apiClient.get("/OtrosActivos", { params }),

  obtenerPorId: (id) => apiClient.get(`/OtrosActivos/${id}`),

  obtenerPorCodificacion: (codificacion) =>
    apiClient.get("/OtrosActivos/por-codificacion", { params: { codificacion } }),

  crear: (data) => apiClient.post("/OtrosActivos", data),

  editar: (id, data) => apiClient.put(`/OtrosActivos/${id}`, data),

  eliminar: (id) => apiClient.delete(`/OtrosActivos/${id}`),

  eliminarTodos: () => apiClient.delete("/OtrosActivos/EliminarTodos"),

  importarExcel: (file, empresa) => subirExcel("/OtrosActivos/importar-excel", file, empresa),
};

export default OtrosActivosService;
