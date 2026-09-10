// Fallback de navegação do service worker (ADR 0007): páginas ainda não
// cacheadas caem aqui quando não há rede.
export const metadata = { title: 'Sem conexão' };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <svg width="72" height="72" viewBox="0 0 48 48" fill="none" stroke="#17130F" strokeWidth="2.5" strokeLinecap="square">
        <path d="M24 4 V40" />
        <path d="M18 40 H30" />
        <rect x="16" y="8" width="16" height="7" fill="#C2341F" stroke="#17130F" />
        <rect x="17" y="18" width="14" height="7" fill="#F2B22E" stroke="#17130F" />
        <rect x="16" y="28" width="16" height="7" fill="#C2341F" stroke="#17130F" />
      </svg>
      <h1 className="font-display text-[36px] leading-none tracking-wide text-ink">SEM CONEXÃO</h1>
      <p className="max-w-[300px] font-bold text-body-text">
        Esta página precisa de internet. A calculadora em{' '}
        <a href="/" className="font-black text-ember underline">
          churrasqu.in
        </a>{' '}
        continua funcionando offline.
      </p>
    </main>
  );
}
