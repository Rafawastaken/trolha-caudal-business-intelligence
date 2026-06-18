# Trolha Caudal — Business Intelligence

Business intelligence dashboard for **trolha.pt** (Nº1 em bombas). It turns the
store's data into a clear read of the business — conversion, traffic, orders,
products and customers — so the purchasing team can see where the money flows
and decide on real demand. The in-app product is branded **Pulse**.

> Status: **work in progress.** UI/UX and the data layer are in place (mock +
> live API wiring); some real-data mappings are still being finalised.

## Stack

- **Vite 8** · **React 19** · **TypeScript**
- **Tailwind CSS v4** · **shadcn/ui** (radix-ui, cva)
- **react-router-dom 7**
- **TanStack Query / Table** · **Zod 4**
- **Recharts 3** for charts
- **@google/genai** (Gemini) for the AI assistant
- Typography: Space Grotesk (display) + Inter (body)

## Project structure

Vertical-slice architecture (one folder per feature):

```
src/
  features/<feature>/   api · schemas · queries · components · pages · routes
  components/ui         shadcn components
  components/layout     app shell (sidebar, topbar, …)
  components/brand      wordmark / mark
  lib/                  api · tokens · period · theme · format · dates · …
  paths.ts · router.tsx · index.css
```

Implemented: **auth** (JWT login), **dashboard** (KPIs, funnel, trend),
**orders** (paginated list + filters, detail, payments/states/refunds).
Planned: products, customers, trends, AI chat, reports/export.

## API

Talks to the **Trolha Tracking API** (`/kpi-api`, JWT Bearer). The contract is in
[`docs/trolha.docs.json`](docs/trolha.docs.json). The dev server proxies
`/kpi-api` to `VITE_API_PROXY_TARGET`.

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_PROXY_TARGET (and VITE_GEMINI_API_KEY)
npm run dev            # http://localhost:3000
```

Set `VITE_USE_MOCK=true` in `.env` to preview the UI with mock data (no backend
required — log in with any credentials).

## Scripts

- `npm run dev` — dev server
- `npm run build` — typecheck + production build
- `npm run lint` — ESLint

---

Desenvolvido por [@Rafawastaken](https://github.com/Rafawastaken).
