import apiClient from "./ApiClient";

const AuthService = {
  obtenerTokenApp: (accessTokenAzure) =>
    apiClient.get("/auth/token", {
      headers: {
        Authorization: `Bearer ${accessTokenAzure}`,
      },
    }),
};

export default AuthService;
