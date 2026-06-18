import { z } from 'zod'

const schema = z.object({
  // Base URL for the Trolha Tracking API. Empty string => same-origin, so the
  // dev proxy (vite.config.ts) and production both resolve `/kpi-api/...`.
  VITE_API_URL: z.string().default(''),
  // Google AI (Gemini) key — the AI assistant calls the Generative Language
  // API directly from the browser (tool is login-gated, no backend proxy).
  VITE_GEMINI_API_KEY: z.string().default(''),
  // Model id for the assistant. Overridable per environment.
  VITE_GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  // When 'true', features serve mock data instead of hitting the API — lets the
  // UI/design be reviewed before the backend host is wired up.
  VITE_USE_MOCK: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
})

export const env = schema.parse(import.meta.env)
