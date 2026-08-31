import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaLaptop,
  FaUserCheck,
  FaClipboardList,
  FaFilePdf,
  FaExchangeAlt,
  FaBoxOpen,
  FaTools,
  FaArrowRight,
  FaSearch,
  FaPlus,
} from "react-icons/fa";

const Inicio = () => {
  const navigate = useNavigate();
  const [rol, setRol] = useState("");
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    setRol(localStorage.getItem("rol") || "");
    setNombre(localStorage.getItem("name") || "");
  }, []);

  const hoy = useMemo(() => {
    return new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const esAdmin = rol === "Administrador";

  const quick = useMemo(() => {
    return [
      { label: "Buscar equipo", to: "/equipos/inventario", icon: <FaSearch /> },
      { label: "Ver asignaciones", to: "/asignaciones/lista", icon: <FaUserCheck /> },
      { label: "Hojas", to: "/formatos/listahojasresponsabilidad", icon: <FaFilePdf /> },
      { label: "Traslados", to: "/formatos/traslados/lista", icon: <FaExchangeAlt /> },
    ];
  }, []);

  const accesosAdmin = useMemo(() => {
    return [
      {
        title: "Ingresar equipo",
        desc: "Agrega un nuevo equipo al inventario.",
        icon: <FaPlus />,
        to: "/equipos/crear",
        tag: "Admin",
      },
      {
        title: "Asignar equipo",
        desc: "Asigna equipos a colaboradores.",
        icon: <FaUserCheck />,
        to: "/asignaciones/crear",
        tag: "Admin",
      },
      {
        title: "Solicitudes",
        desc: "Crea y administra solicitudes.",
        icon: <FaTools />,
        to: "/solicitudes/lista",
        tag: "Admin",
      },
      {
        title: "Inventario",
        desc: "Visualiza equipos registrados y sus datos principales.",
        icon: <FaLaptop />,
        to: "/equipos/inventario",
        tag: "Equipos",
      },
    ];
  }, []);

  const cards = useMemo(() => {
    return [
      {
        title: "Ingresar equipo",
        desc: "Agrega un nuevo equipo al inventario.",
        icon: <FaPlus />,
        to: "/equipos/crear",
        tag: "Admin",
      },
      {
        title: "Asignar equipo",
        desc: "Asigna equipos a colaboradores.",
        icon: <FaUserCheck />,
        to: "/asignaciones/crear",
        tag: "Admin",
      },
      {
        title: "Solicitudes",
        desc: "Crea y administra solicitudes.",
        icon: <FaTools />,
        to: "/solicitudes/lista",
        tag: "Admin",
      },
      {
        title: "Inventario",
        desc: "Visualiza equipos registrados y sus datos principales.",
        icon: <FaLaptop />,
        to: "/equipos/inventario",
        tag: "Equipos",
      },
      {
        title: "Hojas",
        desc: "Consulta hojas y genera PDF cuando lo necesites.",
        icon: <FaFilePdf />,
        to: "/formatos/listahojasresponsabilidad",
        tag: "Formatos",
      },
      {
        title: "Traslados",
        desc: "Movimientos de equipo y reportes en PDF.",
        icon: <FaExchangeAlt />,
        to: "/formatos/traslados/lista",
        tag: "Movimientos",
      },
      {
        title: "Solvencias",
        desc: "Crea solvencias y consulta historial.",
        icon: <FaClipboardList />,
        to: "/formatos/listahojasSolvencias",
        tag: "Formatos",
      },
      {
        title: "Suministros",
        desc: "Inventario y movimientos de suministros.",
        icon: <FaBoxOpen />,
        to: "/suministros/inventario",
        tag: "Bodega",
      },
    ];
  }, []);

  if (!esAdmin) {
    return (
      <div className="h-full w-full overflow-y-auto">
        <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md border border-gray-200 p-10">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-blue-900 tracking-wide">
                PANEL ADMINISTRATIVO
              </h1>
              <p className="mt-3 text-gray-600">
                Acceso restringido. Si necesitás permisos, solicitá acceso a IT.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                  Rol: {rol || "—"}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                  Usuario: {nombre || "—"}
                </span>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/equipos/inventario")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
                >
                  Ver inventario
                </button>
                <button
                  onClick={() => navigate("/asignaciones/lista")}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold transition border border-gray-200"
                >
                  Ver asignaciones
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-10">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900">
                  Panel de Inventario
                </h1>
                <p className="text-gray-600 mt-1">{hoy}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100">
                    Rol: {rol || "—"}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                    Usuario: {nombre || "—"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
                {quick.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => navigate(q.to)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                  >
                    {q.icon}
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
              <div className="lg:col-span-2 bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-6 text-white shadow-lg border border-blue-900/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">Accesos rápidos</h2>
                    <p className="text-white/80 mt-1">
                      Entrá directo a los módulos más usados sin perder tiempo.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/10">
                    Admin
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {accesosAdmin.map((a) => (
                    <button
                      key={a.title}
                      onClick={() => navigate(a.to)}
                      className="text-left rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 p-4 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-lg">
                            {a.icon}
                          </div>
                          <div>
                            <div className="font-bold">{a.title}</div>
                            <div className="text-xs text-white/70 mt-0.5">{a.tag}</div>
                          </div>
                        </div>
                        <FaArrowRight className="text-white/70" />
                      </div>
                      <div className="text-sm text-white/80 mt-3">{a.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/10 border border-white/10 rounded-2xl p-4">
                  <div className="text-sm text-white/85">
                    Tip: podés entrar a todo desde el menú, pero aquí lo tenés a 1 click.
                  </div>
                  <button
                    onClick={() => navigate("/equipos/inventario")}
                    className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 px-5 py-2 rounded-xl font-bold hover:bg-white/90 transition"
                  >
                    Ir al inventario <FaArrowRight />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
                <h2 className="text-lg font-bold text-gray-800">Estado del sistema</h2>

                <div className="mt-4 space-y-3 flex-1">
                  {[
                    { t: "Inventario", d: "Módulo disponible", s: "OK" },
                    { t: "Reportes PDF", d: "Generación lista", s: "OK" },
                    { t: "Formatos", d: "Hojas, solvencias y traslados", s: "OK" },
                  ].map((x) => (
                    <div
                      key={x.t}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4"
                    >
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{x.t}</div>
                        <div className="text-xs text-gray-500">{x.d}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        {x.s}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate("/equipos/inventario")}
                  className="mt-5 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Ir al inventario
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {cards.map((a) => (
                <button
                  key={a.title}
                  onClick={() => navigate(a.to)}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 flex items-center justify-center text-lg">
                      {a.icon}
                    </div>
                    <FaArrowRight className="text-gray-300 group-hover:text-blue-600 transition" />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-gray-800">{a.title}</h3>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                        {a.tag}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{a.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">¿Qué querés hacer hoy?</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Entrá rápido a lo más usado y mantené todo ordenado.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate("/equipos/crear")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-semibold transition"
                  >
                    Ingresar equipo
                  </button>
                  <button
                    onClick={() => navigate("/asignaciones/crear")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-semibold transition"
                  >
                    Asignar equipo
                  </button>
                  <button
                    onClick={() => navigate("/formatos/listahojasresponsabilidad")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-semibold transition"
                  >
                    Ver hojas
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;