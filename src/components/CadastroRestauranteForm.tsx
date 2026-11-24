import {
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../services/api";
import CampoFormulario from "./CampoFormulario";

type CadastroRestauranteFormProps = {
  aoConcluir: (email: string, nomeRestaurante: string) => void;
};

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CadastroRestauranteForm({
  aoConcluir,
}: CadastroRestauranteFormProps) {
  const [nomeRestaurante, setNomeRestaurante] = useState("");
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [codigoMestre, setCodigoMestre] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function validar(): string {
    if (nomeRestaurante.trim().length < 2) {
      return "Informe o nome do restaurante.";
    }

    if (nomeResponsavel.trim().length < 2) {
      return "Informe o nome do responsável.";
    }

    if (!REGEX_EMAIL.test(email.trim())) {
      return "Informe um e-mail válido.";
    }

    if (senha.length < 8) {
      return "A senha deve ter pelo menos 8 caracteres.";
    }

    if (senha !== confirmarSenha) {
      return "As senhas não conferem.";
    }

    if (codigoMestre.trim() === "") {
      return "Informe o código de autorização.";
    }

    return "";
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const mensagem = validar();

    if (mensagem !== "") {
      setErro(mensagem);
      return;
    }

    try {
      setCarregando(true);
      setErro("");

      const resposta = await api.cadastrarRestaurante({
        nome_restaurante: nomeRestaurante.trim(),
        nome_responsavel: nomeResponsavel.trim(),
        email: email.trim(),
        senha: senha,
        codigo_mestre: codigoMestre.trim(),
      });

      aoConcluir(resposta.email, resposta.nome);
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Não foi possível concluir o cadastro.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <ShieldCheck size={20} className="mt-0.5 shrink-0" />

        <p>
          O cadastro só é concluído com o <b>código de autorização</b>{" "}
          fornecido pela equipe BrasaOS.
        </p>
      </div>

      <CampoFormulario
        rotulo="Nome do restaurante"
        Icone={Store}
        valor={nomeRestaurante}
        aoAlterar={setNomeRestaurante}
        placeholder="Ex: Brasa Burger"
      />

      <CampoFormulario
        rotulo="Nome do responsável"
        Icone={User}
        valor={nomeResponsavel}
        aoAlterar={setNomeResponsavel}
        placeholder="Seu nome completo"
        autoComplete="name"
      />

      <CampoFormulario
        rotulo="E-mail de acesso"
        Icone={Mail}
        tipo="email"
        valor={email}
        aoAlterar={setEmail}
        placeholder="voce@restaurante.com"
        autoComplete="email"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoFormulario
          rotulo="Senha"
          Icone={Lock}
          ehSenha={true}
          valor={senha}
          aoAlterar={setSenha}
          placeholder="Mínimo de 8 caracteres"
          autoComplete="new-password"
        />

        <CampoFormulario
          rotulo="Confirmar senha"
          Icone={Lock}
          ehSenha={true}
          valor={confirmarSenha}
          aoAlterar={setConfirmarSenha}
          placeholder="Repita a senha"
          autoComplete="new-password"
        />
      </div>

      <CampoFormulario
        rotulo="Código de autorização"
        Icone={KeyRound}
        ehSenha={true}
        valor={codigoMestre}
        aoAlterar={setCodigoMestre}
        placeholder="Código fornecido pela equipe"
        autoComplete="off"
      />

      {erro !== "" && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
        >
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-black text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
      >
        {carregando && <Loader2 size={18} className="animate-spin" />}

        {carregando ? "Cadastrando..." : "Cadastrar restaurante"}
      </button>
    </form>
  );
}