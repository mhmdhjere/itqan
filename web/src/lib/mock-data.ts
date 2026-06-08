import type {
  Ayah,
  AyahMasteryCell,
  Circle,
  MemorizationPlan,
  MistakeSubcategory,
  ReviewTarget,
  SessionListItem,
  SessionSummary,
  Student,
  SurahMasteryCell,
  SurahMeta,
  VerseStatusDefinition,
} from "./types";

export const teacherName = "Ustadh Ahmad";

export const circles: Circle[] = [
  {
    id: "circle-youth",
    name: "Youth Circle",
    description: "Advanced memorization for teens",
    studentCount: 4,
    lastSessionAt: "2026-06-08T06:30:00",
  },
  {
    id: "circle-fajr",
    name: "Fajr Circle",
    description: "Early morning review circle",
    studentCount: 6,
    lastSessionAt: "2026-06-07T05:15:00",
  },
  {
    id: "circle-advanced",
    name: "Advanced Memorization",
    description: "Hifz completion track",
    studentCount: 3,
    lastSessionAt: "2026-06-06T18:00:00",
  },
];

export const students: Student[] = [
  {
    id: "student-yusuf",
    circleId: "circle-youth",
    fullName: "Yusuf Hassan",
    contactInfo: "yusuf.parent@email.com",
    masteryPercent: 78,
    masteryTrend: 4,
    lastSessionAt: "2026-06-08T06:30:00",
    totalVerses: 1240,
    totalSessions: 48,
    commonMistake: "Madd",
  },
  {
    id: "student-amina",
    circleId: "circle-youth",
    fullName: "Amina Khalid",
    contactInfo: "amina.parent@email.com",
    masteryPercent: 91,
    masteryTrend: 2,
    lastSessionAt: "2026-06-08T07:00:00",
    totalVerses: 2100,
    totalSessions: 72,
    commonMistake: "Hesitation",
  },
  {
    id: "student-omar",
    circleId: "circle-youth",
    fullName: "Omar Faris",
    contactInfo: "omar.parent@email.com",
    masteryPercent: 65,
    masteryTrend: -3,
    lastSessionAt: "2026-06-05T16:00:00",
    totalVerses: 890,
    totalSessions: 31,
    commonMistake: "Forgotten word",
  },
  {
    id: "student-sara",
    circleId: "circle-youth",
    fullName: "Sara Noor",
    contactInfo: "sara.parent@email.com",
    masteryPercent: 84,
    masteryTrend: 1,
    lastSessionAt: "2026-06-07T17:30:00",
    totalVerses: 1560,
    totalSessions: 55,
    commonMistake: "Ghunnah",
  },
];

export const memorizationPlans: MemorizationPlan[] = [
  {
    studentId: "student-yusuf",
    currentSurah: 20,
    currentStartAyah: 57,
    currentEndAyah: 134,
    nextSurah: 20,
    nextStartAyah: 135,
    nextEndAyah: 200,
  },
  {
    studentId: "student-amina",
    currentSurah: 36,
    currentStartAyah: 1,
    currentEndAyah: 83,
    nextSurah: 37,
    nextStartAyah: 1,
    nextEndAyah: 182,
  },
  {
    studentId: "student-omar",
    currentSurah: 18,
    currentStartAyah: 1,
    currentEndAyah: 74,
    nextSurah: 18,
    nextStartAyah: 75,
    nextEndAyah: 110,
  },
  {
    studentId: "student-sara",
    currentSurah: 67,
    currentStartAyah: 1,
    currentEndAyah: 30,
    nextSurah: 68,
    nextStartAyah: 1,
    nextEndAyah: 52,
  },
];

export const reviewTargets: ReviewTarget[] = [
  {
    id: "rt-1",
    studentId: "student-yusuf",
    surah: 87,
    startAyah: 1,
    endAyah: 19,
    source: "manual",
  },
  {
    id: "rt-2",
    studentId: "student-yusuf",
    surah: 88,
    startAyah: 1,
    endAyah: 26,
    source: "manual",
  },
  {
    id: "rt-3",
    studentId: "student-yusuf",
    surah: 86,
    startAyah: 1,
    endAyah: 17,
    source: "algorithm",
  },
];

