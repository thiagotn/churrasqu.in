export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const HEX = '0123456789abcdef';

/** Slug do link público: `churras-da-laje-8f2a`. `random` é injetável para testes. */
export function makeShareSlug(eventName: string, random: () => number = Math.random): string {
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += HEX[Math.min(15, Math.floor(random() * 16))];
  }
  return `${slugify(eventName)}-${suffix}`;
}
