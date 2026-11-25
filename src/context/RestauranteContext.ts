import { createContext, useContext } from "react";
import type { RestauranteAtual } from "../services/api";

const RestauranteContext = createContext<RestauranteAtual | null>(null);

export const RestauranteProvider = RestauranteContext.Provider;

export function useRestaurante(): RestauranteAtual {
  const valor = useContext(RestauranteContext);

  if (valor === null) {
    throw new Error(
      "useRestaurante só pode ser usado dentro de RestauranteGuard."
    );
  }

  return valor;
}