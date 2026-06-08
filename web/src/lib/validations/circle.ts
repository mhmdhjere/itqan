import { z } from "zod";

export const createCircleSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  description: z.string().trim().max(2000).optional().nullable(),
});

export const updateCircleSchema = createCircleSchema.partial().refine(
  (data) => data.name !== undefined || data.description !== undefined,
  { message: "At least one field is required" },
);
