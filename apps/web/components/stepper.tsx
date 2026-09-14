'use client';

import { Branch, Screen, STEP_OF_SCREEN } from '../lib/state';

const STEP4_LABEL: Record<Branch, string> = {
  quote: '4 · Orçamento',
  invite: '4 · Convidar',
};

export function Stepper({
  screen,
  maxStep,
  branch,
  step4Target,
  onGo,
}: {
  screen: Screen;
  maxStep: number;
  branch: Branch | null;
  /** Tela aberta pelo passo 4 (depende do caminho escolhido depois da lista) */
  step4Target: Screen;
  onGo: (screen: Screen) => void;
}) {
  const current = STEP_OF_SCREEN[screen];
  const steps: { step: number; label: string; screen: Screen }[] = [
    { step: 1, label: '1 · Convidados', screen: 'setup' },
    { step: 2, label: '2 · Padrão', screen: 'tiers' },
    { step: 3, label: '3 · Itens', screen: 'edit' },
    { step: 4, label: STEP4_LABEL[branch ?? 'quote'], screen: step4Target },
  ];
  return (
    <nav className="flex flex-wrap gap-3">
      {steps.map(({ step, label, screen: target }) => {
        const state = step === current ? 'current' : step < current ? 'done' : 'future';
        // Navegável só para trás ou até onde o usuário já chegou
        const clickable = step !== current && step <= maxStep;
        const palette =
          state === 'current'
            ? 'bg-ink text-paper'
            : state === 'done'
              ? 'bg-mustard text-ink'
              : 'bg-paper text-[#8A7A66]';
        return (
          <button
            key={step}
            disabled={!clickable}
            onClick={() => clickable && onGo(target)}
            className={`rounded-full border-[3px] border-ink px-4 py-2 text-[13px] font-black shadow-comic-3 ${palette} ${
              clickable ? 'cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px]' : 'cursor-default'
            }`}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
