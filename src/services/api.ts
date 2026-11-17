import type {
  Categoria,
  EscalaSemanal,
  Funcionario,
  Pedido,
  Produto,
  Usuario,
} from "../types";

const BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api";

export type AuthResponse = {
  token: string;
  usuario: Usuario;
};

export type Chamado = {
  id: string;
  numero_mesa: number;
  tipo: "GARCOM" | "FECHAR_CONTA";
  status: "ABERTO" | "ATENDIDO" | "FECHADO";
  criado_em: string;
};

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = localStorage.getItem("auth_token");

  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...init?.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    window.location.href = "/login";

    throw new Error(
      "Sua sessão expirou. Faça login novamente."
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType =
    response.headers.get("content-type");

  let body: any = null;

  if (contentType?.includes("application/json")) {
    body = await response.json();
  } else {
    const text = await response.text();

    body = text
      ? {
          message: text,
        }
      : null;
  }

  if (!response.ok) {
    throw new Error(
      body?.message ||
        body?.error ||
        `Erro ${response.status}: ${response.statusText}`
    );
  }

  return body as T;
}

export const api = {
  login: (
    email: string,
    senha: string
  ) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        senha,
      }),
    }),

  me: () =>
    request<Usuario>("/auth/me"),

  dashboard: (periodo: string) =>
    request<any>(
      `/dashboard/resumo?periodo=${encodeURIComponent(
        periodo
      )}`
    ),

  categorias: () =>
    request<Categoria[]>("/categorias"),

  criarCategoria: (
    categoria: Omit<Categoria, "id">
  ) =>
    request<Categoria>("/categorias", {
      method: "POST",
      body: JSON.stringify(categoria),
    }),

  atualizarCategoria: (
    categoria: Categoria
  ) =>
    request<Categoria>(
      `/categorias/${categoria.id}`,
      {
        method: "PUT",
        body: JSON.stringify(categoria),
      }
    ),

  excluirCategoria: (id: string) =>
    request<void>(`/categorias/${id}`, {
      method: "DELETE",
    }),

  produtos: () =>
    request<Produto[]>("/produtos"),

  criarProduto: (
    produto: Omit<Produto, "id">
  ) =>
    request<Produto>("/produtos", {
      method: "POST",
      body: JSON.stringify(produto),
    }),

  atualizarProduto: (
    produto: Produto
  ) =>
    request<Produto>(
      `/produtos/${produto.id}`,
      {
        method: "PUT",
        body: JSON.stringify(produto),
      }
    ),

  saveProduto: (produto: Produto) => {
    const produtoNovo = !produto.id;

    if (produtoNovo) {
      const {
        id: _id,
        ...produtoSemId
      } = produto;

      return request<Produto>("/produtos", {
        method: "POST",
        body: JSON.stringify(produtoSemId),
      });
    }

    return request<Produto>(
      `/produtos/${produto.id}`,
      {
        method: "PUT",
        body: JSON.stringify(produto),
      }
    );
  },

  deleteProduto: (id: string) =>
    request<void>(`/produtos/${id}`, {
      method: "DELETE",
    }),

  pedidos: () =>
    request<Pedido[]>("/pedidos"),

  statusPedido: (
    id: string,
    status: Pedido["status"]
  ) =>
    request<Pedido>(
      `/pedidos/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
        }),
      }
    ),

  funcionarios: () =>
    request<Funcionario[]>("/funcionarios"),

  criarFuncionario: (
    funcionario: Omit<Funcionario, "id">
  ) =>
    request<Funcionario>("/funcionarios", {
      method: "POST",
      body: JSON.stringify(funcionario),
    }),

  atualizarFuncionario: (
    funcionario: Funcionario
  ) =>
    request<Funcionario>(
      `/funcionarios/${funcionario.id}`,
      {
        method: "PUT",
        body: JSON.stringify(funcionario),
      }
    ),

  excluirFuncionario: (id: string) =>
    request<void>(`/funcionarios/${id}`, {
      method: "DELETE",
    }),

  escalas: (semana: string) =>
    request<EscalaSemanal[]>(
      `/escalas?semana=${encodeURIComponent(
        semana
      )}`
    ),

  saveEscalas: (
    escalas: EscalaSemanal[]
  ) =>
    request<EscalaSemanal[]>("/escalas", {
      method: "PUT",
      body: JSON.stringify(escalas),
    }),

  chamados: () =>
    request<Chamado[]>(
      "/chamados?status=ABERTO"
    ),

  atender: (id: string) =>
    request<Chamado>(
      `/chamados/${id}/atender`,
      {
        method: "PATCH",
      }
    ),

  fecharMesa: (numeroMesa: number) =>
    request<void>(
      `/mesas/${numeroMesa}/fechar`,
      {
        method: "POST",
      }
    ),
};