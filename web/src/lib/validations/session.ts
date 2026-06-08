import { z } from "zod";
import { validateAyahRange } from "@/lib/ayah-range";
import { getSurahMeta } from "@/lib/quran";

const passageSchema = z
  .object({
    surah: z.number().int().min(1).max(114),
    startAyah: z.number().int().min(1),
    endAyah: z.number().int().min(1),
  })
  .superRefine((data, ctx) => {
    try {
      const meta = getSurahMeta(data.surah);
      const result = validateAyahRange(data, meta.ayahCount);
      if (!result.valid) {
        ctx.addIssue({ code: "custom", message: result.error });
      }
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid surah" });
    }
  });

export const createSessionSchema = z.object({
  studentId: z.string().uuid(),
  passages: z.array(passageSchema).min(1),
});

export const verseUpdateSchema = z.object({
  surah: z.number().int().min(1).max(114),
  ayah: z.number().int().min(1),
  statusSlug: z.string().min(1).max(64),
  mistakes: z.array(z.string().max(64)).optional().default([]),
  note: z.string().max(2000).optional().nullable(),
});

export const batchVersesSchema = z.object({
  verses: z.array(verseUpdateSchema),
});

export const endSessionSchema = z.object({
  durationSeconds: z.number().int().min(0).optional(),
});
