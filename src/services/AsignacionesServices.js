import apiClient from "./ApiClient";

const AsignacionesService = {
  crear: (asignacion) => apiClient.post("/asignaciones", asignacion),

  obtenerTodas: () => apiClient.get("/asignaciones"),

  eliminar: (id) => apiClient.delete(`/asignaciones/${id}`),

  obtenerEquiposPorEmpleado: (codigoEmpleado) =>
    apiClient.get(`/asignaciones/empleado/${codigoEmpleado}/equipos`),
};

export default AsignacionesService;
