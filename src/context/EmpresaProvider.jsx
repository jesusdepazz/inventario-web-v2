import React, { useState } from "react";
import { EmpresaContext, STORAGE_KEY, empresaGuardada } from "./empresa";

export default function EmpresaProvider({ children }) {
  const [empresa, setEmpresaState] = useState(empresaGuardada);

  const setEmpresa = (valor) => {
    setEmpresaState(valor);
    try {
      localStorage.setItem(STORAGE_KEY, valor);
    } catch {
      // sin almacenamiento disponible: se mantiene solo en memoria
    }
  };

  return <EmpresaContext.Provider value={{ empresa, setEmpresa }}>{children}</EmpresaContext.Provider>;
}
