import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaWindows, FaShieldAlt } from "react-icons/fa";
import AuthServices from "../services/AuthServices";

export default function Login() {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await instance.loginPopup(loginRequest);
      const account = response.account;

      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account,
      });

      const accessToken = tokenResponse.accessToken;

      localStorage.setItem("tokenAzure", accessToken);
      localStorage.setItem("email", account.username);
      localStorage.setItem("name", account.name);

      const { data } = await AuthServices.obtenerTokenApp(accessToken);

      localStorage.setItem("tokenApp", data.token);
      localStorage.setItem("rol", data.rol);

      navigate("/dashboard");
    } catch (error) {
      console.error("Error en login:", error);
      alert("No puedes ingresar, no tienes acceso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Panel de marca */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-blue-800/20 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center text-center w-full px-16 pt-20 pb-16 text-white">
          <img src="/logo_guandy.png" alt="Logo Guandy" className="h-40 w-auto mb-14 drop-shadow-2xl" />
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Sistema de<br />Inventario
          </h1>
          <p className="mt-4 text-blue-100/80 text-lg max-w-sm">
            Administrá equipos, asignaciones y suministros de Guandy desde un solo lugar.
          </p>
          <div className="mt-12 flex items-center gap-3 text-sm text-blue-100/70">
            <FaShieldAlt className="text-blue-200" />
            Acceso protegido con tu cuenta corporativa de Microsoft
          </div>
        </div>
      </div>

      {/* Panel de login */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <img
            src="/logo_guandy.png"
            alt="Logo Guandy"
            className="h-14 mb-8 mx-auto lg:hidden"
          />

          <h2 className="text-2xl font-bold text-slate-900 text-center lg:text-left">
            Bienvenido de nuevo
          </h2>
          <p className="mt-2 text-sm text-slate-500 text-center lg:text-left">
            Inicia sesión con tu cuenta de Microsoft para continuar.
          </p>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`mt-8 w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-white font-semibold shadow-lg shadow-blue-900/20 transition-all duration-200
            ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-950 hover:shadow-blue-900/30 active:scale-[0.98]"}`}
          >
            <FaWindows className="text-lg" />
            {loading ? "Conectando..." : "Iniciar sesión con Microsoft"}
          </button>

          <p className="mt-8 text-center lg:text-left text-xs text-slate-400">
            Solo usuarios autorizados podrán acceder a la plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}
