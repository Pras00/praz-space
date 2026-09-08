import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
  role: z.enum(["OWNER", "ADMIN", "CASHIER"]),
});

export const updateUserStatusSchema = z.object({
  userId: z.string().min(1, "ID Pengguna wajib diisi"),
  isActive: z.boolean(),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "ID Pengguna wajib diisi"),
  role: z.enum(["OWNER", "ADMIN", "CASHIER"]),
});

export const updateUserSchema = z.object({
  userId: z.string().min(1, "ID Pengguna wajib diisi"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["OWNER", "ADMIN", "CASHIER"]),
  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter")
    .optional()
    .or(z.literal("")),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
