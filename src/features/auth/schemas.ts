import { z } from 'zod'

// Funcionário autenticado. Os docs só garantem `data.employee` sem detalhar
// campos — mantemos um schema tolerante (passthrough) e tipamos o que usamos.
export const employeeSchema = z
  .object({
    id: z.union([z.number(), z.string()]).optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    role: z.string().optional(),
  })
  .passthrough()

export type Employee = z.infer<typeof employeeSchema>

// Resposta de POST /kpi-api/login (já desembrulhada do envelope `data`).
export const loginResponseSchema = z.object({
  token: z.string(),
  token_type: z.string().default('Bearer'),
  expires_in: z.number().default(28800),
  employee: employeeSchema,
})

export type LoginResponse = z.infer<typeof loginResponseSchema>

export const loginInputSchema = z.object({
  email: z.string().min(1, 'Indica o email').email('Email inválido'),
  password: z.string().min(1, 'Indica a password'),
})

export type LoginInput = z.infer<typeof loginInputSchema>
