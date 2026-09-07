'use client';

import { useEffect, useState } from 'react';
import { parsePtNumber } from '../lib/format';

/** Assinatura visual: pressionar = transladar 3px e encolher a sombra (definida por par de classes). */
export const press = 'transition-[transform,box-shadow] duration-75 hover:translate-x-[3px] hover:translate-y-[3px]';

export const labelCls = 'text-[12px] font-black uppercase tracking-[1.5px] text-muted';

export const inputCls =
  'h-[50px] w-full min-w-0 border-[3px] border-ink bg-white px-[14px] text-[16px] font-bold text-ink outline-none focus:bg-paper';

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className={labelCls}>{children}</span>;
}

interface CommitInputProps {
  value: number;
  onCommit: (v: number) => void;
  format: (v: number) => string;
  className: string;
  min?: number;
}

/** Input numérico pt-BR: mantém o texto livre enquanto digita, commita quando parseável. */
function CommitInput({ value, onCommit, format, className, min = 0 }: CommitInputProps) {
  const [text, setText] = useState(format(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(format(value));
  }, [value, focused, format]);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        setText(format(value));
      }}
      onChange={(e) => {
        setText(e.target.value);
        const parsed = parsePtNumber(e.target.value);
        if (Number.isFinite(parsed) && parsed >= min) onCommit(Math.round(parsed * 100) / 100);
      }}
      className={className}
    />
  );
}

const priceFmt = (v: number) => v.toFixed(2).replace('.', ',');
const qtyFmt = (v: number) => String(v).replace('.', ',');

export function PriceInput({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  return (
    <CommitInput
      value={value}
      onCommit={onCommit}
      format={priceFmt}
      className="h-[34px] w-[82px] border-[3px] border-ink bg-white text-center text-[14px] font-black text-ink outline-none focus:bg-paper"
    />
  );
}

export function QtyInput({
  value,
  min,
  onCommit,
}: {
  value: number;
  min: number;
  onCommit: (v: number) => void;
}) {
  return (
    <CommitInput
      value={value}
      onCommit={onCommit}
      format={qtyFmt}
      min={min}
      className="h-[40px] w-[72px] border-[3px] border-ink bg-white text-center text-[15px] font-black text-ink outline-none focus:bg-paper"
    />
  );
}
