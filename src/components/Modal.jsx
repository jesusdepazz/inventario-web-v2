import React, { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";

// Panel lateral (Vaul) para detalles: entra desde la derecha, se cierra con Esc,
// clic fuera o arrastrando. Los padres lo montan/desmontan como antes; aquí se
// anima la entrada y se espera a que termine la salida antes de llamar onClose.
export default function Modal({ titulo, subtitulo, onClose, children, ancho = "max-w-3xl" }) {
  const [open, setOpen] = useState(false);
  const cerrado = useRef(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const finalizar = () => {
    if (cerrado.current) return;
    cerrado.current = true;
    onClose();
  };

  const cerrar = () => {
    setOpen(false);
    // respaldo por si el navegador no dispara el fin de la animación
    setTimeout(finalizar, 450);
  };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(abierto) => !abierto && cerrar()}
      onAnimationEnd={(abierto) => !abierto && finalizar()}
      direction="right"
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-[2px]" />
        <Drawer.Content
          className={`fixed bottom-2 right-2 top-2 z-50 flex w-[calc(100%-1rem)] ${ancho} outline-none`}
          style={{ "--initial-transform": "calc(100% + 8px)" }}
        >
          <div className="flex h-full w-full grow flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div className="min-w-0">
                <Drawer.Title className="text-lg font-semibold tracking-tight text-slate-900">{titulo}</Drawer.Title>
                <Drawer.Description className={subtitulo ? "mt-0.5 truncate text-sm text-slate-500" : "sr-only"}>
                  {subtitulo || titulo}
                </Drawer.Description>
              </div>
              <button
                onClick={cerrar}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto p-6">{children}</div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