const namedSurahs: Record<number, { nameEn: string; nameAr: string; ayahCount: number }> = {
  1: { nameEn: "Al-Fatihah", nameAr: "الفاتحة", ayahCount: 7 },
  2: { nameEn: "Al-Baqarah", nameAr: "البقرة", ayahCount: 286 },
  4: { nameEn: "An-Nisa", nameAr: "النساء", ayahCount: 176 },
  18: { nameEn: "Al-Kahf", nameAr: "الكهف", ayahCount: 110 },
  20: { nameEn: "Taha", nameAr: "طه", ayahCount: 135 },
  36: { nameEn: "Ya-Sin", nameAr: "يس", ayahCount: 83 },
  67: { nameEn: "Al-Mulk", nameAr: "الملك", ayahCount: 30 },
  86: { nameEn: "At-Tariq", nameAr: "الطارق", ayahCount: 17 },
  87: { nameEn: "Al-A'la", nameAr: "الأعلى", ayahCount: 19 },
  88: { nameEn: "Al-Ghashiyah", nameAr: "الغاشية", ayahCount: 26 },
};

export const surahs: SurahMeta[] = Array.from({ length: 114 }, (_, i) => {
  const number = i + 1;
  const named = namedSurahs[number];
  return {
    number,
    nameEn: named?.nameEn ?? `Surah ${number}`,
    nameAr: named?.nameAr ?? `سورة ${number}`,
    ayahCount: named?.ayahCount ?? 20 + (number % 40),
  };
});

export const verseStatuses: VerseStatusDefinition[] = [
  {
    slug: "reminder_required",
    label: "Reminder",
    color: "#f59e0b",
    scorePoints: 85,
  },
  {
    slug: "second_attempt",
    label: "2nd Attempt",
    color: "#f97316",
    scorePoints: 70,
  },
  {
    slug: "third_attempt",
    label: "3rd Attempt",
    color: "#ef4444",
    scorePoints: 60,
  },
  {
    slug: "prompting_required",
    label: "Prompting",
    color: "#ef4444",
    scorePoints: 50,
  },
  {
    slug: "incomplete",
    label: "Incomplete",
    color: "#9f1239",
    scorePoints: 0,
  },
];

export const mistakeSubcategories: MistakeSubcategory[] = [
  { slug: "forgotten_word", label: "Forgotten word", category: "memorization" },
  { slug: "forgotten_verse", label: "Forgotten verse", category: "memorization" },
  {
    slug: "similar_verse_confusion",
    label: "Similar verse",
    category: "memorization",
  },
  { slug: "word_order", label: "Word order", category: "memorization" },
  { slug: "missing_phrase", label: "Missing phrase", category: "memorization" },
  { slug: "madd", label: "Madd", category: "tajweed" },
  { slug: "ghunnah", label: "Ghunnah", category: "tajweed" },
  { slug: "noon_meem_rules", label: "Noon/Meem", category: "tajweed" },
  { slug: "waqf_ibtida", label: "Waqf/Ibtida", category: "tajweed" },
  { slug: "pronunciation", label: "Pronunciation", category: "tajweed" },
  { slug: "articulation", label: "Articulation", category: "tajweed" },
  { slug: "hesitation", label: "Hesitation", category: "behavior" },
  { slug: "slow_recall", label: "Slow recall", category: "behavior" },
  {
    slug: "lack_of_confidence",
    label: "Low confidence",
    category: "behavior",
  },
  {
    slug: "loss_of_concentration",
    label: "Lost focus",
    category: "behavior",
  },
];

