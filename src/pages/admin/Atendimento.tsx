import {
  Bell,
  CheckCircle2,
  Clock3,
  Loader2,
  ReceiptText,
  RefreshCw,
  UserRoundCheck,
  WalletCards,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  api,
  type Chamado,
} from "../../services/api";
import type { Pedido } from "../../types";

const formatarMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

function formatarHorario(data: string) {
  return new Date(data).toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function calcularMinutos(data: string) {
  const criadoEm =
    new Date(data).getTime();

  const agora = Date.now();

  return Math.max(
    0,
    Math.floor(
      (agora - criadoEm) / 60000
    )
  );
}

function textoTempo(minutos: number) {
  if (minutos === 0) {
    return "Agora";
  }

  if (minutos === 1) {
    return "Há 1 minuto";
  }

  if (minutos < 60) {
    return `Há ${minutos} minutos`;
  }

  const horas = Math.floor(
    minutos / 60
  );

  if (horas === 1) {
    return "Há 1 hora";
  }

  return `Há ${horas} horas`;
}

function obterMensagemErro(
  error: unknown,
  mensagemPadrao: string
) {
  if (error instanceof Error) {
    return error.message;
  }

  return mensagemPadrao;
}

type AcaoEmAndamento =
  | {
      chamadoId: string;
      tipo:
        | "ATENDER"
        | "FECHAR_CONTA";
    }
  | null;

export default function Atendimento() {
  const [chamados, setChamados] =
    useState<Chamado[]>([]);

  const [pedidos, setPedidos] =
    useState<Pedido[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [atualizando, setAtualizando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [toast, setToast] =
    useState("");

  const [
    acaoEmAndamento,
    setAcaoEmAndamento,
  ] = useState<AcaoEmAndamento>(
    null
  );

  const [ultimaAtualizacao, setUltimaAtualizacao] =
    useState(new Date());

  const carregarDados = useCallback(
    async (
      mostrarCarregamento = false
    ) => {
      try {
        setErro("");

        if (mostrarCarregamento) {
          setCarregando(true);
        } else {
          setAtualizando(true);
        }

        const [
          chamadosResponse,
          pedidosResponse,
        ] = await Promise.all([
          api.chamados(),
          api.pedidos(),
        ]);

        setChamados(
          chamadosResponse
        );

        setPedidos(
          pedidosResponse
        );

        setUltimaAtualizacao(
          new Date()
        );
      } catch (error: unknown) {
        setErro(
          obterMensagemErro(
            error,
            "Não foi possível carregar os chamados."
          )
        );
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    },
    []
  );

  useEffect(() => {
    carregarDados(true);

    const intervalo =
      window.setInterval(() => {
        carregarDados(false);
      }, 5000);

    return () => {
      window.clearInterval(
        intervalo
      );
    };
  }, [carregarDados]);

  const chamadosOrdenados =
    useMemo(() => {
      return [...chamados].sort(
        (a, b) =>
          new Date(
            a.criado_em
          ).getTime() -
          new Date(
            b.criado_em
          ).getTime()
      );
    }, [chamados]);

  const chamadosGarcom =
    chamadosOrdenados.filter(
      (chamado) =>
        chamado.tipo === "GARCOM"
    );

  const chamadosFechamento =
    chamadosOrdenados.filter(
      (chamado) =>
        chamado.tipo ===
        "FECHAR_CONTA"
    );

  function obterPedidosDaMesa(
    numeroMesa: number
  ) {
    return pedidos.filter(
      (pedido) =>
        pedido.numero_mesa ===
          numeroMesa &&
        pedido.status !==
          "CANCELADO" &&
        pedido.status !==
          "FECHADO"
    );
  }

  function obterTotalDaMesa(
    numeroMesa: number
  ) {
    return obterPedidosDaMesa(
      numeroMesa
    ).reduce(
      (total, pedido) =>
        total + pedido.total,
      0
    );
  }

  function mostrarToast(
    mensagem: string
  ) {
    setToast(mensagem);

    window.setTimeout(() => {
      setToast("");
    }, 2500);
  }

  async function atenderChamado(
    chamado: Chamado
  ) {
    try {
      setErro("");

      setAcaoEmAndamento({
        chamadoId: chamado.id,
        tipo: "ATENDER",
      });

      await api.atender(
        chamado.id
      );

      mostrarToast(
        `Chamado da Mesa ${chamado.numero_mesa} atendido.`
      );

      await carregarDados(false);
    } catch (error: unknown) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível atender o chamado."
        )
      );
    } finally {
      setAcaoEmAndamento(
        null
      );
    }
  }

  async function fecharConta(
    chamado: Chamado
  ) {
    const pedidosMesa =
      obterPedidosDaMesa(
        chamado.numero_mesa
      );

    const totalMesa =
      obterTotalDaMesa(
        chamado.numero_mesa
      );

    const mensagem = [
      `Confirmar fechamento da Mesa ${chamado.numero_mesa}?`,
      "",
      `Pedidos ativos: ${pedidosMesa.length}`,
      `Total da mesa: ${formatarMoeda(totalMesa)}`,
      "",
      "Confirme somente depois de receber o pagamento.",
    ].join("\n");

    const confirmou =
      window.confirm(mensagem);

    if (!confirmou) {
      return;
    }

    try {
      setErro("");

      setAcaoEmAndamento({
        chamadoId: chamado.id,
        tipo: "FECHAR_CONTA",
      });

      await api.fecharMesa(
        chamado.numero_mesa
      );

      mostrarToast(
        `Mesa ${chamado.numero_mesa} fechada com sucesso.`
      );

      await carregarDados(false);
    } catch (error: unknown) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível fechar a mesa."
        )
      );
    } finally {
      setAcaoEmAndamento(
        null
      );
    }
  }

  return (
    <main className="p-5 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-bold text-brand">
            ATENDIMENTO
          </p>

          <h1 className="text-3xl font-black text-slate-900">
            Chamados das mesas
          </h1>

          <p className="mt-1 text-slate-500">
            Atenda chamadas de
            garçom e solicitações
            de fechamento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Chamados abertos
            </p>

            <p className="text-2xl font-black text-brand">
              {
                chamadosOrdenados.length
              }
            </p>
          </div>

          <button
            type="button"
            disabled={atualizando}
            onClick={() =>
              carregarDados(false)
            }
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={
                atualizando
                  ? "animate-spin"
                  : ""
              }
            />

            Atualizar
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />

          Atualização automática
          ativa
        </div>

        <span className="text-xs text-emerald-700">
          Última atualização:{" "}
          {ultimaAtualizacao.toLocaleTimeString(
            "pt-BR",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </span>
      </div>

      {erro && (
        <div className="mt-5 flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{erro}</span>

          <button
            type="button"
            onClick={() =>
              setErro("")
            }
          >
            <X size={18} />
          </button>
        </div>
      )}

      {carregando && (
        <div className="mt-6 rounded-3xl bg-white p-12 text-center shadow-sm">
          <Loader2
            className="mx-auto animate-spin text-brand"
            size={40}
          />

          <p className="mt-4 text-slate-500">
            Carregando chamados...
          </p>
        </div>
      )}

      {!carregando &&
        chamadosOrdenados.length ===
          0 && (
          <div className="mt-6 rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <CheckCircle2
              className="mx-auto text-emerald-500"
              size={50}
            />

            <h2 className="mt-4 text-xl font-black text-slate-900">
              Nenhum chamado
              pendente
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              As chamadas de garçom
              e solicitações de
              fechamento aparecerão
              aqui.
            </p>
          </div>
        )}

      {!carregando &&
        chamadosOrdenados.length >
          0 && (
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Bell className="text-amber-500" />

                    <h2 className="text-xl font-black text-slate-900">
                      Chamadas de
                      garçom
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Mesas aguardando
                    atendimento.
                  </p>
                </div>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                  {
                    chamadosGarcom.length
                  }
                </span>
              </div>

              <div className="space-y-4">
                {chamadosGarcom.map(
                  (chamado) => {
                    const minutos =
                      calcularMinutos(
                        chamado.criado_em
                      );

                    const processando =
                      acaoEmAndamento
                        ?.chamadoId ===
                      chamado.id;

                    return (
                      <article
                        key={
                          chamado.id
                        }
                        className="rounded-3xl border-l-4 border-amber-500 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="inline-block rounded-xl bg-slate-950 px-3 py-2 text-lg font-black text-white">
                              MESA{" "}
                              {
                                chamado.numero_mesa
                              }
                            </span>

                            <h3 className="mt-3 text-lg font-black text-slate-900">
                              Cliente chamou
                              o garçom
                            </h3>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1 text-sm font-bold text-amber-700">
                              <Clock3
                                size={16}
                              />

                              {textoTempo(
                                minutos
                              )}
                            </div>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatarHorario(
                                chamado.criado_em
                              )}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={
                            processando
                          }
                          onClick={() =>
                            atenderChamado(
                              chamado
                            )
                          }
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-black text-white disabled:opacity-50"
                        >
                          {processando ? (
                            <Loader2
                              className="animate-spin"
                              size={19}
                            />
                          ) : (
                            <UserRoundCheck
                              size={19}
                            />
                          )}

                          Marcar como
                          atendido
                        </button>
                      </article>
                    );
                  }
                )}

                {chamadosGarcom.length ===
                  0 && (
                  <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                    Nenhuma mesa
                    chamou o garçom.
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ReceiptText className="text-brand" />

                    <h2 className="text-xl font-black text-slate-900">
                      Fechamento de
                      conta
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Mesas aguardando
                    pagamento.
                  </p>
                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                  {
                    chamadosFechamento.length
                  }
                </span>
              </div>

              <div className="space-y-4">
                {chamadosFechamento.map(
                  (chamado) => {
                    const pedidosMesa =
                      obterPedidosDaMesa(
                        chamado.numero_mesa
                      );

                    const totalMesa =
                      obterTotalDaMesa(
                        chamado.numero_mesa
                      );

                    const minutos =
                      calcularMinutos(
                        chamado.criado_em
                      );

                    const processando =
                      acaoEmAndamento
                        ?.chamadoId ===
                      chamado.id;

                    return (
                      <article
                        key={
                          chamado.id
                        }
                        className="rounded-3xl border-l-4 border-brand bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="inline-block rounded-xl bg-slate-950 px-3 py-2 text-lg font-black text-white">
                              MESA{" "}
                              {
                                chamado.numero_mesa
                              }
                            </span>

                            <h3 className="mt-3 text-lg font-black text-slate-900">
                              Solicitação de
                              fechamento
                            </h3>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1 text-sm font-bold text-red-600">
                              <Clock3
                                size={16}
                              />

                              {textoTempo(
                                minutos
                              )}
                            </div>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatarHorario(
                                chamado.criado_em
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-bold uppercase text-slate-400">
                              Pedidos ativos
                            </p>

                            <p className="mt-1 text-2xl font-black text-slate-900">
                              {
                                pedidosMesa.length
                              }
                            </p>
                          </div>

                          <div className="rounded-2xl bg-brand/10 p-4">
                            <p className="text-xs font-bold uppercase text-brand">
                              Total da mesa
                            </p>

                            <p className="mt-1 text-xl font-black text-brand">
                              {formatarMoeda(
                                totalMesa
                              )}
                            </p>
                          </div>
                        </div>

                        {pedidosMesa.length >
                          0 && (
                          <details className="mt-4 rounded-2xl border border-slate-200 p-4">
                            <summary className="cursor-pointer font-bold text-slate-700">
                              Ver pedidos
                              da mesa
                            </summary>

                            <div className="mt-4 space-y-3">
                              {pedidosMesa.map(
                                (
                                  pedido
                                ) => (
                                  <div
                                    key={
                                      pedido.id
                                    }
                                    className="border-t border-slate-100 pt-3 first:border-0 first:pt-0"
                                  >
                                    <div className="flex justify-between gap-3">
                                      <span className="text-sm font-bold text-slate-700">
                                        Pedido #
                                        {pedido.id.slice(
                                          -5
                                        )}
                                      </span>

                                      <span className="text-sm font-black text-brand">
                                        {formatarMoeda(
                                          pedido.total
                                        )}
                                      </span>
                                    </div>

                                    {pedido.itens.map(
                                      (
                                        item
                                      ) => (
                                        <p
                                          key={
                                            item.id
                                          }
                                          className="mt-1 text-xs text-slate-500"
                                        >
                                          {
                                            item.quantidade
                                          }
                                          x{" "}
                                          {
                                            item.nome_produto
                                          }
                                        </p>
                                      )
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </details>
                        )}

                        <button
                          type="button"
                          disabled={
                            processando
                          }
                          onClick={() =>
                            fecharConta(
                              chamado
                            )
                          }
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 font-black text-white disabled:opacity-50"
                        >
                          {processando ? (
                            <Loader2
                              className="animate-spin"
                              size={19}
                            />
                          ) : (
                            <WalletCards
                              size={19}
                            />
                          )}

                          Confirmar pagamento
                          e fechar mesa
                        </button>
                      </article>
                    );
                  }
                )}

                {chamadosFechamento.length ===
                  0 && (
                  <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                    Nenhuma mesa
                    solicitou fechamento.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white shadow-xl">
          {toast}
        </div>
      )}
    </main>
  );
}