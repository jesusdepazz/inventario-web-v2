import apiClient from "./ApiClient";

export default {
  registrarMovimiento: (dto) => apiClient.post("/inventario/movimientos", dto),
  obtenerInventarioPorSuministro: (suministroId) => apiClient.get(`/inventario/suministro/${suministroId}`),
  obtenerMovimientos: (params) => apiClient.get("/inventario/movimientos", { params })
};