const tahaAyahs57to80: Record<number, string> = {
  57: "لَقَدْ جَاءَكُمْ رَسُولٌ مِّنْ أَنفُسِكُمْ عَزِيزٌ عَلَيْهِ مَا عَنِتُّمْ حَرِيصٌ عَلَيْكُمْ بِالْمُؤْمِنِينَ رَءُوفٌ رَّحِيمٌ",
  58: "فَإِن تَوَلَّوْا فَقُلْ حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
  59: "۞ فَإِن يَأْتِيَنَّكُم مِّنِّي هُدًى فَمَنِ اتَّبَعَ هُدَايَ فَلَا يَضِلُّ وَلَا يَشْقَىٰ",
  60: "وَمَنْ أَعْرَضَ عَن ذِكْرِي فَإِنَّ لَهُ مَعِيشَةً ضَنكًا وَنَحْشُرُهُ يَوْمَ الْقِيَامَةِ أَعْمَىٰ",
  61: "قَالَ رَبِّ لِمَ حَشَرْتَنِي أَعْمَىٰ وَقَدْ كُنتُ بَصِيرًا",
  62: "قَالَ كَذَٰلِكَ أَتَتْكَ آيَاتُنَا فَنَسِيتَهَا وَكَذَٰلِكَ الْيَوْمَ تُنسَىٰ",
  63: "وَكَذَٰلِكَ نَجْزِي مَنْ أَسْرَفَ وَلَمْ يُؤْمِن بِآيَاتِ رَبِّهِ وَلَعَذَابُ الْآخِرَةِ أَشَدُّ وَأَبْقَىٰ",
  64: "أَفَلَمْ يَهْدِ لَهُمْ كَمْ أَهْلَكْنَا قَبْلَهُم مِّنَ الْقُرُونِ يَمْشُونَ فِي مَسَاكِنِهِمْ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّأُولِي النُّهَىٰ",
  65: "وَمَا أَمَرْنَا إِلَّا لِعِبَادَةِ اللَّهِ مُخْلِصِينَ لَهُ الدِّينَ حُنَفَاءَ",
  66: "وَأَنْ أَقِيمُوا الصَّلَاةَ وَاتَّقُوهُ وَهُوَ الَّذِي إِلَيْهِ تُحْشَرُونَ",
  67: "وَمَا خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ وَمَا بَيْنَهُمَا إِلَّا بِالْحَقِّ وَلَكِنَّ أَكْثَرَهُمْ لَا يَعْلَمُونَ",
  68: "فَاصْبِرْ إِنَّ وَعْدَ اللَّهِ حَقٌّ فَلَا تَسْتَخِفَّنَّكَ الَّذِينَ لَا يُوقِنُونَ",
  69: "وَمَا أَنزَلْنَا عَلَيْكَ الْقُرْآنَ لِتَشْقَىٰ",
  70: "إِلَّا تَذْكِرَةً لِّمَن يَخْشَىٰ",
  71: "تَنزِيلًا مِّمَّنْ خَلَقَ الْأَرْضَ وَالسَّمَاوَاتِ الْعُلَى",
  72: "الرَّحْمَٰنُ عَلَى الْعَرْشِ اسْتَوَىٰ",
  73: "لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ وَمَا بَيْنَهُمَا وَمَا تَحْتَ الثَّرَىٰ",
  74: "وَإِن تَجْهَرْ بِالْقَوْلِ فَإِنَّهُ يَعْلَمُ السِّرَّ وَأَخْفَى",
  75: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ لَهُ الْأَسْمَاءُ الْحُسْنَىٰ",
  76: "وَهَلْ أَتَاكَ حَدِيثُ مُوسَىٰ",
  77: "إِذْ رَأَىٰ نَارًا فَقَالَ لِأَهْلِهِ امْكُثُوا إِنِّي آنَسْتُ نَارًا لَّعَلِّي آتِيكُم مِّنْهَا بِقَبَسٍ",
  78: "أَوْ أَجِدُ عَلَى النَّارِ هُدًى",
  79: "فَلَمَّا أَتَاهَا نُودِيَ يَا مُوسَىٰ",
  80: "إِنِّي أَنَا رَبُّكَ فَاخْلَعْ نَعْلَيْكَ إِنَّكَ بِالْوَادِ الْمُقَدَّسِ طُوًى",
};

export function getAyahsInRange(
  surah: number,
  start: number,
  end: number,
): Ayah[] {
  const ayahs: Ayah[] = [];
  for (let ayah = start; ayah <= end; ayah++) {
    const text =
      surah === 20 && tahaAyahs57to80[ayah]
        ? tahaAyahs57to80[ayah]
        : `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ — آية ${ayah} من سورة ${surah}`;
    ayahs.push({ surah, ayah, text });
  }
  return ayahs;
}

export const sessionHistory: SessionListItem[] = [
  {
    id: "session-1",
    studentId: "student-yusuf",
    date: "2026-06-08T06:30:00",
    surah: 20,
    startAyah: 45,
    endAyah: 60,
    masteryScore: 82,
    exceptionCount: 3,
  },
  {
    id: "session-2",
    studentId: "student-yusuf",
    date: "2026-06-06T06:30:00",
    surah: 20,
    startAyah: 30,
    endAyah: 44,
    masteryScore: 75,
    exceptionCount: 5,
  },
  {
    id: "session-3",
    studentId: "student-yusuf",
    date: "2026-06-04T06:30:00",
    surah: 20,
    startAyah: 15,
    endAyah: 29,
    masteryScore: 88,
    exceptionCount: 2,
  },
  {
    id: "session-4",
    studentId: "student-yusuf",
    date: "2026-06-02T06:30:00",
    surah: 87,
    startAyah: 1,
    endAyah: 19,
    masteryScore: 91,
    exceptionCount: 1,
  },
];

