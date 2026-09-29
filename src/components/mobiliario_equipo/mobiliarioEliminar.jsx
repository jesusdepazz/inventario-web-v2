import React, { useEffect, useState } from "react";
import { toast } from "../../utils/toast";
import { useEmpresa } from "../../context/empresa";
import MobiliarioEquipoService from "../../services/MobiliarioEquipoServices";
import { TablaContenedor, Tabla, THead, Th, TBody, Tr, Td, TrCargando, TrVacia } from "../ui/Tabla";

export default function EliminarMobiliarioEquipo() {
  const { empresa } = useEmpresa();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await MobiliarioEquipoService.obtenerTodos({ empresa });
      const lista = Array.isArray(res.data) ? res.data : res.data?.$values ?? [];
      setItems(lista);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar registros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresa]);

  const eliminar = async (id) => {
    if (!window.confirm("¿Desea eliminar este activo?")) return;
    try {
      setDeletingId(id);
      await MobiliarioEquipoService.eliminar(id);
      toast.success("Activo eliminado");
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
        <h1 className="text-2xl font-extrabold text-slate-900">Eliminar mobiliario y equipo</h1>
      </div>

      <TablaContenedor className="flex-1">
        <Tabla>
          <THead>
            <tr>
              <Th>Codificación</Th>
              <Th>Familia</Th>
              <Th>Marca</Th>
              <Th>Modelo</Th>
              <Th>Ubicación</Th>
              <Th>Acción</Th>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <TrCargando colSpan={6} />
            ) : items.length > 0 ? (
              items.map((item, i) => (
                <Tr key={item.id} index={i}>
                  <Td destacado>{item.codificacion || "-"}</Td>
                  <Td>{item.tipoEquipo || "-"}</Td>
                  <Td>{item.marca || "-"}</Td>
                  <Td>{item.modelo || "-"}</Td>
                  <Td>{item.ubicacion || "-"}</Td>
                  <Td><button onClick={() => eliminar(item.id)} disabled={deletingId === item.id} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{deletingId === item.id ? "Eliminando..." : "Eliminar"}</button></Td>
                </Tr>
              ))
            ) : (
              <TrVacia colSpan={6}>No hay activos para eliminar.</TrVacia>
            )}
          </TBody>
        </Tabla>
      </TablaContenedor>
    </div>
  );
}
