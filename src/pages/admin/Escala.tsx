import { Edit3, Plus, Printer, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import type { EscalaSemanal, Funcionario } from "../../types";

const dias = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"] as const;

type DiaSemana = (typeof dias)[number];

const labels: Record<DiaSemana, string> = {
  seg: "Seg",
  ter: "Ter",
  qua: "Qua",
  qui: "Qui",
  sex: "Sex",
  sab: "Sáb",
  dom: "Dom",
};

const escalaPadrao: EscalaSemanal["dias"] = {
  seg: "TRABALHO",
  ter: "TRABALHO",
  qua: "TRABALHO",
  qui: "TRABALHO",
  sex: "TRABALHO",
  sab: "FOLGA",
  dom: "FOLGA",
};

export default function Escala() {
  const [escalas, setEscalas] = useState<EscalaSemanal[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [semana, setSemana] = useState(new Date().toISOString().slice(0, 10));
  const [turno, setTurno] = useState("Todos");
  const [toast, setToast] = useState("");
  const [erro, setErro] = useState("");
  const [modal, setModal] = useState<Funcionario | null | undefined>(undefined);

  async function carregarDados() {
    try {
      setErro("");

      const [funcionariosResponse, escalasResponse] = await Promise.all([
        api.funcionarios(),
        api.escalas(semana),
      ]);

      setFuncionarios(funcionariosResponse);

      /*
       * Se um funcionário ainda não tiver escala cadastrada
       * para a semana selecionada, criamos uma escala 5x2
       * temporária no frontend.
       */
      const escalasCompletas = funcionariosResponse.map((funcionario) => {
        const escalaExistente = escalasResponse.find(
          (escala) => escala.funcionario_id === funcionario.id
        );

        if (escalaExistente) {
          return escalaExistente;
        }

        return {
          funcionario_id: funcionario.id,
          semana_referencia: semana,
          dias: { ...escalaPadrao },
        };
      });

      setEscalas(escalasCompletas);
    } catch (error: any) {
      setErro(
        error.message || "Não foi possível carregar funcionários e escala."
      );
    }
  }

  useEffect(() => {
    carregarDados();
  }, [semana]);

  const funcionariosVisiveis = funcionarios.filter((funcionario) => {
    if (turno === "Todos") {
      return true;
    }

    return funcionario.turno.startsWith(turno);
  });

  const coberturaDiaria = useMemo(() => {
    return dias.map((dia) => {
      return escalas.filter((escala) => {
        const funcionario = funcionarios.find(
          (f) => f.id === escala.funcionario_id
        );

        return funcionario?.ativo && escala.dias[dia] === "TRABALHO";
      }).length;
    });
  }, [escalas, funcionarios]);

  function alterarDia(funcionarioId: string, dia: DiaSemana) {
    setEscalas((escalasAtuais) =>
      escalasAtuais.map((escala) => {
        if (escala.funcionario_id !== funcionarioId) {
          return escala;
        }

        return {
          ...escala,
          dias: {
            ...escala.dias,
            [dia]: escala.dias[dia] === "TRABALHO" ? "FOLGA" : "TRABALHO",
          },
        };
      })
    );
  }

  async function salvarEscala() {
    try {
      setErro("");

      await api.saveEscalas(escalas);

      setToast("Escala salva com sucesso!");

      setTimeout(() => {
        setToast("");
      }, 2000);
    } catch (error: any) {
      setErro(error.message || "Não foi possível salvar a escala.");
    }
  }

  async function excluirFuncionario(funcionario: Funcionario) {
    const confirmou = window.confirm(
      `Deseja realmente excluir ${funcionario.nome}?`
    );

    if (!confirmou) {
      return;
    }

    try {
      setErro("");

      await api.excluirFuncionario(funcionario.id);

      setToast("Funcionário excluído.");

      await carregarDados();

      setTimeout(() => {
        setToast("");
      }, 2000);
    } catch (error: any) {
      setErro(error.message || "Não foi possível excluir o funcionário.");
    }
  }

  return (
    <main className="p-5 lg:p-8">
      {/* CABEÇALHO */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-bold text-brand">EQUIPE</p>
          <h1 className="text-3xl font-black">Funcionários e Escala 5x2</h1>
          <p className="mt-1 text-slate-500">
            Cadastre sua equipe, altere os dados dos funcionários e organize a
            escala semanal.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setModal(null)}
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-3 font-bold text-white shadow-sm"
          >
            <Plus size={20} />
            Novo Funcionário
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 font-bold"
          >
            <Printer size={20} />
            Imprimir
          </button>
        </div>
      </div>

      {/* ERRO */}
      {erro && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {erro}
        </div>
      )}

      {/* FILTROS */}
      <div className="mt-6 flex flex-wrap gap-4">
        <label className="text-sm font-bold">
          Semana de referência
          <input
            type="date"
            value={semana}
            onChange={(event) => setSemana(event.target.value)}
            className="mt-1 block rounded-xl border bg-white p-3 font-normal"
          />
        </label>

        <label className="text-sm font-bold">
          Turno
          <select
            value={turno}
            onChange={(event) => setTurno(event.target.value)}
            className="mt-1 block rounded-xl border bg-white p-3 font-normal"
          >
            <option value="Todos">Todos</option>
            <option value="Diurno">Diurno</option>
            <option value="Noturno">Noturno</option>
            <option value="Integral">Integral</option>
          </select>
        </label>
      </div>

      {/* TABELA */}
      <div className="mt-5 overflow-x-auto rounded-3xl bg-white p-4 shadow-panel">
        <table className="w-full min-w-[1150px] text-center">
          <thead>
            <tr className="text-xs uppercase text-slate-400">
              <th className="pb-4 text-left">Funcionário</th>
              {dias.map((dia) => (
                <th key={dia} className="pb-4">
                  {labels[dia]}
                </th>
              ))}
              <th className="pb-4">Status 5x2</th>
              <th className="pb-4">Ações</th>
            </tr>
          </thead>

          <tbody>
            {funcionariosVisiveis.map((funcionario) => {
              const escala = escalas.find(
                (e) => e.funcionario_id === funcionario.id
              );

              if (!escala) {
                return null;
              }

              const diasTrabalhados = dias.filter(
                (dia) => escala.dias[dia] === "TRABALHO"
              ).length;

              const folgas = 7 - diasTrabalhados;
              const escalaCorreta = diasTrabalhados === 5 && folgas === 2;

              return (
                <tr
                  key={funcionario.id}
                  className={`border-t ${
                    !funcionario.ativo ? "opacity-50" : ""
                  }`}
                >
                  {/* FUNCIONÁRIO */}
                  <td className="py-5 text-left">
                    <div className="font-black text-slate-900">
                      {funcionario.nome}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {funcionario.cargo}
                    </div>
                    <div className="text-xs text-slate-400">
                      {funcionario.turno}
                    </div>
                    <span
                      className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        funcionario.ativo
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {funcionario.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>

                  {/* DIAS */}
                  {dias.map((dia) => {
                    const trabalhando = escala.dias[dia] === "TRABALHO";

                    return (
                      <td key={dia}>
                        <button
                          disabled={!funcionario.ativo}
                          onClick={() => alterarDia(funcionario.id, dia)}
                          className={`w-24 rounded-xl py-2 text-xs font-bold transition ${
                            trabalhando
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          } disabled:cursor-not-allowed`}
                        >
                          {trabalhando ? "Trabalho" : "Folga"}
                        </button>
                      </td>
                    );
                  })}

                  {/* STATUS */}
                  <td>
                    <span
                      className={`inline-block rounded-full px-3 py-2 text-xs font-black ${
                        escalaCorreta
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {diasTrabalhados}T / {folgas}F
                    </span>
                    <div
                      className={`mt-2 text-xs font-bold ${
                        escalaCorreta ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {escalaCorreta ? "OK" : "Fora do padrão 5x2"}
                    </div>
                  </td>

                  {/* AÇÕES */}
                  <td>
                    <div className="flex justify-center gap-1">
                      <button
                        title="Editar funcionário"
                        onClick={() => setModal(funcionario)}
                        className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                      >
                        <Edit3 size={19} />
                      </button>

                      <button
                        title="Excluir funcionário"
                        onClick={() => excluirFuncionario(funcionario)}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                      >
                        <Trash2 size={19} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {funcionariosVisiveis.length === 0 && (
              <tr>
                <td colSpan={10} className="p-10 text-center text-slate-500">
                  Nenhum funcionário cadastrado neste turno.
                </td>
              </tr>
            )}
          </tbody>

          {/* COBERTURA */}
          <tfoot>
            <tr className="border-t bg-slate-50 font-bold">
              <td className="py-4 text-left">Cobertura diária</td>
              {coberturaDiaria.map((quantidade, index) => (
                <td
                  key={index}
                  className={
                    quantidade < 2 ? "text-red-600" : "text-emerald-700"
                  }
                >
                  {quantidade}
                  <div className="text-[10px] font-normal">funcionários</div>
                </td>
              ))}
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* SALVAR */}
      <button
        onClick={salvarEscala}
        className="mt-5 flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold text-white shadow-sm"
      >
        <Save size={20} />
        Salvar Escala
      </button>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* MODAL */}
      {modal !== undefined && (
        <FuncionarioModal
          initial={modal}
          close={() => setModal(undefined)}
          saved={async () => {
            setModal(undefined);

            setToast(
              modal
                ? "Funcionário atualizado com sucesso!"
                : "Funcionário criado com sucesso!"
            );

            await carregarDados();

            setTimeout(() => {
              setToast("");
            }, 2000);
          }}
        />
      )}
    </main>
  );
}

interface FuncionarioModalProps {
  initial: Funcionario | null;
  close: () => void;
  saved: () => void;
}

function FuncionarioModal({ initial, close, saved }: FuncionarioModalProps) {
  const [funcionario, setFuncionario] = useState<
    Omit<Funcionario, "id"> | Funcionario
  >(
    initial || {
      nome: "",
      cargo: "Cozinheiro(a)",
      turno: "Diurno (Almoço)",
      ativo: true,
    }
  );
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar() {
    if (!funcionario.nome.trim()) {
      setErro("Informe o nome do funcionário.");
      return;
    }

    setErro("");
    setLoading(true);

    try {
      if (initial) {
        await api.atualizarFuncionario(funcionario as Funcionario);
      } else {
        await api.criarFuncionario(funcionario as Omit<Funcionario, "id">);
      }

      saved();
    } catch (error: any) {
      setErro(error.message || "Não foi possível salvar o funcionário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4">
      <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-brand">EQUIPE</p>
            <h2 className="text-2xl font-black">
              {initial ? "Editar funcionário" : "Novo funcionário"}
            </h2>
          </div>

          <button
            onClick={close}
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-bold">
            Nome
            <input
              value={funcionario.nome}
              onChange={(event) =>
                setFuncionario({
                  ...funcionario,
                  nome: event.target.value,
                })
              }
              className="mt-1 w-full rounded-xl border p-3 font-normal outline-none focus:ring-2 focus:ring-brand/30"
              placeholder="Nome completo"
            />
          </label>

          <label className="block text-sm font-bold">
            Cargo
            <select
              value={funcionario.cargo}
              onChange={(event) =>
                setFuncionario({
                  ...funcionario,
                  cargo: event.target.value as Funcionario["cargo"],
                })
              }
              className="mt-1 w-full rounded-xl border p-3 font-normal"
            >
              <option>Cozinheiro(a)</option>
              <option>Auxiliar de Cozinha</option>
              <option>Garçom/Atendente</option>
              <option>Caixa</option>
              <option>Gerente</option>
            </select>
          </label>

          <label className="block text-sm font-bold">
            Turno
            <select
              value={funcionario.turno}
              onChange={(event) =>
                setFuncionario({
                  ...funcionario,
                  turno: event.target.value as Funcionario["turno"],
                })
              }
              className="mt-1 w-full rounded-xl border p-3 font-normal"
            >
              <option>Diurno (Almoço)</option>
              <option>Noturno (Jantar)</option>
              <option>Integral</option>
            </select>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-4 font-bold">
            <input
              type="checkbox"
              checked={funcionario.ativo}
              onChange={(event) =>
                setFuncionario({
                  ...funcionario,
                  ativo: event.target.checked,
                })
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

        {/* ACTIONS */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={close}
            className="rounded-xl border px-4 py-3 font-bold"
          >
            Cancelar
          </button>

          <button
            disabled={loading}
            onClick={salvar}
            className="rounded-xl bg-brand px-5 py-3 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar funcionário"}
          </button>
        </div>
      </section>
    </div>
  );
}