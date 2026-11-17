import {
  Edit3,
  FolderPlus,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "../../services/api";

import type {
  Categoria,
  Produto,
} from "../../types";

/* ============================================================
   FUNÇÕES AUXILIARES
============================================================ */

const formatarMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */

export default function Cardapio() {
  const [produtos, setProdutos] =
    useState<Produto[]>([]);

  const [categorias, setCategorias] =
    useState<Categoria[]>([]);

  const [busca, setBusca] =
    useState("");

  const [filtroStatus, setFiltroStatus] =
    useState<
      "TODOS" | "DISPONIVEIS" | "ESGOTADOS"
    >("TODOS");

  const [
    filtroCategoria,
    setFiltroCategoria,
  ] = useState("TODAS");

  const [
    produtoSelecionado,
    setProdutoSelecionado,
  ] = useState<
    Produto | null | undefined
  >(undefined);

  const [
    categoriaSelecionada,
    setCategoriaSelecionada,
  ] = useState<
    Categoria | null | undefined
  >(undefined);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  const [toast, setToast] =
    useState("");

  /* ==========================================================
     CARREGAMENTO
  ========================================================== */

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [
        produtosResponse,
        categoriasResponse,
      ] = await Promise.all([
        api.produtos(),
        api.categorias(),
      ]);

      setProdutos(produtosResponse);

      setCategorias(
        [...categoriasResponse].sort(
          (categoriaA, categoriaB) =>
            categoriaA.ordem -
            categoriaB.ordem
        )
      );
    } catch (error: unknown) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar o cardápio."
        )
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  /* ==========================================================
     TOAST
  ========================================================== */

  function exibirToast(
    mensagem: string
  ) {
    setToast(mensagem);

    window.setTimeout(() => {
      setToast("");
    }, 2500);
  }

  /* ==========================================================
     FILTROS
  ========================================================== */

  const produtosFiltrados =
    useMemo(() => {
      const buscaNormalizada =
        busca.trim().toLowerCase();

      return produtos.filter(
        (produto) => {
          const correspondeBusca =
            produto.nome
              .toLowerCase()
              .includes(
                buscaNormalizada
              ) ||
            produto.descricao
              .toLowerCase()
              .includes(
                buscaNormalizada
              );

          const correspondeCategoria =
            filtroCategoria ===
              "TODAS" ||
            produto.categoria_id ===
              filtroCategoria;

          const correspondeStatus =
            filtroStatus ===
              "TODOS" ||
            (filtroStatus ===
              "DISPONIVEIS" &&
              produto.disponivel) ||
            (filtroStatus ===
              "ESGOTADOS" &&
              !produto.disponivel);

          return (
            correspondeBusca &&
            correspondeCategoria &&
            correspondeStatus
          );
        }
      );
    }, [
      produtos,
      busca,
      filtroCategoria,
      filtroStatus,
    ]);

  /* ==========================================================
     PRODUTOS
  ========================================================== */

  async function atualizarProduto(
    produto: Produto,
    alteracoes: Partial<Produto>
  ) {
    try {
      setErro("");

      await api.saveProduto({
        ...produto,
        ...alteracoes,
      });

      await carregarDados();

      exibirToast(
        "Produto atualizado com sucesso."
      );
    } catch (error: unknown) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível atualizar o produto."
        )
      );
    }
  }

  async function excluirProduto(
    produto: Produto
  ) {
    const confirmou =
      window.confirm(
        `Deseja realmente excluir o produto "${produto.nome}"?`
      );

    if (!confirmou) {
      return;
    }

    try {
      setErro("");

      await api.deleteProduto(
        produto.id
      );

      await carregarDados();

      exibirToast(
        "Produto excluído com sucesso."
      );
    } catch (error: unknown) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível excluir o produto."
        )
      );
    }
  }

  /* ==========================================================
     CATEGORIAS
  ========================================================== */

  async function excluirCategoria(
    categoria: Categoria
  ) {
    const produtosDaCategoria =
      produtos.filter(
        (produto) =>
          produto.categoria_id ===
          categoria.id
      );

    if (
      produtosDaCategoria.length >
      0
    ) {
      setErro(
        `A categoria "${categoria.nome}" possui ${produtosDaCategoria.length} produto(s). ` +
          "Mova ou exclua os produtos antes de excluir a categoria."
      );

      return;
    }

    const confirmou =
      window.confirm(
        `Deseja realmente excluir a categoria "${categoria.nome}"?`
      );

    if (!confirmou) {
      return;
    }

    try {
      setErro("");

      await api.excluirCategoria(
        categoria.id
      );

      await carregarDados();

      exibirToast(
        "Categoria excluída com sucesso."
      );
    } catch (error: unknown) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível excluir a categoria."
        )
      );
    }
  }

  /* ==========================================================
     RENDERIZAÇÃO
  ========================================================== */

  return (
    <main className="p-5 lg:p-8">
      {/* CABEÇALHO */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-bold text-brand">
            OPERAÇÃO
          </p>

          <h1 className="text-3xl font-black text-slate-900">
            Cardápio
          </h1>

          <p className="mt-1 text-slate-500">
            Gerencie categorias, produtos,
            preços e disponibilidade.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setCategoriaSelecionada(
                null
              )
            }
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <FolderPlus size={19} />

            Nova Categoria
          </button>

          <button
            type="button"
            disabled={
              categorias.length === 0
            }
            onClick={() =>
              setProdutoSelecionado(null)
            }
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-3 font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={19} />

            Novo Produto
          </button>
        </div>
      </div>

      {/* ERRO */}

      {erro && (
        <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <span>{erro}</span>

          <button
            type="button"
            onClick={() => setErro("")}
            className="shrink-0"
            aria-label="Fechar mensagem de erro"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* CARREGANDO */}

      {carregando && (
        <div className="mt-6 rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />

          <p className="mt-4 text-sm text-slate-500">
            Carregando cardápio...
          </p>
        </div>
      )}

      {/* ESTADO SEM CATEGORIAS */}

      {!carregando &&
        categorias.length === 0 && (
          <section className="mt-6 rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
            <FolderPlus
              className="mx-auto text-brand"
              size={48}
            />

            <h2 className="mt-4 text-xl font-black text-slate-900">
              Crie sua primeira categoria
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Antes de cadastrar produtos, crie
              uma categoria para organizar o
              cardápio. Por exemplo: Lanches,
              Porções, Bebidas ou Sobremesas.
            </p>

            <button
              type="button"
              onClick={() =>
                setCategoriaSelecionada(
                  null
                )
              }
              className="mt-5 rounded-xl bg-brand px-5 py-3 font-bold text-white"
            >
              Criar primeira categoria
            </button>
          </section>
        )}

      {/* CONTEÚDO */}

      {!carregando &&
        categorias.length > 0 && (
          <>
            {/* GESTÃO DE CATEGORIAS */}

            <section className="mt-7">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Categorias
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Defina os grupos e a ordem
                    de exibição no cardápio.
                  </p>
                </div>

                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                  {categorias.length}{" "}
                  {categorias.length === 1
                    ? "categoria"
                    : "categorias"}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {categorias.map(
                  (categoria) => {
                    const quantidadeProdutos =
                      produtos.filter(
                        (produto) =>
                          produto.categoria_id ===
                          categoria.id
                      ).length;

                    return (
                      <article
                        key={
                          categoria.id
                        }
                        className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              Ordem{" "}
                              {
                                categoria.ordem
                              }
                            </span>

                            <h3 className="mt-1 truncate font-black text-slate-900">
                              {
                                categoria.nome
                              }
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                quantidadeProdutos
                              }{" "}
                              {quantidadeProdutos ===
                              1
                                ? "produto"
                                : "produtos"}
                            </p>
                          </div>

                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              title="Editar categoria"
                              onClick={() =>
                                setCategoriaSelecionada(
                                  categoria
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                            >
                              <Edit3
                                size={
                                  17
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title="Excluir categoria"
                              onClick={() =>
                                excluirCategoria(
                                  categoria
                                )
                              }
                              className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                            >
                              <Trash2
                                size={
                                  17
                                }
                              />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </section>

            {/* FILTROS */}

            <section className="mt-7">
              <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <label className="flex min-w-[250px] flex-1 items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:ring-2 focus-within:ring-brand/20">
                  <Search
                    size={18}
                    className="text-slate-400"
                  />

                  <input
                    value={busca}
                    onChange={(
                      event
                    ) =>
                      setBusca(
                        event.target
                          .value
                      )
                    }
                    className="w-full py-3 outline-none"
                    placeholder="Buscar produto..."
                  />
                </label>

                <select
                  value={
                    filtroCategoria
                  }
                  onChange={(event) =>
                    setFiltroCategoria(
                      event.target
                        .value
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium outline-none"
                >
                  <option value="TODAS">
                    Todas as categorias
                  </option>

                  {categorias.map(
                    (categoria) => (
                      <option
                        key={
                          categoria.id
                        }
                        value={
                          categoria.id
                        }
                      >
                        {
                          categoria.nome
                        }
                      </option>
                    )
                  )}
                </select>

                <select
                  value={
                    filtroStatus
                  }
                  onChange={(event) =>
                    setFiltroStatus(
                      event.target
                        .value as
                        | "TODOS"
                        | "DISPONIVEIS"
                        | "ESGOTADOS"
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium outline-none"
                >
                  <option value="TODOS">
                    Todos
                  </option>

                  <option value="DISPONIVEIS">
                    Disponíveis
                  </option>

                  <option value="ESGOTADOS">
                    Esgotados
                  </option>
                </select>
              </div>
            </section>

            {/* TABELA DE PRODUTOS */}

            <section className="mt-4 overflow-x-auto rounded-3xl bg-white p-4 shadow-sm">
              <table className="w-full min-w-[920px] text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-4">
                      Produto
                    </th>

                    <th className="pb-4">
                      Categoria
                    </th>

                    <th className="pb-4">
                      Preço
                    </th>

                    <th className="pb-4">
                      Disponibilidade
                    </th>

                    <th className="pb-4">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {produtosFiltrados.map(
                    (produto) => {
                      const categoria =
                        categorias.find(
                          (item) =>
                            item.id ===
                            produto.categoria_id
                        );

                      return (
                        <tr
                          key={
                            produto.id
                          }
                          className="border-t border-slate-100"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              {produto.imagem_url ? (
                                <img
                                  src={
                                    produto.imagem_url
                                  }
                                  alt={
                                    produto.nome
                                  }
                                  className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 object-cover"
                                />
                              ) : (
                                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs text-slate-400">
                                  Sem foto
                                </div>
                              )}

                              <div className="min-w-0">
                                <b className="block text-slate-900">
                                  {
                                    produto.nome
                                  }
                                </b>

                                <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                  {
                                    produto.descricao
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                              {categoria?.nome ||
                                "Categoria removida"}
                            </span>
                          </td>

                          <td>
                            <div>
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                defaultValue={
                                  produto.preco
                                }
                                onBlur={(
                                  event
                                ) => {
                                  const novoPreco =
                                    Number(
                                      event
                                        .target
                                        .value
                                    );

                                  if (
                                    Number.isFinite(
                                      novoPreco
                                    ) &&
                                    novoPreco >
                                      0 &&
                                    novoPreco !==
                                      produto.preco
                                  ) {
                                    atualizarProduto(
                                      produto,
                                      {
                                        preco:
                                          novoPreco,
                                      }
                                    );
                                  } else {
                                    event.target.value =
                                      String(
                                        produto.preco
                                      );
                                  }
                                }}
                                className="w-28 rounded-lg border border-slate-200 px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-brand/20"
                              />

                              <p className="mt-1 text-xs text-slate-400">
                                {formatarMoeda(
                                  produto.preco
                                )}
                              </p>
                            </div>
                          </td>

                          <td>
                            <button
                              type="button"
                              onClick={() =>
                                atualizarProduto(
                                  produto,
                                  {
                                    disponivel:
                                      !produto.disponivel,
                                  }
                                )
                              }
                              className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                                produto.disponivel
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                              }`}
                            >
                              {produto.disponivel
                                ? "Disponível"
                                : "Esgotado"}
                            </button>
                          </td>

                          <td>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                title="Editar produto"
                                onClick={() =>
                                  setProdutoSelecionado(
                                    produto
                                  )
                                }
                                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                              >
                                <Edit3
                                  size={
                                    18
                                  }
                                />
                              </button>

                              <button
                                type="button"
                                title="Excluir produto"
                                onClick={() =>
                                  excluirProduto(
                                    produto
                                  )
                                }
                                className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                              >
                                <Trash2
                                  size={
                                    18
                                  }
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>

              {produtosFiltrados.length ===
                0 && (
                <div className="p-12 text-center">
                  <Search
                    className="mx-auto text-slate-300"
                    size={38}
                  />

                  <h3 className="mt-3 font-black text-slate-700">
                    Nenhum produto encontrado
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Ajuste os filtros ou cadastre
                    um novo produto.
                  </p>
                </div>
              )}
            </section>
          </>
        )}

      {/* MODAL DE PRODUTO */}

      {produtoSelecionado !==
        undefined && (
        <ProdutoModal
          produtoInicial={
            produtoSelecionado
          }
          categorias={
            categorias
          }
          fechar={() =>
            setProdutoSelecionado(
              undefined
            )
          }
          salvo={async () => {
            const editando =
              produtoSelecionado !==
              null;

            setProdutoSelecionado(
              undefined
            );

            await carregarDados();

            exibirToast(
              editando
                ? "Produto atualizado com sucesso."
                : "Produto criado com sucesso."
            );
          }}
        />
      )}

      {/* MODAL DE CATEGORIA */}

      {categoriaSelecionada !==
        undefined && (
        <CategoriaModal
          categoriaInicial={
            categoriaSelecionada
          }
          proximaOrdem={
            categorias.length === 0
              ? 1
              : Math.max(
                  ...categorias.map(
                    (categoria) =>
                      categoria.ordem
                  )
                ) + 1
          }
          fechar={() =>
            setCategoriaSelecionada(
              undefined
            )
          }
          salva={async () => {
            const editando =
              categoriaSelecionada !==
              null;

            setCategoriaSelecionada(
              undefined
            );

            await carregarDados();

            exibirToast(
              editando
                ? "Categoria atualizada com sucesso."
                : "Categoria criada com sucesso."
            );
          }}
        />
      )}

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] rounded-xl bg-slate-950 px-5 py-3 font-bold text-white shadow-xl">
          {toast}
        </div>
      )}
    </main>
  );
}

/* ============================================================
   MODAL DE CATEGORIA
============================================================ */

interface CategoriaModalProps {
  categoriaInicial:
    | Categoria
    | null;

  proximaOrdem: number;

  fechar: () => void;

  salva: () => Promise<void>;
}

function CategoriaModal({
  categoriaInicial,
  proximaOrdem,
  fechar,
  salva,
}: CategoriaModalProps) {
  const [nome, setNome] =
    useState(
      categoriaInicial?.nome || ""
    );

  const [ordem, setOrdem] =
    useState(
      categoriaInicial?.ordem ||
        proximaOrdem
    );

  const [erro, setErro] =
    useState("");

  const [salvando, setSalvando] =
    useState(false);

  async function salvarCategoria() {
    const nomeNormalizado =
      nome.trim();

    if (!nomeNormalizado) {
      setErro(
        "Informe o nome da categoria."
      );

      return;
    }

    if (
      !Number.isInteger(ordem) ||
      ordem < 1
    ) {
      setErro(
        "A ordem deve ser um número inteiro maior que zero."
      );

      return;
    }

    try {
      setSalvando(true);
      setErro("");

      if (categoriaInicial) {
        await api.atualizarCategoria({
          ...categoriaInicial,
          nome: nomeNormalizado,
          ordem,
        });
      } else {
        await api.criarCategoria({
          nome: nomeNormalizado,
          ordem,
        });
      }

      await salva();
    } catch (error: unknown) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível salvar a categoria."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
      onMouseDown={fechar}
    >
      <section
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-brand">
              CARDÁPIO
            </p>

            <h2 className="text-2xl font-black text-slate-900">
              {categoriaInicial
                ? "Editar categoria"
                : "Nova categoria"}
            </h2>
          </div>

          <button
            type="button"
            onClick={fechar}
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">
            Nome da categoria

            <input
              autoFocus
              value={nome}
              onChange={(event) =>
                setNome(
                  event.target.value
                )
              }
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="Ex: Lanches"
            />
          </label>

          <label className="block text-sm font-bold text-slate-700">
            Ordem de exibição

            <input
              type="number"
              min="1"
              step="1"
              value={ordem}
              onChange={(event) =>
                setOrdem(
                  Number(
                    event.target.value
                  )
                )
              }
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:ring-2 focus:ring-brand/20"
            />

            <span className="mt-1 block text-xs font-normal text-slate-500">
              Categorias com números menores
              aparecem primeiro.
            </span>
          </label>

          {erro && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {erro}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={fechar}
            className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={salvando}
            onClick={
              salvarCategoria
            }
            className="rounded-xl bg-brand px-5 py-3 font-bold text-white disabled:opacity-50"
          >
            {salvando
              ? "Salvando..."
              : "Salvar categoria"}
          </button>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   MODAL DE PRODUTO
============================================================ */

interface ProdutoModalProps {
  produtoInicial:
    | Produto
    | null;

  categorias: Categoria[];

  fechar: () => void;

  salvo: () => Promise<void>;
}

function ProdutoModal({
  produtoInicial,
  categorias,
  fechar,
  salvo,
}: ProdutoModalProps) {
  const [produto, setProduto] =
    useState<Produto>(() => ({
      id:
        produtoInicial?.id ||
        "",

      categoria_id:
        produtoInicial?.categoria_id ||
        categorias[0]?.id ||
        "",

      nome:
        produtoInicial?.nome ||
        "",

      descricao:
        produtoInicial?.descricao ||
        "",

      preco:
        produtoInicial?.preco ||
        0,

      imagem_url:
        produtoInicial?.imagem_url ||
        "",

      disponivel:
        produtoInicial?.disponivel ??
        true,
    }));

  const [erro, setErro] =
    useState("");

  const [salvando, setSalvando] =
    useState(false);

  const [imagemComErro, setImagemComErro] =
    useState(false);

  async function salvarProduto() {
    const nomeNormalizado =
      produto.nome.trim();

    const descricaoNormalizada =
      produto.descricao.trim();

    const imagemNormalizada =
      produto.imagem_url.trim();

    if (!produto.categoria_id) {
      setErro(
        "Selecione uma categoria."
      );

      return;
    }

    if (!nomeNormalizado) {
      setErro(
        "Informe o nome do produto."
      );

      return;
    }

    if (
      !Number.isFinite(
        produto.preco
      ) ||
      produto.preco <= 0
    ) {
      setErro(
        "Informe um preço maior que zero."
      );

      return;
    }

    try {
      setSalvando(true);
      setErro("");

      await api.saveProduto({
        ...produto,
        nome: nomeNormalizado,
        descricao:
          descricaoNormalizada,
        imagem_url:
          imagemNormalizada,
      });

      await salvo();
    } catch (error: unknown) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível salvar o produto."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
      onMouseDown={fechar}
    >
      <section
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-brand">
              CARDÁPIO
            </p>

            <h2 className="text-2xl font-black text-slate-900">
              {produtoInicial
                ? "Editar produto"
                : "Novo produto"}
            </h2>
          </div>

          <button
            type="button"
            onClick={fechar}
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">
            Nome

            <input
              value={produto.nome}
              onChange={(event) =>
                setProduto({
                  ...produto,
                  nome:
                    event.target.value,
                })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="Ex: Brasa Bacon"
            />
          </label>

          <label className="text-sm font-bold text-slate-700">
            Categoria

            <select
              value={
                produto.categoria_id
              }
              onChange={(event) =>
                setProduto({
                  ...produto,
                  categoria_id:
                    event.target.value,
                })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="">
                Selecione uma categoria
              </option>

              {categorias.map(
                (categoria) => (
                  <option
                    key={
                      categoria.id
                    }
                    value={
                      categoria.id
                    }
                  >
                    {
                      categoria.nome
                    }
                  </option>
                )
              )}
            </select>
          </label>

          <label className="text-sm font-bold text-slate-700">
            Preço

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={produto.preco}
              onChange={(event) =>
                setProduto({
                  ...produto,
                  preco:
                    Number(
                      event.target.value
                    ),
                })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="0,00"
            />

            <span className="mt-1 block text-xs font-normal text-slate-500">
              {formatarMoeda(
                Number.isFinite(
                  produto.preco
                )
                  ? produto.preco
                  : 0
              )}
            </span>
          </label>

          <label className="text-sm font-bold text-slate-700">
            URL da imagem

            <input
              type="url"
              value={
                produto.imagem_url
              }
              onChange={(event) => {
                setImagemComErro(false);

                setProduto({
                  ...produto,
                  imagem_url:
                    event.target.value,
                });
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="https://..."
            />
          </label>

          <label className="text-sm font-bold text-slate-700 md:col-span-2">
            Descrição

            <textarea
              rows={4}
              value={
                produto.descricao
              }
              onChange={(event) =>
                setProduto({
                  ...produto,
                  descricao:
                    event.target.value,
                })
              }
              className="mt-1 w-full resize-none rounded-xl border border-slate-200 p-3 font-normal outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="Descreva ingredientes e características do produto."
            />
          </label>

          {produto.imagem_url && (
            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-bold text-slate-700">
                Pré-visualização
              </p>

              {!imagemComErro ? (
                <img
                  src={
                    produto.imagem_url
                  }
                  alt="Pré-visualização do produto"
                  onError={() =>
                    setImagemComErro(
                      true
                    )
                  }
                  className="h-52 w-full rounded-2xl bg-slate-100 object-cover"
                />
              ) : (
                <div className="grid h-40 place-items-center rounded-2xl bg-red-50 p-5 text-center text-sm text-red-700">
                  Não foi possível carregar a
                  imagem. Verifique a URL.
                </div>
              )}
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-4 font-bold text-slate-700 md:col-span-2">
            <input
              type="checkbox"
              checked={
                produto.disponivel
              }
              onChange={(event) =>
                setProduto({
                  ...produto,
                  disponivel:
                    event.target
                      .checked,
                })
              }
              className="h-5 w-5 accent-brand"
            />

            Disponível para venda
          </label>
        </div>

        {erro && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={fechar}
            className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={salvando}
            onClick={salvarProduto}
            className="rounded-xl bg-brand px-5 py-3 font-bold text-white disabled:opacity-50"
          >
            {salvando
              ? "Salvando..."
              : "Salvar produto"}
          </button>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   TRATAMENTO DE ERROS
============================================================ */

function obterMensagemErro(
  error: unknown,
  mensagemPadrao: string
) {
  if (error instanceof Error) {
    return error.message;
  }

  return mensagemPadrao;
}