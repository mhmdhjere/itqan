import { z } from "zod";

export const createNoteSchema = z.object({
  scope: z.enum(["verse", "session", "student"]),
  refId: z.string().uuid(),
  body: z.string().min(1).max(2000),
});
