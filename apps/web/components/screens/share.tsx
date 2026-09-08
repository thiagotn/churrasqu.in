'use client';

import { useState } from 'react';
import { CalculationResult } from '@churrasquin/calculator';
import { API_BASE } from '../../lib/api';
import { money } from '../../lib/format';
import { PIX_PLACEHOLDER } from '../../lib/labels';
import { Action, ChurrasState } from '../../lib/state';
import { FieldLabel, inputCls, press } from '../ui';

const PIX_TYPES = ['Celular', 'CPF', 'E-mail', 'Aleatória'] as const;

export function ShareScreen({
  state,
  result,
  dispatch,
  onUpdate,
  saving,
}: {
  state: ChurrasState;
  result: CalculationResult;
  dispatch: React.Dispatch<Action>;
  onUpdate: () => void;
  saving: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [qrVersion, setQrVersion] = useState(0);
  const patch = (p: Partial<ChurrasState>) => dispatch({ type: 'patch', patch: p });

  const publicUrl = `churrasqu.in/ho/${state.savedSlug}`;
  const qrSrc = `${API_BASE}/public/${state.savedSlug}/qrcode?v=${qrVersion}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${publicUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard bloqueado */
    }
  };

  const downloadQr = async () => {
    try {
      const blob = await (await fetch(qrSrc)).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `churras-${state.savedSlug}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(qrSrc, '_blank');
    }
  };

  const save = () => {
    onUpdate();
    // recarrega o QR depois do PATCH (o payload Pix pode ter mudado)
    setTimeout(() => setQrVersion((v) => v + 1), 800);
  };

  return (
    <div className="flex flex-col gap-[clamp(16px,2.4vw,28px)]">
      <section className="flex flex-wrap items-center justify-between gap-4 border-4 border-ink bg-mustard p-[clamp(18px,2.5vw,30px)] shadow-comic-10">
        <div>
          <h1 className="font-display text-[clamp(30px,5vw,44px)] tracking-wide text-ink">
            Churras salvo! Agora é só espalhar.
          </h1>
          <p className="text-[15px] font-extrabold text-ink">
            Total {money(result.total)} · {money(result.perAdult)} por adulto · {result.guests} convidados
          </p>
        </div>
        <a
          href={`/ho/${state.savedSlug}`}
          target="_blank"
          rel="noreferrer"
          className={`border-[3px] border-ink bg-ink px-5 py-3 text-[15px] font-black text-paper shadow-[6px_6px_0_#C2341F] ${press}`}
        >
          Ver página pública
        </a>
      </section>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,290px),1fr))] items-start gap-[clamp(16px,2.4vw,28px)]">
        {/* Dados do evento */}
        <section className="flex flex-col gap-3 border-4 border-ink bg-paper p-[clamp(18px,2.5vw,30px)] shadow-comic-10">
          <h2 className="font-display text-[24px] tracking-wide text-ink">Dados do evento</h2>
          <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
            <FieldLabel>Nome do churras</FieldLabel>
            <input className={inputCls} value={state.eventName} onChange={(e) => patch({ eventName: e.target.value })} />
          </label>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,90px),1fr))] gap-2">
            <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
              <FieldLabel>Data</FieldLabel>
              <input type="date" className={inputCls} value={state.eventDay} onChange={(e) => patch({ eventDay: e.target.value })} />
            </label>
            <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
              <FieldLabel>Começa</FieldLabel>
              <input type="time" className={inputCls} value={state.startTime} onChange={(e) => patch({ startTime: e.target.value })} />
            </label>
            <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
              <FieldLabel>Termina</FieldLabel>
              <input type="time" className={inputCls} value={state.endTime} onChange={(e) => patch({ endTime: e.target.value })} />
            </label>
          </div>
          <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
            <FieldLabel>Endereço</FieldLabel>
            <input className={inputCls} value={state.eventAddress} onChange={(e) => patch({ eventAddress: e.target.value })} />
          </label>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,120px),1fr))] gap-2">
            <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
              <FieldLabel>Bairro</FieldLabel>
              <input className={inputCls} value={state.eventCity} onChange={(e) => patch({ eventCity: e.target.value })} />
            </label>
            <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
              <FieldLabel>Referência</FieldLabel>
              <input className={inputCls} value={state.eventHint} onChange={(e) => patch({ eventHint: e.target.value })} />
            </label>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className={`border-[3px] border-ink bg-mustard px-4 py-3 text-[15px] font-black text-ink shadow-comic-4 disabled:opacity-60 ${press}`}
          >
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </section>

        {/* Link + Pix */}
        <section className="flex flex-col gap-3 border-4 border-ink bg-paper p-[clamp(18px,2.5vw,30px)] shadow-comic-10">
          <h2 className="font-display text-[24px] tracking-wide text-ink">Link público</h2>
          <div className="overflow-hidden text-ellipsis whitespace-nowrap border-[3px] border-ink bg-cream p-3 font-mono text-[13px] font-bold text-ink">
            {publicUrl}
          </div>
          <button
            onClick={copyLink}
            className={`border-[3px] border-ink bg-ember px-4 py-3 text-[15px] font-black text-paper shadow-comic-4 hover:bg-ember-hover ${press}`}
          >
            {copied ? 'Copiado!' : 'Copiar link'}
          </button>

          <div className="h-[3px] bg-[#17130F1A]" />

          <h3 className="font-display text-[20px] tracking-wide text-ink">Chave Pix</h3>
          <div className="flex flex-wrap gap-2">
            {PIX_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => patch({ pixType: type, pixKey: '' })}
                className={`rounded-full border-[3px] border-ink px-3 py-1 text-[13px] font-extrabold shadow-comic-3 ${press} ${
                  state.pixType === type ? 'bg-brand-sky text-paper' : 'bg-paper text-ink hover:bg-mustard'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <input
            className={inputCls}
            placeholder={PIX_PLACEHOLDER[state.pixType]}
            value={state.pixKey}
            onChange={(e) => patch({ pixKey: e.target.value })}
          />
          <div className="border-[3px] border-dashed border-[#17130F66] bg-cream p-3">
            <div className="text-[12px] font-black uppercase tracking-[1.5px] text-muted">Cobrar por adulto</div>
            <div className="font-display text-[30px] text-ink">{money(result.perAdult)}</div>
          </div>
          <p className="text-[13px] font-bold text-muted">
            A chave entra no QR e na página pública depois de "Salvar alterações".
          </p>
        </section>

        {/* QR */}
        <section className="flex flex-col items-center gap-3 border-4 border-ink bg-ink p-[clamp(18px,2.5vw,30px)] text-paper shadow-[8px_8px_0_#C2341F]">
          <h2 className="font-display text-[24px] tracking-wide">QR do churras</h2>
          <div className="w-full max-w-[240px] border-[10px] border-paper bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt={`QR Code do churras ${state.eventName}`} className="aspect-square w-full" />
          </div>
          <p className="text-center text-[13px] font-bold opacity-85">
            Com Pix salvo, o QR já abre a cobrança de {money(result.perAdult)}; sem Pix, abre o convite.
          </p>
          <button
            onClick={downloadQr}
            className={`w-full border-[3px] border-ink bg-mustard px-4 py-3 text-[15px] font-black text-ink shadow-comic-4 ${press}`}
          >
            Baixar QR em PNG
          </button>
        </section>
      </div>

      <button
        onClick={() => dispatch({ type: 'go', screen: 'edit' })}
        className={`self-start rounded-full border-[3px] border-ink bg-paper px-4 py-2 text-[14px] font-extrabold text-ink shadow-comic-3 hover:bg-mustard ${press}`}
      >
        ← Voltar para a lista
      </button>
    </div>
  );
}
