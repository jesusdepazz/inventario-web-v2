import apiClient from "./ApiClient";
import { subirExcel } from "./excelUpload";

const MobiliarioEquipoService = {
  // params opcionales: { empresa, estado, ubicacion, segmento }
  obtenerTodos: (params = {}) => apiClient.get("/MobiliarioEquipo", { params }),

  obtenerPorId: (id) => apiClient.get(`/MobiliarioEquipo/${id}`),

  crear: (data) => apiClient.post("/MobiliarioEquipo", data),

  editar: (id, data) => apiClient.put(`/MobiliarioEquipo/${id}`, data),

  eliminar: (id) => apiClient.delete(`/MobiliarioEquipo/${id}`),

  // data: { descripcion, tipoIncidencia, reportadoPor, estadoReporte, fechaReporte? }
  crearReporteDanio: (id, data) => apiClient.post(`/MobiliarioEquipo/${id}/reportes-danios`, data),

  actualizarReporteDanio: (id, reporteId, data) =>
    apiClient.put(`/MobiliarioEquipo/${id}/reportes-danios/${reporteId}`, data),

  importarExcel: (file, empresa) => subirExcel("/MobiliarioEquipo/importar-excel", file, empresa),
};

export default MobiliarioEquipoService;
