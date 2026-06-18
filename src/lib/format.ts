// Formatadores e parsers partilhados — locale pt-PT.
//
// Convenção: ponto único de configuração para `Intl.NumberFormat` evita
// criar instâncias por componente e mantém a apresentação coerente
// (separadores, dígitos significativos).

const eur = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const num = new Intl.NumberFormat("pt-PT");

const eurCompact = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const numCompact = new Intl.NumberFormat("pt-PT", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Moeda EUR compacta (pt-PT). Ex: 120500 → "120,5 mil €". */
export function formatEurCompact(value: number): string {
  return eurCompact.format(value);
}

/** Número compacto (pt-PT). Ex: 12500 → "12,5 mil". */
export function formatNumCompact(value: number): string {
  return numCompact.format(value);
}

const pct = new Intl.NumberFormat("pt-PT", {
  style: "percent",
  maximumFractionDigits: 1,
});

/** Formata como moeda EUR (pt-PT). Ex: 12.34 → "12,34 €". */
export function formatEur(value: number): string {
  return eur.format(value);
}

/** Formata como número inteiro/decimal (pt-PT). Ex: 1234 → "1234". */
export function formatNum(value: number): string {
  return num.format(value);
}

/**
 * Formata como percentagem (pt-PT). Espera um valor DECIMAL — 0.32 → "32 %".
 *
 * Nota: o BE devolve `margin` em pontos percentuais (24.17 = 24,17%).
 * Para esse caso o caller divide por 100 antes: `formatPercent(margin / 100)`.
 */
export function formatPercent(decimal: number): string {
  return pct.format(decimal);
}

/**
 * Tenta parsear um número a partir de string (de URL params, inputs,
 * etc.). Devolve undefined para valores vazios, null/undefined, ou que
 * não sejam números finitos válidos.
 */
export function parseNumber(v: string | null | undefined): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
