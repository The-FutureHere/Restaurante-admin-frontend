import {
  ArrowUpRight,
  CalendarDays,
  DollarSign,
  Receipt,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useEffect,
  useState,
} from "react";

import {
  api,
  type DashboardAnual,
} from "../../services/api";

type ModoDashboard =
  | "OPERACIONAL"
  | "MENSAL";

type PeriodoDashboard =
  | "hoje"
  | "7d"
  | "mes";

type HoraDashboard = {
  hora: string;
  pedidos: number;
  faturamento: number;
};

type DiaDashboard = {
  dia: string;
  valor: number;
};

type ProdutoRanking = {
  produto_id: string;
  nome: string;
  imagem_url: string;
  categoria: string;
  quantidade: number;
  receita: number;
};

type DashboardResumo = {
  faturado_dia: number;
  variacao_dia: number;
  faturado_semana: number;
  ticket_medio: number;
  pedidos_hoje: number;
  pedidos_ativos: number;
  horas: HoraDashboard[];
  semana: DiaDashboard[];
  ranking: ProdutoRanking[];
};

function brl(valor: number) {
  return Number(
    valor || 0
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

function obterErro(
  error: unknown
) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível carregar o dashboard.";
}

export default function Dashboard() {
  const anoAtual =
    new Date().getFullYear();

  const [
    modo,
    setModo,
  ] =
    useState<ModoDashboard>(
      "OPERACIONAL"
    );

  const [
    periodo,
    setPeriodo,
  ] =
    useState<PeriodoDashboard>(
      "hoje"
    );

  const [
    ano,
    setAno,
  ] =
    useState(anoAtual);

  const [
    dados,
    setDados,
  ] =
    useState<
      DashboardResumo | null
    >(null);

  const [
    dadosAnuais,
    setDadosAnuais,
  ] =
    useState<
      DashboardAnual | null
    >(null);

  const [
    carregando,
    setCarregando,
  ] =
    useState(true);

  const [
    erro,
    setErro,
  ] =
    useState("");

  useEffect(() => {
    if (
      modo !== "OPERACIONAL"
    ) {
      return;
    }

    async function carregarDashboard() {
      try {
        setCarregando(true);
        setErro("");

        const resposta =
          await api.dashboard(
            periodo
          );

        setDados(
          resposta as DashboardResumo
        );
      } catch (error) {
        setErro(
          obterErro(error)
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDashboard();
  }, [modo, periodo]);

  useEffect(() => {
    if (
      modo !== "MENSAL"
    ) {
      return;
    }

    async function carregarAnual() {
      try {
        setCarregando(true);
        setErro("");

        const resposta =
          await api.dashboardAnual(
            ano
          );

        setDadosAnuais(
          resposta
        );
      } catch (error) {
        setErro(
          obterErro(error)
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarAnual();
  }, [modo, ano]);

  return (
    <main className="p-5 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-bold text-brand">
            VISÃO GERAL
          </p>

          <h1 className="text-3xl font-black">
            Dashboard
          </h1>

          <p className="mt-1 text-slate-500">
            Acompanhe vendas e
            faturamento do
            restaurante.
          </p>
        </div>

        <div className="flex rounded-2xl bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() =>
              setModo(
                "OPERACIONAL"
              )
            }
            className={
              modo ===
              "OPERACIONAL"
                ? "rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white"
                : "rounded-xl px-4 py-3 text-sm font-bold text-slate-500"
            }
          >
            Operacional
          </button>

          <button
            type="button"
            onClick={() =>
              setModo(
                "MENSAL"
              )
            }
            className={
              modo === "MENSAL"
                ? "rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white"
                : "rounded-xl px-4 py-3 text-sm font-bold text-slate-500"
            }
          >
            Por mês
          </button>
        </div>
      </div>

      {erro && (
        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-red-700">
          {erro}
        </div>
      )}

      {carregando && (
        <div className="mt-6 rounded-3xl bg-white p-12 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />

          <p className="mt-4 text-slate-500">
            Carregando...
          </p>
        </div>
      )}

      {!carregando &&
        !erro &&
        modo ===
          "OPERACIONAL" &&
        dados && (
          <VisaoOperacional
            dados={dados}
            periodo={periodo}
            setPeriodo={
              setPeriodo
            }
          />
        )}

      {!carregando &&
        !erro &&
        modo === "MENSAL" &&
        dadosAnuais && (
          <VisaoMensal
            dados={
              dadosAnuais
            }
            ano={ano}
            setAno={setAno}
          />
        )}
    </main>
  );
}

type VisaoOperacionalProps = {
  dados: DashboardResumo;

  periodo:
    PeriodoDashboard;

  setPeriodo: (
    periodo: PeriodoDashboard
  ) => void;
};

function VisaoOperacional({
  dados,
  periodo,
  setPeriodo,
}: VisaoOperacionalProps) {
  return (
    <>
      <div className="mt-6 flex justify-end">
        <select
          value={periodo}
          onChange={(event) =>
            setPeriodo(
              event.target
                .value as PeriodoDashboard
            )
          }
          className="rounded-xl border bg-white px-4 py-3 font-bold"
        >
          <option value="hoje">
            Hoje
          </option>

          <option value="7d">
            Últimos 7 dias
          </option>

          <option value="mes">
            Este mês
          </option>
        </select>
      </div>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi
          titulo="Faturado no Dia"
          valor={brl(
            dados.faturado_dia
          )}
          detalhe={`${dados.variacao_dia}%`}
          Icone={DollarSign}
        />

        <Kpi
          titulo="Faturado na Semana"
          valor={brl(
            dados.faturado_semana
          )}
          detalhe="7 dias"
          Icone={
            ArrowUpRight
          }
        />

        <Kpi
          titulo="Ticket Médio"
          valor={brl(
            dados.ticket_medio
          )}
          detalhe="por pedido"
          Icone={
            ShoppingBag
          }
        />

        <Kpi
          titulo="Pedidos Hoje"
          valor={String(
            dados.pedidos_hoje
          )}
          detalhe={`${dados.pedidos_ativos} ativos`}
          Icone={Receipt}
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-black">
            Pedidos por hora
          </h2>

          <div className="mt-5 h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  dados.horas
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="hora"
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="pedidos"
                  fill="#e11d48"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-black">
            Faturamento por dia
          </h2>

          <div className="mt-5 h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  dados.semana
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="dia"
                />

                <YAxis />

                <Tooltip
                  formatter={(
                    valor
                  ) =>
                    brl(
                      Number(
                        valor
                      )
                    )
                  }
                />

                <Bar
                  dataKey="valor"
                  fill="#e11d48"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">
          Produtos mais vendidos
        </h2>

        {dados.ranking.length ===
        0 ? (
          <p className="py-10 text-center text-slate-500">
            Nenhum dado disponível.
          </p>
        ) : (
          dados.ranking.map(
            (
              produto,
              index
            ) => (
              <div
                key={
                  produto.produto_id
                }
                className="flex items-center gap-4 border-t py-3 first:border-0"
              >
                <b>
                  #{index + 1}
                </b>

                {produto.imagem_url ? (
                  <img
                    src={
                      produto.imagem_url
                    }
                    alt={
                      produto.nome
                    }
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-slate-100" />
                )}

                <div className="flex-1">
                  <p className="font-bold">
                    {
                      produto.nome
                    }
                  </p>

                  <p className="text-xs text-slate-400">
                    {
                      produto.categoria
                    }
                  </p>
                </div>

                <span>
                  {
                    produto.quantidade
                  }{" "}
                  un.
                </span>

                <b className="text-brand">
                  {brl(
                    produto.receita
                  )}
                </b>
              </div>
            )
          )
        )}
      </section>
    </>
  );
}

type VisaoMensalProps = {
  dados: DashboardAnual;

  ano: number;

  setAno: (
    ano: number
  ) => void;
};

function VisaoMensal({
  dados,
  ano,
  setAno,
}: VisaoMensalProps) {
  const anoAtual =
    new Date().getFullYear();

  const anos = [
    anoAtual,
    anoAtual - 1,
    anoAtual - 2,
    anoAtual - 3,
    anoAtual - 4,
    anoAtual - 5,
  ];

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">
            Faturamento mensal
          </h2>

          <p className="text-sm text-slate-500">
            Visualize o desempenho
            de janeiro a dezembro.
          </p>
        </div>

        <label className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3">
          <CalendarDays
            size={18}
            className="text-brand"
          />

          <span className="text-sm font-bold">
            Ano
          </span>

          <select
            value={ano}
            onChange={(event) =>
              setAno(
                Number(
                  event.target
                    .value
                )
              )
            }
            className="font-black outline-none"
          >
            {anos.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>
        </label>
      </div>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi
          titulo="Faturamento do Ano"
          valor={brl(
            dados.faturamento_total
          )}
          detalhe={String(
            dados.ano
          )}
          Icone={DollarSign}
        />

        <Kpi
          titulo="Ticket Médio"
          valor={brl(
            dados.ticket_medio
          )}
          detalhe="média anual"
          Icone={
            ShoppingBag
          }
        />

        <Kpi
          titulo="Total de Pedidos"
          valor={String(
            dados.total_pedidos
          )}
          detalhe="no ano"
          Icone={Receipt}
        />

        <Kpi
          titulo="Melhor Mês"
          valor={
            dados.melhor_mes ||
            "Sem vendas"
          }
          detalhe={
            dados.melhor_mes
              ? brl(
                  dados.faturamento_melhor_mes
                )
              : "sem dados"
          }
          Icone={TrendingUp}
        />
      </section>

      <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">
          Faturamento por mês
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Janeiro a dezembro de{" "}
          {dados.ano}.
        </p>

        <div className="mt-6 h-80">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={
                dados.meses
              }
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="nome"
              />

              <YAxis />

              <Tooltip
                formatter={(
                  valor
                ) =>
                  brl(
                    Number(
                      valor
                    )
                  )
                }
              />

              <Bar
                dataKey="faturamento"
                fill="#e11d48"
                radius={[
                  8,
                  8,
                  0,
                  0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">
          Detalhamento mensal
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="text-xs uppercase text-slate-400">
                <th className="pb-3">
                  Mês
                </th>

                <th className="pb-3">
                  Faturamento
                </th>

                <th className="pb-3">
                  Pedidos
                </th>

                <th className="pb-3">
                  Ticket médio
                </th>
              </tr>
            </thead>

            <tbody>
              {dados.meses.map(
                (mes) => {
                  const ticketMedio =
                    mes.pedidos >
                    0
                      ? mes.faturamento /
                        mes.pedidos
                      : 0;

                  return (
                    <tr
                      key={
                        mes.mes
                      }
                      className="border-t"
                    >
                      <td className="py-4 font-bold">
                        {mes.nome}
                      </td>

                      <td className="py-4 font-black text-brand">
                        {brl(
                          mes.faturamento
                        )}
                      </td>

                      <td className="py-4">
                        {
                          mes.pedidos
                        }
                      </td>

                      <td className="py-4">
                        {brl(
                          ticketMedio
                        )}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

type KpiProps = {
  titulo: string;
  valor: string;
  detalhe: string;
  Icone: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
};

function Kpi({
  titulo,
  valor,
  detalhe,
  Icone,
}: KpiProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/10 text-brand">
          <Icone size={21} />
        </span>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
          {detalhe}
        </span>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {titulo}
      </p>

      <p className="mt-1 text-2xl font-black">
        {valor}
      </p>
    </div>
  );
}