import {
  BarChart3,
  BellRing,
  ChefHat,
  Flame,
  LogOut,
  QrCode,
  Settings2,
  Users,
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useApp } from "../context/AppContext";

const links = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    to: "/admin/atendimento",
    label: "Atendimento",
    icon: BellRing,
  },
  {
    to: "/admin/cardapio",
    label: "Cardápio",
    icon: Settings2,
  },
  {
    to: "/admin/escala",
    label: "Escala",
    icon: Users,
  },
  {
    to: "/admin/qrcodes",
    label: "QR Codes",
    icon: QrCode,
  },
];

export default function AdminLayout() {
  const { user, logout } = useApp();

  const navigate = useNavigate();

  function sair() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-slate-950 p-5 text-white lg:flex">

        <div className="flex items-center gap-3 text-xl font-black">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand">
            <Flame size={20} />
          </span>

          <span>BrasaOS</span>
        </div>

        <div className="mt-8 rounded-2xl bg-white/5 p-3">
          <p className="font-bold">
            {user?.nome}
          </p>

          <p className="mt-1 text-xs text-white/45">
            Administrador
          </p>
        </div>

        <nav className="mt-6 space-y-2">
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-3 py-3 font-bold transition-colors",
                    isActive
                      ? "bg-brand text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon size={19} />

                <span>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <button
            type="button"
            onClick={() =>
              navigate("/cozinha")
            }
            className="flex w-full items-center gap-3 rounded-xl bg-white/10 px-3 py-3 font-bold transition-colors hover:bg-white/15"
          >
            <ChefHat size={20} />

            <span>
              Abrir Tela da Cozinha
            </span>
          </button>

          <button
            type="button"
            onClick={sair}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut size={20} />

            <span>Sair</span>
          </button>
        </div>

      </aside>

      <div className="lg:pl-64">

        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:hidden">

          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
              <Flame size={18} />
            </span>

            <strong>
              BrasaOS
            </strong>
          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              title="Atendimento"
              onClick={() =>
                navigate(
                  "/admin/atendimento"
                )
              }
              className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700"
            >
              <BellRing size={19} />
            </button>

            <button
              type="button"
              title="Tela da Cozinha"
              onClick={() =>
                navigate("/cozinha")
              }
              className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700"
            >
              <ChefHat size={19} />
            </button>

            <button
              type="button"
              title="Sair"
              onClick={sair}
              className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-600"
            >
              <LogOut size={19} />
            </button>

          </div>

        </header>

        <Outlet />

      </div>

    </div>
  );
}