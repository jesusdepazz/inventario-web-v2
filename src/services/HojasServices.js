import ApiClient from "./ApiClient";

const HojasService = {
  crearHoja: async (payload) => {
    try {
      const response = await ApiClient.post("/HojasResponsabilidad", payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  obtenerHoja: async (id) => {
    try {
      const response = await ApiClient.get(`/HojasResponsabilidad/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  listarHojas: async () => {
    try {
      const response = await ApiClient.get("/HojasResponsabilidad");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  actualizarHoja: async (id, payload) => {
    try {
      const response = await ApiClient.put(
        `/HojasResponsabilidad/${id}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  obtenerVersiones: async (id) => {
    try {
      const response = await ApiClient.get(`/HojasResponsabilidad/${id}/versiones`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  eliminarVersion: async (id, versionId) => {
    try {
      const response = await ApiClient.delete(
        `/HojasResponsabilidad/${id}/versiones/${versionId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default HojasService;
