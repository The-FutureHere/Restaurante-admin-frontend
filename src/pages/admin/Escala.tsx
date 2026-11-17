import {
  Edit3,
  Plus,
  Printer,
  Save,
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
  EscalaSemanal,
  Funcionario,
} from "../../types";

const dias = [
  "seg",
  "ter",
  "qua",
  "qui",
  "sex",
  "sab",
  "dom",
] as const;

type DiaSemana = (typeof dias)[number];

type FiltroTurno =
  | "TODOS"
  | Funcionario["turno"];

type FormularioFuncionario = {
  nome: string;
  cargo: Funcionario["cargo"];
  turno: Funcionario["turno"];
  ativo: boolean;
};

const labelsDias: Record<
  DiaSemana,
  string
> = {
  seg: "Seg",
  ter: "Ter",
  qua: "Qua",
  qui: "Qui",
  sex: "Sex",
  sab: "Sáb",
  dom: "Dom",
};

const labelsCargo: Record<
  Funcionario["cargo"],
  string
> = {
  COZINHEIRO: "Cozinheiro(a)",
  AUXILIAR_COZINHA:
    "Auxiliar de Cozinha",
  GARCOM_ATENDENTE:
    "Garçom/Atendente",
  CAIXA: "Caixa",
  GERENTE: "Gerente",
};

const labelsTurno: Record<
  Funcionario["turno"],
  string
> = {
  DIURNO: "Diurno (Almoço)",
  NOTURNO: "Noturno (Jantar)",
  INTEGRAL: "Integral",
};

