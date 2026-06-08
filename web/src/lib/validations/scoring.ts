import { z } from "zod";

export const scoringPreviewSchema = z.object({
  statusSlug: z.string().min(1).max(64),
  mistakes: z.array(z.string().max(64)).optional().default([]),
});
