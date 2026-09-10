'use client';

import { useEffect, useState } from 'react';
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
  confirmed: string[];
  confirmedDetailed?: { name: string; paid: boolean }[];
  pix: { type: string; key: string; payload: string } | null;
}

type RsvpResponse = 'vou' | 'levo-alguem' | 'nao-vou';

const RSVP_OPTIONS: { id: RsvpResponse; label: string; note: string }[] = [
  { id: 'vou', label: 'Vou!', note: 'Boa! Chega cedo que a picanha não espera.' },
  { id: 'levo-alguem', label: 'Vou levar alguém', note: 'Fechou! Seu +1 entra na lista dos confirmados.' },
  { id: 'nao-vou', label: 'Não vou', note: 'Que pena — fica pro próximo churras.' },
];

function rsvpStorageKey(slug: string): string {
  return `churrasquin.rsvp.${slug}`;
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

export function InviteClient({ slug }: { slug: string }) {
  const [invite, setInvite] = useState<Invite | null>(null);
  const [error, setError] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [rsvp, setRsvp] = useState<RsvpResponse | null>(null);
  const [rsvpToken, setRsvpToken] = useState<string | null>(null);
  const [rsvpError, setRsvpError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(rsvpStorageKey(slug));
      if (raw) {
        const saved = JSON.parse(raw) as { token: string; name: string; response: RsvpResponse };
        setGuestName(saved.name);
        setRsvp(saved.response);
        setRsvpToken(saved.token);
      }
    } catch {
      /* storage indisponível */
    }
  }, [slug]);

  const sendRsvp = async (response: RsvpResponse) => {
    if (!guestName.trim()) {
      setRsvpError('Conta pra gente quem é você primeiro.');
      return;
    }
    setRsvpError('');
    const previous = rsvp;
    setRsvp(response);
    try {
      const res = await api<{ token: string; name: string; response: RsvpResponse }>(
        `/public/${slug}/rsvp`,
        { method: 'POST', body: { name: guestName.trim(), response, token: rsvpToken ?? undefined } },
      );
      setRsvpToken(res.token);
      try {
        localStorage.setItem(rsvpStorageKey(slug), JSON.stringify(res));
      } catch {
        /* noop */
      }
      const updated = await api<Invite>(`/public/${slug}`);
      setInvite(updated);
    } catch {
      setRsvp(previous);
      setRsvpError('Não rolou confirmar agora — tenta de novo.');
    }
  };

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

            {/* RSVP */}
            <section className="flex flex-col gap-3 border-4 border-ink bg-paper p-[clamp(18px,2.5vw,30px)] shadow-comic-8">
              <h2 className="font-display text-[28px] tracking-wide text-ink">Você vai?</h2>
              <input
                className="h-[48px] w-full min-w-0 border-[3px] border-ink bg-white px-[14px] text-[15px] font-bold text-ink outline-none focus:bg-paper"
                placeholder="Seu nome"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                {RSVP_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => void sendRsvp(option.id)}
                    className={`rounded-full border-[3px] border-ink px-4 py-2 text-[14px] font-extrabold shadow-comic-3 ${press} ${
                      rsvp === option.id ? 'bg-ember text-paper' : 'bg-paper text-ink hover:bg-mustard'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {rsvpError && (
                <p className="border-[3px] border-ember bg-paper p-2 text-[13px] font-black text-ember">{rsvpError}</p>
              )}
              {rsvp && (
                <p className="text-[14px] font-bold text-body-text">
                  {RSVP_OPTIONS.find((o) => o.id === rsvp)?.note}
                </p>
              )}
              <div className="h-[3px] bg-[#17130F1A]" />
              <div className="text-[12px] font-black uppercase tracking-[2px] text-muted">Confirmados</div>
              <div className="flex flex-wrap gap-2">
                {invite.confirmed.length === 0 && (
                  <span className="text-[14px] font-bold text-muted">Ninguém ainda — seja a primeira pessoa!</span>
                )}
                {(invite.confirmedDetailed ?? invite.confirmed.map((name) => ({ name, paid: false }))).map(
                  (guest, i) => (
                    <span
                      key={`${guest.name}-${i}`}
                      className={`flex items-center gap-1 rounded-full border-[3px] border-ink px-3 py-[7px] text-[14px] font-extrabold text-ink ${
                        invite.confirmedDetailed && guest.paid ? 'bg-mustard' : 'bg-cream'
                      }`}
                    >
                      {guest.name}
                      {invite.confirmedDetailed && guest.paid && (
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#17130F" strokeWidth="3" strokeLinecap="square">
                          <path d="M2 9 L6 13 L14 3" />
                        </svg>
                      )}
                    </span>
                  ),
                )}
              </div>
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
