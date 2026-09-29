import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";
// eslint-disable-next-line no-unused-vars -- se usa como <motion.*> en JSX
import { motion, AnimatePresence } from "motion/react";
import { FaBars } from "react-icons/fa";
import Sidebar, { SidebarContenido } from "./Sidebar";
import { useEmpresa } from "../context/empresa";
import { tituloDeRuta } from "./navegacion";

const Layout = () => {
  const { pathname } = useLocation();
  const { empresa } = useEmpresa();
  const [menuMovil, setMenuMovil] = useState(false);

  // Cierra el menú móvil al navegar
  useEffect(() => setMenuMovil(false), [pathname]);

  const hoy = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />

      <Drawer.Root open={menuMovil} onOpenChange={setMenuMovil} direction="left">
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] lg:hidden" />
          <Drawer.Content className="fixed inset-y-0 left-0 z-50 w-72 outline-none lg:hidden" style={{ "--initial-transform": "calc(100% + 8px)" }}>
            <Drawer.Title className="sr-only">Menú</Drawer.Title>
            <Drawer.Description className="sr-only">Navegación del inventario</Drawer.Description>
            <SidebarContenido />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden lg:ml-72">
        <header className="z-30 flex shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md lg:px-6">
          <button
            type="button"
            onClick={() => setMenuMovil(true)}
            aria-label="Abrir menú"
            className="-ml-1 grid h-9 w-9 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 active:scale-95 lg:hidden"
          >
            <FaBars />
          </button>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h2
              key={pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="min-w-0 truncate text-sm font-semibold text-slate-800"
            >
              {tituloDeRuta(pathname)}
            </motion.h2>
          </AnimatePresence>
          <div className="flex-1" />
          <span className="hidden text-xs capitalize text-slate-400 sm:block">{hoy}</span>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 ring-1 ring-inset ring-blue-700/10">{empresa}</span>
        </header>

        <main className="relative flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
