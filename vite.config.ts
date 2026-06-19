import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Proxy /kpi-api to the real Trolha Tracking API in dev so the browser talks to
// the same-origin path (avoids CORS, mirrors production where both are served
// under the same host). Set VITE_API_PROXY_TARGET in .env to point at it.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Apex host (sem `www`): `www.trolha.pt` faz 301 para `trolha.pt`, e o browser
  // ao seguir um 301 num POST converte-o em GET e descarta o body — partia o
  // login. `followRedirects` é um seguro extra caso a API redirecione no futuro.
  const target = env.VITE_API_PROXY_TARGET || 'https://trolha.pt'

  return {
    base: '/kpi/',
    resolve: { tsconfigPaths: true },
    plugins: [tailwindcss(), react()],
    server: {
      proxy: {
        '/kpi-api': {
          target,
          changeOrigin: true,
          secure: false,
          followRedirects: true,
        },
      },
    },
  }
})
