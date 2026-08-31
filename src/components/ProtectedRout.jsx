import React from "react";
import { Navigate, useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [], requiredRole }) => {
  const rol = localStorage.getItem("rol");
  const navigate = useNavigate();

  if (!rol) {
    return <Navigate to="/login" replace />;
  }

  const rolesPermitidos = requiredRole
    ? [requiredRole]
    : allowedRoles;

  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(rol)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h1 className="text-5xl font-bold text-red-600 mb-6 text-center">
          Acceso Denegado
        </h1>
        <p className="text-lg text-gray-700 mb-6 text-center">
          No tienes permisos para acceder a esta página.
        </p>
        <button
          onClick={() => navigate("/inicio")}
          className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-950 transition font-semibold"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return children;
};


export default ProtectedRoute;
