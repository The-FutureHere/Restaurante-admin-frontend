import { Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useId, useState } from "react";

type CampoFormularioProps = {
  rotulo: string;
  Icone: LucideIcon;
  valor: string;
  aoAlterar: (valor: string) => void;
  tipo?: "text" | "email";
  placeholder?: string;
  autoComplete?: string;
  ehSenha?: boolean;
  ajuda?: string;
};

export default function CampoFormulario({
  rotulo,
  Icone,
  valor,
  aoAlterar,
  tipo = "text",
  placeholder,
  autoComplete,
  ehSenha = false,
  ajuda,
}: CampoFormularioProps) {
  const id = useId();
  const [visivel, setVisivel] = useState(false);

  let tipoFinal: string = tipo;

  if (ehSenha) {
    tipoFinal = visivel ? "text" : "password";
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-bold text-slate-700"
      >
        {rotulo}
      </label>

      <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        <Icone size={18} className="shrink-0 text-slate-400" />

        <input
          id={id}
          type={tipoFinal}
          value={valor}
          onChange={(evento) => aoAlterar(evento.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent py-3 text-base outline-none placeholder:text-slate-400"
        />

        {ehSenha && (
          <button
            type="button"
            onClick={() => setVisivel(!visivel)}
            aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
            className="shrink-0 text-slate-400 hover:text-slate-600"
          >
            {visivel ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {ajuda && <p className="mt-1.5 text-xs text-slate-500">{ajuda}</p>}
    </div>
  );
}