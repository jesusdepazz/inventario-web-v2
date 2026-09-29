import apiClient from "./ApiClient";
import { subirExcel } from "./excelUpload";

const VehiculosService = {
  // params opcionales: { empresa }
  obtenerTodos: (params = {}) => apiClient.get("/Vehiculos", { params }),

  // Incluye reparaciones, mantenimientos, alertas, fallas, pólizas y reportes de estado físico
  obtenerPorId: (id) => apiClient.get(`/Vehiculos/${id}`),

  crear: (data) => apiClient.post("/Vehiculos", data),

  editar: (id, data) => apiClient.put(`/Vehiculos/${id}`, data),

  eliminar: (id) => apiClient.delete(`/Vehiculos/${id}`),

  importarExcel: (file, empresa) => subirExcel("/Vehiculos/importar-excel", file, empresa),

  // El backend espera el número suelto en el body ([FromBody] int)
  actualizarKilometraje: (id, kilometraje) =>
    apiClient.patch(`/Vehiculos/${id}/kilometraje`, Number(kilometraje), {
      headers: { "Content-Type": "application/json" },
    }),

  // data: { responsable, kilometraje, fecha? }
  asignar: (id, data) => apiClient.post(`/Vehiculos/${id}/asignar`, data),

  crearReparacion: (id, data) => apiClient.post(`/Vehiculos/${id}/reparaciones`, data),

  crearMantenimiento: (id, data) => apiClient.post(`/Vehiculos/${id}/mantenimientos`, data),
  actualizarMantenimiento: (id, mantenimientoId, data) =>
    apiClient.put(`/Vehiculos/${id}/mantenimientos/${mantenimientoId}`, data),

  crearAlerta: (id, data) => apiClient.post(`/Vehiculos/${id}/alertas`, data),
  obtenerAlertasPendientes: (params = {}) => apiClient.get("/Vehiculos/alertas/pendientes", { params }),
  atenderAlerta: (alertaId) => apiClient.patch(`/Vehiculos/alertas/${alertaId}/atender`),

  crearFalla: (id, data) => apiClient.post(`/Vehiculos/${id}/fallas`, data),
  actualizarFalla: (id, fallaId, data) => apiClient.put(`/Vehiculos/${id}/fallas/${fallaId}`, data),

  crearPoliza: (id, data) => apiClient.post(`/Vehiculos/${id}/polizas`, data),

  crearReporteEstadoFisico: (id, data) => apiClient.post(`/Vehiculos/${id}/reportes-estado-fisico`, data),

  // tipo: reparaciones | mantenimientos | alertas | fallas | polizas | reportes-estado-fisico
  eliminarRegistro: (id, tipo, registroId) => apiClient.delete(`/Vehiculos/${id}/${tipo}/${registroId}`),
};

export default VehiculosService;
