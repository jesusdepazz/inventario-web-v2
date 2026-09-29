import React, { useEffect, useState } from "react";
import { toast } from "../../utils/toast";
import { useEmpresa } from "../../context/empresa";
import OtrosActivosService from "../../services/OtrosActivosServices";
import { aLista } from "../../services/payload";
import { mensajeError } from "./campos";
import { TablaContenedor, Tabla, THead, Th, TBody, Tr, Td, TrCargando, TrVacia } from "../ui/Tabla";

export default function EliminarOtrosActivos() {
  const { empresa } = useEmpresa();
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await OtrosActivosService.obtenerTodos({ empresa });
      setActivos(aLista(res.data));
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
      await OtrosActivosService.eliminar(id);
      toast.success("Activo eliminado");
      await cargar();
    } catch (error) {
      console.error(error);
      toast.error(mensajeError(error, "No se pudo eliminar"));
    } finally {
      setDeletingId(null);
    }
  };

  const eliminarTodos = async () => {
    if (!window.confirm(`¿Eliminar los ${activos.length} otros activos? Esta acción no se puede deshacer.`)) return;
    try {
      setDeletingAll(true);
      const { data } = await OtrosActivosService.eliminarTodos();
      toast.success(data?.mensaje || "Todos los activos fueron eliminados");
      await cargar();
    } catch (error) {
      console.error(error);
      toast.error(mensajeError(error, "No se pudieron eliminar los activos"));
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900">Eliminar otros activos</h1>
        <button onClick={eliminarTodos} disabled={deletingAll || activos.length === 0} className="rounded-xl border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
          {deletingAll ? "Eliminando..." : "Eliminar todos"}
        </button>
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
            ) : activos.length > 0 ? (
              activos.map((a, i) => (
                <Tr key={a.id} index={i}>
                  <Td destacado>{a.codificacion || "-"}</Td>
                  <Td>{a.tipoEquipo || "-"}</Td>
                  <Td>{a.marca || "-"}</Td>
                  <Td>{a.modelo || "-"}</Td>
                  <Td>{a.ubicacion || "-"}</Td>
                  <Td><button onClick={() => eliminar(a.id)} disabled={deletingId === a.id} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{deletingId === a.id ? "Eliminando..." : "Eliminar"}</button></Td>
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
