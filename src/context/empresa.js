import { createContext, useContext } from "react";

export const EMPRESAS = ["PROINSA", "CANDY MALLOWS", "CAFETERÍA", "GUANDY"];
export const EMPRESA_DEFAULT = "GUANDY";
export const STORAGE_KEY = "empresa";

export const EmpresaContext = createContext({ empresa: EMPRESA_DEFAULT, setEmpresa: () => {} });

export const useEmpresa = () => useContext(EmpresaContext);

export const empresaGuardada = () => {
  try {
    const valor = localStorage.getItem(STORAGE_KEY);
    return EMPRESAS.includes(valor) ? valor : EMPRESA_DEFAULT;
  } catch {
    return EMPRESA_DEFAULT;
  }
};
