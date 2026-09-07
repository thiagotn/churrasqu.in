'use client';

import { use, useEffect, useState } from 'react';
import { AlcoholMode } from '@churrasquin/calculator';
import { API_BASE, ApiError, api } from '../../../lib/api';
import { money } from '../../../lib/format';
import { ALCOHOL_NOTE, dayLabel } from '../../../lib/labels';
import { press } from '../../../components/ui';

interface Invite {
  slug: string;
  eventName: string;
  eventDay: string;
  startTime: string;
  endTime: string;
  eventAddress: string;
  eventCity: string;
  eventHint: string;
  alcoholMode: AlcoholMode;
  adults: number;
  guests: number;
  total: number;
  perAdult: number;
  organizer: string;
  categories: { category: string; items: string[] }[];
  pix: { type: string; key: string; payload: string } | null;
}

function Skeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="h-[260px] border-4 border-ink bg-paper shadow-comic-10" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,290px),1fr))] gap-6">
        <div className="h-[300px] border-4 border-ink bg-paper shadow-comic-10" />
        <div className="h-[300px] border-4 border-ink bg-paper shadow-comic-10" />
      </div>
    </div>
  );
}

export default function PublicInvitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [error, setError] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);

  useEffect(() => {
    api<Invite>(`/public/${slug}`)
      .then(setInvite)
      .catch((err) =>
        setError(
          err instanceof ApiError && err.status === 404
            ? 'Este churras não existe (ou o link veio errado do grupo).'
            : 'Não consegui carregar o convite — tenta de novo daqui a pouco.',
        ),
      );
  }, [slug]);

  const copyPix = async () => {
    if (!invite?.pix) return;
    try {
      await navigator.clipboard.writeText(invite.pix.payload);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 1600);
    } catch {
      /* clipboard bloqueado */
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[1100px] flex-col gap-[clamp(16px,2.4vw,28px)] px-[clamp(12px,3vw,40px)] pb-20 pt-[clamp(14px,3vw,36px)]">
      {error && (
        <section className="mx-auto max-w-[520px] border-4 border-ink bg-paper p-6 text-center shadow-comic-10">
          <h1 className="font-display text-[32px] tracking-wide text-ember">Eita.</h1>
          <p className="font-bold text-body-text">{error}</p>
        </section>
      )}

      {!error && !invite && <Skeleton />}

      {invite && (
        <>
          {/* Hero */}
          <section className="border-4 border-ink bg-ember text-paper shadow-comic-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/invite-cover.jpeg"
              alt=""
              className="h-[clamp(150px,22vw,230px)] w-full border-b-4 border-ink object-cover"
            />
            <div className="flex flex-wrap items-end justify-between gap-4 p-[clamp(18px,2.5vw,30px)]">
              <div>
                <div className="text-[12px] font-black uppercase tracking-[2px] opacity-90">Você foi convidado</div>
                <h1 className="font-display text-[clamp(34px,6vw,58px)] leading-none tracking-wide">
                  {invite.eventName}
                </h1>
                <p className="mt-2 text-[15px] font-extrabold">
                  {dayLabel(invite.eventDay)} · começa {invite.startTime} · até {invite.endTime}
                </p>
                <p className="text-[14px] font-bold opacity-90">
                  {[invite.eventAddress, invite.eventCity, invite.eventHint].filter(Boolean).join(' — ')}
                </p>
              </div>
              <div className="border-[3px] border-ink bg-mustard px-4 py-3 text-ink shadow-comic-4">
                <div className="text-[12px] font-black uppercase tracking-[1.5px]">Sua parte</div>
                <div className="font-display text-[38px] leading-none">{money(invite.perAdult)}</div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,290px),1fr))] items-start gap-[clamp(16px,2.4vw,28px)]">
            {/* O que vai ter */}
            <section className="flex flex-col gap-3 border-4 border-ink bg-paper p-[clamp(18px,2.5vw,30px)] shadow-comic-10">
              <h2 className="font-display text-[26px] tracking-wide text-ink">O que vai ter</h2>
              {invite.categories.map((group) => (
                <div key={group.category}>
                  <div className="text-[12px] font-black uppercase tracking-[1.5px] text-ember">{group.category}</div>
                  <p className="text-[14px] font-bold text-body-text">{group.items.join(' · ')}</p>
                </div>
              ))}
              <div className="border-[3px] border-ink bg-mustard p-3 text-[14px] font-extrabold text-ink">
                {ALCOHOL_NOTE[invite.alcoholMode]}
              </div>
              <div className="flex items-baseline justify-between border-t-[3px] border-dotted border-[#17130F55] pt-3">
                <span className="text-[14px] font-black uppercase text-muted">Total</span>
                <span className="font-display text-[26px] text-ink">{money(invite.total)}</span>
              </div>
            </section>

            {/* Pix */}
            <section className="flex flex-col items-center gap-3 border-4 border-ink bg-brand-sky p-[clamp(18px,2.5vw,30px)] text-paper shadow-comic-10">
              <h2 className="self-start font-display text-[26px] tracking-wide">Pague sua parte no Pix</h2>
              {invite.pix ? (
                <>
                  <div className="w-full max-w-[210px] border-[10px] border-paper bg-paper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${API_BASE}/public/${invite.slug}/qrcode`}
                      alt="QR Code Pix"
                      className="aspect-square w-full"
                    />
                  </div>
                  <div className="w-full break-all border-[3px] border-paper bg-[#FFF8EA22] p-3 font-mono text-[13px]">
                    {invite.pix.type} · {invite.pix.key}
                  </div>
                  <button
                    onClick={copyPix}
                    className={`w-full border-[3px] border-ink bg-mustard px-4 py-3 text-[15px] font-black text-ink shadow-comic-4 ${press}`}
                  >
                    {copiedPix ? 'Pix copiado!' : 'Copiar Pix copia e cola'}
                  </button>
                </>
              ) : (
                <p className="text-[14px] font-bold opacity-90">
                  {invite.organizer} ainda não cadastrou a chave Pix — combina o acerto por lá.
                </p>
              )}
              <div className="text-[13px] font-bold opacity-85">Organizado por {invite.organizer}</div>
            </section>
          </div>
        </>
      )}

      <footer className="mt-auto flex flex-wrap justify-between gap-2 border-t-[3px] border-[#17130F33] pt-4 text-[13px] font-bold text-muted">
        <span>churrasqu.in — ninguém paga a mais, ninguém passa fome</span>
        <span>Preços de referência — ajuste conforme seu mercado.</span>
      </footer>
    </div>
  );
}
