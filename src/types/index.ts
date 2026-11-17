export interface Usuario { id: string; nome: string; email: string; perfil: 'ADMIN' | 'COZINHA' }
export interface Categoria { id: string; nome: string; ordem: number }
export interface Produto { id: string; categoria_id: string; nome: string; descricao: string; preco: number; imagem_url: string; disponivel: boolean }
export interface ItemPedido { id: string; produto_id: string; nome_produto: string; quantidade: number; preco_unitario: number; observacao?: string }
export interface Pedido { id: string; numero_mesa: number; nome_cliente: string; status: 'PENDENTE' | 'PREPARANDO' | 'PRONTO' | 'CANCELADO'; total: number; criado_em: string; itens: ItemPedido[] }
export interface Funcionario { id: string; nome: string; cargo: 'Cozinheiro(a)' | 'Auxiliar de Cozinha' | 'Garçom/Atendente' | 'Caixa' | 'Gerente'; turno: 'Diurno (Almoço)' | 'Noturno (Jantar)' | 'Integral'; ativo: boolean }
export interface EscalaSemanal { funcionario_id: string; semana_referencia: string; dias: { seg: 'TRABALHO' | 'FOLGA'; ter: 'TRABALHO' | 'FOLGA'; qua: 'TRABALHO' | 'FOLGA'; qui: 'TRABALHO' | 'FOLGA'; sex: 'TRABALHO' | 'FOLGA'; sab: 'TRABALHO' | 'FOLGA'; dom: 'TRABALHO' | 'FOLGA' } }
