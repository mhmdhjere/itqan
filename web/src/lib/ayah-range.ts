export type AyahRangeInput = {
  surah: number;
  startAyah: number;
  endAyah: number;
};

export type AyahRangeValidationResult =
  | { valid: true; normalized: AyahRangeInput }
  | { valid: false; error: string };

export function validateAyahRange(
  input: AyahRangeInput,
  ayahCount: number,
): AyahRangeValidationResult {
  const { surah, startAyah, endAyah } = input;

  if (!Number.isInteger(surah) || surah < 1 || surah > 114) {
    return { valid: false, error: "Surah must be between 1 and 114" };
  }

  if (!Number.isInteger(startAyah) || startAyah < 1) {
    return { valid: false, error: "Start ayah must be at least 1" };
  }

  if (!Number.isInteger(endAyah) || endAyah < 1) {
    return { valid: false, error: "End ayah must be at least 1" };
  }

  if (startAyah > endAyah) {
    return { valid: false, error: "End ayah must be greater than or equal to start ayah" };
  }

  if (endAyah > ayahCount) {
    return {
      valid: false,
      error: `End ayah exceeds surah length (${ayahCount})`,
    };
  }

  return {
    valid: true,
    normalized: { surah, startAyah, endAyah },
  };
}

export function clampAyahRange(
  input: AyahRangeInput,
  ayahCount: number,
): AyahRangeInput {
  const start = Math.max(1, Math.min(input.startAyah, ayahCount));
  const end = Math.max(start, Math.min(input.endAyah, ayahCount));
  return { surah: input.surah, startAyah: start, endAyah: end };
}
