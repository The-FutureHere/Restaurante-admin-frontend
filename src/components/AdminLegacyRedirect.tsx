import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

export default function AdminLegacyRedirect() {
  const { user } = useApp();
  const location = useLocation();

  const [slug, setSlug] = useState<string | null>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    if (user === null) {
      return undefined;
    }

    let cancelado = false;

    api
      .restauranteAtual()
      .then((resposta) => {
        if (!cancelado) {
          setSlug(resposta.slug);
        }
      })
      .catch(() => {
        if (!cancelado) {
          setFalhou(true);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [user]);

  if (user === null || falhou) {
    return <Navigate to="/login" replace />;
  }

  if (slug === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100">
        <Loader2 size={40} className="animate-spin text-brand" />
      </div>
    );
  }

  const restante = location.pathname.replace(/^\/admin/, "");

  const destino =
    "/" +
    slug +
    "/admin" +
    (restante === "" || restante === "/" ? "/dashboard" : restante);

  return <Navigate to={destino} replace />;
}