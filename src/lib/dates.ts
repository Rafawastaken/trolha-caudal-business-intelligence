// Date helpers partilhados entre features.
//
// Convenções:
// - "ISO date" = string "yyyy-mm-dd" sem hora/timezone. É o formato que
//   o BE espera em filtros de data e o que guardamos em URLs.
// - Conversões `Date <-> string` correm sempre em hora LOCAL — evitamos
//   o off-by-one clássico do `new Date('yyyy-mm-dd')` que parseia como UTC
//   e dá o dia anterior em fusos a oeste de Greenwich.

/** Converte um Date para "yyyy-mm-dd" em hora local. */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Constrói um Date a partir de "yyyy-mm-dd" interpretado em hora local. */
export function fromIsoDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Formata "yyyy-mm-dd" como "DD/MM/YYYY" (locale pt-PT). */
export function formatPtDate(s: string): string {
  return fromIsoDate(s).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Devolve o intervalo "últimos N dias" terminando hoje, em ISO dates.
 * Útil como default para filtros de data.
 */
export function lastNDaysRange(n: number): { since: string; until: string } {
  const until = new Date();
  const since = new Date();
  since.setDate(since.getDate() - n);
  return { since: toIsoDate(since), until: toIsoDate(until) };
}

/**
 * Converte um valor de input `type="datetime-local"` (ex: "2026-05-06T14:30")
 * para uma ISO string em UTC. Devolve undefined para input vazio/inválido.
 *
 * O `<input type="datetime-local">` devolve a hora em fuso LOCAL sem TZ.
 * `new Date(s)` interpreta-a como hora local — então `.toISOString()` faz
 * o ajuste correto para UTC, que é o que o BE espera (time.Time parseável).
 */
export function datetimeLocalToIso(v: string): string | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/**
 * Tempo relativo curto em PT (estilo "há 3 min" / "há 2 h" / "há 5 d").
 * Para datas com mais de 30 dias, devolve a data PT (DD/MM/YY) em vez do
 * relativo — manter "há 47 d" perde precisão útil.
 *
 * Usado para mostrar `updated_at` de ofertas Genesys, eventos, etc. — sítios
 * onde o operador quer saber "isto é fresco?" sem ler timestamps absolutos.
 */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const ms = Date.now() - d.getTime();
  if (ms < 0) return "agora"; // tolerar clock skew (BE ligeiramente à frente)
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} d`;
  return d.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

/**
 * Devolve o instante actual + `secondsAhead` no formato esperado por
 * `<input type="datetime-local">` ("YYYY-MM-DDTHH:mm" em hora LOCAL).
 *
 * Pequena folga (~30s default) garante que após o user confirmar e o
 * request chegar ao BE, o `start_at` ainda está no futuro relativamente à
 * `scheduleStartGrace` (1 min back). Sem folga, um clock skew + latência
 * pode tornar a campanha rejected como "start_at must be in the future".
 */
export function nowAsDatetimeLocal(secondsAhead = 30): string {
  const d = new Date(Date.now() + secondsAhead * 1000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

/**
 * Verifica se um valor `datetime-local` está no passado vs `Date.now()`.
 * Devolve `false` para input vazio/inválido — validação faz-se noutro lado.
 */
export function isDatetimeLocalInPast(v: string): boolean {
  if (!v) return false;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

/**
 * Inverso de `datetimeLocalToIso`: converte uma ISO string (UTC) para o
 * formato esperado por `<input type="datetime-local">` ("YYYY-MM-DDTHH:mm"
 * em hora LOCAL, sem TZ). Devolve "" para input vazio/inválido.
 *
 * Útil para pré-preencher forms a partir de datas guardadas pelo BE.
 */
export function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${hh}:${mm}`;
}
