import { api } from '@/lib/api'

import { overviewSchema, type Overview } from './schemas'

// GET /kpi-api/overview — bundle de carga inicial do dashboard (+ período
// anterior para deltas). O contrato ainda não documenta a shape da resposta;
// `normalizeOverview` é o único ponto a ajustar quando virmos os dados reais.
export async function fetchOverview(
  from: string,
  to: string,
): Promise<Overview> {
  const raw = await api<unknown>('/kpi-api/overview', { params: { from, to } })
  return normalizeOverview(raw)
}

function normalizeOverview(raw: unknown): Overview {
  // TODO(api real): mapear os campos reais de /overview para o modelo canónico.
  // Por agora tenta a shape canónica diretamente — se a API real diferir, este
  // parse falha e o erro fica visível na UI (sinal claro do que ajustar).
  return overviewSchema.parse(raw)
}
