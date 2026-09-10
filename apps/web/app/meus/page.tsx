'use client';

import { useEffect, useState } from 'react';
import { ApiError, api, session } from '../../lib/api';
import { money } from '../../lib/format';
import { isPastDay, shortDayLabel } from '../../lib/labels';
import { AuthScreen } from '../../components/screens/auth';
import { press } from '../../components/ui';

interface MyRsvp {
  id: string;
  guestName: string;
  response: 'vou' | 'levo-alguem' | 'nao-vou';
  paid: boolean;
}

interface MyBarbecue {
  id: string;
  slug: string;
  eventName: string;
  eventDay: string;
  startTime: string;
  endTime: string;
  eventAddress: string;
  eventCity: string;
  eventHint?: string;
  alcoholMode: string;
  tier: string;
  men: number;
  women: number;
  kids: number;
  total: number;
  perAdult: number;
  pixType?: string | null;
  pixKey?: string | null;
  showPaidPublicly: boolean;
  confirmedCount: number;
  paidCount: number;
  rsvps: MyRsvp[];
  items: { itemId: string; qty: number; unitPrice: number }[];
}

const CheckIcon = ({ stroke = '#17130F' }: { stroke?: string }) => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="square">
    <path d="M2 9 L6 13 L14 3" />
  </svg>
);

