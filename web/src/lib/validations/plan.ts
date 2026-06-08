import { z } from "zod";
import { validateAyahRange } from "@/lib/ayah-range";
import { getSurahMeta } from "@/lib/quran";

const ayahRangeFields = z.object({
  surah: z.number().int().min(1).max(114),
  startAyah: z.number().int().min(1),
  endAyah: z.number().int().min(1),
});

export const memorizationPlanSchema = z
  .object({
    currentSurah: z.number().int().min(1).max(114),
    currentStartAyah: z.number().int().min(1),
    currentEndAyah: z.number().int().min(1),
    nextSurah: z.number().int().min(1).max(114),
    nextStartAyah: z.number().int().min(1),
    nextEndAyah: z.number().int().min(1),
  })
  .superRefine((data, ctx) => {
    const ranges = [
      {
        path: "current",
        input: {
          surah: data.currentSurah,
          startAyah: data.currentStartAyah,
          endAyah: data.currentEndAyah,
        },
      },
      {
        path: "next",
        input: {
          surah: data.nextSurah,
          startAyah: data.nextStartAyah,
          endAyah: data.nextEndAyah,
        },
      },
    ];

    for (const range of ranges) {
      try {
        const meta = getSurahMeta(range.input.surah);
        const result = validateAyahRange(range.input, meta.ayahCount);
        if (!result.valid) {
          ctx.addIssue({
            code: "custom",
            message: `${range.path}: ${result.error}`,
          });
        }
      } catch {
        ctx.addIssue({
          code: "custom",
          message: `${range.path}: Invalid surah`,
        });
      }
    }
  });

export const reviewTargetSchema = ayahRangeFields.superRefine((data, ctx) => {
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
