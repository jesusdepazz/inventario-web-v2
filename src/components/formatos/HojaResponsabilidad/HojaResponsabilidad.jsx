import React, { useState, useEffect, useMemo } from "react";
import HojasService from "../../../services/HojasServices";
import EquiposService from "../../../services/EquiposServices";
import EmpleadosService from "../../../services/EmpleadosServices";
import AsignacionesService from "../../../services/AsignacionesServices";
import EmpleadosExternosService from "../../../services/EmpleadosExternosServices";

const HojaResponsabilidadForm = () => {
  const [tipoHoja, setTipoHoja] = useState("");
  const [hojaNo, setHojaNo] = useState("");
  const [motivo, setMotivo] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [estado, SetEstado] = useState("");
  const [solvenciaNo, SetSolvenciaNo] = useState("");
  const [fechaSolvencia, SetFechaSolvencia] = useState("");
  const [observaciones, SetObservaciones] = useState("");
  const [empleados, setEmpleados] = useState([]);
  const [jefeInmediato, setJefeInmediato] = useState("");
  const [jefeData, setJefeData] = useState(null);
  const [jefeSuggestions, setJefeSuggestions] = useState([]);
  const [isTypingJefe, setIsTypingJefe] = useState(false);
  const [jefeSeleccionado, setJefeSeleccionado] = useState(null);
  const [equipos, setEquipos] = useState([]);
  const [empleadoCodigo, setEmpleadoCodigo] = useState("");
  const [equipoCodificacion, setEquipoCodificacion] = useState("");
  const [accesorios, setAccesorios] = useState([]);
  const [modoExterno, setModoExterno] = useState(false);
  const [proyecto, setProyecto] = useState("");

  const accesoriosDisponibles = useMemo(
    () => [
      "Maletin",
      "Adaptador",
      "Cable USB",
      "Cargador/Cubo",
      "Audifonos",
      "Control Remoto",
      "Baterias",
      "Estuche",
      "Memoria SD",
      "Otros",
    ],
    []
  );

  const agregarEmpleado = async () => {
    if (!empleadoCodigo?.trim()) return;

    try {
      let empleado;

      if (modoExterno) {
        const res = await EmpleadosExternosService.obtenerPorCodigo(empleadoCodigo.trim());
        const ext = res.data;
        empleado = {
          codigoEmpleado: ext.codigoEmpleado,
          nombre: ext.nombre,
          puesto: ext.puesto,
          departamento: ext.documento,
        };
        if (ext.proyecto) setProyecto(ext.proyecto);
      } else {
        const res = await EmpleadosService.obtenerPorCodigo(empleadoCodigo.trim());
        empleado = res.data;
      }

      setEmpleados((prev) => {
        const existe = prev.some((e) => e.codigoEmpleado === empleado.codigoEmpleado);
        if (existe) return prev;
        return [...prev, empleado];
      });

      const resEquipos = await AsignacionesService.obtenerEquiposPorEmpleado(
        empleado.codigoEmpleado
      );
      const lista = Array.isArray(resEquipos.data)
        ? resEquipos.data
        : Array.isArray(resEquipos.data?.$values)
          ? resEquipos.data.$values
          : [];
      setEquipos((prev) => {
        const map = new Map(prev.map((x) => [x.codificacion, x]));
        for (const it of lista)
          map.set(it.codificacion, { ...it, observaciones: "" });
        return Array.from(map.values());
      });

      setEmpleadoCodigo("");
    } catch (err) {
      console.error(err);
      window.alert(
        modoExterno
          ? "Empleado externo no encontrado. Verificá el código."
          : "Empleado no encontrado o sin equipos asignados"
      );
    }
  };

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (jefeInmediato.trim().length < 2) {
        setJefeSuggestions([]);
        return;
      }

      try {
        const res = await EmpleadosService.buscarPorNombre(jefeInmediato);

        if (Array.isArray(res?.data)) {
          setJefeSuggestions(res.data);
          setIsTypingJefe(true);
        } else if (Array.isArray(res?.data?.$values)) {
          setJefeSuggestions(res.data.$values);
          setIsTypingJefe(true);
        } else {
          setJefeSuggestions([]);
        }
      } catch (err) {
        console.error(err);
        setJefeSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [jefeInmediato]);

  const selectJefe = (jefe) => {
    setJefeData(jefe);
    setJefeSeleccionado(jefe);
    setJefeInmediato(jefe.nombre);
    setJefeSuggestions([]);
  };

  const eliminarEmpleado = (index) => {
    setEmpleados((prev) => prev.filter((_, i) => i !== index));
  };

  const agregarEquipo = async () => {
    if (!equipoCodificacion?.trim()) return;

    try {
      const res = await EquiposService.obtenerPorCodificacion(equipoCodificacion.trim());
      const eq = res.data;

      setEquipos((prev) => {
        const existe = prev.some((x) => x.codificacion === eq.codificacion);
        if (existe) return prev;
        return [...prev, { ...eq, observaciones: "" }]; // 👈
      });

      setEquipoCodificacion("");
    } catch (err) {
      window.alert("Equipo no encontrado");
    }
  };

  const eliminarEquipo = (index) => {
    setEquipos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const accesoriosString =
      Array.isArray(accesorios) && accesorios.length > 0 ? accesorios.join(", ") : "";

    const empleadosMapped =
      Array.isArray(empleados) && empleados.length > 0
        ? empleados.map((emp) => ({
          EmpleadoId: emp.codigoEmpleado,
          Nombre: emp.nombre,
          Puesto: emp.puesto,
          Departamento: emp.departamento,
        }))
        : [];

    const equiposMapped =
      Array.isArray(equipos) && equipos.length > 0
        ? equipos.map((eq) => ({
          Codificacion: eq.codificacion,
          Marca: eq.marca,
          Modelo: eq.modelo,
          Serie: eq.serie,
          TipoEquipo: eq.tipoEquipo,
          Ubicacion: eq.ubicacion,
          FechaIngreso: eq.fechaIngreso,
          Estado: eq.estado,
          EquipoTipo: eq.equipoTipo,
          Extension: eq.extension,
          NumeroAsignado: eq.numeroAsignado,
          Imei: eq.imei,
          Observaciones: eq.observaciones || "",
        }))
        : [];

    const payload = {
      TipoHoja: tipoHoja,
      HojaNo: hojaNo,
      Motivo: motivo,
      Comentarios: comentarios,
      Estado: estado,
      Observaciones: observaciones,
      Accesorios: accesoriosString,
      JefeInmediato: jefeSeleccionado ? jefeSeleccionado.nombre : "",
      Proyecto: proyecto || null,
      Empleados: empleadosMapped,
      Equipos: equiposMapped,
      ...(estado === "Inactiva" && {
        SolvenciaNo: solvenciaNo,
        FechaSolvencia: fechaSolvencia,
      }),
    };

    try {
      const res = await HojasService.crearHoja(payload);
      console.log(payload.Equipos);
      window.alert("Hoja creada con éxito! ID: " + (res?.Id ?? ""));
    } catch (error) {
      if (error?.mensaje) window.alert("Error del servidor: " + error.mensaje);
      else {
        console.error(error);
        window.alert("Ocurrió un error al crear la hoja");
      }
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-56px)] px-4 py-6">
      <div className="max-w-6xl mx-auto h-[calc(100vh-56px-48px)]">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden h-full flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex-none">
            <h2 className="text-2xl font-bold text-slate-900">Crear Hoja de Responsabilidad</h2>
            <p className="text-sm text-slate-600 mt-1">
              Completá los datos, agregá empleados y equipos. Todo se guarda en una sola hoja.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-7 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="text-base font-semibold text-slate-900">Detalles de la hoja</h3>
                      <p className="text-sm text-slate-600">Información general de la hoja.</p>
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-slate-600">Tipo de hoja</label>
                          <select
                            value={tipoHoja}
                            onChange={(e) => setTipoHoja(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                          >
                            <option value="">-- Seleccione tipo de hoja --</option>
                            <option value="Computo">Hoja responsabilidad cómputo</option>
                            <option value="Movil">Hoja responsabilidad móvil</option>
                            <option value="Externo">Préstamo externo</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-600">Hoja No.</label>
                          <input
                            value={hojaNo}
                            onChange={(e) => setHojaNo(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-600">Motivo</label>
                          <input
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-600">Estado</label>
                          <select
                            value={estado}
                            onChange={(e) => SetEstado(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                          >
                            <option value="">-- Selecciona estado --</option>
                            <option value="Activa">Activa</option>
                            <option value="Inactiva">Inactiva</option>
                          </select>
                        </div>

                        {estado === "Inactiva" && (
                          <>
                            <div>
                              <label className="text-xs font-medium text-slate-600">No. Solvencia</label>
                              <input
                                value={solvenciaNo}
                                onChange={(e) => SetSolvenciaNo(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-medium text-slate-600">Fecha de solvencia</label>
                              <input
                                type="date"
                                value={fechaSolvencia}
                                onChange={(e) => SetFechaSolvencia(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                              />
                            </div>
                          </>
                        )}

                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-slate-600">Observaciones</label>
                          <input
                            value={observaciones}
                            onChange={(e) => SetObservaciones(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-slate-600">Comentarios</label>
                          <textarea
                            value={comentarios}
                            onChange={(e) => setComentarios(e.target.value)}
                            rows={3}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                          />
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">Accesorios</div>
                            <div className="text-xs text-slate-600 mt-1">
                              Seleccioná los accesorios entregados.
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-full">
                            {accesorios.length} seleccionados
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {accesoriosDisponibles.map((item) => (
                            <label
                              key={item}
                              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                            >
                              <input
                                type="checkbox"
                                checked={accesorios.includes(item)}
                                onChange={(e) => {
                                  if (e.target.checked) setAccesorios((prev) => [...prev, item]);
                                  else setAccesorios((prev) => prev.filter((a) => a !== item));
                                }}
                                className="h-4 w-4"
                              />
                              {item}
                            </label>
                          ))}
                        </div>
                      </div>

                      {modoExterno && (
                        <div className="mt-4">
                          <label className="text-xs font-medium text-slate-600">Proyecto</label>
                          <input
                            value={proyecto}
                            onChange={(e) => setProyecto(e.target.value)}
                            placeholder="Nombre del proyecto"
                            className="mt-1 w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">Agregar empleado</h3>
                        <p className="text-sm text-slate-600">Ingresá el código y agregalo a la hoja.</p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-xs font-medium text-slate-600">Externo</span>
                        <div
                          onClick={() => {
                            const siguiente = !modoExterno;
                            setModoExterno(siguiente);
                            setTipoHoja(siguiente ? "Externo" : "");
                          }}
                          className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${modoExterno ? "bg-amber-500" : "bg-slate-300"}`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${modoExterno ? "translate-x-5" : ""}`} />
                        </div>
                      </label>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-8">
                          <label className="text-xs font-medium text-slate-600">
                            {modoExterno ? "Código de empleado externo" : "Código de empleado"}
                          </label>
                          <input
                            placeholder={modoExterno ? "Ej: EXT-001" : "Ej: T03108"}
                            value={empleadoCodigo}
                            onChange={(e) => setEmpleadoCodigo(e.target.value)}
                            className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 ${modoExterno ? "border-amber-300 focus:ring-amber-500 focus:border-amber-500" : "border-slate-300 focus:ring-emerald-500 focus:border-emerald-500"}`}
                          />
                        </div>
                        <div className="sm:col-span-4 flex items-end">
                          <button
                            type="button"
                            onClick={agregarEmpleado}
                            className="w-full rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <div className="text-sm font-semibold text-slate-900">Empleados</div>
                          <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-full">
                            {empleados.length}
                          </span>
                        </div>

                        <div className="max-h-52 overflow-auto">
                          {empleados.length === 0 ? (
                            <div className="px-4 py-6 text-sm text-slate-500 text-center">
                              No hay empleados agregados todavía.
                            </div>
                          ) : (
                            <ul className="divide-y divide-slate-100">
                              {empleados.map((emp, i) => (
                                <li key={i} className="px-4 py-3 flex items-center justify-between">
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-900 truncate">
                                      {emp.nombre}
                                    </div>
                                    <div className="text-xs text-slate-600 mt-1 truncate">
                                      {emp.puesto} · {emp.departamento}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => eliminarEmpleado(i)}
                                    className="ml-3 text-red-600 font-semibold text-sm hover:underline"
                                  >
                                    Quitar
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-5 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="text-base font-semibold text-slate-900">Jefe inmediato</h3>
                      <p className="text-sm text-slate-600">Buscá por nombre y seleccioná.</p>
                    </div>

                    <div className="p-5">
                      <div className="relative">
                        <input
                          placeholder="Ingrese nombre del jefe inmediato"
                          value={jefeInmediato}
                          onChange={(e) => {
                            const val = e.target.value;
                            setJefeInmediato(val);
                            setIsTypingJefe(val.trim().length > 0);
                            if (val.trim().length < 2) setJefeSuggestions([]);
                          }}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                        />

                        {isTypingJefe && jefeSuggestions.length > 0 && (
                          <ul className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg z-50 max-h-64 overflow-auto">
                            {jefeSuggestions.map((j, i) => (
                              <li
                                key={i}
                                className="px-4 py-3 hover:bg-slate-50 cursor-pointer"
                                onClick={() => {
                                  selectJefe(j);
                                  setIsTypingJefe(false);
                                }}
                              >
                                <div className="text-sm font-semibold text-slate-900">{j.nombre}</div>
                                <div className="text-xs text-slate-600 mt-1">
                                  {j.puesto} · {j.departamento}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {jefeData && (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">
                              {jefeData.nombre}
                            </div>
                            <div className="text-xs text-slate-600 mt-1 truncate">
                              {jefeData.puesto} · {jefeData.departamento}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-red-600 font-semibold text-sm hover:underline"
                            onClick={() => {
                              setJefeData(null);
                              setJefeSeleccionado(null);
                              setJefeInmediato("");
                              setIsTypingJefe(false);
                            }}
                          >
                            Quitar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="text-base font-semibold text-slate-900">Agregar equipo</h3>
                      <p className="text-sm text-slate-600">Ingresá la codificación y agregalo.</p>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-8">
                          <label className="text-xs font-medium text-slate-600">Codificación</label>
                          <input
                            placeholder="Ej: EQ-IT-000123"
                            value={equipoCodificacion}
                            onChange={(e) => setEquipoCodificacion(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                          />
                        </div>
                        <div className="sm:col-span-4 flex items-end">
                          <button
                            type="button"
                            onClick={agregarEquipo}
                            className="w-full rounded-xl bg-blue-900 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-950"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <div className="text-sm font-semibold text-slate-900">Equipos</div>
                          <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-full">
                            {equipos.length}
                          </span>
                        </div>

                        <div className="max-h-64 overflow-auto">
                          {equipos.length === 0 ? (
                            <div className="px-4 py-6 text-sm text-slate-500 text-center">
                              No hay equipos agregados todavía.
                            </div>
                          ) : (
                            <ul className="divide-y divide-slate-100">
                              {equipos.map((eq, i) => (
                                <li key={i} className="px-4 py-3 flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-900 truncate">
                                      {eq.codificacion}
                                    </div>
                                    <div className="text-xs text-slate-600 mt-1 truncate">
                                      {eq.marca} {eq.modelo}
                                      {eq.serie ? ` · ${eq.serie}` : ""}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => eliminarEquipo(i)}
                                    className="text-red-600 font-semibold text-sm hover:underline"
                                  >
                                    Quitar
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                        Tip: si agregás empleados primero, se cargan automáticamente sus equipos asignados.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
              <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                <div className="text-sm text-slate-700">
                  Empleados: <b>{empleados.length}</b> · Equipos: <b>{equipos.length}</b>
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 text-white px-6 py-2 text-sm font-semibold hover:bg-blue-700"
                >
                  Crear Hoja
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HojaResponsabilidadForm;