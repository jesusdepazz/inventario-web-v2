import React, { useEffect, useState } from "react";
import { toast } from "../../utils/toast";
import { useEmpresa } from "../../context/empresa";
import InmueblesService from "../../services/InmueblesServices";
import { limpiarPayload } from "../../services/payload";
import useFamilias from "../../hooks/useFamilias";
import { TablaContenedor, Tabla, THead, Th, TBody, Tr, Td, TrCargando, TrVacia } from "../ui/Tabla";
import Badge from "../ui/Badge";


export default function EditarInmueble() {
  const { empresa } = useEmpresa();
  const familiasCatalogo = useFamilias("Inmuebles");
  const [inmuebles, setInmuebles] = useState([]);
  const [loadingLista, setLoadingLista] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [inmueble, setInmueble] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoadingLista(true);
        const res = await InmueblesService.obtenerTodos({ empresa });
        const lista = Array.isArray(res.data) ? res.data : res.data?.$values ?? [];
        setInmuebles(lista);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar inmuebles");
      } finally {
        setLoadingLista(false);
      }
    };
    cargar();
       
  }, [empresa]);

  const filtrados = inmuebles.filter((i) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return [i.codificacion, i.descripcion, i.direccion].join(" ").toLowerCase().includes(q);
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInmueble((prev) => ({ ...prev, [name]: value }));
  };

  const guardarCambios = async () => {
    if (!inmueble?.id) return;
    try {
      setSaving(true);
      const payload = limpiarPayload(inmueble, {
        fechas: ["fechaOrdenCompra", "fechaFactura"],
        omitir: ["archivos", "polizas"],
      });
      await InmueblesService.editar(inmueble.id, payload);
      toast.success("Inmueble actualizado correctamente");
      setInmueble(null);
      const res = await InmueblesService.obtenerTodos({ empresa });
      const lista = Array.isArray(res.data) ? res.data : res.data?.$values ?? [];
      setInmuebles(lista);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el inmueble");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-52px)] bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h1 className="text-xl font-bold text-slate-900">Editar inmueble</h1>
          <p className="mt-1 text-sm text-slate-600">Selecciona un inmueble de la lista para actualizar su información.</p>
        </div>

        {!inmueble ? (
          <div className="p-6">
            <label className="text-xs font-semibold text-slate-700">Buscar por descripción o dirección</label>
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Ej: Oficina central" />

            <TablaContenedor className="mt-4 max-h-96">
              <Tabla>
                <THead>
                  <tr>
                    <Th>Descripción</Th>
                    <Th>Dirección</Th>
                    <Th>Estado</Th>
                    <Th></Th>
                  </tr>
                </THead>
                <TBody>
                  {loadingLista ? (
                    <TrCargando colSpan={4} />
                  ) : filtrados.length > 0 ? (
                    filtrados.map((i, idx) => (
                      <Tr key={i.id} index={idx}>
                        <Td destacado>{i.descripcion || "-"}</Td>
                        <Td>{i.direccion || "-"}</Td>
                        <Td>{i.estado ? <Badge>{i.estado}</Badge> : "-"}</Td>
                        <Td>
                          <button onClick={() => setInmueble(i)} className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white">Editar</button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <TrVacia colSpan={4}>No se encontraron inmuebles.</TrVacia>
                  )}
                </TBody>
              </Tabla>
            </TablaContenedor>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex flex-col md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Familia</label>
                <select name="nombreCatalogoActivo" value={inmueble.nombreCatalogoActivo || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
                  <option value="">Seleccione familia</option>
                  {[...new Set([inmueble.nombreCatalogoActivo, ...familiasCatalogo].filter(Boolean))].map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="flex flex-col md:col-span-2"><label className="text-xs font-semibold text-slate-700">Codificación</label><input name="codificacion" value={inmueble.codificacion || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col md:col-span-2"><label className="text-xs font-semibold text-slate-700">Descripción</label><input name="descripcion" value={inmueble.descripcion || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col md:col-span-2"><label className="text-xs font-semibold text-slate-700">Dirección</label><input name="direccion" value={inmueble.direccion || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Estado</label><select name="estado" value={inmueble.estado || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="disponible">Disponible</option><option value="reservada">Reservada</option><option value="vendida">Vendida</option><option value="alquilada">Alquilada</option></select></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Número de orden de compra</label><input name="numeroOrdenCompra" value={inmueble.numeroOrdenCompra || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Fecha de orden de compra</label><input type="date" name="fechaOrdenCompra" value={inmueble.fechaOrdenCompra ? String(inmueble.fechaOrdenCompra).slice(0,10) : ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Número de factura electrónica</label><input name="numeroFacturaElectronica" value={inmueble.numeroFacturaElectronica || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Fecha de factura</label><input type="date" name="fechaFactura" value={inmueble.fechaFactura ? String(inmueble.fechaFactura).slice(0,10) : ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs font-semibold text-slate-700">Nombre del proveedor</label><input name="nombreProveedor" value={inmueble.nombreProveedor || ""} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
              <div className="flex flex-col md:col-span-2"><label className="text-xs font-semibold text-slate-700">Ficha técnica</label><textarea name="fichaTecnica" value={inmueble.fichaTecnica || ""} onChange={handleChange} rows="3" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setInmueble(null)} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Cancelar</button>
              <button type="button" onClick={guardarCambios} disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Guardando..." : "Guardar cambios"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
