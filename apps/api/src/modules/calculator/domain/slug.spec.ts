import { makeShareSlug, slugify } from './slug';

describe('slugify', () => {
  it('minúsculas, sem acentos, separadores viram hífen', () => {
    expect(slugify('Churras da Laje')).toBe('churras-da-laje');
    expect(slugify('São João & Cia!')).toBe('sao-joao-cia');
    expect(slugify('  Churrascão  2026  ')).toBe('churrascao-2026');
  });
});

describe('makeShareSlug', () => {
  it('anexa sufixo hexadecimal de 4 caracteres', () => {
    expect(makeShareSlug('Churras da Laje')).toMatch(/^churras-da-laje-[0-9a-f]{4}$/);
  });

  it('é determinístico com random injetado', () => {
    expect(makeShareSlug('Churras da Laje', () => 0)).toBe('churras-da-laje-0000');
    expect(makeShareSlug('Churras da Laje', () => 0.99)).toBe('churras-da-laje-ffff');
  });
});
