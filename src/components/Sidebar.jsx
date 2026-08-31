import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FaHome,
  FaLaptop,
  FaClipboardList,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp,
  FaUpload,
  FaEdit,
  FaTrash,
  FaUserCheck,
  FaBoxOpen,
  FaPlus,
  FaIdCard,
  FaTimes,
  FaMapMarkerAlt,
} from "react-icons/fa";

const navLinkClass = (active) =>
  `flex items-center gap-3 font-semibold text-[15px] px-3 py-2.5 rounded-xl transition-all duration-200 ${
    active
      ? "bg-white text-blue-900 shadow-md"
      : "text-blue-50/90 hover:bg-white/10 hover:text-white"
  }`;

const categoryButtonClass =
  "flex items-center justify-between w-full font-semibold text-[15px] px-3 py-2.5 rounded-xl text-blue-50/90 hover:bg-white/10 hover:text-white transition-all duration-200";

const subLinkClass = (active) =>
  `flex items-center gap-2 text-sm py-1 transition-colors ${
    active
      ? "text-white font-semibold"
      : "text-blue-100/70 hover:text-white"
  }`;

const modalPanelClass =
  "relative bg-white rounded-2xl shadow-2xl p-6 w-96 border border-slate-100";
const modalTitleClass = "text-xl font-bold mb-6 text-slate-900 text-center";
const modalPrimaryBtnClass =
  "w-full bg-blue-900 text-white py-2 px-4 rounded-lg hover:bg-blue-950 transition-colors";
const modalCancelBtnClass =
  "w-full bg-slate-200 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors";

