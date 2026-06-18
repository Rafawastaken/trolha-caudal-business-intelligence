import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/features/auth/auth-context'
import { PeriodProvider } from '@/lib/period'
import { queryClient } from '@/lib/query'
import { ThemeProvider } from '@/lib/theme'
import { router } from '@/router'
import '@/index.css'

const root = document.getElementById('root')
if (!root) throw new Error('#root not found')

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PeriodProvider>
            <RouterProvider router={router} />
            <Toaster richColors position="top-right" />
            <ReactQueryDevtools initialIsOpen={false} />
          </PeriodProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
