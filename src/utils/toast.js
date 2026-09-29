import { toast as sonner } from "sonner";

// Adaptador con la API que usaba react-toastify (toast.warn, opción autoClose)
// para que todas las vistas usen Sonner sin cambiar cada llamada.
const opciones = (o = {}) => {
  const { autoClose, ...resto } = o;
  return autoClose ? { duration: autoClose, ...resto } : resto;
};

export const toast = Object.assign((mensaje, o) => sonner(mensaje, opciones(o)), {
  success: (mensaje, o) => sonner.success(mensaje, opciones(o)),
  error: (mensaje, o) => sonner.error(mensaje, opciones(o)),
  info: (mensaje, o) => sonner.info(mensaje, opciones(o)),
  warning: (mensaje, o) => sonner.warning(mensaje, opciones(o)),
  warn: (mensaje, o) => sonner.warning(mensaje, opciones(o)),
  promise: sonner.promise,
  dismiss: sonner.dismiss,
});
