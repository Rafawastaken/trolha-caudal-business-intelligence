import { createElement, lazy, type ComponentType, type ReactElement } from 'react'

// Helper para code-splitting por rota. Evita declarar um componente a nível de
// módulo nos ficheiros `routes.tsx` (que exportam o array de rotas), o que
// dispararia o aviso react-refresh/only-export-components. A suspensão é
// apanhada pelo <Suspense> do layout.
export function lazyRoute(
  importer: () => Promise<{ default: ComponentType }>,
): ReactElement {
  return createElement(lazy(importer))
}