function Cobrancas({
  barbecue,
  token,
  onUpdated,
}: {
  barbecue: MyBarbecue;
  token: string;
  onUpdated: (updated: MyBarbecue) => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const confirmed = barbecue.rsvps.filter((r) => r.response !== 'nao-vou');
  const missing = (barbecue.confirmedCount - barbecue.paidCount) * barbecue.perAdult;

  const togglePaid = async (rsvp: MyRsvp) => {
    setBusyId(rsvp.id);
    try {
      const updated = await api<MyBarbecue>(`/barbecues/${barbecue.id}/rsvps/${rsvp.id}`, {
        method: 'PATCH',
        body: { paid: !rsvp.paid },
        token,
      });
      onUpdated(updated);
    } catch {
      /* mantém estado anterior */
    } finally {
      setBusyId(null);
    }
  };

  const toggleVisibility = async () => {
    try {
      const updated = await api<MyBarbecue>(`/barbecues/${barbecue.id}/paid-visibility`, {
        method: 'PATCH',
        body: { showPaidPublicly: !barbecue.showPaidPublicly },
        token,
      });
      onUpdated(updated);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="flex flex-col gap-3 border-t-[3px] border-dotted border-[#17130F55] pt-3">
      <div className="border-[3px] border-ink bg-mustard p-3">
        <div className="text-[11px] font-black uppercase tracking-[1.5px] text-ink/70">Arrecadado</div>
        <div className="font-display text-[30px] leading-none text-ink">
          {money(barbecue.paidCount * barbecue.perAdult)}
        </div>
        <div className="text-[13px] font-extrabold text-ink">
          {barbecue.paidCount} de {barbecue.confirmedCount} pagaram
          {missing > 0 && (
            <>
              {' '}
              · faltam <span className="text-ember">{money(missing)}</span>
            </>
          )}
        </div>
      </div>

      <button
        onClick={() => void toggleVisibility()}
        className="flex items-center justify-between gap-3 border-[3px] border-ink bg-paper p-3 text-left"
      >
        <span>
          <span className="block text-[14px] font-black text-ink">Mostrar quem pagou no convite</span>
          <span className="block text-[12px] font-bold text-muted">
            {barbecue.showPaidPublicly ? 'ligado — aparece na página pública' : 'desligado — só você vê esta lista'}
          </span>
        </span>
        <span
          className={`flex h-[28px] w-[52px] shrink-0 items-center border-[3px] border-ink p-[2px] ${
            barbecue.showPaidPublicly ? 'justify-end bg-mustard' : 'justify-start bg-cream'
          }`}
        >
          <span className="h-[18px] w-[18px] border-[3px] border-ink bg-paper" />
        </span>
      </button>

      <div className="flex flex-col">
        {confirmed.length === 0 && (
          <p className="text-[13px] font-bold text-muted">Ninguém confirmou ainda — manda o link no grupo!</p>
        )}
        {confirmed.map((rsvp) => (
          <div key={rsvp.id} className="flex items-center gap-2 border-b-2 border-[#17130F1A] py-2 last:border-b-0">
            <span className="min-w-0 flex-1 truncate text-[15px] font-black text-ink">
              {rsvp.guestName}
              {rsvp.response === 'levo-alguem' && (
                <span className="ml-1 rounded-full border-2 border-ink bg-brand-sky px-2 py-[1px] text-[11px] font-black text-paper">
                  +1
                </span>
              )}
            </span>
            <button
              disabled={busyId === rsvp.id}
              onClick={() => void togglePaid(rsvp)}
              className={`flex items-center gap-1 rounded-full px-3 py-[6px] text-[12px] font-black disabled:opacity-60 ${press} ${
                rsvp.paid
                  ? 'border-[3px] border-ink bg-mustard text-ink'
                  : 'border-[3px] border-dashed border-[#17130F66] bg-paper text-ember'
              }`}
            >
              {rsvp.paid ? (
                <>
                  <CheckIcon /> PAGOU
                </>
              ) : (
                'marcar pago'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarbecueCard({
  barbecue,
  token,
  onUpdated,
}: {
  barbecue: MyBarbecue;
  token: string;
  onUpdated: (updated: MyBarbecue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const past = isPastDay(barbecue.eventDay);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://churrasqu.in/ho/${barbecue.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard bloqueado */
    }
  };

  const editList = () => {
    try {
      sessionStorage.setItem('churrasquin.resume', JSON.stringify(barbecue));
    } catch {
      /* storage indisponível */
    }
    window.location.href = '/';
  };

  return (
    <section
      className={`flex flex-col gap-3 border-4 border-ink p-4 shadow-comic-8 ${past ? 'bg-cream' : 'bg-paper'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-display text-[26px] leading-none tracking-wide text-ink">{barbecue.eventName}</h2>
        <span
          className={`whitespace-nowrap border-[3px] border-ink px-2 py-1 text-[12px] font-black ${
            past ? 'bg-paper text-muted' : 'bg-mustard text-ink'
          }`}
        >
          {past ? `ROLOU · ${shortDayLabel(barbecue.eventDay).slice(4)}` : shortDayLabel(barbecue.eventDay)}
        </span>
      </div>

      <div className="text-[15px] font-extrabold text-ink">
        {money(barbecue.total)} <span className="text-ember">· {money(barbecue.perAdult)} por adulto</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border-[3px] border-ink bg-cream px-3 py-1 text-[12px] font-extrabold text-ink">
          {barbecue.confirmedCount} confirmados
        </span>
        <span
          className={`flex items-center gap-1 rounded-full border-[3px] border-ink px-3 py-1 text-[12px] font-black ${
            barbecue.paidCount === barbecue.confirmedCount && barbecue.confirmedCount > 0
              ? 'bg-mustard text-ink'
              : 'bg-paper text-ember'
          }`}
        >
          {barbecue.paidCount > 0 && <CheckIcon />}
          {barbecue.paidCount}/{barbecue.confirmedCount} pagaram
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className={`border-[3px] border-ink bg-ember px-2 py-2 font-display text-[18px] tracking-wide text-paper shadow-comic-3 hover:bg-ember-hover ${press}`}
        >
          {open ? 'Fechar cobranças' : 'Cobranças'}
        </button>
        <button
          onClick={editList}
          className={`border-[3px] border-ink bg-paper px-2 py-2 text-[14px] font-black text-ink shadow-comic-3 hover:bg-mustard ${press}`}
        >
          Editar lista
        </button>
      </div>

      {open && <Cobrancas barbecue={barbecue} token={token} onUpdated={onUpdated} />}

      <div className="flex items-center gap-2 border-t-[3px] border-dotted border-[#17130F55] pt-2">
        <a
          href={`/ho/${barbecue.slug}`}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 flex-1 truncate font-mono text-[12px] font-bold text-body-text underline"
        >
          churrasqu.in/ho/{barbecue.slug}
        </a>
        <button
          onClick={() => void copyLink()}
          className={`whitespace-nowrap border-[3px] border-ink bg-cream px-3 py-1 text-[12px] font-black text-ink hover:bg-mustard ${press}`}
        >
          {copied ? 'Copiado!' : 'copiar'}
        </button>
      </div>
    </section>
  );
}

export default function MeusChurrasPage() {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [list, setList] = useState<MyBarbecue[] | null>(null);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState(false);

  const load = async (accessToken: string) => {
    try {
      setList(await api<MyBarbecue[]>('/barbecues', { token: accessToken }));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        session.clear();
        setToken(null);
      } else {
        setError('Não consegui carregar seus churras — a API está de pé?');
      }
    }
  };

  useEffect(() => {
    const current = session.get();
    setChecked(true);
    if (current) {
      setToken(current.token);
      setUserName(current.name);
      void load(current.token);
    }
  }, []);

  const updateOne = (updated: MyBarbecue) =>
    setList((prev) => (prev ? prev.map((b) => (b.id === updated.id ? updated : b)) : prev));

  return (
    <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col gap-[clamp(16px,2.4vw,28px)] px-[clamp(12px,3vw,40px)] pb-20 pt-[clamp(14px,3vw,36px)]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <a href="/" className="font-display text-[26px] tracking-wide text-ink">
          CHURRASQU<span className="text-ember">.IN</span>
        </a>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className={`rounded-full border-[3px] border-ink bg-mustard px-4 py-2 text-[13px] font-black text-ink shadow-comic-3 ${press}`}
          >
            + Novo churras
          </a>
          {token && (
            <button
              onClick={() => {
                session.clear();
                window.location.href = '/';
              }}
              className={`rounded-full border-[3px] border-ink bg-paper px-4 py-2 text-[13px] font-extrabold text-ink shadow-comic-3 hover:bg-mustard ${press}`}
            >
              Sair
            </button>
          )}
        </div>
      </header>

      {checked && !token && (
        <AuthScreen
          submitSuffix=""
          backLabel="← Página inicial"
          onBack={() => (window.location.href = '/')}
          onAuthed={(name, accessToken) => {
            setToken(accessToken);
            setUserName(name);
            void load(accessToken);
          }}
        />
      )}

      {token && (
        <>
          <div>
            <h1 className="font-display text-[clamp(34px,5vw,48px)] leading-[0.95] tracking-wide text-ink">
              MEUS CHURRAS
            </h1>
            <p className="text-[14px] font-extrabold text-muted">
              {list === null
                ? `Carregando, ${userName}…`
                : `${list.length} churras salvo${list.length === 1 ? '' : 's'} · links sempre no ar`}
            </p>
          </div>

          {error && (
            <p className="border-[3px] border-ember bg-paper p-3 text-[13px] font-black text-ember">{error}</p>
          )}

          {list !== null && list.length === 0 && (
            <section className="mx-auto mt-6 flex max-w-[420px] flex-col items-center gap-4 border-4 border-ink bg-paper p-9 text-center shadow-comic-10">
              <svg width="72" height="72" viewBox="0 0 48 48" fill="none" stroke="#17130F" strokeWidth="2.5" strokeLinecap="square">
                <path d="M24 4 V40" />
                <path d="M18 40 H30" />
                <rect x="16" y="8" width="16" height="7" fill="#C2341F" stroke="#17130F" />
                <rect x="17" y="18" width="14" height="7" fill="#F2B22E" stroke="#17130F" />
                <rect x="16" y="28" width="16" height="7" fill="#C2341F" stroke="#17130F" />
              </svg>
              <h2 className="font-display text-[30px] leading-none tracking-wide text-ink">Nenhum churras ainda</h2>
              <p className="max-w-[260px] text-[14px] font-bold text-body-text">
                Monte a lista, salve e o link do rateio aparece aqui — pronto pra mandar no grupo.
              </p>
              <a
                href="/"
                className={`border-4 border-ink bg-ember px-5 py-3 font-display text-[22px] tracking-wide text-paper shadow-comic-6 hover:bg-ember-hover ${press}`}
              >
                Montar meu primeiro churras →
              </a>
            </section>
          )}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] items-start gap-[clamp(16px,2.4vw,28px)]">
            {(list ?? []).map((barbecue) => (
              <BarbecueCard key={barbecue.id} barbecue={barbecue} token={token} onUpdated={updateOne} />
            ))}
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
