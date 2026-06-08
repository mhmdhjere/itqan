import { z } from "zod";

const slugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z][a-z0-9_]*$/, "Slug must be lowercase letters, numbers, underscores");

export const createMistakeCategorySchema = z.object({
  slug: slugSchema,
  labelEn: z.string().trim().min(1).max(128),
  labelAr: z.string().trim().max(128).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateMistakeCategorySchema = z
  .object({
    labelEn: z.string().trim().min(1).max(128).optional(),
    labelAr: z.string().trim().max(128).optional().nullable(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const createMistakeSubcategorySchema = z.object({
  categoryId: z.string().uuid(),
  slug: slugSchema,
  labelEn: z.string().trim().min(1).max(128),
  labelAr: z.string().trim().max(128).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateMistakeSubcategorySchema = z
  .object({
    labelEn: z.string().trim().min(1).max(128).optional(),
    labelAr: z.string().trim().max(128).optional().nullable(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
