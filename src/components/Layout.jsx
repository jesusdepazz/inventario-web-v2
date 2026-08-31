import { Outlet } from "react-router-dom";
import { useState } from "react";
import { FaBars } from "react-icons/fa";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 lg:ml-80 h-screen overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 bg-blue-900 text-white px-4 py-3 shadow-md shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            className="p-2 -ml-2 rounded-lg hover:bg-white/10"
          >
            <FaBars className="text-lg" />
          </button>
          <img src="/logo_guandy.png" alt="Logo Guandy" className="h-8" />
          <span className="font-extrabold tracking-wide">INVENTARIO</span>
        </header>

        <main className="flex-1 p-6 bg-slate-100 overflow-hidden relative">
          <Outlet />
        </main>

        <footer className="bg-slate-100 text-center text-sm text-slate-500 py-2 border-t border-slate-200">
          © 2025 Guandy · Todos los derechos reservados
        </footer>
      </div>
    </div>
  );
};

export default Layout;
