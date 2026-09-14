import { normalizeBrMobile, normalizeBrPhone } from './phone';

describe('telefones BR', () => {
  it('normalizeBrPhone aceita fixo e celular, com ou sem +55', () => {
    expect(normalizeBrPhone('(11) 98888-1234')).toBe('+5511988881234');
    expect(normalizeBrPhone('+55 11 98888-1234')).toBe('+5511988881234');
    expect(normalizeBrPhone('11 3333-4444')).toBe('+551133334444');
    expect(normalizeBrPhone('123')).toBeNull();
  });

  it('normalizeBrMobile exige celular (9 na frente)', () => {
    expect(normalizeBrMobile('(11) 98888-1234')).toBe('+5511988881234');
    expect(normalizeBrMobile('5511988881234')).toBe('+5511988881234');
    expect(normalizeBrMobile('11 3333-4444')).toBeNull();
    expect(normalizeBrMobile('(01) 98888-1234')).toBeNull();
    expect(normalizeBrMobile('')).toBeNull();
  });
});
