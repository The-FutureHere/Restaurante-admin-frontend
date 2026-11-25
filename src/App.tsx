import { Navigate, Route, Routes } from "react-router-dom";
import AdminLegacyRedirect from "./components/AdminLegacyRedirect";
import { Protected } from "./components/Protected";
import RestauranteGuard from "./components/RestauranteGuard";
import AdminLayout from "./layouts/AdminLayout";
import Cozinha from "./pages/Cozinha";
import Login from "./pages/Login";
import Atendimento from "./pages/admin/Atendimento";
import Cardapio from "./pages/admin/Cardapio";
import Dashboard from "./pages/admin/Dashboard";
import Escala from "./pages/admin/Escala";
import QRCodes from "./pages/admin/QRCodes";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/admin/*" element={<AdminLegacyRedirect />} />

      <Route
        path="/:slug/admin"
        element={
          <Protected perfil="ADMIN">
            <RestauranteGuard>
              <AdminLayout />
            </RestauranteGuard>
          </Protected>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />

        <Route path="atendimento" element={<Atendimento />} />

        <Route path="cardapio" element={<Cardapio />} />

        <Route path="escala" element={<Escala />} />

        <Route path="qrcodes" element={<QRCodes />} />
      </Route>

      <Route
        path="/cozinha"
        element={
          <Protected perfil="ANY">
            <Cozinha />
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}