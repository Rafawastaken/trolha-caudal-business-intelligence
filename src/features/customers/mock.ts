import type { CustomerMix, GeoRegion, TopCustomer } from './schemas'

// Dataset de demonstração determinístico (loja de bombas de água). O mesmo
// período produz sempre os mesmos resultados (sem flicker entre renders).

const TOP_CUSTOMERS: TopCustomer[] = [
  { id: 938, name: 'Hidráulica Coelho, Lda', orders: 9, revenue: 4820.5 },
  { id: 919, name: 'AgroRega Sul', orders: 7, revenue: 3910.0 },
  { id: 901, name: 'Quinta do Vale', orders: 6, revenue: 2740.9 },
  { id: 884, name: 'Rega Norte, Lda', orders: 5, revenue: 2180.0 },
  { id: 877, name: 'Vinhas do Douro, SA', orders: 4, revenue: 1985.4 },
  { id: 860, name: 'Câmara de Vagos', orders: 3, revenue: 1640.0 },
  { id: 845, name: 'Estufas do Oeste', orders: 4, revenue: 1390.75 },
  { id: 822, name: 'Hotel Mar Azul', orders: 3, revenue: 1120.0 },
  { id: 810, name: 'Bombas & Cia', orders: 3, revenue: 980.5 },
  { id: 799, name: 'Adega Cooperativa', orders: 2, revenue: 760.0 },
]

const GEOGRAPHY: GeoRegion[] = [
  { region: 'Porto', orders: 38, revenue: 8420.5 },
  { region: 'Lisboa', orders: 31, revenue: 7180.0 },
  { region: 'Aveiro', orders: 24, revenue: 5260.4 },
  { region: 'Braga', orders: 19, revenue: 3980.0 },
  { region: 'Coimbra', orders: 16, revenue: 3120.75 },
  { region: 'Leiria', orders: 12, revenue: 2340.0 },
  { region: 'Setúbal', orders: 10, revenue: 1980.9 },
  { region: 'Faro', orders: 8, revenue: 1540.0 },
  { region: 'Viseu', orders: 6, revenue: 1120.5 },
  { region: 'Évora', orders: 4, revenue: 760.0 },
]

export function mockTopCustomers(): TopCustomer[] {
  return TOP_CUSTOMERS
}

export function mockCustomerMix(): CustomerMix {
  return { newCustomers: 34, returning: 58 }
}

export function mockGeography(): GeoRegion[] {
  return GEOGRAPHY
}
