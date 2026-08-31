import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import SolicitudesService from "../../services/SolicitudesServices";
import UbicacionesService from "../../services/UbicacionesServices";

const EliminarSolicitud = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [ubicaciones, setUbicaciones] = useState({});

  const cargarSolicitudes = async () => {
    try {
      const res = await SolicitudesService.obtenerTodas();
      setSolicitudes(res.data);
    } catch (err) {
      console.error("Error al cargar solicitudes", err);
      toast.error("Error al obtener las solicitudes");
    }
  };

  const eliminarSolicitud = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta solicitud?")) return;

    try {
      await SolicitudesService.eliminar(id);
      toast.success("Solicitud eliminada correctamente");
      cargarSolicitudes();
    } catch (err) {
      console.error("Error al eliminar solicitud", err);
      toast.error("No se pudo eliminar la solicitud");
    }
  };

  const cargarUbicaciones = async () => {
    try {
      const res = await UbicacionesService.obtenerTodas();
      const mapa = {};
      res.data.forEach((u) => {
        mapa[u.id] = u.nombre;
      });
      setUbicaciones(mapa);
    } catch (err) {
      console.error("Error al cargar ubicaciones", err);
      toast.error("No se pudieron cargar las ubicaciones");
    }
  };

  useEffect(() => {
    cargarSolicitudes();
    cargarUbicaciones();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="overflow-x-auto bg-white shadow-md rounded-xl p-4">
        <table className="w-full text-sm text-left border border-gray-200">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-4 py-2 border">Código</th>
              <th className="px-4 py-2 border">Nombre</th>
              <th className="px-4 py-2 border">Equipo</th>
              <th className="px-4 py-2 border">Ubicación</th>
              <th className="px-4 py-2 border">Jefe Inmediato</th>
              <th className="px-4 py-2 border">Estado</th>
              <th className="px-4 py-2 border text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.length > 0 ? (
              solicitudes.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2 border">{s.codigoEmpleado}</td>
                  <td className="px-4 py-2 border">{s.nombreEmpleado}</td>
                  <td className="px-4 py-2 border">{s.codificacionEquipo}</td>
                  <td className="px-4 py-2 border">
                    {ubicaciones[s.ubicacion] || "Desconocida"}
                  </td>
                  <td className="px-4 py-2 border">{s.jefeInmediato}</td>
                  <td className="px-4 py-2 border font-medium">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${s.estado === "Aprobada"
                        ? "bg-green-600"
                        : s.estado === "Denegada"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                        }`}
                    >
                      {s.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2 border flex justify-center">
                    <button
                      onClick={() => eliminarSolicitud(s.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-6 border">
                  No hay solicitudes registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EliminarSolicitud;
