'use client';

import { FormEvent, useState } from 'react';
import { ApiError, api, session } from '../../lib/api';
import { FieldLabel, inputCls, press } from '../ui';

interface AuthResponse {
  user: { id: string; name: string; email: string };
  accessToken: string;
}

const BENEFITS = [
  'Salvar este churras e reaproveitar a lista no próximo',
  'Gerar o link churrasqu.in/ho/… para mandar no grupo',
  'QR Code com Pix e valor por pessoa',
  'Ver quem confirmou (e, em breve, quem pagou)',
];

export function AuthScreen({
  onAuthed,
  onBack,
}: {
  onAuthed: (name: string, token: string) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (tab === 'signup' && password.length < 8) {
      setError('A senha precisa de pelo menos 8 caracteres.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await api<AuthResponse>(`/auth/${tab === 'signup' ? 'signup' : 'login'}`, {
        method: 'POST',
        body: tab === 'signup' ? { name, email, password } : { email, password },
      });
      session.set({ token: res.accessToken, name: res.user.name });
      onAuthed(res.user.name, res.accessToken);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sem conexão com a API — ela está de pé?');
    } finally {
      setBusy(false);
    }
  };

  const fieldError = error && (
    <p className="border-[3px] border-ember bg-paper p-2 text-[13px] font-black text-ember">{error}</p>
  );

  return (
    <div className="mx-auto grid w-full max-w-[900px] grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[clamp(16px,2.4vw,28px)]">
      <section className="flex flex-col gap-4 border-4 border-ink bg-paper p-[clamp(18px,2.5vw,30px)] shadow-comic-10">
        <div>
          <h1 className="font-display text-[clamp(28px,4vw,40px)] tracking-wide text-ink">
            {tab === 'signup' ? 'Crie sua conta' : 'Bem-vindo de volta'}
          </h1>
          <p className="text-[14px] font-bold text-muted">
            {tab === 'signup' ? 'Rapidinho — só para o link do seu churras não sumir.' : 'Entra aí que o churras te espera.'}
          </p>
        </div>

        <div className="grid grid-cols-2 border-[3px] border-ink">
          {(
            [
              ['signup', 'Criar conta'],
              ['login', 'Já tenho conta'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setError('');
              }}
              className={`px-3 py-2 text-[14px] font-black ${tab === id ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-mustard'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          {tab === 'signup' && (
            <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
              <FieldLabel>Seu nome</FieldLabel>
              <input required className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          )}
          <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
            <FieldLabel>E-mail</FieldLabel>
            <input
              required
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
            <FieldLabel>Senha</FieldLabel>
            <input
              required
              type="password"
              minLength={tab === 'signup' ? 8 : undefined}
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {fieldError}
          <button
            disabled={busy}
            className={`border-4 border-ink bg-brand-sky px-6 py-3 font-display text-[clamp(22px,3vw,28px)] tracking-wide text-paper shadow-comic-7 disabled:opacity-60 ${press}`}
          >
            {busy ? 'Um instante…' : tab === 'signup' ? 'Criar conta e salvar' : 'Entrar e salvar'}
          </button>
        </form>

        <button onClick={onBack} className="self-start text-[14px] font-extrabold text-ember underline">
          ← Voltar para a lista
        </button>
      </section>

      <section className="flex h-fit flex-col gap-3 border-4 border-ink bg-brand-sky p-[clamp(18px,2.5vw,30px)] text-paper shadow-comic-10">
        <h2 className="font-display text-[clamp(24px,3vw,30px)] tracking-wide">Com a conta você pode…</h2>
        <ul className="flex flex-col gap-2 text-[15px] font-bold">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <span className="mt-[6px] h-[10px] w-[10px] shrink-0 rounded-full bg-mustard" />
              {benefit}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
