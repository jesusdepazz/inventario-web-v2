import apiClient from "./ApiClient";
import { subirExcel } from "./excelUpload";

const InmueblesService = {
  // params opcionales: { empresa, estado }
  obtenerTodos: (params = {}) => apiClient.get("/Inmuebles", { params }),

  obtenerPorId: (id) => apiClient.get(`/Inmuebles/${id}`),

  crear: (data) => apiClient.post("/Inmuebles", data),

  editar: (id, data) => apiClient.put(`/Inmuebles/${id}`, data),

  eliminar: (id) => apiClient.delete(`/Inmuebles/${id}`),

  // data: { numeroPoliza, aseguradora, fechaInicio, fechaRenovacion, coberturasEspecificas, gestionReclamosSiniestros, estado }
  crearPoliza: (id, data) => apiClient.post(`/Inmuebles/${id}/polizas`, data),

  subirArchivo: (id, archivo, tipoDocumento = "documento") => {
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("tipoDocumento", tipoDocumento);
    return apiClient.post(`/Inmuebles/${id}/archivos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  descargarArchivo: (archivoId) =>
    apiClient.get(`/Inmuebles/archivos/${archivoId}/descargar`, { responseType: "blob" }),

  importarExcel: (file, empresa) => subirExcel("/Inmuebles/importar-excel", file, empresa),
};

export default InmueblesService;
