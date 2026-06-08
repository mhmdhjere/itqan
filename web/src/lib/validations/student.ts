import { z } from "zod";

export const createStudentSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(255),
  contactInfo: z.string().trim().max(255).optional().nullable(),
});

export const updateStudentSchema = z
  .object({
    fullName: z.string().trim().min(1).max(255).optional(),
    contactInfo: z.string().trim().max(255).optional().nullable(),
    archived: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.fullName !== undefined ||
      data.contactInfo !== undefined ||
      data.archived !== undefined,
    { message: "At least one field is required" },
  );
