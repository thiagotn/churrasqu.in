import {
  applyAdjustments,
  buildBaseList,
  calculate,
  durationHours,
  meatBaseKg,
  meatForTier,
  roundKg,
  roundUnits,
  stretchFor,
} from './calculator';
import { CalculatorInput, ListItem } from './types';

// Cenário padrão do protótipo: 6 homens, 5 mulheres, 3 crianças, 12:30–19:00 (6.5h)
const defaults: CalculatorInput = {
  men: 6,
  women: 5,
  kids: 3,
  startTime: '12:30',
  endTime: '19:00',
  alcoholMode: 'lista',
  tier: 'medio',
};

const byId = (items: ListItem[], id: string): ListItem => {
  const found = items.find((i) => i.id === id);
  if (!found) throw new Error(`item ${id} não encontrado`);
  return found;
};

describe('durationHours', () => {
  it('calcula a duração no mesmo dia', () => {
    expect(durationHours('12:30', '19:00')).toBe(6.5);
    expect(durationHours('10:00', '20:00')).toBe(10);
  });

  it('vira o dia quando o fim é antes do início', () => {
    expect(durationHours('22:00', '02:00')).toBe(4);
  });

  it('limita a 1–14h', () => {
    expect(durationHours('12:00', '12:30')).toBe(1);
    expect(durationHours('12:00', '12:00')).toBe(14); // 0h vira 24h, clamp em 14
  });
});

describe('stretchFor', () => {
  it('aplica o fator por faixa de duração', () => {
    expect(stretchFor(4)).toBe(1);
    expect(stretchFor(4.99)).toBe(1);
    expect(stretchFor(5)).toBe(1.12);
    expect(stretchFor(6.99)).toBe(1.12);
    expect(stretchFor(7)).toBe(1.25);
    expect(stretchFor(14)).toBe(1.25);
  });
});

describe('arredondamentos', () => {
  it('roundKg: múltiplos de 0.5, mínimo 0.5', () => {
    expect(roundKg(0.1)).toBe(0.5);
    expect(roundKg(1.24)).toBe(1);
    expect(roundKg(1.26)).toBe(1.5);
    expect(roundKg(1.75)).toBe(2); // meio arredonda para cima
    expect(roundKg(2)).toBe(2);
  });

  it('roundUnits: para cima, mínimo 1', () => {
    expect(roundUnits(0.01)).toBe(1);
    expect(roundUnits(3)).toBe(3);
    expect(roundUnits(3.01)).toBe(4);
  });
});

describe('meatBaseKg / meatForTier', () => {
  it('gramagem por perfil: 420g homem, 320g mulher, 200g criança', () => {
    expect(meatBaseKg({ men: 1, women: 0, kids: 0 }, 1)).toBeCloseTo(0.42);
    expect(meatBaseKg({ men: 0, women: 1, kids: 0 }, 1)).toBeCloseTo(0.32);
    expect(meatBaseKg({ men: 0, women: 0, kids: 1 }, 1)).toBeCloseTo(0.2);
    expect(meatBaseKg({ men: 6, women: 5, kids: 3 }, 1)).toBeCloseTo(4.72);
  });

  it('aplica o stretch da duração', () => {
    expect(meatBaseKg({ men: 6, women: 5, kids: 3 }, 1.12)).toBeCloseTo(5.2864);
  });

  it('gourmet assa 5% a mais; os demais não', () => {
    expect(meatForTier(10, 'gourmet')).toBeCloseTo(10.5);
    expect(meatForTier(10, 'basico')).toBe(10);
    expect(meatForTier(10, 'medio')).toBe(10);
  });
});