export const mockSessionSummary: SessionSummary = {
  id: "session-demo",
  studentId: "student-yusuf",
  surah: 20,
  startAyah: 57,
  endAyah: 80,
  startedAt: "2026-06-08T06:30:00",
  endedAt: "2026-06-08T06:42:00",
  durationMinutes: 12,
  versesRecited: 24,
  exceptionCount: 4,
  reminderCount: 1,
  secondAttemptCount: 1,
  promptingCount: 1,
  incompleteCount: 0,
  masteryScore: 82,
  mistakeBreakdown: [
    { category: "tajweed", percent: 60 },
    { category: "memorization", percent: 30 },
    { category: "behavior", percent: 10 },
  ],
  markedVerses: [
    { ayah: 62, status: "reminder_required", mistakes: [] },
    {
      ayah: 65,
      status: "second_attempt",
      mistakes: ["madd", "ghunnah"],
    },
    { ayah: 71, status: "second_attempt", mistakes: [] },
    { ayah: 74, status: "prompting_required", mistakes: ["hesitation"] },
  ],
};

export function getCircle(id: string) {
  return circles.find((c) => c.id === id);
}

export function getStudent(id: string) {
  return students.find((s) => s.id === id);
}

export function getStudentsByCircle(circleId: string) {
  return students.filter((s) => s.circleId === circleId);
}

export function getSurah(number: number) {
  return surahs.find((s) => s.number === number);
}

export function getPlan(studentId: string) {
  return memorizationPlans.find((p) => p.studentId === studentId);
}

export function getReviewTargets(studentId: string) {
  return reviewTargets.filter((r) => r.studentId === studentId);
}

export function getSessionsForStudent(studentId: string) {
  return sessionHistory.filter((s) => s.studentId === studentId);
}

export function formatSurahRange(
  surah: number,
  start: number,
  end: number,
): string {
  const meta = getSurah(surah);
  const name = meta?.nameEn ?? `Surah ${surah}`;
  return start === end ? `${name} (${start})` : `${name} (${start}–${end})`;
}

export function formatRelativeDate(iso: string) {
  const date = new Date(iso);
  const now = new Date("2026-06-08T12:00:00");
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

const masteryStates: Array<"memorized" | "needs_review" | "frequently_weak" | "not_recited"> = [
  "memorized",
  "needs_review",
  "frequently_weak",
  "not_recited",
];

export function getSurahMasteryMap(studentId: string): SurahMasteryCell[] {
  return Array.from({ length: 114 }, (_, i) => {
    const surah = i + 1;
    const seed = (surah * 17 + studentId.length * 3) % 100;
    let state = masteryStates[seed % 4];
    if (surah <= 30) state = seed > 20 ? "memorized" : "needs_review";
    if (surah > 100) state = "not_recited";
    if (studentId === "student-yusuf" && surah === 20) state = "needs_review";
    const score =
      state === "memorized"
        ? 90 + (seed % 10)
        : state === "needs_review"
          ? 70 + (seed % 15)
          : state === "frequently_weak"
            ? 40 + (seed % 20)
            : 0;
    return { surah, state, score };
  });
}

export function getAyahMasteryMap(
  studentId: string,
  surah: number,
): AyahMasteryCell[] {
  const meta = getSurah(surah);
  const count = meta?.ayahCount ?? 20;
  return Array.from({ length: count }, (_, i) => {
    const ayah = i + 1;
    const seed = (surah * ayah + studentId.length) % 100;
    let state = masteryStates[seed % 4];
    if (studentId === "student-yusuf" && surah === 20 && ayah >= 57 && ayah <= 80) {
      state = ayah % 5 === 0 ? "needs_review" : "memorized";
    }
    if (ayah > 100) state = "not_recited";
    return {
      ayah,
      state,
      score: state === "not_recited" ? 0 : 60 + (seed % 40),
      lastRecitedAt: state === "not_recited" ? null : "2026-06-05T06:00:00",
      topMistakes:
        state === "needs_review" || state === "frequently_weak"
          ? ["Madd", "Hesitation"]
          : [],
    };
  });
}

export const strongestWeakest = {
  strongest: [
    { surah: 87, name: "Al-A'la", score: 96 },
    { surah: 1, name: "Al-Fatihah", score: 100 },
    { surah: 36, name: "Ya-Sin", score: 94 },
  ],
  weakest: [
    { surah: 20, name: "Taha", score: 72 },
    { surah: 18, name: "Al-Kahf", score: 68 },
    { surah: 4, name: "An-Nisa", score: 65 },
  ],
};
