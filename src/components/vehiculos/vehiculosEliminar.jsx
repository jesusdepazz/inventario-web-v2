import React, { useEffect, useState } from "react";
import { toast } from "../../utils/toast";
import { useEmpresa } from "../../context/empresa";
import VehiculosService from "../../services/VehiculosServices";
import { TablaContenedor, Tabla, THead, Th, TBody, Tr, Td, TrCargando, TrVacia } from "../ui/Tabla";

export default function EliminarVehiculos() {
  const { empresa } = useEmpresa();
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await VehiculosService.obtenerTodos({ empresa });
      const lista = Array.isArray(res.data) ? res.data : res.data?.$values ?? [];
      setVehiculos(lista);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar vehículos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresa]);

  const eliminar = async (id) => {
    if (!window.confirm("¿Desea eliminar este vehículo?")) return;
    try {
      setDeletingId(id);
      await VehiculosService.eliminar(id);
      toast.success("Vehículo eliminado");
      await cargar();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900">Eliminar vehículos</h1>
      </div>

      <TablaContenedor className="flex-1">
        <Tabla>
          <THead>
            <tr>
              <Th>Codificación</Th>
              <Th>Marca</Th>
              <Th>Modelo</Th>
              <Th>Placa</Th>
              <Th>Ubicación</Th>
              <Th>Acción</Th>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <TrCargando colSpan={6} />
            ) : vehiculos.length > 0 ? (
              vehiculos.map((v, i) => (
                <Tr key={v.id} index={i}>
                  <Td destacado>{v.codificacion || "-"}</Td>
                  <Td>{v.marca || "-"}</Td>
                  <Td>{v.modelo || "-"}</Td>
                  <Td>{v.placa || "-"}</Td>
                  <Td>{v.ubicacion || "-"}</Td>
                  <Td><button onClick={() => eliminar(v.id)} disabled={deletingId === v.id} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{deletingId === v.id ? "Eliminando..." : "Eliminar"}</button></Td>
                </Tr>
              ))
            ) : (
              <TrVacia colSpan={6}>No hay vehículos para eliminar.</TrVacia>
            )}
          </TBody>
        </Tabla>
      </TablaContenedor>
    </div>
  );
}