describe('buildBaseList — nível médio, cenário padrão', () => {
  const items = buildBaseList(defaults);

  it('gera ids estáveis e únicos', () => {
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('medio-picanha');
    expect(ids).toContain('medio-costela-bovina');
  });

  it('reparte a carne pelos cortes com arredondamento de 0.5kg', () => {
    // carne total = 4.72 * 1.12 = 5.2864 kg
    expect(byId(items, 'medio-picanha').qty).toBe(2); // 34% = 1.797 → 2.0
    expect(byId(items, 'medio-costela-bovina').qty).toBe(1.5); // 24% = 1.269 → 1.5
    expect(byId(items, 'medio-linguica-artesanal').qty).toBe(1); // 20% = 1.057 → 1.0
    expect(byId(items, 'medio-asinha-de-frango-temperada').qty).toBe(1); // 22% = 1.163 → 1.0
    for (const cut of items.filter((i) => i.category === 'Carnes')) {
      expect(cut.unit).toBe('kg');
    }
  });

  it('bebidas do médio: long neck por adulto e kit caipirinha a cada 10 adultos', () => {
    // 11 adultos * 1.5L / 0.355 = 46.48 → 47
    expect(byId(items, 'medio-cerveja-long-neck-355ml').qty).toBe(47);
    expect(byId(items, 'medio-kit-caipirinha-cachaca-limao-acucar').qty).toBe(2); // 11/10 → 2
    expect(byId(items, 'medio-refrigerante-2l').qty).toBe(4); // 14*0.55/2 = 3.85 → 4
    expect(byId(items, 'medio-agua-mineral-1-5l').qty).toBe(6); // 14*0.6/1.5 = 5.6 → 6
    expect(byId(items, 'medio-gelo-5kg').qty).toBe(3); // 14/6*1.12 = 2.61 → 3
  });

  it('acompanhamentos por convidado/adulto com o fator do catálogo', () => {
    expect(byId(items, 'medio-pao-de-alho-artesanal').qty).toBe(14); // 1 por convidado
    expect(byId(items, 'medio-queijo-coalho-no-espeto').qty).toBe(11); // 1 por adulto
    expect(byId(items, 'medio-farofa-da-casa-500g').qty).toBe(3); // 14/6 → 3
    expect(byId(items, 'medio-maionese-verde-caseira').qty).toBe(2); // kg: 14/8 = 1.75 → 2.0
  });

  it('essenciais em função da carne e dos convidados', () => {
    expect(byId(items, 'medio-carvao-de-eucalipto-5kg').qty).toBe(2); // 5.2864/5 → 2
    expect(byId(items, 'medio-sal-grosso-1kg').qty).toBe(1); // 5.2864/8 → 1
    expect(byId(items, 'medio-kit-descartaveis-pratos-copos-guardanapos').qty).toBe(2); // 14/10 → 2
    expect(byId(items, 'medio-acendedor-e-papel-aluminio').qty).toBe(1);
  });

  it('sem "gelo extra" abaixo de 7h; presente a partir de 7h', () => {
    expect(items.some((i) => i.id === 'medio-gelo-extra-e-reposicao-de-carvao')).toBe(false);
    const long = buildBaseList({ ...defaults, startTime: '11:00', endTime: '19:00' });
    const extra = byId(long, 'medio-gelo-extra-e-reposicao-de-carvao');
    expect(extra.qty).toBe(1);
    expect(extra.unitPrice).toBe(42);
  });

  it('opcionais do nível vêm desligados, como sugestão', () => {
    const optionals = items.filter((i) => i.optional);
    expect(optionals.map((i) => i.name)).toEqual([
      'Batata rústica assada',
      'Tábua de frios',
      'Chimichurri artesanal',
    ]);
    for (const opt of optionals) {
      expect(opt.on).toBe(false);
      expect(opt.category).toBe('Acompanhamentos');
    }
  });
});

describe('buildBaseList — políticas de bebida', () => {
  it('lista + básico: cerveja em lata', () => {
    const items = buildBaseList({ ...defaults, tier: 'basico' });
    expect(byId(items, 'basico-cerveja-lata-350ml').qty).toBe(48); // 11*1.5/0.35 = 47.1 → 48
  });

  it('lista + gourmet: IPA, Malbec e espumante', () => {
    const items = buildBaseList({ ...defaults, tier: 'gourmet' });
    expect(byId(items, 'gourmet-cerveja-artesanal-ipa-600ml').qty).toBe(28); // 16.5/0.6 = 27.5 → 28
    expect(byId(items, 'gourmet-vinho-malbec-garrafa').qty).toBe(2); // 11/6 → 2
    expect(byId(items, 'gourmet-espumante-brut-garrafa').qty).toBe(2); // 11/10 → 2
  });

  it('byob, bar e none: sem álcool na lista, suco no lugar', () => {
    for (const alcoholMode of ['byob', 'bar', 'none'] as const) {
      const items = buildBaseList({ ...defaults, alcoholMode });
      expect(items.some((i) => i.name.toLowerCase().includes('cerveja'))).toBe(false);
      expect(items.some((i) => i.name.toLowerCase().includes('caipirinha'))).toBe(false);
      expect(byId(items, 'medio-suco-natural-concentrado-1l').qty).toBe(4); // 14/4 → 4
    }
  });

  it('refrigerante, água e gelo entram em qualquer política', () => {
    for (const alcoholMode of ['lista', 'byob', 'bar', 'none'] as const) {
      const names = buildBaseList({ ...defaults, alcoholMode }).map((i) => i.id);
      expect(names).toContain('medio-refrigerante-2l');
      expect(names).toContain('medio-agua-mineral-1-5l');
      expect(names).toContain('medio-gelo-5kg');
    }
  });

  it('beerPerAdultL é parametrizável', () => {
    const items = buildBaseList({ ...defaults, beerPerAdultL: 0.5 });
    expect(byId(items, 'medio-cerveja-long-neck-355ml').qty).toBe(16); // 5.5/0.355 = 15.5 → 16
  });
});

