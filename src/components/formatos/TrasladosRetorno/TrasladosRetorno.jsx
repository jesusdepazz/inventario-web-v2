import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TrasladosRetornoService from "../../../services/TrasladosRetornoService";
import EmpleadosService from "../../../services/EmpleadosServices";
import EquiposService from "../../../services/EquiposServices";
import UbicacionesService from "../../../services/UbicacionesServices";

const CrearTrasladoRetorno = () => {
  const initialFormData = {
    no: "",
    fechaPase: "",
    motivoSalida: "",
    ubicacionRetorno: "",
    fechaRetorno: "",
    tipoRetiro: "proveedor",
    codigoProveedor: "",
    telefonoProveedor: "",
    personaRetira: "",
    nombreProveedor: "",
    nombreContacto: "",
    identificacion: "",
    empleados: [],
    equipos: []
  };

  const [formData, setFormData] = useState(initialFormData);
  const [empleadoCodigo, setEmpleadoCodigo] = useState("");
  const [equipoCodigo, setEquipoCodigo] = useState("");
  const [ubicaciones, setUbicaciones] = useState([]);

  useEffect(() => {
    UbicacionesService.obtenerTodas()
      .then((res) => {
        setUbicaciones(Array.isArray(res.data) ? res.data : res.data?.$values ?? []);
      })
      .catch(() => toast.error("Error al cargar ubicaciones"));
  }, []);

  const handleAgregarEmpleado = () => {
    const codigo = empleadoCodigo.trim();

    if (!codigo) {
      toast.warning("Debe ingresar un código de empleado");
      return;
    }

    EmpleadosService.obtenerPorCodigo(codigo)
      .then((res) => {
        const empleado = {
          empleadoId: codigo,
          nombre: res.data?.nombre ?? "",
          puesto: res.data?.puesto ?? "",
          departamento: res.data?.departamento ?? ""
        };

        const existe = formData.empleados.some(
          (e) => e.empleadoId?.toLowerCase() === empleado.empleadoId?.toLowerCase()
        );

        if (existe) {
          toast.warning("Empleado ya agregado");
          return;
        }

        setFormData((prev) => ({
          ...prev,
          empleados: [...prev.empleados, empleado]
        }));

        setEmpleadoCodigo("");
        toast.success("Empleado agregado");
      })
      .catch(() => toast.error("Empleado no encontrado"));
  };

  const handleQuitarEmpleado = (index) => {
    setFormData((prev) => ({
      ...prev,
      empleados: prev.empleados.filter((_, i) => i !== index)
    }));
  };

  const handleAgregarEquipo = () => {
    const codigo = equipoCodigo.trim();

    if (!codigo) {
      toast.warning("Debe ingresar una codificación de equipo");
      return;
    }

    EquiposService.obtenerPorCodificacion(codigo)
      .then((res) => {
        const cod = res.data?.codificacion ?? "";

        if (!cod) {
          toast.error("Equipo inválido");
          return;
        }

        const existe = formData.equipos.some(
          (e) => e.equipo?.toLowerCase() === cod.toLowerCase()
        );

        if (existe) {
          toast.warning("Equipo ya agregado");
          return;
        }

        const equipo = {
          equipo: cod,
          descripcionEquipo: res.data?.tipoEquipo ?? "",
          marca: res.data?.marca ?? "",
          modelo: res.data?.modelo ?? "",
          serie: res.data?.serie ?? ""
        };

        setFormData((prev) => ({
          ...prev,
          equipos: [...prev.equipos, equipo]
        }));

        setEquipoCodigo("");
        toast.success("Equipo agregado");
      })
      .catch(() => toast.error("Equipo no encontrado"));
  };

  const handleQuitarEquipo = (index) => {
    setFormData((prev) => ({
      ...prev,
      equipos: prev.equipos.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTipoRetiro = (tipo) => {
    setFormData((prev) => ({
      ...prev,
      tipoRetiro: tipo,
      ...(tipo === "proveedor"
        ? { empleados: [] }
        : {
            codigoProveedor: "",
            telefonoProveedor: "",
            personaRetira: "",
            nombreProveedor: "",
            nombreContacto: "",
            identificacion: ""
          })
    }));
  };

  const esProveedor = formData.tipoRetiro !== "empleado";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.no.trim()) return toast.error("Debe ingresar el No.");
    if (!formData.fechaPase) return toast.error("Debe ingresar la fecha del pase");
    if (formData.equipos.length === 0) return toast.error("Debe agregar al menos un equipo");

    if (esProveedor) {
      if (!formData.nombreProveedor.trim()) return toast.error("Debe ingresar el nombre del proveedor");
    } else {
      if (formData.empleados.length === 0) return toast.error("Debe agregar al menos un empleado");
    }

    if (!formData.motivoSalida.trim()) return toast.error("Debe ingresar el motivo de salida");
    if (!formData.ubicacionRetorno) return toast.error("Debe seleccionar ubicación de retorno");

    TrasladosRetornoService.crear(formData)
      .then(() => {
        toast.success("Traslado registrado correctamente");
        setFormData(initialFormData);
        setEmpleadoCodigo("");
        setEquipoCodigo("");
      })
      .catch((err) => {
        console.error(err.response?.data);
        toast.error("Error al registrar traslado");
      });
  };

  return (
    <div className="min-h-screen flex justify-center items-start px-4 py-8">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-blue-900">
            Crear Pase de Salida con Retorno
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Completa los datos del pase, empleados y equipos
          </p>
        </div>

        <div className="p-6 max-h-[78vh] overflow-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Tipo de traslado
              </h3>

              <div className="inline-flex rounded-xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleTipoRetiro("proveedor")}
                  className={`px-5 py-2 font-semibold transition ${
                    esProveedor
                      ? "bg-blue-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Proveedor externo
                </button>
                <button
                  type="button"
                  onClick={() => handleTipoRetiro("empleado")}
                  className={`px-5 py-2 font-semibold transition border-l border-gray-200 ${
                    !esProveedor
                      ? "bg-blue-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Empleados (ubicación)
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                {esProveedor
                  ? "El equipo sale con un proveedor externo que lo retirará y retornará."
                  : "El equipo sale bajo la responsabilidad de uno o más empleados de la ubicación de retorno."}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Datos Generales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No.
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.no}
                    onChange={(e) => handleChange("no", e.target.value)}
                    placeholder="Ej: PR-00012"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Pase
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.fechaPase}
                    onChange={(e) => handleChange("fechaPase", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Retorno
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.fechaRetorno}
                    onChange={(e) => handleChange("fechaRetorno", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {esProveedor && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Datos del Proveedor / Contacto
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Proveedor
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.codigoProveedor}
                    onChange={(e) => handleChange("codigoProveedor", e.target.value)}
                    placeholder="Ej: PROV-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono Proveedor
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.telefonoProveedor}
                    onChange={(e) => handleChange("telefonoProveedor", e.target.value)}
                    placeholder="Ej: 5555-5555"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Proveedor
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.nombreProveedor}
                    onChange={(e) => handleChange("nombreProveedor", e.target.value)}
                    placeholder="Nombre del proveedor"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Contacto
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.nombreContacto}
                    onChange={(e) => handleChange("nombreContacto", e.target.value)}
                    placeholder="Nombre del contacto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Persona que Retira
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.personaRetira}
                    onChange={(e) => handleChange("personaRetira", e.target.value)}
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Identificación
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.identificacion}
                    onChange={(e) => handleChange("identificacion", e.target.value)}
                    placeholder="DPI / Pasaporte"
                  />
                </div>
              </div>
            </div>
            )}

            {!esProveedor && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Empleados
              </h3>

              <div className="flex flex-col md:flex-row gap-3">
                <input
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={empleadoCodigo}
                  onChange={(e) => setEmpleadoCodigo(e.target.value)}
                  placeholder="Código de empleado"
                />
                <button
                  type="button"
                  onClick={handleAgregarEmpleado}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
                >
                  Agregar
                </button>
              </div>

              {formData.empleados.length > 0 && (
                <div className="mt-4 overflow-x-auto bg-white border border-gray-200 rounded-xl">
                  <table className="min-w-[900px] w-full text-sm">
                    <thead className="bg-blue-800 text-white">
                      <tr>
                        <th className="p-3 text-left">Código</th>
                        <th className="p-3 text-left">Nombre</th>
                        <th className="p-3 text-left">Puesto</th>
                        <th className="p-3 text-left">Departamento</th>
                        <th className="p-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.empleados.map((emp, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="border-t border-gray-200 p-3">
                            {emp.empleadoId}
                          </td>
                          <td className="border-t border-gray-200 p-3">
                            {emp.nombre}
                          </td>
                          <td className="border-t border-gray-200 p-3">
                            {emp.puesto}
                          </td>
                          <td className="border-t border-gray-200 p-3">
                            {emp.departamento}
                          </td>
                          <td className="border-t border-gray-200 p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleQuitarEmpleado(i)}
                              className="text-red-600 font-semibold hover:text-red-800"
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Equipos
              </h3>

              <div className="flex flex-col md:flex-row gap-3">
                <input
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={equipoCodigo}
                  onChange={(e) => setEquipoCodigo(e.target.value)}
                  placeholder="Codificación del equipo"
                />
                <button
                  type="button"
                  onClick={handleAgregarEquipo}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
                >
                  Agregar
                </button>
              </div>

              {formData.equipos.length > 0 && (
                <div className="mt-4 overflow-x-auto bg-white border border-gray-200 rounded-xl">
                  <table className="min-w-[900px] w-full text-sm">
                    <thead className="bg-blue-800 text-white">
                      <tr>
                        <th className="p-3 text-left">Equipo</th>
                        <th className="p-3 text-left">Descripción</th>
                        <th className="p-3 text-left">Marca</th>
                        <th className="p-3 text-left">Modelo</th>
                        <th className="p-3 text-left">Serie</th>
                        <th className="p-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.equipos.map((eq, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="border-t border-gray-200 p-3">{eq.equipo}</td>
                          <td className="border-t border-gray-200 p-3">{eq.descripcionEquipo}</td>
                          <td className="border-t border-gray-200 p-3">{eq.marca}</td>
                          <td className="border-t border-gray-200 p-3">{eq.modelo}</td>
                          <td className="border-t border-gray-200 p-3">{eq.serie}</td>
                          <td className="border-t border-gray-200 p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleQuitarEquipo(i)}
                              className="text-red-600 font-semibold hover:text-red-800"
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Salida y Retorno
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo de Salida
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.motivoSalida}
                    onChange={(e) => handleChange("motivoSalida", e.target.value)}
                    placeholder="Ej: Reparación, garantía, proveedor..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación Retorno
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.ubicacionRetorno}
                    onChange={(e) => handleChange("ubicacionRetorno", e.target.value)}
                  >
                    <option value="">Seleccione una ubicación</option>
                    {ubicaciones.map((u) => (
                      <option key={u.id} value={u.nombre}>
                        {u.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 font-semibold transition"
              >
                Guardar Traslado
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearTrasladoRetorno;