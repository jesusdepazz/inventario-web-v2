import React, { useEffect, useState } from "react";
import { toast } from "../../utils/toast";
import { useEmpresa } from "../../context/empresa";
import InmueblesService from "../../services/InmueblesServices";
import { TablaContenedor, Tabla, THead, Th, TBody, Tr, Td, TrCargando, TrVacia } from "../ui/Tabla";
import Badge from "../ui/Badge";

export default function EliminarInmuebles() {
  const { empresa } = useEmpresa();
  const [inmuebles, setInmuebles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await InmueblesService.obtenerTodos({ empresa });
      const lista = Array.isArray(res.data) ? res.data : res.data?.$values ?? [];
      setInmuebles(lista);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar inmuebles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresa]);

  const eliminar = async (id) => {
    if (!window.confirm("¿Desea eliminar este inmueble?")) return;
    try {
      setDeletingId(id);
      await InmueblesService.eliminar(id);
      toast.success("Inmueble eliminado");
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
        <h1 className="text-2xl font-extrabold text-slate-900">Eliminar inmuebles</h1>
      </div>

      <TablaContenedor className="flex-1">
        <Tabla>
          <THead>
            <tr>
              <Th>Descripción</Th>
              <Th>Familia</Th>
              <Th>Dirección</Th>
              <Th>Estado</Th>
              <Th>Acción</Th>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <TrCargando colSpan={5} />
            ) : inmuebles.length > 0 ? (
              inmuebles.map((i, idx) => (
                <Tr key={i.id} index={idx}>
                  <Td destacado>{i.descripcion || "-"}</Td>
                  <Td>{i.nombreCatalogoActivo || "-"}</Td>
                  <Td>{i.direccion || "-"}</Td>
                  <Td>{i.estado ? <Badge>{i.estado}</Badge> : "-"}</Td>
                  <Td><button onClick={() => eliminar(i.id)} disabled={deletingId === i.id} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{deletingId === i.id ? "Eliminando..." : "Eliminar"}</button></Td>
                </Tr>
              ))
            ) : (
              <TrVacia colSpan={5}>No hay inmuebles para eliminar.</TrVacia>
            )}
          </TBody>
        </Tabla>
      </TablaContenedor>
    </div>
  );
}
