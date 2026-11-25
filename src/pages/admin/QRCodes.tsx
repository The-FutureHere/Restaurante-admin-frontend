import { Loader2, Lock, Printer, Store } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRestaurante } from "../../context/RestauranteContext";
import { api } from "../../services/api";

const URL_PADRAO_MOBILE = "https://restaurante-mobile-frontend.vercel.app";

const URL_MOBILE: string = String(
  import.meta.env.VITE_MOBILE_URL || URL_PADRAO_MOBILE
).replace(/\/+$/, "");

const MAX_MESAS = 200;

function obterMensagemErro(error: unknown, mensagemPadrao: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return mensagemPadrao;
}

export default function QRCodes() {
  const restaurante = useRestaurante();

  const [quantidade, setQuantidade] = useState(0);
  const [digitado, setDigitado] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await api.quantidadeMesas();

        if (!cancelado) {
          setQuantidade(resposta.quantidade);
          setDigitado(String(resposta.quantidade));
        }
      } catch (error) {
        if (!cancelado) {
          setErro(
            obterMensagemErro(error, "Não foi possível carregar as mesas.")
          );
        }
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    }

    carregar();

    return () => {
      cancelado = true;
    };
  }, []);

  async function gerar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const valor = Number(digitado);

    if (!Number.isInteger(valor) || valor < 1 || valor > MAX_MESAS) {
      setAviso("");
      setErro(`Informe um número inteiro de 1 a ${MAX_MESAS}.`);
      return;
    }

    try {
      setSalvando(true);
      setErro("");
      setAviso("");

      await api.definirQuantidadeMesas(valor);

      setQuantidade(valor);
      setDigitado(String(valor));
      setAviso(`${valor} QR Codes gerados. Pode imprimir as placas.`);
    } catch (error) {
      setErro(
        obterMensagemErro(error, "Não foi possível gerar os QR Codes.")
      );
    } finally {
      setSalvando(false);
    }
  }

  const mesas = Array.from({ length: quantidade }, (_, indice) => indice + 1);

  return (
    <main className="p-5 lg:p-8">
      <div className="no-print flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-bold text-brand">MESAS</p>

          <h1 className="text-3xl font-black text-slate-900">QR Codes</h1>

          <p className="mt-1 text-slate-500">
            Gere e imprima as placas do cardápio digital de cada mesa.
          </p>
        </div>

        <button
          type="button"
          disabled={carregando || quantidade === 0}
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-brand px-4 py-3 font-bold text-white disabled:opacity-50"
        >
          <Printer size={20} />

          Imprimir placas
        </button>
      </div>

      <section className="no-print mt-6 grid gap-4 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
            <Store size={15} />

            Restaurante

            <Lock size={13} className="text-slate-400" />
          </p>

          <p className="mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700">
            {restaurante.nome}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
            Endereço do cardápio

            <Lock size={13} className="text-slate-400" />
          </p>

          <p className="mt-1.5 break-all rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            {URL_MOBILE}
          </p>
        </div>

        <form onSubmit={gerar}>
          <label
            htmlFor="quantidade-mesas"
            className="block text-sm font-bold text-slate-700"
          >
            Quantidade de mesas
          </label>

          <div className="mt-1.5 flex gap-2">
            <input
              id="quantidade-mesas"
              type="number"
              min={1}
              max={MAX_MESAS}
              step={1}
              value={digitado}
              onChange={(evento) => setDigitado(evento.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />

            <button
              type="submit"
              disabled={salvando || carregando}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-bold text-white disabled:opacity-50"
            >
              {salvando && <Loader2 size={16} className="animate-spin" />}

              Gerar
            </button>
          </div>
        </form>
      </section>

      <p className="no-print mt-3 text-xs text-slate-500">
        Se você aumentar a quantidade, as novas mesas são criadas
        automaticamente. Diminuir só muda quantas placas são geradas: as mesas
        já cadastradas não são apagadas.
      </p>

      {erro !== "" && (
        <p
          role="alert"
          className="no-print mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
        >
          {erro}
        </p>
      )}

      {aviso !== "" && (
        <p
          role="status"
          className="no-print mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800"
        >
          {aviso}
        </p>
      )}

      {carregando ? (
        <div className="no-print mt-6 rounded-3xl bg-white p-12 text-center">
          <Loader2 size={36} className="mx-auto animate-spin text-brand" />
        </div>
      ) : (
        <section className="qr-grid mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {mesas.map((numero) => {
            const url =
              URL_MOBILE +
              "/?restaurante=" +
              encodeURIComponent(restaurante.slug) +
              "&mesa=" +
              numero;

            return (
              <article
                key={numero}
                className="break-inside-avoid rounded-3xl bg-white p-6 text-center shadow-sm"
              >
                <p className="text-sm font-bold text-brand">
                  {restaurante.nome}
                </p>

                <h2 className="mt-1 text-3xl font-black">MESA {numero}</h2>

                <p className="mb-4 text-sm text-slate-500">
                  Aponte a câmera e faça seu pedido
                </p>

                <div className="flex justify-center">
                  <QRCodeSVG
                    value={url}
                    size={190}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}