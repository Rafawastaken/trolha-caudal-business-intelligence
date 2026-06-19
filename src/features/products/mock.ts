import type {
  Category,
  LowStockItem,
  TopProduct,
  Voucher,
} from './schemas'

// Dataset de demonstração determinístico (loja de bombas de água). O mesmo
// período/limiar produz sempre os mesmos resultados (sem flicker entre renders).

type SeedProduct = {
  id: number
  name: string
  category: string
  categoryId: number
  price: number
  sold: number
  stock: number
}

const CATALOG: SeedProduct[] = [
  { id: 120, name: 'Bomba submersível 1.5CV INOX', category: 'Bombas submersíveis', categoryId: 1, price: 289.9, sold: 42, stock: 12 },
  { id: 121, name: 'Eletrobomba autoescorvante 1CV', category: 'Bombas de superfície', categoryId: 2, price: 159.9, sold: 38, stock: 7 },
  { id: 122, name: 'Bomba periférica 0.5CV', category: 'Bombas de superfície', categoryId: 2, price: 74.9, sold: 64, stock: 3 },
  { id: 123, name: 'Depósito de pressão 100L', category: 'Depósitos & vasos', categoryId: 3, price: 199.0, sold: 21, stock: 9 },
  { id: 124, name: 'Vaso de expansão 24L', category: 'Depósitos & vasos', categoryId: 3, price: 49.9, sold: 33, stock: 0 },
  { id: 125, name: 'Bomba de superfície 1.5CV', category: 'Bombas de superfície', categoryId: 2, price: 219.0, sold: 27, stock: 5 },
  { id: 126, name: 'Pressostato regulável', category: 'Acessórios', categoryId: 4, price: 24.5, sold: 88, stock: 2 },
  { id: 127, name: 'Kit rega gota-a-gota', category: 'Rega', categoryId: 5, price: 39.9, sold: 51, stock: 18 },
  { id: 128, name: 'Bomba de drenagem 0.75CV', category: 'Bombas submersíveis', categoryId: 1, price: 129.9, sold: 30, stock: 4 },
  { id: 129, name: 'Controlador de nível', category: 'Acessórios', categoryId: 4, price: 42.0, sold: 24, stock: 1 },
  { id: 130, name: 'Mangueira reforçada 25m', category: 'Rega', categoryId: 5, price: 34.9, sold: 47, stock: 22 },
  { id: 131, name: 'Filtro de água 3/4"', category: 'Acessórios', categoryId: 4, price: 18.9, sold: 72, stock: -1 },
  { id: 132, name: 'Grupo hidropressor 1CV', category: 'Bombas de superfície', categoryId: 2, price: 349.0, sold: 14, stock: 6 },
  { id: 133, name: 'Bomba solar 0.5CV', category: 'Bombas submersíveis', categoryId: 1, price: 459.0, sold: 9, stock: 8 },
]

const TODAY = new Date()

export function mockTopProducts(): TopProduct[] {
  return CATALOG.map((p) => ({
    id: p.id,
    name: p.name,
    qty: p.sold,
    revenue: Math.round(p.sold * p.price * 100) / 100,
  }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
}

export function mockCategories(): Category[] {
  const map = new Map<number, Category>()
  for (const p of CATALOG) {
    const cur = map.get(p.categoryId) ?? {
      id: p.categoryId,
      name: p.category,
      qty: 0,
      revenue: 0,
    }
    cur.qty += p.sold
    cur.revenue += p.sold * p.price
    map.set(p.categoryId, cur)
  }
  return [...map.values()]
    .map((c) => ({ ...c, revenue: Math.round(c.revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue)
}

export function mockLowStock(threshold = 5): LowStockItem[] {
  return CATALOG.filter((p) => p.stock <= threshold)
    .map((p) => ({ id: p.id, name: p.name, quantity: p.stock }))
    .sort((a, b) => a.quantity - b.quantity)
}

export function mockVouchers(): Voucher[] {
  // Loja real sem cupões; damos alguns exemplos para preview do design.
  const seed = TODAY.getMonth()
  return [
    { code: 'VERAO10', uses: 12 + seed, discount: 348.5 },
    { code: 'PORTESGRATIS', uses: 7, discount: 48.3 },
    { code: 'CLIENTE5', uses: 4, discount: 96.0 },
  ]
}
