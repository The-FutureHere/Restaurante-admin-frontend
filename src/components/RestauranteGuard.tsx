import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { RestauranteProvider } from "../context/RestauranteContext";
import { api } from "../services/api";
import type { RestauranteAtual } from "../services/api";

type RestauranteGuardProps = {
  children: ReactNode;
};

export default function RestauranteGuard({ children }: RestauranteGuardProps) {
  const { slug } = useParams();
  const location = useLocation();

  const [restaurante, setRestaurante] = useState<RestauranteAtual | null>(null);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;

    setErro("");

    api
      .restauranteAtual()
      .then((resposta) => {
        if (!cancelado) {
          setRestaurante(resposta);
        }
      })
      .catch((error: unknown) => {
        if (!cancelado) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar o restaurante."
          );
        }
      });

    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  if (erro !== "") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <div className="max-w-sm rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-black text-slate-900">
            Não foi possível abrir o painel
          </h1>

          <p className="mt-2 text-sm text-slate-500">{erro}</p>

          <button
            type="button"
            onClick={() => setTentativa(tentativa + 1)}
            className="mt-5 rounded-xl bg-brand px-5 py-3 font-bold text-white"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (restaurante === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100">
        <Loader2 size={40} className="animate-spin text-brand" />
      </div>
    );
  }

  if (slug !== restaurante.slug) {
    const restante = location.pathname.split("/").slice(3).join("/");

    const destino =
      "/" +
      restaurante.slug +
      "/admin/" +
      (restante === "" ? "dashboard" : restante);

    return <Navigate to={destino} replace />;
  }

  return <RestauranteProvider value={restaurante}>{children}</RestauranteProvider>;
}