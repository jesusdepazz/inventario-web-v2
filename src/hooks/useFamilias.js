import { useEffect, useState } from "react";
import CatalogoActivosService from "../services/CatalogoActivosServices";
import { aLista } from "../services/payload";
import { obtenerCategoria } from "../components/equipos/catalogoActivos";

// Familias configuradas en el catálogo de activos para una categoría.
// Si el catálogo no responde, usa las familias predeterminadas.
export default function useFamilias(categoria) {
  const [familias, setFamilias] = useState(obtenerCategoria(categoria)?.familias ?? []);

  useEffect(() => {
    let activo = true;
    CatalogoActivosService.obtenerTodos({ categoria, soloActivos: true })
      .then((res) => {
        const nombres = aLista(res.data).map((c) => c.nombre);
        if (activo && nombres.length) setFamilias(nombres);
      })
      .catch((error) => console.error("Error al cargar el catálogo:", error));
    return () => {
      activo = false;
    };
  }, [categoria]);

  return familias;
}
