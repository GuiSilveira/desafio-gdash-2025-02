/**
 * Schemas de validação para autenticação
 */
import { z } from "zod";

/**
 * Schema para validação do formulário de login
 */
export const loginSchema = z.object({
  email: z.email("Insira um email válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
