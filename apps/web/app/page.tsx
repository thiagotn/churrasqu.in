export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-display text-6xl tracking-wide">
        CHURRASQU<span className="text-ember">.IN</span>
      </h1>
      <p className="text-sm font-bold uppercase tracking-[2px] text-muted">
        Ninguém paga a mais. Ninguém passa fome.
      </p>
      <p className="max-w-md text-center font-bold text-body-text">
        Em construção — o domínio do calculator já vive em{' '}
        <code className="font-mono">apps/api</code>.
      </p>
    </main>
  );
}
