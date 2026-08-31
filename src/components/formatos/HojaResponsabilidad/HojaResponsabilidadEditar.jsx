import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HojasService from "../../../services/HojasServices";
import EquiposService from "../../../services/EquiposServices";
import EmpleadosService from "../../../services/EmpleadosServices";
import AsignacionesService from "../../../services/AsignacionesServices";

const HojaResponsabilidadEditar = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hojaNo, setHojaNo] = useState("");
  const [tipoHoja, setTipoHoja] = useState("");
  const [motivo, setMotivo] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [estado, SetEstado] = useState("");
  const [solvenciaNo, SetSolvenciaNo] = useState("");
  const [fechaSolvencia, SetFechaSolvencia] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [empleados, setEmpleados] = useState([]);
  const [jefeInmediato, setJefeInmediato] = useState("");
  const [jefeSeleccionado, setJefeSeleccionado] = useState(null);
  const [jefeSuggestions, setJefeSuggestions] = useState([]);
  const [isTypingJefe, setIsTypingJefe] = useState(false);
  const [equipos, setEquipos] = useState([]);
  const [empleadoCodigo, setEmpleadoCodigo] = useState("");
  const [equipoCodificacion, setEquipoCodificacion] = useState("");
  const [accesorios, setAccesorios] = useState([]);

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

  useEffect(() => {
    const fetchHoja = async () => {
      try {
        const h = await HojasService.obtenerHoja(id);

        setHojaNo(h.hojaNo || "");
        setTipoHoja(h.tipoHoja || "");
        setMotivo(h.motivo || "");
        setComentarios(h.comentarios || "");
        SetEstado(h.estado || "");
        setObservaciones(h.observaciones || "");
        SetSolvenciaNo(h.solvenciaNo || "");
        SetFechaSolvencia(h.fechaSolvencia?.slice(0, 10) || "");

        const acc =
          typeof h.accesorios === "string" && h.accesorios.trim().length > 0
            ? h.accesorios.split(",").map((x) => x.trim()).filter(Boolean)
            : [];
        setAccesorios(acc);

        if (h.jefeInmediato) {
          setJefeInmediato(h.jefeInmediato);
          const parts = h.jefeInmediato.split(" - ");
          setJefeSeleccionado({
            nombre: parts?.[0] || h.jefeInmediato,
            puesto: parts?.[1] || "",
            departamento: parts?.[2] || "",
          });
        }

        const emps = Array.isArray(h.empleados)
          ? h.empleados
          : Array.isArray(h.empleados?.$values)
          ? h.empleados.$values
          : [];
        setEmpleados(emps);

        const eqs = Array.isArray(h.equipos)
          ? h.equipos
          : Array.isArray(h.equipos?.$values)
          ? h.equipos.$values
          : [];
        setEquipos(eqs);
      } catch (err) {
        console.error(err);
        alert("Error al cargar la hoja");
      }
    };

    fetchHoja();
  }, [id]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (jefeInmediato.trim().length < 2) {
        setJefeSuggestions([]);
        return;
      }

      try {
        const res = await EmpleadosService.buscarPorNombre(jefeInmediato);
        const lista = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.$values)
          ? res.data.$values
          : [];
        setJefeSuggestions(lista);
        setIsTypingJefe(true);
      } catch (err) {
        console.error(err);
        setJefeSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [jefeInmediato]);

  const selectJefe = (j) => {
    setJefeSeleccionado(j);
    const txt =
      j?.departamento
        ? `${j.nombre} - ${j.puesto} - ${j.departamento}`
        : `${j.nombre} - ${j.puesto}`;
    setJefeInmediato(txt);
    setJefeSuggestions([]);
    setIsTypingJefe(false);
  };

  const agregarEmpleado = async () => {
    if (!empleadoCodigo?.trim()) return;

    try {
      const res = await EmpleadosService.obtenerPorCodigo(empleadoCodigo.trim());
      const emp = res.data;

      setEmpleados((prev) => {
        const existe = prev.some(
          (e) => (e.codigoEmpleado ?? e.empleadoId) === (emp.codigoEmpleado ?? emp.empleadoId)
        );
        if (existe) return prev;
        return [...prev, emp];
      });

      const resEquipos = await AsignacionesService.obtenerEquiposPorEmpleado(
        emp.codigoEmpleado ?? emp.empleadoId
      );

      const lista = Array.isArray(resEquipos?.data)
        ? resEquipos.data
        : Array.isArray(resEquipos?.data?.$values)
        ? resEquipos.data.$values
        : [];

      setEquipos((prev) => {
        const normPrev = prev.map((x) => ({
          Codificacion: x.Codificacion ?? x.codificacion,
          Marca: x.Marca ?? x.marca,
          Modelo: x.Modelo ?? x.modelo,
          Serie: x.Serie ?? x.serie,
          TipoEquipo: x.TipoEquipo ?? x.tipoEquipo,
          Ubicacion: x.Ubicacion ?? x.ubicacion,
          FechaIngreso: x.FechaIngreso ?? x.fechaIngreso,
          Estado: x.Estado ?? x.estado ?? "Activo",
          EquipoTipo: x.EquipoTipo ?? x.equipoTipo,
          Extension: x.Extension ?? x.extension,
          NumeroAsignado: x.NumeroAsignado ?? x.numeroAsignado,
          Imei: x.Imei ?? x.imei,
        }));

        const map = new Map(normPrev.map((x) => [x.Codificacion, x]));
        for (const eq of lista) {
          const dto = {
            Codificacion: eq.codificacion ?? eq.Codificacion,
            Marca: eq.marca ?? eq.Marca,
            Modelo: eq.modelo ?? eq.Modelo,
            Serie: eq.serie ?? eq.Serie,
            TipoEquipo: eq.tipoEquipo ?? eq.TipoEquipo,
            Ubicacion: eq.ubicacion ?? eq.Ubicacion,
            FechaIngreso: eq.fechaIngreso ?? eq.FechaIngreso,
            Estado: eq.estado ?? eq.Estado ?? "Activo",
            EquipoTipo: eq.equipoTipo ?? eq.EquipoTipo,
            Extension: eq.extension ?? eq.Extension,
            NumeroAsignado: eq.numeroAsignado ?? eq.NumeroAsignado,
            Imei: eq.imei ?? eq.Imei,
          };
          if (dto.Codificacion) map.set(dto.Codificacion, dto);
        }
        return Array.from(map.values());
      });

      setEmpleadoCodigo("");
    } catch (err) {
      console.error(err);
      alert("Empleado no encontrado o sin equipos asignados");
    }
  };

  const eliminarEmpleado = (index) => setEmpleados((prev) => prev.filter((_, i) => i !== index));

  const agregarEquipo = async () => {
    if (!equipoCodificacion?.trim()) return;

    try {
      const res = await EquiposService.obtenerPorCodificacion(equipoCodificacion.trim());
      const eq = res.data;

      const equipoDTO = {
        Codificacion: eq.codificacion,
        Marca: eq.marca,
        Modelo: eq.modelo,
        Serie: eq.serie,
        TipoEquipo: eq.tipoEquipo,
        Ubicacion: eq.ubicacion,
        FechaIngreso: eq.fechaIngreso,
        Estado: eq.estado || "Activo",
        EquipoTipo: eq.equipoTipo,
        Extension: eq.extension,
        NumeroAsignado: eq.numeroAsignado,
        Imei: eq.imei,
      };

      setEquipos((prev) => {
        const existe = prev.some(
          (x) => (x.Codificacion ?? x.codificacion) === equipoDTO.Codificacion
        );
        if (existe) return prev;
        return [...prev, equipoDTO];
      });

      setEquipoCodificacion("");
    } catch (err) {
      console.error(err);
      alert("Equipo no encontrado");
    }
  };

  const eliminarEquipo = (index) => setEquipos((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      HojaNo: hojaNo,
      TipoHoja: tipoHoja,
      Motivo: motivo,
      Comentarios: comentarios,
      Estado: estado,
      Observaciones: observaciones,
      Accesorios: accesorios.join(", "),
      JefeInmediato: jefeSeleccionado
        ? jefeSeleccionado?.departamento
          ? `${jefeSeleccionado.nombre} - ${jefeSeleccionado.puesto} - ${jefeSeleccionado.departamento}`
          : `${jefeSeleccionado.nombre} - ${jefeSeleccionado.puesto}`
        : jefeInmediato,
      Empleados: empleados.map((emp) => ({
        EmpleadoId: emp.codigoEmpleado ?? emp.empleadoId,
        Nombre: emp.nombre,
        Puesto: emp.puesto,
        Departamento: emp.departamento,
      })),
      Equipos: equipos.map((eq) => ({
        Codificacion: eq.Codificacion ?? eq.codificacion,
        Marca: eq.Marca ?? eq.marca,
        Modelo: eq.Modelo ?? eq.modelo,
        Serie: eq.Serie ?? eq.serie,
        TipoEquipo: eq.TipoEquipo ?? eq.tipoEquipo,
        Ubicacion: eq.Ubicacion ?? eq.ubicacion,
        FechaIngreso: eq.FechaIngreso ?? eq.fechaIngreso,
        Estado: eq.Estado ?? eq.estado ?? "Activo",
        EquipoTipo: eq.EquipoTipo ?? eq.equipoTipo,
        Extension: eq.Extension ?? eq.extension,
        NumeroAsignado: eq.NumeroAsignado ?? eq.numeroAsignado,
        Imei: eq.Imei ?? eq.imei,
      })),
      ...(estado === "Inactiva" && {
        SolvenciaNo: solvenciaNo,
        FechaSolvencia: fechaSolvencia,
      }),
    };

    try {
      await HojasService.actualizarHoja(id, payload);
      alert("Hoja actualizada correctamente");
      navigate("/formatos/listahojasresponsabilidad");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la hoja");
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-56px)] px-4 py-6">
      <div className="max-w-6xl mx-auto h-[calc(100vh-56px-48px)]">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden h-full flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex-none">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Editar Hoja de Responsabilidad</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Actualizá los datos, empleados y equipos. No se corta: el scroll es interno.
                </p>
              </div>
              <div className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                Hoja: <span className="text-slate-900">{hojaNo || "-"}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-7 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="text-base font-semibold text-slate-900">Detalles de la hoja</h3>
                      <p className="text-sm text-slate-600">Información general.</p>
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-slate-600">Hoja No.</label>
                          <input
                            value={hojaNo}
                            readOnly
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 cursor-not-allowed"
                          />
                        </div>

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
                            <option value="">-- Selecciona --</option>
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
                              <label className="text-xs font-medium text-slate-600">Fecha Solvencia</label>
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
                            onChange={(e) => setObservaciones(e.target.value)}
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
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="text-base font-semibold text-slate-900">Empleados</h3>
                      <p className="text-sm text-slate-600">Agregá por código.</p>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-8">
                          <label className="text-xs font-medium text-slate-600">Código de empleado</label>
                          <input
                            placeholder="Ej: T03108"
                            value={empleadoCodigo}
                            onChange={(e) => setEmpleadoCodigo(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                          <div className="text-sm font-semibold text-slate-900">Lista</div>
                          <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-full">
                            {empleados.length}
                          </span>
                        </div>

                        <div className="max-h-56 overflow-auto">
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
                                onClick={() => selectJefe(j)}
                              >
                                <div className="text-sm font-semibold text-slate-900">{j.nombre}</div>
                                <div className="text-xs text-slate-600 mt-1">
                                  {j.puesto}
                                  {j.departamento ? ` · ${j.departamento}` : ""}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {jefeSeleccionado && (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">
                              {jefeSeleccionado.nombre}
                            </div>
                            <div className="text-xs text-slate-600 mt-1 truncate">
                              {jefeSeleccionado.puesto}
                              {jefeSeleccionado.departamento ? ` · ${jefeSeleccionado.departamento}` : ""}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-red-600 font-semibold text-sm hover:underline"
                            onClick={() => {
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
                      <h3 className="text-base font-semibold text-slate-900">Equipos</h3>
                      <p className="text-sm text-slate-600">Agregá por codificación.</p>
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
                          <div className="text-sm font-semibold text-slate-900">Lista</div>
                          <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-full">
                            {equipos.length}
                          </span>
                        </div>

                        <div className="max-h-72 overflow-auto">
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
                                      {(eq.Codificacion ?? eq.codificacion) || "-"}
                                    </div>
                                    <div className="text-xs text-slate-600 mt-1 truncate">
                                      {(eq.Marca ?? eq.marca) || ""} {(eq.Modelo ?? eq.modelo) || ""}
                                      {(eq.Serie ?? eq.serie) ? ` · ${(eq.Serie ?? eq.serie)}` : ""}
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
                        Tip: al agregar empleados, se pueden cargar equipos automáticamente.
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
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="rounded-xl bg-slate-100 text-slate-800 px-5 py-2 text-sm font-semibold hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 text-white px-6 py-2 text-sm font-semibold hover:bg-blue-700"
                  >
                    Actualizar Hoja
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HojaResponsabilidadEditar;