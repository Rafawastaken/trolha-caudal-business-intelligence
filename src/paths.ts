// Fonte única de verdade das URLs de navegação.
//
// - Usa `paths` em `<Link to={...}>`, `navigate(...)`, redirects.
// - Os padrões de rota em `features/<nome>/routes.tsx` usam strings literais
//   (ex.: `'orders/:id'`) porque são sintaxe específica do React Router —
//   ficam acopladas ao sítio onde as rotas são declaradas.
export const paths = {
  home: '/',
  login: '/login',

  dashboard: '/',

  orders: {
    list: '/orders',
    view: (id: string | number) => `/orders/${id}`,
  },

  products: '/products',
  customers: '/customers',
  trends: '/trends',
  reports: '/reports',
  settings: '/settings',
} as const
