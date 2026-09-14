'use client';

import { useEffect, useState } from 'react';
import { parsePtNumber } from '../lib/format';

/** Assinatura visual: pressionar = transladar 3px e encolher a sombra (definida por par de classes). */
export const press = 'transition-[transform,box-shadow] duration-75 hover:translate-x-[3px] hover:translate-y-[3px]';

export const labelCls = 'text-[12px] font-black uppercase tracking-[1.5px] text-muted';

export const inputCls =
  'h-[50px] w-full min-w-0 border-[3px] border-ink bg-white px-[14px] text-[16px] font-bold text-ink outline-none focus:bg-paper';

/** Logo do WhatsApp (Simple Icons) — herda a cor do texto. */
export function WhatsAppIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

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
      className="h-10 w-[56px] border-[3px] border-ink bg-white text-center text-[13px] font-black text-ink outline-none focus:bg-paper md:w-[82px] md:text-[14px]"
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
      className="h-10 w-[46px] border-[3px] border-ink bg-white text-center text-[14px] font-black text-ink outline-none focus:bg-paper md:w-[64px] md:text-[15px]"
    />
  );
}
