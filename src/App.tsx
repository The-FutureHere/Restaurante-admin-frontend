import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { Protected } from "./components/Protected";

import AdminLayout from "./layouts/AdminLayout";

import Login from "./pages/Login";
import Cozinha from "./pages/Cozinha";

import Dashboard from "./pages/admin/Dashboard";
import Cardapio from "./pages/admin/Cardapio";
import Escala from "./pages/admin/Escala";
import QRCodes from "./pages/admin/QRCodes";
import Atendimento from "./pages/admin/Atendimento";

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/admin"
        element={
          <Protected perfil="ADMIN">
            <AdminLayout />
          </Protected>
        }
      >
        <Route
          index
          element={
            <Navigate
              to="dashboard"
              replace
            />
          }
        />

        <Route
          path="dashboard"
          element={<Dashboard />}
        />

        <Route
          path="atendimento"
          element={<Atendimento />}
        />

        <Route
          path="cardapio"
          element={<Cardapio />}
        />

        <Route
          path="escala"
          element={<Escala />}
        />

        <Route
          path="qrcodes"
          element={<QRCodes />}
        />
      </Route>

      <Route
        path="/cozinha"
        element={
          <Protected perfil="ANY">
            <Cozinha />
          </Protected>
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />
    </Routes>
  );
}