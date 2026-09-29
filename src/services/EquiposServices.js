import apiClient from "./ApiClient";
import { subirExcel } from "./excelUpload";

const EquiposService = {
  // params opcionales: { empresa }
  obtenerEquipos: (params = {}) => apiClient.get("/equipos", { params }),

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

  importarExcel: (file, empresa) => subirExcel("/equipos/importar-excel", file, empresa),
};

export default EquiposService;
