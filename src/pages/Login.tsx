import {
  BarChart3,
  CheckCircle2,
  ChefHat,
  Flame,
  Loader2,
  Lock,
  Mail,
  QrCode,
} from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import CadastroRestauranteForm from "../components/CadastroRestauranteForm";
import CampoFormulario from "../components/CampoFormulario";
import { useApp } from "../context/AppContext";

type Aba = "ENTRAR" | "CADASTRAR";

const destaques = [
  {
    Icone: BarChart3,
    titulo: "Gestão em tempo real",
    texto: "Faturamento, pedidos e desempenho do restaurante em um só painel.",
  },
  {
    Icone: ChefHat,
    titulo: "Cozinha conectada",
    texto: "Os pedidos chegam direto ao monitor da cozinha, sem papel.",
  },
  {
    Icone: QrCode,
    titulo: "Cardápio por QR Code",
    texto: "O cliente pede da mesa e acompanha o preparo pelo celular.",
  },
];

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();

  const [aba, setAba] = useState<Aba>("ENTRAR");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(false);

  function mudarAba(proxima: Aba) {
    setAba(proxima);
    setErro("");
    setAviso("");
  }

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (email.trim() === "" || senha === "") {
      setErro("Informe e-mail e senha.");
      return;
    }

    try {
      setCarregando(true);
      setErro("");
      setAviso("");

      const usuario = await login(email.trim(), senha);

      if (usuario.perfil === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/cozinha");
      }
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Não foi possível entrar.");
      }
    } finally {
      setCarregando(false);
    }
  }

  function cadastroConcluido(emailCadastrado: string, nomeRestaurante: string) {
    setEmail(emailCadastrado);
    setSenha("");
    setErro("");
    setAviso(
      nomeRestaurante +
        " foi cadastrado com sucesso. Entre com seu e-mail e senha."
    );
    setAba("ENTRAR");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-14 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

        <div className="relative flex items-center gap-3 text-2xl font-black">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand">
            <Flame size={24} />
          </span>

          BrasaOS
        </div>

        <div className="relative">
          <p className="text-sm font-bold tracking-widest text-brand">
            PLATAFORMA PARA RESTAURANTES
          </p>

          <h1 className="mt-4 max-w-lg text-5xl font-black leading-tight">
            Do pedido na mesa ao fechamento da conta.
          </h1>

          <ul className="mt-10 space-y-6">
            {destaques.map(({ Icone, titulo, texto }) => (
              <li key={titulo} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-brand">
                  <Icone size={20} />
                </span>

                <div>
                  <p className="font-bold">{titulo}</p>

                  <p className="mt-0.5 text-sm text-white/55">{texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/40">
          BrasaOS, gestão de restaurantes.
        </p>
      </section>

      <section className="flex items-center justify-center bg-slate-50 px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 text-2xl font-black lg:hidden">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-white">
              <Flame size={22} />
            </span>

            BrasaOS
          </div>

          <h2 className="text-3xl font-black text-slate-900">
            {aba === "ENTRAR" ? "Acesse sua conta" : "Cadastre seu restaurante"}
          </h2>

          <p className="mt-2 text-slate-500">
            {aba === "ENTRAR"
              ? "Entre para acompanhar a operação do seu restaurante."
              : "Crie o acesso do seu restaurante ao BrasaOS."}
          </p>

          <div className="mt-8 grid grid-cols-2 rounded-2xl bg-slate-200/70 p-1">
            <button
              type="button"
              onClick={() => mudarAba("ENTRAR")}
              className={
                aba === "ENTRAR"
                  ? "rounded-xl bg-white py-2.5 text-sm font-black text-slate-900 shadow-sm"
                  : "rounded-xl py-2.5 text-sm font-bold text-slate-500"
              }
            >
              Entrar
            </button>

            <button
              type="button"
              onClick={() => mudarAba("CADASTRAR")}
              className={
                aba === "CADASTRAR"
                  ? "rounded-xl bg-white py-2.5 text-sm font-black text-slate-900 shadow-sm"
                  : "rounded-xl py-2.5 text-sm font-bold text-slate-500"
              }
            >
              Cadastrar restaurante
            </button>
          </div>

          <div className="mt-6">
            {aba === "ENTRAR" && (
              <form onSubmit={entrar} className="space-y-4">
                {aviso !== "" && (
                  <p
                    role="status"
                    className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800"
                  >
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

                    {aviso}
                  </p>
                )}

                <CampoFormulario
                  rotulo="E-mail"
                  Icone={Mail}
                  tipo="email"
                  valor={email}
                  aoAlterar={setEmail}
                  placeholder="voce@restaurante.com"
                  autoComplete="email"
                />

                <CampoFormulario
                  rotulo="Senha"
                  Icone={Lock}
                  ehSenha={true}
                  valor={senha}
                  aoAlterar={setSenha}
                  placeholder="Sua senha"
                  autoComplete="current-password"
                />

                {erro !== "" && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
                  >
                    {erro}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={carregando}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-black text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
                >
                  {carregando && <Loader2 size={18} className="animate-spin" />}

                  {carregando ? "Entrando..." : "Entrar"}
                </button>
              </form>
            )}

            {aba === "CADASTRAR" && (
              <CadastroRestauranteForm aoConcluir={cadastroConcluido} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}