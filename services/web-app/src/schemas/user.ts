/**
 * Schemas de validação para usuários
 */
import { z } from "zod";

/**
 * Schema para validação do campo nome
 */
export const nameSchema = z
  .string()
  .min(2, "O nome deve ter no mínimo 2 caracteres")
  .max(100, "O nome deve ter no máximo 100 caracteres");

/**
 * Schema para validação do campo email
 */
export const emailSchema = z.string().email("Insira um email válido");

/**
 * Schema para validação de senha obrigatória (criação de usuário)
 */
export const passwordRequiredSchema = z
  .string()
  .min(6, "A senha deve ter no mínimo 6 caracteres")
  .max(50, "A senha deve ter no máximo 50 caracteres");

/**
 * Schema para validação de senha opcional (edição de usuário)
 * Permite string vazia ou senha com mínimo de 6 caracteres
 */
export const passwordOptionalSchema = z
  .string()
  .max(50, "A senha deve ter no máximo 50 caracteres")
  .refine(
    (val) => val === "" || val.length >= 6,
    "A senha deve ter no mínimo 6 caracteres"
  );

/**
 * Schema completo para criação de usuário
 */
export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordRequiredSchema,
  role: z.enum(["admin", "user"]),
});

/**
 * Schema completo para edição de usuário
 */
export const editUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordOptionalSchema,
  role: z.enum(["admin", "user"]),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type EditUserFormData = z.infer<typeof editUserSchema>;
