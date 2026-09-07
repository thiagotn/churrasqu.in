import { buildPixPayload, crc16, normalizePixKey } from './pix';

describe('crc16', () => {
  it('confere com o vetor de exemplo do manual do BCB', () => {
    const body =
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304';
    expect(crc16(body)).toBe('1D3D');
  });
});

describe('normalizePixKey', () => {
  it('celular vira +55DDDNÚMERO', () => {
    expect(normalizePixKey('Celular', '(11) 98888-1234')).toBe('+5511988881234');
    expect(normalizePixKey('Celular', '+55 11 98888-1234')).toBe('+5511988881234');
    expect(normalizePixKey('Celular', '123')).toBeNull();
  });

  it('CPF exige 11 dígitos', () => {
    expect(normalizePixKey('CPF', '123.456.789-00')).toBe('12345678900');
    expect(normalizePixKey('CPF', '123')).toBeNull();
  });

  it('e-mail é validado e minusculizado', () => {
    expect(normalizePixKey('E-mail', ' Ze@Email.com ')).toBe('ze@email.com');
    expect(normalizePixKey('E-mail', 'sem-arroba')).toBeNull();
  });

  it('aleatória exige formato uuid', () => {
    expect(normalizePixKey('Aleatória', '0F7A2C1E-9B44-4D21-8F0E-11AA22BB33CC')).toBe(
      '0f7a2c1e-9b44-4d21-8f0e-11aa22bb33cc',
    );
    expect(normalizePixKey('Aleatória', 'nao-e-uuid')).toBeNull();
  });
});

describe('buildPixPayload', () => {
  const payload = buildPixPayload({
    key: '+5511988881234',
    amount: 117.75,
    merchantName: 'Zé do Churras',
    city: 'São Paulo',
    txid: 'churras-da-laje-8f2a',
  });

  it('gera EMV com GUI do Pix, moeda BRL e valor', () => {
    expect(payload.startsWith('000201')).toBe(true);
    expect(payload).toContain('br.gov.bcb.pix');
    expect(payload).toContain('5303986'); // BRL
    expect(payload).toContain('5406117.75'); // campo 54, len 06
    expect(payload).toContain('5913ZE DO CHURRAS'); // sem acento, maiúsculo
    expect(payload).toContain('6009SAO PAULO');
    expect(payload).toContain('0517churrasdalaje8f2a'); // txid sem hífens
  });

  it('CRC final fecha com o corpo', () => {
    expect(payload.slice(-4)).toBe(crc16(payload.slice(0, -4)));
  });

  it('sem valor, omite o campo 54', () => {
    const noAmount = buildPixPayload({ key: 'ze@email.com', merchantName: 'Zé', city: 'SP' });
    expect(noAmount).toContain('53039865802BR'); // campo 58 logo após o 53, sem campo 54
    expect(noAmount.slice(-4)).toBe(crc16(noAmount.slice(0, -4)));
  });
});
