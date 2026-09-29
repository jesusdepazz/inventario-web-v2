import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useIsAuthenticated } from "@azure/msal-react";
import Inicio from "./pages/Inicio";
import Layout from "./components/Layout";
import Login from "./components/Login";

import {
  CrearEquipo,
  ListaEquipos,
  EditarEquipo,
  EliminarEquipos,
  IngresarInmueble,
  InventarioInmuebles,
  EditarInmueble,
  EliminarInmuebles,
  IngresarMobiliarioEquipo,
  InventarioMobiliarioEquipo,
  EditarMobiliarioEquipo,
  EliminarMobiliarioEquipo,
  IngresarEquipoComputo,
  InventarioEquipoComputo,
  EditarEquipoComputo,
  EliminarEquipoComputo,
  IngresarVehiculo,
  InventarioVehiculos,
  EditarVehiculo,
  EliminarVehiculos,
  IngresarOtrosActivos,
  InventarioOtrosActivos,
  EditarOtrosActivos,
  EliminarOtrosActivos,
  CatalogoActivos,
} from "./modules/activos";
import EmpresaProvider from "./context/EmpresaProvider";
import {
  BajaActivosForm,
  ListabajaAtivos,
  generarBajaPDF,
  HojaResponsabilidad,
  ListaHojasResponsabilidad,
  HojaResponsabilidadEdit,
  ListaHojaSolvencia,
  HojaSolvencia,
  CrearTraslado,
  TrasladosLista,
  CrearTrasladoRetorno,
  TrasladosRetornoLista,
} from "./modules/formatos";

function RequireAuth({ children }) {
  const isAuthenticated = useIsAuthenticated();
  const tokenApp = localStorage.getItem("tokenApp");
  if (!isAuthenticated && !tokenApp) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton duration={3500} />
      <EmpresaProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Navigate to="/inicio" replace />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/inicio" element={<Inicio />} />
          {/* EQUIPOS */}
          <Route path="/equipos/crear" element={<CrearEquipo />} />
          <Route path="/equipos/inventario/:categoria" element={<ListaEquipos />} />
          <Route path="/equipos/inventario" element={<ListaEquipos />} />
          <Route path="/equipos/editar" element={<EditarEquipo />} />
          <Route path="/equipos/eliminar" element={<EliminarEquipos />} />

          <Route path="/activos/inmuebles/ingresar" element={<IngresarInmueble />} />
          <Route path="/activos/inmuebles/inventario" element={<InventarioInmuebles />} />
          <Route path="/activos/inmuebles/editar" element={<EditarInmueble />} />
          <Route path="/activos/inmuebles/eliminar" element={<EliminarInmuebles />} />

          <Route path="/activos/mobiliario-y-equipo/ingresar" element={<IngresarMobiliarioEquipo />} />
          <Route path="/activos/mobiliario-y-equipo/inventario" element={<InventarioMobiliarioEquipo />} />
          <Route path="/activos/mobiliario-y-equipo/editar" element={<EditarMobiliarioEquipo />} />
          <Route path="/activos/mobiliario-y-equipo/eliminar" element={<EliminarMobiliarioEquipo />} />

          <Route path="/activos/equipo-de-computo/ingresar" element={<IngresarEquipoComputo />} />
          <Route path="/activos/equipo-de-computo/inventario" element={<InventarioEquipoComputo />} />
          <Route path="/activos/equipo-de-computo/editar" element={<EditarEquipoComputo />} />
          <Route path="/activos/equipo-de-computo/eliminar" element={<EliminarEquipoComputo />} />

          <Route path="/activos/vehiculos/ingresar" element={<IngresarVehiculo />} />
          <Route path="/activos/vehiculos/inventario" element={<InventarioVehiculos />} />
          <Route path="/activos/vehiculos/editar" element={<EditarVehiculo />} />
          <Route path="/activos/vehiculos/eliminar" element={<EliminarVehiculos />} />

          <Route path="/activos/otros-activos/ingresar" element={<IngresarOtrosActivos />} />
          <Route path="/activos/otros-activos/inventario" element={<InventarioOtrosActivos />} />
          <Route path="/activos/otros-activos/editar" element={<EditarOtrosActivos />} />
          <Route path="/activos/otros-activos/eliminar" element={<EliminarOtrosActivos />} />

          <Route path="/activos/catalogos" element={<CatalogoActivos />} />
          {/* FORMATOS/RESPONSABILIDAD */}
          <Route path="/formatos/hojaderesponsabilidad" element={<HojaResponsabilidad />} />
          <Route path="/formatos/listahojasresponsabilidad" element={<ListaHojasResponsabilidad />} />
          <Route path="/hojas-responsabilidad/editar/:id" element={<HojaResponsabilidadEdit /> }/>
          {/* FORMATOS/SOLVENCIAS */}
          <Route path="/formatos/listahojasSolvencias" element={<ListaHojaSolvencia />} />
          <Route path="/formatos/hojasSolvencias" element={<HojaSolvencia />} />
          {/* FORMATOS/BAJADEACTIVOS */}
          <Route path="/formatos/bajaAtivos" element={<BajaActivosForm />} />
          <Route path="/formatos/ListabajaAtivos" element={<ListabajaAtivos />} />
          <Route path="/formatos/BajaActivo/BajaActivoPDF" element={<generarBajaPDF />} />
          {/* FORMATOS/TRASLADOS */}
          <Route path="/formatos/traslados/lista" element={<TrasladosLista />} />
          <Route path="/formatos/traslados/crear" element={<CrearTraslado />} />
          {/* FORMATOS/TRASLADOSRETORNO */}
          <Route path="/formatos/trasladosRetorno/crear" element={<CrearTrasladoRetorno />} />
          <Route path="/formatos/trasladosRetorno/lista" element={<TrasladosRetornoLista />} />
        </Route>
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
      </EmpresaProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;
