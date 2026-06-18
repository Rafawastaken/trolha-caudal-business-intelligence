import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Proxy /kpi-api to the real Trolha Tracking API in dev so the browser talks to
// the same-origin path (avoids CORS, mirrors production where both are served
// under the same host). Set VITE_API_PROXY_TARGET in .env to point at it.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_PROXY_TARGET || 'https://www.trolha.pt'

  return {
    resolve: { tsconfigPaths: true },
    plugins: [tailwindcss(), react()],
    server: {
      proxy: {
        '/kpi-api': { target, changeOrigin: true, secure: false },
      },
    },
  }
})