export default function Sidebar({ open = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [equiposOpen, setEquiposOpen] = useState(false);
  const [asignacionesOpen, setAsignacionesOpen] = useState(false);
  const [mantenimientosOpen, setMantenimientosOpen] = useState(false);
  const [formatosOpen, setFormatosOpen] = useState(false);
  const [modalHojaOpen, setModalHojaOpen] = useState(false);
  const [modalSolvenciaOpen, setModalSolvenciaOpen] = useState(false);
  const [modalTrasladoOpen, setModalTrasladoOpen] = useState(false);
  const [suministrosOpen, setSuministrosOpen] = useState(false);
  const [externosOpen, setExternosOpen] = useState(false);
  const [modalBajasActivoOpen, setModalBajasActivoOpen] = useState(false);
  const [modalTrasladoRetornoOpen, setModalTrasladoRetornoOpen] = useState(false);
  const [rol, setRol] = useState(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const storedRol = localStorage.getItem("rol");
    setRol(storedRol);
  }, []);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const open =
      modalHojaOpen ||
      modalSolvenciaOpen ||
      modalTrasladoOpen ||
      modalBajasActivoOpen ||
      modalTrasladoRetornoOpen;

    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [
    modalHojaOpen,
    modalSolvenciaOpen,
    modalTrasladoOpen,
    modalBajasActivoOpen,
    modalTrasladoRetornoOpen,
  ]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    navigate("/login");
  };

  const openHojaModal = () => setModalHojaOpen(true);
  const closeHojaModal = () => setModalHojaOpen(false);
  const handleHojaOption = (path) => {
    navigate(path);
    closeHojaModal();
  };

  const openSolvenciaModal = () => setModalSolvenciaOpen(true);
  const closeSolvenciaModal = () => setModalSolvenciaOpen(false);
  const handleSolvenciaOption = (path) => {
    navigate(path);
    closeSolvenciaModal();
  };

  const openTrasladoModal = () => setModalTrasladoOpen(true);
  const closeTrasladoModal = () => setModalTrasladoOpen(false);
  const handleTrasladoOption = (path) => {
    navigate(path);
    closeTrasladoModal();
  };

  const openBajasActivoModal = () => setModalBajasActivoOpen(true);
  const closeBajasActivoModal = () => setModalBajasActivoOpen(false);
  const handleBajasActivoOption = (path) => {
    navigate(path);
    closeBajasActivoModal();
  };

  const handleTrasladoRetornoOption = (ruta) => {
    setModalTrasladoRetornoOpen(false);
    navigate(ruta);
  };

  const closeTrasladoRetornoModal = () => setModalTrasladoRetornoOpen(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`bg-gradient-to-b from-blue-950 via-blue-900 to-blue-900 text-white w-80 h-screen fixed flex flex-col shadow-xl z-50 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="px-6 pt-9 pb-5 shrink-0 relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="absolute top-4 right-4 lg:hidden p-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
        >
          <FaTimes />
        </button>
        <div className="flex flex-col items-center">
          <img src="/logo_guandy.png" alt="Logo Guandy" className="h-16 mb-3 drop-shadow-lg" />
          <h2 className="text-xl font-extrabold tracking-wider text-white">
            INVENTARIO
          </h2>
          <hr className="border-blue-400/30 w-3/4 mt-4" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4 min-h-0">
        <nav className="flex flex-col gap-2">
          <Link to="/inicio" className={navLinkClass(isActive("/inicio"))}>
            <FaHome /> Inicio
          </Link>

          <div>
            <button onClick={() => setEquiposOpen(!equiposOpen)} className={categoryButtonClass}>
              <span className="flex items-center gap-3">
                <FaLaptop /> Equipos
              </span>
              {equiposOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
            </button>
            <div className={`ml-6 mt-1 flex flex-col gap-2 overflow-hidden transition-all duration-500 ${equiposOpen ? "max-h-40" : "max-h-0"}`}>
              <Link to="/equipos/inventario" className={subLinkClass(isActive("/equipos/inventario"))}>
                <FaClipboardList /> Inventario
              </Link>
              {rol === "Administrador" && (
                <>
                  <Link to="/equipos/crear" className={subLinkClass(isActive("/equipos/crear"))}>
                    <FaUpload /> Ingresar
                  </Link>
                  <Link to="/equipos/editar" className={subLinkClass(isActive("/equipos/editar"))}>
                    <FaEdit /> Editar
                  </Link>
                  <Link to="/equipos/eliminar" className={subLinkClass(isActive("/equipos/eliminar"))}>
                    <FaTrash /> Eliminar
                  </Link>
                </>
              )}
            </div>
          </div>

          <div>
            <button onClick={() => setSuministrosOpen(!suministrosOpen)} className={categoryButtonClass}>
              <span className="flex items-center gap-3">
                <FaBoxOpen /> Suministros
              </span>
              {suministrosOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
            </button>
            <div className={`ml-6 mt-1 flex flex-col gap-2 overflow-hidden transition-all duration-500 ${suministrosOpen ? "max-h-48" : "max-h-0"}`}>
              {rol === "Administrador" && (
                <>
                  <Link to="/suministros" className={subLinkClass(isActive("/suministros"))}>
                    <FaPlus /> Crear Suministro
                  </Link>
                  <Link to="/suministros/inventario" className={subLinkClass(isActive("/suministros/inventario"))}>
                    <FaClipboardList /> Inventario de suministros
                  </Link>
                  <Link to="/suministros/movimientos" className={subLinkClass(isActive("/suministros/movimientos"))}>
                    <FaUpload /> Movimientos de suministros
                  </Link>
                  <Link to="/suministros/eliminarMovimientos" className={subLinkClass(isActive("/suministros/eliminarMovimientos"))}>
                    <FaTrash /> Eliminar Movimientos
                  </Link>
                </>
              )}
            </div>
          </div>

          <div>
            <button onClick={() => setAsignacionesOpen(!asignacionesOpen)} className={categoryButtonClass}>
              <span className="flex items-center gap-3">
                <FaUserCheck /> Asignaciones
              </span>
              {asignacionesOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
            </button>
            <div className={`ml-6 mt-1 flex flex-col gap-2 overflow-hidden transition-all duration-500 ${asignacionesOpen ? "max-h-52" : "max-h-0"}`}>
              {rol === "Administrador" && (
                <>
                  <Link to="/asignaciones/crear" className={subLinkClass(isActive("/asignaciones/crear"))}>
                    <FaUpload /> Asignar
                  </Link>
                  <Link to="/asignaciones/eliminar" className={subLinkClass(isActive("/asignaciones/eliminar"))}>
                    <FaTrash /> Desasignar
                  </Link>
                  <Link to="/asignaciones/comunal/crear" className={subLinkClass(isActive("/asignaciones/comunal/crear"))}>
                    <FaMapMarkerAlt /> Asignación comunal
                  </Link>
                  <Link to="/asignaciones/comunal/lista" className={subLinkClass(isActive("/asignaciones/comunal/lista"))}>
                    <FaClipboardList /> Historial comunal
                  </Link>
                </>
              )}
              <Link to="/asignaciones/lista" className={subLinkClass(isActive("/asignaciones/lista"))}>
                <FaClipboardList /> Historial
              </Link>
            </div>
          </div>

          {rol === "Administrador" && (
            <div>
              <button onClick={() => setExternosOpen(!externosOpen)} className={categoryButtonClass}>
                <span className="flex items-center gap-3">
                  <FaIdCard /> Externos
                </span>
                {externosOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
              </button>
              <div className={`ml-6 mt-1 flex flex-col gap-2 overflow-hidden transition-all duration-500 ${externosOpen ? "max-h-32" : "max-h-0"}`}>
                <Link to="/externos/crear" className={subLinkClass(isActive("/externos/crear"))}>
                  <FaPlus /> Registrar
                </Link>
                <Link to="/externos/lista" className={subLinkClass(isActive("/externos/lista"))}>
                  <FaClipboardList /> Lista
                </Link>
              </div>
            </div>
          )}

          <div>
            <button onClick={() => setMantenimientosOpen(!mantenimientosOpen)} className={categoryButtonClass}>
              <span className="flex items-center gap-3">
                <FaClipboardList /> Solicitudes
              </span>
              {mantenimientosOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
            </button>
            <div className={`ml-6 mt-1 flex flex-col gap-2 overflow-hidden transition-all duration-500 ${mantenimientosOpen ? "max-h-32" : "max-h-0"}`}>
              {rol === "Administrador" && (
                <>
                  <Link to="/solicitudes/crear" className={subLinkClass(isActive("/solicitudes/crear"))}>
                    <FaUpload /> Crear
                  </Link>
                  <Link to="/solicitudes/eliminar" className={subLinkClass(isActive("/solicitudes/eliminar"))}>
                    <FaTrash /> Eliminar
                  </Link>
                </>
              )}
              <Link to="/solicitudes/lista" className={subLinkClass(isActive("/solicitudes/lista"))}>
                <FaClipboardList /> Historial
              </Link>
            </div>
          </div>

          <div>
            <button onClick={() => setFormatosOpen(!formatosOpen)} className={categoryButtonClass}>
              <span className="flex items-center gap-3">
                <FaClipboardList /> Formatos
              </span>
              {formatosOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
            </button>
            <div className={`ml-6 mt-1 flex flex-col gap-2 overflow-hidden transition-all duration-500 ${formatosOpen ? "max-h-64" : "max-h-0"}`}>
              <button onClick={openHojaModal} className={`${subLinkClass(false)} text-left`}>
                <FaUpload /> Hoja de responsabilidad
              </button>
              <button onClick={openSolvenciaModal} className={`${subLinkClass(false)} text-left`}>
                <FaUpload /> Solvencias
              </button>
              <button onClick={() => setModalTrasladoRetornoOpen(true)} className={`${subLinkClass(false)} text-left`}>
                <FaUpload /> Pase de salida con retorno
              </button>
              <button onClick={openBajasActivoModal} className={`${subLinkClass(false)} text-left`}>
                <FaUpload /> Bajas
              </button>
              <button onClick={openTrasladoModal} className={`${subLinkClass(false)} text-left`}>
                <FaUpload /> Traslados
              </button>
            </div>
          </div>
        </nav>
      </div>

      <div className="p-6 pt-4 shrink-0">
        <hr className="border-blue-400/30 mb-4" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 font-bold text-lg px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors w-full justify-center"
        >
          <FaSignOutAlt /> Cerrar sesión
        </button>
      </div>

      {createPortal(
        <>
          {modalHojaOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={closeHojaModal} />
              <div className={modalPanelClass}>
                <h2 className={modalTitleClass}>Selecciona una opción</h2>
                <div className="flex flex-col gap-3">
                  {rol === "Administrador" && (
                    <button onClick={() => handleHojaOption("/formatos/hojaderesponsabilidad")} className={modalPrimaryBtnClass}>
                      Crear
                    </button>
                  )}
                  <button onClick={() => handleHojaOption("/formatos/listahojasresponsabilidad")} className={modalPrimaryBtnClass}>
                    Ver Historial
                  </button>
                  <button onClick={closeHojaModal} className={modalCancelBtnClass}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {modalSolvenciaOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={closeSolvenciaModal} />
              <div className={modalPanelClass}>
                <h2 className={modalTitleClass}>Solvencias</h2>
                <div className="flex flex-col gap-3">
                  {rol === "Administrador" && (
                    <button onClick={() => handleSolvenciaOption("/formatos/hojasSolvencias")} className={modalPrimaryBtnClass}>
                      Crear
                    </button>
                  )}
                  <button onClick={() => handleSolvenciaOption("/formatos/listahojasSolvencias")} className={modalPrimaryBtnClass}>
                    Ver Historial
                  </button>
                  <button onClick={closeSolvenciaModal} className={modalCancelBtnClass}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {modalTrasladoOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={closeTrasladoModal} />
              <div className={modalPanelClass}>
                <h2 className={modalTitleClass}>Traslados</h2>
                <div className="flex flex-col gap-3">
                  {rol === "Administrador" && (
                    <button onClick={() => handleTrasladoOption("/formatos/traslados/crear")} className={modalPrimaryBtnClass}>
                      Crear
                    </button>
                  )}
                  <button onClick={() => handleTrasladoOption("/formatos/traslados/lista")} className={modalPrimaryBtnClass}>
                    Ver Historial
                  </button>
                  <button onClick={closeTrasladoModal} className={modalCancelBtnClass}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {modalBajasActivoOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={closeBajasActivoModal} />
              <div className={modalPanelClass}>
                <h2 className={modalTitleClass}>Bajas de Activos</h2>
                <div className="flex flex-col gap-3">
                  {rol === "Administrador" && (
                    <button onClick={() => handleBajasActivoOption("/formatos/bajaAtivos")} className={modalPrimaryBtnClass}>
                      Crear Baja
                    </button>
                  )}
                  <button onClick={() => handleBajasActivoOption("/formatos/ListabajaAtivos")} className={modalPrimaryBtnClass}>
                    Ver Historial
                  </button>
                  <button onClick={closeBajasActivoModal} className={modalCancelBtnClass}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {modalTrasladoRetornoOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={closeTrasladoRetornoModal} />
              <div className={modalPanelClass}>
                <h2 className={modalTitleClass}>Selecciona una opción</h2>
                <div className="flex flex-col gap-3">
                  {rol === "Administrador" && (
                    <button onClick={() => handleTrasladoRetornoOption("/formatos/trasladosRetorno/crear")} className={modalPrimaryBtnClass}>
                      Crear Traslado Retorno
                    </button>
                  )}
                  <button onClick={() => handleTrasladoRetornoOption("/formatos/trasladosRetorno/lista")} className={modalPrimaryBtnClass}>
                    Ver Historial
                  </button>
                  <button onClick={closeTrasladoRetornoModal} className={modalCancelBtnClass}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>,
        document.body
      )}
      </div>
    </>
  );
}
