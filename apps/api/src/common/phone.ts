// Telefones brasileiros normalizados em E.164 (+55 DDD número)

const withCountry = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('55') && digits.length > 11 ? digits : `55${digits}`;
};

/** Fixo ou celular (DDD + 8 ou 9 dígitos); null = inválido. */
export function normalizeBrPhone(raw: string): string | null {
  const full = withCountry(raw);
  return /^55[1-9]\d{9,10}$/.test(full) ? `+${full}` : null;
}

/** Só celular (DDD + 9 + 8 dígitos) — o que dá para chamar no WhatsApp; null = inválido. */
export function normalizeBrMobile(raw: string): string | null {
  const full = withCountry(raw);
  return /^55[1-9][1-9]9\d{8}$/.test(full) ? `+${full}` : null;
}
