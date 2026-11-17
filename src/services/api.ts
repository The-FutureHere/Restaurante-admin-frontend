import type {
  Categoria,
  EscalaSemanal,
  Funcionario,
  Pedido,
  Produto,
  Usuario,
} from "../types";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export type AuthResponse = {
  token: string;
  usuario: Usuario;
};

export type Chamado = {
  id: string;
  numero_mesa: number;
  tipo: "GARCOM" | "FECHAR_CONTA";
  status: string;
  criado_em: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("auth_token");

  const r = await fetch(BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (r.status === 401) {
    localStorage.clear();
    location.href = "/login";
  }

  const b = await r.json().catch(() => null);

  if (!r.ok) {
    throw Error(b?.message || b?.error || `Erro ${r.status}`);
  }

  return b;
}

export const api = {
  login: (email: string, senha: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    }),

  me: () => request<Usuario>("/auth/me"),

  dashboard: (periodo: string) =>
    request<any>(`/dashboard/resumo?periodo=${periodo}`),

  categorias: () => request<Categoria[]>("/categorias"),

  produtos: () => request<Produto[]>("/produtos"),

  saveProduto: (p: Produto) =>
    request<Produto>(p.id ? `/produtos/${p.id}` : "/produtos", {
      method: p.id ? "PUT" : "POST",
      body: JSON.stringify(p),
    }),

  deleteProduto: (id: string) =>
    request<void>(`/produtos/${id}`, {
      method: "DELETE",
    }),

  pedidos: () => request<Pedido[]>("/pedidos"),

  statusPedido: (id: string, status: Pedido["status"]) =>
    request<Pedido>(`/pedidos/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  funcionarios: () => request<Funcionario[]>("/funcionarios"),

  criarFuncionario: (funcionario: Omit<Funcionario, "id">) =>
    request<Funcionario>("/funcionarios", {
      method: "POST",
      body: JSON.stringify(funcionario),
    }),

  atualizarFuncionario: (funcionario: Funcionario) =>
    request<Funcionario>(`/funcionarios/${funcionario.id}`, {
      method: "PUT",
      body: JSON.stringify(funcionario),
    }),

  excluirFuncionario: (id: string) =>
    request<void>(`/funcionarios/${id}`, {
      method: "DELETE",
    }),

  escalas: (s: string) => request<EscalaSemanal[]>(`/escalas?semana=${s}`),

  saveEscalas: (e: EscalaSemanal[]) =>
    request<EscalaSemanal[]>("/escalas", {
      method: "PUT",
      body: JSON.stringify(e),
    }),

  chamados: () => request<Chamado[]>("/chamados?status=ABERTO"),

  atender: (id: string) =>
    request<void>(`/chamados/${id}/atender`, {
      method: "PATCH",
    }),

  fecharMesa: (n: number) =>
    request<void>(`/mesas/${n}/fechar`, {
      method: "POST",
    }),
};