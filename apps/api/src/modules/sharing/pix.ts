// Payload Pix EMV (BR Code) — Manual de Padrões para Iniciação do Pix (BCB)

import { normalizeBrPhone } from '../../common/phone';

export type PixKeyType = 'Celular' | 'CPF' | 'E-mail' | 'Aleatória';

export const PIX_KEY_TYPES: PixKeyType[] = ['Celular', 'CPF', 'E-mail', 'Aleatória'];

/** Normaliza a chave por tipo; null = inválida. */
export function normalizePixKey(type: PixKeyType, key: string): string | null {
  switch (type) {
    case 'Celular':
      return normalizeBrPhone(key);
    case 'CPF': {
      const digits = key.replace(/\D/g, '');
      return digits.length === 11 ? digits : null;
    }
    case 'E-mail': {
      const trimmed = key.trim().toLowerCase();
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : null;
    }
    case 'Aleatória': {
      const trimmed = key.trim().toLowerCase();
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(trimmed)
        ? trimmed
        : null;
    }
  }
}

/** Campo EMV: ID (2) + tamanho (2) + valor. */
const emv = (id: string, value: string): string =>
  id + String(value.length).padStart(2, '0') + value;

/** CRC16-CCITT (poly 0x1021, init 0xFFFF) sobre o payload ASCII, em hex maiúsculo. */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Nome/cidade: ASCII sem acento, maiúsculo, tamanho limitado pelo padrão. */
const ascii = (text: string, max: number): string => {
  const clean = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 .-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
    .slice(0, max)
    .trim();
  return clean || 'CHURRASQUIN';
};

export interface PixPayloadOptions {
  /** Chave já normalizada (normalizePixKey) */
  key: string;
  /** Valor em reais; omitido/0 = QR sem valor fixo */
  amount?: number;
  merchantName: string;
  city: string;
  /** Identificador da cobrança (alfanumérico, até 25); default '***' */
  txid?: string;
}

export function buildPixPayload(opts: PixPayloadOptions): string {
  const accountInfo = emv('00', 'br.gov.bcb.pix') + emv('01', opts.key);
  const txid = (opts.txid ?? '').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***';
  let payload =
    emv('00', '01') + // Payload Format Indicator
    emv('26', accountInfo) + // Merchant Account Information (Pix)
    emv('52', '0000') + // Merchant Category Code
    emv('53', '986'); // Moeda: BRL
  if (opts.amount && opts.amount > 0) payload += emv('54', opts.amount.toFixed(2));
  payload +=
    emv('58', 'BR') +
    emv('59', ascii(opts.merchantName, 25)) +
    emv('60', ascii(opts.city, 15)) +
    emv('62', emv('05', txid)) +
    '6304';
  return payload + crc16(payload);
}
