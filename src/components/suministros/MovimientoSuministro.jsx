import { useMemo, useEffect, useRef, useState } from "react";
import SuministrosService from "../../services/SuministrosService";
import EntradaSuministroService from "../../services/EntradasSuministrosServices";
import SalidaSuministroService from "../../services/SalidasSuministrosServices";
import UbicacionesService from "../../services/UbicacionesServices";
import EmpleadosService from "../../services/EmpleadosServices";
import { FaArrowDown, FaArrowUp, FaFloppyDisk, FaUserCheck, FaBoxesStacked } from "react-icons/fa6";

export default function Movimientos() {
  const [suministros, setSuministros] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);

  const [tipoMovimiento, setTipoMovimiento] = useState("entrada");
  const [formData, setFormData] = useState({
    suministroId: "",
    cantidad: "",
    personaResponsable: "",
    departamentoResponsable: "",
  });

  const [sugerencias, setSugerencias] = useState([]);
  const [openSug, setOpenSug] = useState(false);

  const [suministroQuery, setSuministroQuery] = useState("");
  const [openSugSuministro, setOpenSugSuministro] = useState(false);

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mensajeTipo, setMensajeTipo] = useState("ok");

  const debounceRef = useRef(null);
  const blurRef = useRef(null);
  const blurSuministroRef = useRef(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [suministrosRes, ubicacionesRes] = await Promise.all([
          SuministrosService.obtenerTodos(),
          UbicacionesService.obtenerTodas(),
        ]);

        setSuministros(suministrosRes.data || []);
        setUbicaciones(ubicacionesRes.data || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setMensajeTipo("error");
        setMensaje("Error cargando datos ❌");
      }
    };

    cargarDatos();
  }, []);

  const suministroSeleccionado = useMemo(() => {
    const id = Number(formData.suministroId);
    if (!id) return null;
    return suministros.find((s) => s.id === id) || null;
  }, [formData.suministroId, suministros]);

  const sugerenciasSuministros = useMemo(() => {
    const q = suministroQuery.trim().toLowerCase();
    if (!q) return [];
    return suministros
      .filter((s) => s.nombreProducto?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [suministroQuery, suministros]);

  const limpiarMensaje = () => {
    setMensaje("");
    setMensajeTipo("ok");
  };

  const buscarEmpleado = async (texto) => {
    const q = (texto || "").trim();
    if (q.length < 2) {
      setSugerencias([]);
      setOpenSug(false);
      return;
    }

    try {
      const { data } = await EmpleadosService.buscarPorNombre(q);
      const arr = Array.isArray(data) ? data : [];
      setSugerencias(arr);
      setOpenSug(arr.length > 0);
    } catch (error) {
      console.error(error);
      setSugerencias([]);
      setOpenSug(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (mensaje) limpiarMensaje();

    if (name === "personaResponsable") {
      setFormData((prev) => ({
        ...prev,
        departamentoResponsable: "",
      }));

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => buscarEmpleado(value), 250);
    }
  };

  const seleccionarEmpleado = (empleado) => {
    setFormData((prev) => ({
      ...prev,
      personaResponsable: empleado?.nombre || "",
      departamentoResponsable: empleado?.departamento || "",
    }));
    setSugerencias([]);
    setOpenSug(false);
  };

  const handleSuministroQueryChange = (e) => {
    const value = e.target.value;
    setSuministroQuery(value);
    setFormData((prev) => ({ ...prev, suministroId: "" }));
    setOpenSugSuministro(value.trim().length > 0);
    if (mensaje) limpiarMensaje();
  };

  const seleccionarSuministro = (s) => {
    setFormData((prev) => ({ ...prev, suministroId: s.id }));
    setSuministroQuery(s.nombreProducto || "");
    setOpenSugSuministro(false);
  };

  const handleTipoMovimiento = (val) => {
    setTipoMovimiento(val);
    limpiarMensaje();

    if (val === "entrada") {
      setFormData((prev) => ({
        ...prev,
        personaResponsable: "",
        departamentoResponsable: "",
      }));
      setSugerencias([]);
      setOpenSug(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    limpiarMensaje();

    const suministroIdNum = Number(formData.suministroId);
    const cantidadNum = Number(formData.cantidad);

    if (!suministroIdNum || !cantidadNum || cantidadNum <= 0) {
      setMensajeTipo("error");
      setMensaje("Debe seleccionar un suministro y una cantidad válida ❌");
      setLoading(false);
      return;
    }

    if (tipoMovimiento === "salida" && !formData.personaResponsable.trim()) {
      setMensajeTipo("error");
      setMensaje("Debe indicar la persona responsable ❌");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        suministroId: suministroIdNum,
        cantidadProducto: cantidadNum,
      };

      if (tipoMovimiento === "entrada") {
        await EntradaSuministroService.crear(payload);
        setMensajeTipo("ok");
        setMensaje("Entrada registrada correctamente ✔️");
      } else {
        await SalidaSuministroService.crear({
          ...payload,
          personaResponsable: formData.personaResponsable,
          departamentoResponsable: formData.departamentoResponsable,
        });

        setMensajeTipo("ok");
        setMensaje("Salida registrada correctamente ✔️");
      }

      setFormData({
        suministroId: "",
        cantidad: "",
        personaResponsable: "",
        departamentoResponsable: "",
      });
      setSugerencias([]);
      setOpenSug(false);
      setSuministroQuery("");
      setOpenSugSuministro(false);

      try {
        const suministrosRes = await SuministrosService.obtenerTodos();
        setSuministros(suministrosRes.data || []);
      } catch (_) {}
    } catch (error) {
      console.error(error);

      if (error.response?.data?.errors) {
        setMensajeTipo("error");
        setMensaje("Error del backend: " + JSON.stringify(error.response.data.errors));
      } else if (error.response?.data?.title) {
        setMensajeTipo("error");
        setMensaje("Error: " + error.response.data.title);
      } else {
        setMensajeTipo("error");
        setMensaje("Error al registrar el movimiento ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  const iconTipo = tipoMovimiento === "entrada" ? (
    <FaArrowDown className="text-green-700" />
  ) : (
    <FaArrowUp className="text-blue-700" />
  );

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white border border-gray-200 shadow-md rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                  {iconTipo}
                  Registrar movimiento
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Entradas y salidas de suministros con validación básica.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">
                  Suministros: {suministros.length}
                </span>
                <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">
                  Ubicaciones: {ubicaciones.length}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {mensaje && (
              <div
                className={`mb-5 rounded-xl border p-4 text-sm font-semibold ${
                  mensajeTipo === "ok"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {mensaje}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de movimiento
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleTipoMovimiento("entrada")}
                      className={`rounded-xl px-3 py-2 font-semibold border transition ${
                        tipoMovimiento === "entrada"
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      Entrada
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTipoMovimiento("salida")}
                      className={`rounded-xl px-3 py-2 font-semibold border transition ${
                        tipoMovimiento === "salida"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      Salida
                    </button>
                  </div>
                </div>

                <div className="md:col-span-8 relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Suministro
                  </label>

                  <input
                    type="text"
                    value={suministroQuery}
                    onChange={handleSuministroQueryChange}
                    onFocus={() => {
                      if (sugerenciasSuministros.length > 0) setOpenSugSuministro(true);
                    }}
                    onBlur={() => {
                      blurSuministroRef.current = setTimeout(() => setOpenSugSuministro(false), 150);
                    }}
                    autoComplete="off"
                    placeholder="Escribí el nombre del suministro..."
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />

                  {openSugSuministro && sugerenciasSuministros.length > 0 && (
                    <ul
                      className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-auto z-20"
                      onMouseDown={() => {
                        if (blurSuministroRef.current) clearTimeout(blurSuministroRef.current);
                      }}
                    >
                      {sugerenciasSuministros.map((s) => (
                        <li
                          key={s.id}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between gap-3"
                          onClick={() => seleccionarSuministro(s)}
                        >
                          <span className="font-semibold text-gray-900">{s.nombreProducto}</span>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            Actual: {s.cantidadActual}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {openSugSuministro &&
                    suministroQuery.trim().length > 0 &&
                    sugerenciasSuministros.length === 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        No se encontraron suministros con ese nombre.
                      </p>
                    )}

                  {suministroSeleccionado && (
                    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                        <FaBoxesStacked className="text-gray-700" />
                      </div>
                      <div className="text-sm">
                        <p className="font-bold text-gray-900">
                          {suministroSeleccionado.nombreProducto}
                        </p>
                        <p className="text-gray-600">
                          Existencia actual:{" "}
                          <span className="font-semibold text-gray-900">
                            {suministroSeleccionado.cantidadActual}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    required
                    placeholder="Cantidad a registrar"
                    className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {tipoMovimiento === "salida" && (
                  <>
                    <div className="md:col-span-5 relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Persona responsable
                      </label>
                      <input
                        type="text"
                        name="personaResponsable"
                        value={formData.personaResponsable}
                        onChange={handleChange}
                        onFocus={() => {
                          if (sugerencias.length > 0) setOpenSug(true);
                        }}
                        onBlur={() => {
                          blurRef.current = setTimeout(() => setOpenSug(false), 150);
                        }}
                        autoComplete="off"
                        placeholder="Escribe el nombre"
                        className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />

                      {openSug && sugerencias.length > 0 && (
                        <ul
                          className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-auto z-20"
                          onMouseDown={() => {
                            if (blurRef.current) clearTimeout(blurRef.current);
                          }}
                        >
                          {sugerencias.map((emp) => (
                            <li
                              key={emp.codigoEmpleado}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                              onClick={() => seleccionarEmpleado(emp)}
                            >
                              <div className="font-semibold text-gray-900">{emp.nombre}</div>
                              <div className="text-xs text-gray-600">{emp.departamento}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Departamento
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="departamentoResponsable"
                          value={formData.departamentoResponsable}
                          readOnly
                          className="w-full rounded-xl border border-gray-300 bg-gray-100 p-3 text-gray-800"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                          <FaUserCheck />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-extrabold transition ${
                    loading
                      ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <FaFloppyDisk />
                  {loading ? "Guardando..." : "Registrar movimiento"}
                </button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  Tip: para salidas, buscá y seleccioná la persona para que se llene el
                  departamento automáticamente.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}