import { useMsal } from "@azure/msal-react";

// Nombre de la persona que inició sesión: el guardado al entrar o, si no hay
// (o quedó el genérico del acceso local), el de la cuenta de Microsoft activa.
export default function useNombreUsuario() {
  const { instance, accounts } = useMsal();
  const guardado = localStorage.getItem("name");
  if (guardado && guardado !== "Usuario local" && guardado !== "undefined") return guardado;
  const cuenta = instance.getActiveAccount() || accounts[0];
  return cuenta?.name || guardado || "Usuario";
}
