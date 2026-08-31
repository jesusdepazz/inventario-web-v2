import apiClient from "./ApiClient";

const UbicacionesService = {
  obtenerTodas: () => apiClient.get("/ubicaciones"),

  crear: (data) => apiClient.post("/ubicaciones", data),

  importarExcel: (file) => {
    const formData = new FormData();
    formData.append("archivo", file);
    return apiClient.post("/ubicaciones/importar-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  eliminar: (id) => apiClient.delete(`/ubicaciones/${id}`),
};

export default UbicacionesService;