function criarDiasPadrao(): EscalaSemanal["dias"] {
  return {
    seg: "TRABALHO",
    ter: "TRABALHO",
    qua: "TRABALHO",
    qui: "TRABALHO",
    sex: "TRABALHO",
    sab: "FOLGA",
    dom: "FOLGA",
  };
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

function alternarValorDia(
  valorAtual: "TRABALHO" | "FOLGA"
): "TRABALHO" | "FOLGA" {
  if (valorAtual === "TRABALHO") {
    return "FOLGA";
  }

  return "TRABALHO";
}

function criarDiasAlterados(
  escala: EscalaSemanal,
  dia: DiaSemana
): EscalaSemanal["dias"] {
  const seg =
    dia === "seg"
      ? alternarValorDia(escala.dias.seg)
      : escala.dias.seg;

  const ter =
    dia === "ter"
      ? alternarValorDia(escala.dias.ter)
      : escala.dias.ter;

  const qua =
    dia === "qua"
      ? alternarValorDia(escala.dias.qua)
      : escala.dias.qua;

  const qui =
    dia === "qui"
      ? alternarValorDia(escala.dias.qui)
      : escala.dias.qui;

  const sex =
    dia === "sex"
      ? alternarValorDia(escala.dias.sex)
      : escala.dias.sex;

  const sab =
    dia === "sab"
      ? alternarValorDia(escala.dias.sab)
      : escala.dias.sab;

  const dom =
    dia === "dom"
      ? alternarValorDia(escala.dias.dom)
      : escala.dias.dom;

  return {
    seg,
    ter,
    qua,
    qui,
    sex,
    sab,
    dom,
  };
}

export default function Escala() {
  const [
    funcionarios,
    setFuncionarios,
  ] = useState<Funcionario[]>([]);

  const [escalas, setEscalas] =
    useState<EscalaSemanal[]>([]);

  const [semana, setSemana] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const [turno, setTurno] =
    useState<FiltroTurno>("TODOS");

  const [modal, setModal] =
    useState<
      Funcionario | null | undefined
    >(undefined);

  const [erro, setErro] =
    useState("");

  const [toast, setToast] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const respostas =
        await Promise.all([
          api.funcionarios(),
          api.escalas(semana),
        ]);

      const funcionariosResponse =
        respostas[0];

      const escalasResponse =
        respostas[1];

      setFuncionarios(
        funcionariosResponse
      );

      const escalasDaSemana =
        funcionariosResponse.map(
          (funcionario) => {
            const escalaExistente =
              escalasResponse.find(
                (escala) =>
                  escala.funcionario_id ===
                  funcionario.id
              );

            if (escalaExistente) {
              return escalaExistente;
            }

            const novaEscala: EscalaSemanal = {
              funcionario_id:
                funcionario.id,
              semana_referencia:
                semana,
              dias: criarDiasPadrao(),
            };

            return novaEscala;
          }
        );

      setEscalas(
        escalasDaSemana
      );
    } catch (error: unknown) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar os funcionários e a escala."
        )
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [semana]);

  const funcionariosFiltrados =
    useMemo(() => {
      if (turno === "TODOS") {
        return funcionarios;
      }

      return funcionarios.filter(
        (funcionario) =>
          funcionario.turno ===
          turno
      );
    }, [funcionarios, turno]);

  const coberturaDiaria =
    useMemo(() => {
      return dias.map((dia) => {
        return escalas.filter(
          (escala) => {
            const funcionario =
              funcionarios.find(
                (item) =>
                  item.id ===
                  escala.funcionario_id
              );

            if (!funcionario) {
              return false;
            }

            if (!funcionario.ativo) {
              return false;
            }

            return (
              escala.dias[dia] ===
              "TRABALHO"
            );
          }
        ).length;
      });
    }, [escalas, funcionarios]);

  function alterarDia(
    funcionarioId: string,
    dia: DiaSemana
  ) {
    setEscalas(
      (escalasAtuais) => {
        return escalasAtuais.map(
          (escala) => {
            if (
              escala.funcionario_id !==
              funcionarioId
            ) {
              return escala;
            }

            const escalaAtualizada: EscalaSemanal =
              {
                funcionario_id:
                  escala.funcionario_id,
                semana_referencia:
                  escala.semana_referencia,
                dias: criarDiasAlterados(
                  escala,
                  dia
                ),
              };

            return escalaAtualizada;
          }
        );
      }
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

  async function salvarEscala() {
    try {
      setSalvando(true);
      setErro("");

      await api.saveEscalas(
        escalas
      );

      mostrarToast(
        "Escala salva com sucesso."
      );
    } catch (error: unknown) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível salvar a escala."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirFuncionario(
    funcionario: Funcionario
  ) {
    const confirmou =
      window.confirm(
        `Deseja excluir ${funcionario.nome}?`
      );

    if (!confirmou) {
      return;
    }

    try {
      setErro("");

      await api.excluirFuncionario(
        funcionario.id
      );

      mostrarToast(
        "Funcionário excluído com sucesso."
      );

      await carregarDados();
    } catch (error: unknown) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível excluir o funcionário."
        )
      );
    }
  }

  return (
    <main className="p-5 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-bold text-brand">
            EQUIPE
          </p>

          <h1 className="text-3xl font-black text-slate-900">
            Funcionários e Escala 5x2
          </h1>

          <p className="mt-1 text-slate-500">
            Gerencie funcionários e monte
            a escala semanal.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModal(null)}
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-3 font-bold text-white"
          >
            <Plus size={20} />

            Novo Funcionário
          </button>

          <button
            type="button"
            onClick={() =>
              window.print()
            }
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold"
          >
            <Printer size={20} />

            Imprimir
          </button>
        </div>
      </div>

      {erro && (
        <div className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <span>{erro}</span>

          <button
            type="button"
            onClick={() =>
              setErro("")
            }
            aria-label="Fechar mensagem"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-4">
        <label className="text-sm font-bold">
          Semana de referência

          <input
            type="date"
            value={semana}
            onChange={(event) =>
              setSemana(
                event.target.value
              )
            }
            className="mt-1 block rounded-xl border border-slate-200 bg-white p-3 font-normal"
          />
        </label>

        <label className="text-sm font-bold">
          Turno

          <select
            value={turno}
            onChange={(event) =>
              setTurno(
                event.target
                  .value as FiltroTurno
              )
            }
            className="mt-1 block rounded-xl border border-slate-200 bg-white p-3 font-normal"
          >
            <option value="TODOS">
              Todos
            </option>

            <option value="DIURNO">
              Diurno (Almoço)
            </option>

            <option value="NOTURNO">
              Noturno (Jantar)
            </option>

            <option value="INTEGRAL">
              Integral
            </option>
          </select>
        </label>
      </div>

      {carregando ? (
        <div className="mt-5 rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />

          <p className="mt-4 text-slate-500">
            Carregando funcionários e
            escalas...
          </p>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-3xl bg-white p-4 shadow-sm">
          <table className="w-full min-w-[1150px] text-center">
            <thead>
              <tr className="text-xs uppercase text-slate-400">
                <th className="pb-4 text-left">
                  Funcionário
                </th>

                {dias.map((dia) => (
                  <th
                    key={dia}
                    className="pb-4"
                  >
                    {labelsDias[dia]}
                  </th>
                ))}

                <th className="pb-4">
                  Status 5x2
                </th>

                <th className="pb-4">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {funcionariosFiltrados.map(
                (funcionario) => {
                  const escala =
                    escalas.find(
                      (item) =>
                        item.funcionario_id ===
                        funcionario.id
                    );

                  if (!escala) {
                    return null;
                  }

                  const diasTrabalhados =
                    dias.filter(
                      (dia) =>
                        escala.dias[
                          dia
                        ] ===
                        "TRABALHO"
                    ).length;

                  const diasDeFolga =
                    7 -
                    diasTrabalhados;

                  const escalaCorreta =
                    diasTrabalhados ===
                      5 &&
                    diasDeFolga === 2;

                  return (
                    <tr
                      key={
                        funcionario.id
                      }
                      className={
                        funcionario.ativo
                          ? "border-t border-slate-100"
                          : "border-t border-slate-100 opacity-50"
                      }
                    >
                      <td className="py-5 text-left">
                        <div className="font-black text-slate-900">
                          {
                            funcionario.nome
                          }
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {
                            labelsCargo[
                              funcionario
                                .cargo
                            ]
                          }
                        </div>

                        <div className="text-xs text-slate-400">
                          {
                            labelsTurno[
                              funcionario
                                .turno
                            ]
                          }
                        </div>

                        <span
                          className={
                            funcionario.ativo
                              ? "mt-2 inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700"
                              : "mt-2 inline-block rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600"
                          }
                        >
                          {funcionario.ativo
                            ? "Ativo"
                            : "Inativo"}
                        </span>
                      </td>

                      {dias.map((dia) => {
                        const trabalhando =
                          escala.dias[
                            dia
                          ] ===
                          "TRABALHO";

                        return (
                          <td key={dia}>
                            <button
                              type="button"
                              disabled={
                                !funcionario.ativo
                              }
                              onClick={() =>
                                alterarDia(
                                  funcionario.id,
                                  dia
                                )
                              }
                              className={
                                trabalhando
                                  ? "w-24 rounded-xl bg-emerald-100 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-200 disabled:cursor-not-allowed"
                                  : "w-24 rounded-xl bg-amber-100 py-2 text-xs font-bold text-amber-800 hover:bg-amber-200 disabled:cursor-not-allowed"
                              }
                            >
                              {trabalhando
                                ? "Trabalho"
                                : "Folga"}
                            </button>
                          </td>
                        );
                      })}

                      <td>
                        <span
                          className={
                            escalaCorreta
                              ? "inline-block rounded-full bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-700"
                              : "inline-block rounded-full bg-red-100 px-3 py-2 text-xs font-black text-red-700"
                          }
                        >
                          {diasTrabalhados}T /{" "}
                          {diasDeFolga}F
                        </span>

                        <div
                          className={
                            escalaCorreta
                              ? "mt-2 text-xs font-bold text-emerald-600"
                              : "mt-2 text-xs font-bold text-red-600"
                          }
                        >
                          {escalaCorreta
                            ? "OK"
                            : "Fora do padrão 5x2"}
                        </div>
                      </td>

                      <td>
                        <div className="flex justify-center gap-1">
                          <button
                            type="button"
                            title="Editar funcionário"
                            onClick={() =>
                              setModal(
                                funcionario
                              )
                            }
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          >
                            <Edit3
                              size={19}
                            />
                          </button>

                          <button
                            type="button"
                            title="Excluir funcionário"
                            onClick={() =>
                              excluirFuncionario(
                                funcionario
                              )
                            }
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                          >
                            <Trash2
                              size={19}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}

              {funcionariosFiltrados.length ===
                0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="p-10 text-center text-slate-500"
                  >
                    Nenhum funcionário
                    encontrado.
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot>
              <tr className="border-t bg-slate-50 font-bold">
                <td className="py-4 text-left">
                  Cobertura diária
                </td>

                {coberturaDiaria.map(
                  (
                    quantidade,
                    index
                  ) => (
                    <td
                      key={index}
                      className={
                        quantidade < 2
                          ? "text-red-600"
                          : "text-emerald-700"
                      }
                    >
                      {quantidade}
                    </td>
                  )
                )}

                <td></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <button
        type="button"
        disabled={
          carregando ||
          salvando
        }
        onClick={salvarEscala}
        className="mt-5 flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold text-white disabled:opacity-50"
      >
        <Save size={20} />

        {salvando
          ? "Salvando..."
          : "Salvar Escala"}
      </button>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white shadow-xl">
          {toast}
        </div>
      )}

      {modal !== undefined && (
        <FuncionarioModal
          initial={modal}
          close={() =>
            setModal(undefined)
          }
          saved={async () => {
            const mensagem =
              modal === null
                ? "Funcionário criado com sucesso."
                : "Funcionário atualizado com sucesso.";

            setModal(undefined);

            await carregarDados();

            mostrarToast(mensagem);
          }}
        />
      )}
    </main>
  );
}

interface FuncionarioModalProps {
  initial:
    | Funcionario
    | null;

  close: () => void;

  saved: () => Promise<void>;
}

function FuncionarioModal({
  initial,
  close,
  saved,
}: FuncionarioModalProps) {
  const [
    formulario,
    setFormulario,
  ] = useState<FormularioFuncionario>({
    nome:
      initial?.nome ?? "",
    cargo:
      initial?.cargo ??
      "COZINHEIRO",
    turno:
      initial?.turno ??
      "DIURNO",
    ativo:
      initial?.ativo ?? true,
  });

  const [loading, setLoading] =
    useState(false);

  const [erro, setErro] =
    useState("");

  function alterarNome(
    nome: string
  ) {
    setFormulario(
      (estadoAtual) => {
        return {
          nome,
          cargo:
            estadoAtual.cargo,
          turno:
            estadoAtual.turno,
          ativo:
            estadoAtual.ativo,
        };
      }
    );
  }

  function alterarCargo(
    cargo: Funcionario["cargo"]
  ) {
    setFormulario(
      (estadoAtual) => {
        return {
          nome:
            estadoAtual.nome,
          cargo,
          turno:
            estadoAtual.turno,
          ativo:
            estadoAtual.ativo,
        };
      }
    );
  }

  function alterarTurno(
    turno: Funcionario["turno"]
  ) {
    setFormulario(
      (estadoAtual) => {
        return {
          nome:
            estadoAtual.nome,
          cargo:
            estadoAtual.cargo,
          turno,
          ativo:
            estadoAtual.ativo,
        };
      }
    );
  }

  function alterarAtivo(
    ativo: boolean
  ) {
    setFormulario(
      (estadoAtual) => {
        return {
          nome:
            estadoAtual.nome,
          cargo:
            estadoAtual.cargo,
          turno:
            estadoAtual.turno,
          ativo,
        };
      }
    );
  }

  async function salvar() {
    const nome =
      formulario.nome.trim();

    if (!nome) {
      setErro(
        "Informe o nome do funcionário."
      );

      return;
    }

    try {
      setLoading(true);
      setErro("");

      if (initial) {
        const funcionarioAtualizado: Funcionario =
          {
            id: initial.id,
            nome,
            cargo:
              formulario.cargo,
            turno:
              formulario.turno,
            ativo:
              formulario.ativo,
          };

        await api.atualizarFuncionario(
          funcionarioAtualizado
        );
      } else {
        const novoFuncionario: Omit<
          Funcionario,
          "id"
        > = {
          nome,
          cargo:
            formulario.cargo,
          turno:
            formulario.turno,
          ativo:
            formulario.ativo,
        };

        await api.criarFuncionario(
          novoFuncionario
        );
      }

      await saved();
    } catch (error: unknown) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível salvar o funcionário."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
      onMouseDown={close}
    >
      <section
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-brand">
              EQUIPE
            </p>

            <h2 className="text-2xl font-black text-slate-900">
              {initial
                ? "Editar funcionário"
                : "Novo funcionário"}
            </h2>
          </div>

          <button
            type="button"
            onClick={close}
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-bold">
            Nome

            <input
              value={
                formulario.nome
              }
              onChange={(event) =>
                alterarNome(
                  event.target.value
                )
              }
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 font-normal"
              placeholder="Nome completo"
            />
          </label>

          <label className="block text-sm font-bold">
            Cargo

            <select
              value={
                formulario.cargo
              }
              onChange={(event) =>
                alterarCargo(
                  event.target
                    .value as Funcionario["cargo"]
                )
              }
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 font-normal"
            >
              <option value="COZINHEIRO">
                Cozinheiro(a)
              </option>

              <option value="AUXILIAR_COZINHA">
                Auxiliar de Cozinha
              </option>

              <option value="GARCOM_ATENDENTE">
                Garçom/Atendente
              </option>

              <option value="CAIXA">
                Caixa
              </option>

              <option value="GERENTE">
                Gerente
              </option>
            </select>
          </label>

          <label className="block text-sm font-bold">
            Turno

            <select
              value={
                formulario.turno
              }
              onChange={(event) =>
                alterarTurno(
                  event.target
                    .value as Funcionario["turno"]
                )
              }
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 font-normal"
            >
              <option value="DIURNO">
                Diurno (Almoço)
              </option>

              <option value="NOTURNO">
                Noturno (Jantar)
              </option>

              <option value="INTEGRAL">
                Integral
              </option>
            </select>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-4 font-bold">
            <input
              type="checkbox"
              checked={
                formulario.ativo
              }
              onChange={(event) =>
                alterarAtivo(
                  event.target.checked
                )
              }
              className="h-5 w-5"
            />

            Funcionário ativo
          </label>

          {erro && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {erro}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="rounded-xl border border-slate-200 px-4 py-3 font-bold"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={salvar}
            className="rounded-xl bg-brand px-5 py-3 font-bold text-white disabled:opacity-50"
          >
            {loading
              ? "Salvando..."
              : "Salvar funcionário"}
          </button>
        </div>
      </section>
    </div>
  );
}