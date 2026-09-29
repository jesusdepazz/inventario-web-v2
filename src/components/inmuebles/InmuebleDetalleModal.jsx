import React, { useEffect, useState } from "react";
import { toast } from "../../utils/toast";
import InmueblesService from "../../services/InmueblesServices";
import { aLista, descargarBlob, limpiarPayload } from "../../services/payload";
import Modal from "../Modal";
import { inputCls, labelCls, fecha } from "../modalEstilos";
import { TablaContenedor, Tabla, THead, Th, TBody, Tr, Td, TrVacia } from "../ui/Tabla";
import Badge from "../ui/Badge";

const TIPOS_DOCUMENTO = ["plano", "escritura", "contrato", "imagen", "licencia", "documento"];

const POLIZA_INICIAL = {
  numeroPoliza: "",
  aseguradora: "",
  fechaInicio: "",
  fechaRenovacion: "",
  coberturasEspecificas: "",
  gestionReclamosSiniestros: "",
  estado: "activa",
};

export default function InmuebleDetalleModal({ inmuebleId, onClose }) {
  const [inmueble, setInmueble] = useState(null);
  const [poliza, setPoliza] = useState(POLIZA_INICIAL);
  const [archivo, setArchivo] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState("documento");
  const [savingPoliza, setSavingPoliza] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  const cargar = async () => {
    try {
      const { data } = await InmueblesService.obtenerPorId(inmuebleId);
      setInmueble(data);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el inmueble");
    }
  };

  useEffect(() => {
    cargar();
  }, [inmuebleId]);

  const handlePoliza = (e) => setPoliza((p) => ({ ...p, [e.target.name]: e.target.value }));

  const guardarPoliza = async (e) => {
    e.preventDefault();
    const { numeroPoliza, aseguradora, fechaInicio, fechaRenovacion } = poliza;
    if (!numeroPoliza || !aseguradora || !fechaInicio || !fechaRenovacion) {
      toast.warn("Número, aseguradora, fecha de inicio y de renovación son obligatorios");
      return;
    }
    try {
      setSavingPoliza(true);
      await InmueblesService.crearPoliza(inmuebleId, limpiarPayload(poliza, { fechas: ["fechaInicio", "fechaRenovacion"] }));
      setPoliza(POLIZA_INICIAL);
      toast.success("Póliza registrada");
      await cargar();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.mensaje || "No se pudo registrar la póliza");
    } finally {
      setSavingPoliza(false);
    }
  };

  const subirArchivo = async (e) => {
    e.preventDefault();
    if (!archivo) {
      toast.warn("Seleccione un archivo");
      return;
    }
    try {
      setSubiendo(true);
      await InmueblesService.subirArchivo(inmuebleId, archivo, tipoDocumento);
      setArchivo(null);
      e.target.reset();
      toast.success("Archivo cargado");
      await cargar();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.mensaje || "No se pudo cargar el archivo");
    } finally {
      setSubiendo(false);
    }
  };

  const descargar = async (a) => {
    try {
      const { data } = await InmueblesService.descargarArchivo(a.id);
      descargarBlob(data, a.nombreOriginal);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo descargar el archivo");
    }
  };

  const vencePronto = (f) => {
    if (!f) return false;
    const dias = (new Date(f) - new Date()) / 86400000;
    return dias <= 30;
  };

  return (
    <Modal titulo="Detalle del inmueble" subtitulo={inmueble ? `${inmueble.descripcion} · ${inmueble.direccion}` : "Cargando..."} onClose={onClose} ancho="max-w-5xl">
      {inmueble && (
        <>
          <section>
            <h3 className="mb-3 text-sm font-semibold tracking-tight text-slate-900">Pólizas de seguro</h3>
            <TablaContenedor>
              <Tabla>
                <THead>
                  <tr>
                    <Th>No. póliza</Th>
                    <Th>Aseguradora</Th>
                    <Th>Inicio</Th>
                    <Th>Renovación</Th>
                    <Th>Coberturas</Th>
                    <Th>Reclamos / siniestros</Th>
                    <Th>Estado</Th>
                  </tr>
                </THead>
                <TBody>
                  {aLista(inmueble.polizas).length > 0 ? (
                    aLista(inmueble.polizas).map((p, i) => (
                      <Tr key={p.id} index={i}>
                        <Td destacado>{p.numeroPoliza}</Td>
                        <Td>{p.aseguradora}</Td>
                        <Td>{fecha(p.fechaInicio)}</Td>
                        <Td className={p.estado === "activa" && vencePronto(p.fechaRenovacion) ? "font-semibold !text-rose-600" : ""}>{fecha(p.fechaRenovacion)}</Td>
                        <Td>{p.coberturasEspecificas || "-"}</Td>
                        <Td>{p.gestionReclamosSiniestros || "-"}</Td>
                        <Td><Badge className="capitalize">{p.estado}</Badge></Td>
                      </Tr>
                    ))
                  ) : (
                    <TrVacia colSpan={7}>Sin pólizas registradas.</TrVacia>
                  )}
                </TBody>
              </Tabla>
            </TablaContenedor>

            <form onSubmit={guardarPoliza} className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 md:grid-cols-3">
              <div><label className={labelCls}>No. póliza *</label><input name="numeroPoliza" value={poliza.numeroPoliza} onChange={handlePoliza} className={inputCls} /></div>
              <div><label className={labelCls}>Aseguradora *</label><input name="aseguradora" value={poliza.aseguradora} onChange={handlePoliza} className={inputCls} /></div>
              <div>
                <label className={labelCls}>Estado</label>
                <select name="estado" value={poliza.estado} onChange={handlePoliza} className={inputCls}>
                  <option value="activa">Activa</option>
                  <option value="vencida">Vencida</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div><label className={labelCls}>Fecha inicio *</label><input type="date" name="fechaInicio" value={poliza.fechaInicio} onChange={handlePoliza} className={inputCls} /></div>
              <div><label className={labelCls}>Fecha renovación *</label><input type="date" name="fechaRenovacion" value={poliza.fechaRenovacion} onChange={handlePoliza} className={inputCls} /></div>
              <div />
              <div className="md:col-span-3"><label className={labelCls}>Coberturas específicas</label><textarea name="coberturasEspecificas" rows="2" value={poliza.coberturasEspecificas} onChange={handlePoliza} className={inputCls} /></div>
              <div className="md:col-span-3"><label className={labelCls}>Gestión de reclamos por siniestros</label><textarea name="gestionReclamosSiniestros" rows="2" value={poliza.gestionReclamosSiniestros} onChange={handlePoliza} className={inputCls} /></div>
              <div className="md:col-span-3 flex justify-end">
                <button type="submit" disabled={savingPoliza} className="rounded-xl bg-blue-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">{savingPoliza ? "Guardando..." : "Agregar póliza"}</button>
              </div>
            </form>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold tracking-tight text-slate-900">Multimedia <span className="font-normal text-slate-400">· planos, escrituras, contratos, imágenes, licencias</span></h3>
            <TablaContenedor>
              <Tabla>
                <THead>
                  <tr>
                    <Th>Archivo</Th>
                    <Th>Tipo</Th>
                    <Th>Fecha</Th>
                    <Th />
                  </tr>
                </THead>
                <TBody>
                  {aLista(inmueble.archivos).length > 0 ? (
                    aLista(inmueble.archivos).map((a, i) => (
                      <Tr key={a.id} index={i}>
                        <Td destacado>{a.nombreOriginal}</Td>
                        <Td><Badge tono="azul" className="capitalize">{a.tipoDocumento}</Badge></Td>
                        <Td>{fecha(a.fechaSubida)}</Td>
                        <Td className="text-right">
                          <button onClick={() => descargar(a)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 active:scale-[0.97]">Descargar</button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <TrVacia colSpan={4}>Sin archivos cargados.</TrVacia>
                  )}
                </TBody>
              </Tabla>
            </TablaContenedor>

            <form onSubmit={subirArchivo} className="mt-4 flex flex-col gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 md:flex-row md:items-end">
              <div className="flex-1"><label className={labelCls}>Archivo</label><input type="file" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} className={inputCls} /></div>
              <div>
                <label className={labelCls}>Tipo de documento</label>
                <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} className={`${inputCls} capitalize`}>
                  {TIPOS_DOCUMENTO.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button type="submit" disabled={subiendo} className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">{subiendo ? "Subiendo..." : "Subir archivo"}</button>
            </form>
          </section>
        </>
      )}
    </Modal>
  );
}