describe('buildBaseList — gourmet usa carne com fator 1.05', () => {
  it('picanha maturada parte de 5.55kg de carne', () => {
    const items = buildBaseList({ ...defaults, tier: 'gourmet' });
    // 5.2864 * 1.05 = 5.5507; 28% = 1.554 → 1.5
    expect(byId(items, 'gourmet-picanha-maturada').qty).toBe(1.5);
  });
});

describe('validação de entrada', () => {
  it('rejeita contagens negativas ou fracionadas', () => {
    expect(() => buildBaseList({ ...defaults, men: -1 })).toThrow();
    expect(() => buildBaseList({ ...defaults, women: 1.5 })).toThrow();
  });

  it('rejeita nível e política desconhecidos', () => {
    expect(() => buildBaseList({ ...defaults, tier: 'premium' as never })).toThrow();
    expect(() => buildBaseList({ ...defaults, alcoholMode: 'open-bar' as never })).toThrow();
  });
});

describe('applyAdjustments', () => {
  const base = buildBaseList(defaults);

  it('edita quantidade e preço unitário', () => {
    const items = applyAdjustments(base, {
      edits: { 'medio-picanha': 3 },
      prices: { 'medio-picanha': 99.9 },
    });
    const picanha = byId(items, 'medio-picanha');
    expect(picanha.qty).toBe(3);
    expect(picanha.unitPrice).toBe(99.9);
    expect(picanha.on).toBe(true);
  });

  it('null remove o item do total', () => {
    const items = applyAdjustments(base, { edits: { 'medio-picanha': null } });
    expect(byId(items, 'medio-picanha').on).toBe(false);
  });

  it('editar a quantidade de um opcional o ativa', () => {
    const items = applyAdjustments(base, { edits: { 'medio-tabua-de-frios': 1 } });
    expect(byId(items, 'medio-tabua-de-frios').on).toBe(true);
  });

  it('sem ajustes, devolve a lista intacta', () => {
    expect(applyAdjustments(base)).toEqual(base);
  });
});

describe('calculate — totais e rateio', () => {
  // Cenário pequeno, verificável à mão: 2 homens, 4h, básico, sem álcool.
  const small: CalculatorInput = {
    men: 2,
    women: 0,
    kids: 0,
    startTime: '12:00',
    endTime: '16:00',
    alcoholMode: 'none',
    tier: 'basico',
  };

  it('total é a soma de qty × preço dos itens ativos, rateado por adulto', () => {
    const result = calculate(small);
    // Carnes (0.84kg → cada corte no mínimo 0.5kg): 0.5*26 + 0.5*19 + 0.5*49 = 47
    // Bebidas: suco 1*19 + refri 1*11.5 + água 1*4.5 + gelo 1*14 = 49
    // Acompanhamentos: pão de alho 2*4.5 + farofa 1*12 + vinagrete 1*18 = 39
    // Essenciais: carvão 1*29 + sal 1*9.5 + descartáveis 1*38 + acendedor 1*24 = 100.5
    expect(result.total).toBe(235.5);
    expect(result.perAdult).toBe(117.75);
    expect(result.adults).toBe(2);
    expect(result.guests).toBe(2);
    expect(result.hours).toBe(4);
    expect(result.stretch).toBe(1);
    expect(result.meatListKg).toBe(1.5);
    expect(result.meatBaseKg).toBeCloseTo(0.84);
  });

  it('opcionais desligados não entram no total; ajustes recalculam', () => {
    const plain = calculate(defaults);
    const withOptional = calculate(defaults, { edits: { 'medio-tabua-de-frios': 1 } });
    expect(withOptional.total).toBeCloseTo(plain.total + 89, 2);

    const cheaper = calculate(defaults, { edits: { 'medio-picanha': null } });
    expect(cheaper.total).toBeCloseTo(plain.total - 2 * 89, 2);
    expect(cheaper.meatListKg).toBeCloseTo(plain.meatListKg - 2, 2);
  });

  it('sem adultos, rateio é 0 (sem divisão por zero)', () => {
    const result = calculate({ ...small, men: 0, kids: 2 });
    expect(result.perAdult).toBe(0);
    expect(Number.isFinite(result.total)).toBe(true);
  });
});
