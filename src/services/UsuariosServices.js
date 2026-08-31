import apiClient from "./ApiClient";

const UsuariosService = {
  crear: (usuario) => apiClient.post("/usuarios", usuario),

  cambiarRol: (correo, nuevoRol) => apiClient.put(`/usuarios/${correo}/rol`, JSON.stringify(nuevoRol), {
    headers: {
      "Content-Type": "application/json",
    },
  }),
};

export default UsuariosService;
