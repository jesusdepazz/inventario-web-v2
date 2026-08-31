import ApiClient from "./ApiClient";

const SolvenciasService = {
  crearSolvencia: async (hojaResponsabilidadId, observaciones, solvenciaNo) => {
    try {
      const response = await ApiClient.post("/HojaSolvencias", null, {
        params: { hojaResponsabilidadId, observaciones, solvenciaNo},
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  listarHistorico: async () => {
    try {
      const response = await ApiClient.get("/HojaSolvencias/historico");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  eliminarSolvencia: async (id) => {
    try {
      const response = await ApiClient.delete(`/HojaSolvencias/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default SolvenciasService;
