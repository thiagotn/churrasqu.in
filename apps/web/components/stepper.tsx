'use client';

import { Screen, STEP_OF_SCREEN } from '../lib/state';

const STEPS: { step: number; label: string; screen: Screen }[] = [
  { step: 1, label: '1 · Convidados', screen: 'setup' },
  { step: 2, label: '2 · Nível', screen: 'tiers' },
  { step: 3, label: '3 · Lista', screen: 'edit' },
  { step: 4, label: '4 · Compartilhar', screen: 'saved' },
];

export function Stepper({
  screen,
  maxStep,
  onGo,
}: {
  screen: Screen;
  maxStep: number;
  onGo: (screen: Screen) => void;
}) {
  const current = STEP_OF_SCREEN[screen];
  return (
    <nav className="flex flex-wrap gap-3">
      {STEPS.map(({ step, label, screen: target }) => {
        const state = step === current ? 'current' : step < current ? 'done' : 'future';
        // Navegável só para trás ou até onde o usuário já chegou (a etapa 4 abre depois de salvar)
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
