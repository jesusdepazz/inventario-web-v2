import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UbicacionesService from "../../services/UbicacionesServices";
import EquiposService from "../../services/EquiposServices";
import EmpleadosService from "../../services/EmpleadosServices";
import SolicitudesService from "../../services/SolicitudesServices";

const CrearSolicitud = () => {
    const [empleado, setEmpleado] = useState({
        codigo: "",
        nombre: "",
        puesto: "",
        departamento: "",
    });

    const [ubicaciones, setUbicaciones] = useState([]);
    const [ubicacion, setUbicacion] = useState("");
    const [jefeInmediato, setJefeInmediato] = useState("");
    const [tipoSolicitud, setTipoSolicitud] = useState("");

    const [equiposDisponibles, setEquiposDisponibles] = useState([]);
    const [equipoSeleccionado, setEquipoSeleccionado] = useState({
        codificacion: "",
        marca: "",
        modelo: "",
        serie: "",
    });

    const navigate = useNavigate();

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const resUbicaciones = await UbicacionesService.obtenerTodas();
                setUbicaciones(resUbicaciones.data);

                const resEquipos = await EquiposService.obtenerEquipos();
                const disponibles = resEquipos.data.filter(e => !e.asignaciones || e.asignaciones.length === 0);
                setEquiposDisponibles(disponibles);
            } catch (err) {
                console.error("Error al cargar datos:", err);
            }
        };

        cargarDatos();
    }, []);

    const buscarEmpleado = async () => {
        try {
            const res = await EmpleadosService.obtenerPorCodigo(empleado.codigo);
            const data = res.data;

            setEmpleado({
                ...empleado,
                nombre: data.nombre,
                puesto: data.puesto,
                departamento: data.departamento,
            });
        } catch (err) {
            toast.error("Empleado no encontrado");
            setEmpleado({
                ...empleado,
                nombre: "",
                puesto: "",
                departamento: "",
            });
        }
    };

    const handleEquipoSeleccionado = (e) => {
        const cod = e.target.value;
        const equipo = equiposDisponibles.find(eq => eq.codificacion === cod);
        if (equipo) {
            setEquipoSeleccionado({
                codificacion: cod,
                marca: equipo.marca,
                modelo: equipo.modelo,
                serie: equipo.serie,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!empleado.nombre || !ubicacion || !equipoSeleccionado.codificacion) {
            toast.warn("Por favor completa todos los campos requeridos");
            return;
        }

        const solicitud = {
            codigoEmpleado: empleado.codigo,
            nombreEmpleado: empleado.nombre,
            puesto: empleado.puesto,
            departamento: empleado.departamento,
            ubicacion,
            jefeInmediato,
            codificacionEquipo: equipoSeleccionado.codificacion,
            marca: equipoSeleccionado.marca,
            modelo: equipoSeleccionado.modelo,
            serie: equipoSeleccionado.serie,
            tipoSolicitud
        };

        try {
            const res = await SolicitudesService.crear(solicitud);
            toast.success(`Solicitud creada exitosamente con correlativo ${res.data.correlativo}`);
            navigate("/solicitudesDashboard");
        } catch (err) {
            console.error("Error backend:", err.response?.data || err.message);
            if (err.response?.data?.errors) {
                Object.values(err.response.data.errors).forEach((msgs) => {
                    msgs.forEach((msg) => toast.error(msg));
                });
            } else {
                toast.error("Error al crear la solicitud");
            }
        }
    };

    return (
        <div className="flex justify-center px-4 py-10 overflow-y-auto">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-6xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <section>
                        <h3 className="text-xl font-semibold mb-4 border-b border-blue-300 pb-2">Empleado</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="codigo" className="mb-1 font-medium text-gray-700">Código de empleado</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="codigo"
                                        value={empleado.codigo}
                                        onChange={(e) => setEmpleado({ ...empleado, codigo: e.target.value })}
                                        className="input-field"
                                    />
                                    <button
                                        type="button"
                                        onClick={buscarEmpleado}
                                        className="bg-blue-900 text-white px-3 py-1 rounded hover:bg-blue-950 text-sm"
                                    >
                                        Buscar
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 font-medium text-gray-700">Nombre</label>
                                <div className="info-box">{empleado.nombre || "—"}</div>
                            </div>
                            <div>
                                <label className="mb-1 font-medium text-gray-700">Puesto</label>
                                <div className="info-box">{empleado.puesto || "—"}</div>
                            </div>
                            <div>
                                <label className="mb-1 font-medium text-gray-700">Departamento</label>
                                <div className="info-box">{empleado.departamento || "—"}</div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold mb-4 border-b border-blue-300 pb-2">Detalles del equipo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="mb-1 font-medium text-gray-700">Ubicación</label>
                                <select
                                    value={ubicacion}
                                    onChange={(e) => setUbicacion(e.target.value)}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Seleccione una ubicación</option>
                                    {ubicaciones.map((ubi) => (
                                        <option key={ubi.id} value={ubi.id}>{ubi.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 font-medium text-gray-700">Jefe Inmediato</label>
                                <input
                                    type="text"
                                    value={jefeInmediato}
                                    onChange={(e) => setJefeInmediato(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="mb-1 font-medium text-gray-700">Equipo</label>
                                <select
                                    value={equipoSeleccionado.codificacion}
                                    onChange={handleEquipoSeleccionado}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Seleccione un equipo</option>
                                    {equiposDisponibles.map((e, i) => (
                                        <option key={i} value={e.codificacion}>
                                            {e.codificacion} - {e.modelo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 font-medium text-gray-700">Marca</label>
                                <div className="info-box">{equipoSeleccionado.marca || "—"}</div>
                            </div>
                            <div>
                                <label className="mb-1 font-medium text-gray-700">Modelo</label>
                                <div className="info-box">{equipoSeleccionado.modelo || "—"}</div>
                            </div>
                            <div>
                                <label className="mb-1 font-medium text-gray-700">Serie</label>
                                <div className="info-box">{equipoSeleccionado.serie || "—"}</div>
                            </div>
                        </div>
                    </section>
                    <section>
                        <h3 className="text-xl font-semibold mb-4 border-b border-blue-300 pb-2">Detalles de solicitud</h3>
                        <div className="mb-4">
                            <label className="mb-1 block font-medium text-gray-700">Tipo de solicitud</label>
                            <select
                                name="tipoSolicitud"
                                value={tipoSolicitud}
                                onChange={(e) => setTipoSolicitud(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Seleccione una opción</option>
                                <option value="Solicitud de pase">Solicitud de pase</option>
                                <option value="Solicitud de traslado">Solicitud de traslado</option>
                                <option value="Solicitud de baja">Solicitud de baja</option>
                                <option value="Solicitud de ingreso a inventario">Solicitud de ingreso a inventario</option>
                                <option value="Solicitud de solvencia">Solicitud de solvencia</option>
                                <option value="Bajas">Bajas</option>
                                <option value="Solicitud de actualizacion de hoja de vida">Solicitud de actualizacion de hoja de vida</option>
                            </select>
                        </div>
                    </section>

                    <div className="flex justify-center gap-4 pt-6">
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold"
                        >
                            Crear Solicitud
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/solicitudesDashboard")}
                            className="bg-gray-400 text-white px-5 py-2 rounded-lg hover:bg-gray-500 text-sm font-semibold"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearSolicitud;
