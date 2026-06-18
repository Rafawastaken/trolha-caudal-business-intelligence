import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Vendored shadcn components co-export `*Variants` (cva) helpers, and our
    // context modules co-locate the Provider with its hook/constants — both are
    // accepted patterns. The fast-refresh rule is a DX-only nicety here.
    files: [
      'src/components/ui/**/*.{ts,tsx}',
      'src/lib/period.tsx',
      'src/lib/theme.tsx',
      'src/features/**/*-context.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
