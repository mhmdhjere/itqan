import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(255),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["teacher", "admin"]).default("teacher"),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    role: z.enum(["teacher", "admin"]).optional(),
    status: z.enum(["active", "suspended"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
