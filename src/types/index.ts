export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: "ADMIN" | "COZINHA";
}

export interface Categoria {
  id: string;
  nome: string;
  ordem: number;
}

export interface Produto {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  disponivel: boolean;
}

export interface ItemPedido {
  id: string;
  produto_id: string;
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
  observacao?: string;
}

export interface Pedido {
  id: string;
  numero_mesa: number;
  nome_cliente: string;

  status:
    | "PENDENTE"
    | "PREPARANDO"
    | "PRONTO"
    | "CANCELADO"
    | "FECHADO";

  total: number;
  criado_em: string;

  itens: ItemPedido[];
}

export interface Funcionario {
  id: string;

  nome: string;

  cargo:
    | "COZINHEIRO"
    | "AUXILIAR_COZINHA"
    | "GARCOM_ATENDENTE"
    | "CAIXA"
    | "GERENTE";

  turno:
    | "DIURNO"
    | "NOTURNO"
    | "INTEGRAL";

  ativo: boolean;
}

export type StatusDiaEscala =
  | "TRABALHO"
  | "FOLGA";

export interface DiasEscala {
  seg: StatusDiaEscala;
  ter: StatusDiaEscala;
  qua: StatusDiaEscala;
  qui: StatusDiaEscala;
  sex: StatusDiaEscala;
  sab: StatusDiaEscala;
  dom: StatusDiaEscala;
}

export interface EscalaSemanal {
  funcionario_id: string;
  semana_referencia: string;
  dias: DiasEscala;
}