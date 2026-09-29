import React, { useEffect, useState } from "react";
import { toast } from "../../utils/toast";
import { useEmpresa } from "../../context/empresa";
import VehiculosService from "../../services/VehiculosServices";
import { limpiarPayload } from "../../services/payload";
import UbicacionesService from "../../services/UbicacionesServices";
import useFamilias from "../../hooks/useFamilias";
import { TablaContenedor, Tabla, THead, Th, TBody, Tr, Td, TrCargando, TrVacia } from "../ui/Tabla";


export default function EditarVehiculo() {
  const { empresa } = useEmpresa();
  const familiasCatalogo = useFamilias("Vehículos");
  const [vehiculos, setVehiculos] = useState([]);
  const [loadingLista, setLoadingLista] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [vehiculo, setVehiculo] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoadingLista(true);
        const res = await VehiculosService.obtenerTodos({ empresa });
        const lista = Array.isArray(res.data) ? res.data : res.data?.$values ?? [];
        setVehiculos(lista);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar vehículos");
      } finally {
        setLoadingLista(false);
      }
    };
    cargar();

    const cargarUbicaciones = async () => {
      try {
        const res = await UbicacionesService.obtenerTodas();
        const data = Array.isArray(res.data) ? res.data : res.data?.$values ?? [];
        setUbicaciones(data);
      } catch (error) {
        console.error("Error cargando ubicaciones:", error);
      }
    };
    cargarUbicaciones();
       
  }, [empresa]);

  const filtrados = vehiculos.filter((v) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return [v.codificacion, v.marca, v.modelo, v.placa].join(" ").toLowerCase().includes(q);
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehiculo((prev) => ({ ...prev, [name]: value }));
  };

  const guardarCambios = async () => {
    if (!vehiculo?.id) return;
    try {
      setSaving(true);
      const payload = limpiarPayload(vehiculo, {
        fechas: ["fechaIngreso", "fechaActualizacion", "fechaAsignacion", "fechaUltimaActualizacionKm"],
        numeros: ["modeloAnio", "kilometrajeActual", "kilometrajeAsignacion"],
        omitir: ["historialReparaciones", "mantenimientos", "alertasServicio", "bitacoraFallas", "polizasSeguro", "reportesEstadoFisico"],
      });
      await VehiculosService.editar(vehiculo.id, payload);
      toast.success("Vehículo actualizado correctamente");
      setVehiculo(null);
      const res = await VehiculosService.obtenerTodos({ empresa });
      const lista = Array.isArray(res.data) ? res.data : res.data?.$values ?? [];
      setVehiculos(lista);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el vehículo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-52px)] bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h1 className="text-xl font-bold text-slate-900">Editar vehículo</h1>
          <p className="mt-1 text-sm text-slate-600">Selecciona un vehículo de la lista para actualizar su información.</p>
        </div>

        {!vehiculo ? (
          <div className="p-6">
            <label className="text-xs font-semibold text-slate-700">Buscar por codificación, marca, modelo o placa</label>
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Ej: VEH-001" />

            <TablaContenedor className="mt-4 max-h-96">
              <Tabla>
                <THead>
                  <tr>
                    <Th>Codificación</Th>
                    <Th>Marca</Th>
                    <Th>Modelo</Th>
                    <Th>Placa</Th>
                    <Th></Th>
                  </tr>
                </THead>
                <TBody>
                  {loadingLista ? (
                    <TrCargando colSpan={5} />
                  ) : filtrados.length > 0 ? (
                    filtrados.map((v, i) => (
                      <Tr key={v.id} index={i}>
                        <Td destacado>{v.codificacion || "-"}</Td>
                        <Td>{v.marca || "-"}</Td>
                        <Td>{v.modelo || "-"}</Td>
                        <Td>{v.placa || "-"}</Td>
                        <Td>
                          <button onClick={() => setVehiculo(v)} className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white">Editar</button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <TrVacia colSpan={5}>No se encontraron vehículos.</TrVacia>
                  )}
                </TBody>
              </Tabla>
            </TablaContenedor>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex flex-col md:col-span-2"><label className="text-xs font-semibold text-slate-700">Familia</label><select name="tipoEquipo" value={vehiculo.tipoEquipo || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Seleccione familia</option>{[...new Set([vehiculo.tipoEquipo, ...familiasCatalogo].filter(Boolean))].map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Codificación</label><input value={vehiculo.codificacion || ""} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Marca</label><input name="marca" value={vehiculo.marca || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Modelo</label><input name="modelo" value={vehiculo.modelo || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Placa</label><input name="placa" value={vehiculo.placa || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">VIN</label><input name="vin" value={vehiculo.vin || ""} onChange={handleChange} maxLength={17} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Año</label><input type="number" name="modeloAnio" value={vehiculo.modeloAnio || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Color</label><input name="color" value={vehiculo.color || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Tipo combustible</label><input name="tipoCombustible" value={vehiculo.tipoCombustible || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Kilometraje actual</label><input type="number" name="kilometrajeActual" value={vehiculo.kilometrajeActual || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Estado</label><select name="estado" value={vehiculo.estado || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Seleccione</option><option value="Operativo">Operativo</option><option value="En taller">En taller</option><option value="Fuera de servicio">Fuera de servicio</option></select></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Ubicación</label><select name="ubicacion" value={vehiculo.ubicacion || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Seleccione ubicación</option>{ubicaciones.map((u) => <option key={u.id ?? u.nombre} value={u.nombre}>{u.nombre}</option>)}</select></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Orden de compra</label><input name="ordenCompra" value={vehiculo.ordenCompra || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Factura</label><input name="factura" value={vehiculo.factura || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Proveedor</label><input name="proveedor" value={vehiculo.proveedor || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Responsable anterior</label><input name="responsableAnterior" value={vehiculo.responsableAnterior || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col md:col-span-2"><label className="text-xs font-semibold text-slate-700">Comentarios</label><textarea name="comentarios" value={vehiculo.comentarios || ""} onChange={handleChange} rows="2" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col md:col-span-2"><label className="text-xs font-semibold text-slate-700">Observaciones</label><textarea name="observaciones" value={vehiculo.observaciones || ""} onChange={handleChange} rows="2" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setVehiculo(null)} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Cancelar</button>
              <button type="button" onClick={guardarCambios} disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Guardando..." : "Guardar cambios"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
