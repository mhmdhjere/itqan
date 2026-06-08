type ConfigCategory =
  | "mastery"
  | "review"
  | "live_session"
  | "display"
  | "feature_flags"
  | "system";

export type DefaultConfigEntry = {
  key: string;
  value: unknown;
  valueType: "number" | "string" | "boolean" | "json";
  category: ConfigCategory;
  label: string;
  description?: string;
};

export const defaultAppConfig: DefaultConfigEntry[] = [
  {
    key: "mastery.mistake_penalty",
    value: 5,
    valueType: "number",
    category: "mastery",
    label: "Mistake penalty",
    description: "Points deducted per mistake tag (floor at status base)",
  },
  {
    key: "mastery.rolling_window_sessions",
    value: 3,
    valueType: "number",
    category: "mastery",
    label: "Rolling window sessions",
    description: "Number of recent sessions used for per-ayah mastery average",
  },
  {
    key: "mastery.map.memorized_min_score",
    value: 90,
    valueType: "number",
    category: "mastery",
    label: "Memorized min score",
  },
  {
    key: "mastery.map.stale_days",
    value: 90,
    valueType: "number",
    category: "mastery",
    label: "Stale days",
    description: "Days since last recitation before ayah is considered stale",
  },
  {
    key: "mastery.map.weak_mistake_count",
    value: 3,
    valueType: "number",
    category: "mastery",
    label: "Weak mistake count",
    description: "Mistakes on same ayah within 30 days → frequently weak",
  },
  {
    key: "review.urgency_mistake_weight",
    value: 3,
    valueType: "number",
    category: "review",
    label: "Mistake urgency weight",
  },
  {
    key: "review.urgency_mastery_weight",
    value: 2,
    valueType: "number",
    category: "review",
    label: "Mastery urgency weight",
  },
  {
    key: "review.stale_day_divisor",
    value: 30,
    valueType: "number",
    category: "review",
    label: "Stale day divisor",
  },
  {
    key: "review.max_recommendations",
    value: 5,
    valueType: "number",
    category: "review",
    label: "Max recommendations",
  },
  {
    key: "live.tap_mode",
    value: "attempt_cycle",
    valueType: "string",
    category: "live_session",
    label: "Tap mode",
  },
  {
    key: "live.undo_depth",
    value: 10,
    valueType: "number",
    category: "live_session",
    label: "Undo depth",
  },
  {
    key: "live.auto_start_timer",
    value: true,
    valueType: "boolean",
    category: "live_session",
    label: "Auto-start timer",
  },
  {
    key: "display.quran_font",
    value: "amiri",
    valueType: "string",
    category: "display",
    label: "Quran font family",
  },
  {
    key: "display.quran_font_size",
    value: 28,
    valueType: "number",
    category: "display",
    label: "Quran font size (px)",
  },
  {
    key: "display.ayah_marker_style",
    value: "parens",
    valueType: "string",
    category: "display",
    label: "Ayah marker style",
  },
  {
    key: "system.session_immutability_hours",
    value: 48,
    valueType: "number",
    category: "system",
    label: "Session immutability window (hours)",
  },
  {
    key: "system.max_students_per_circle",
    value: 50,
    valueType: "number",
    category: "system",
    label: "Max students per circle",
  },
];

export const defaultFeatureFlags = [
  {
    key: "features.mastery_map",
    enabled: true,
    description: "Enable mastery map UI",
  },
  {
    key: "features.review_auto",
    enabled: true,
    description: "Enable algorithmic review suggestions",
  },
  {
    key: "features.offline_queue",
    enabled: false,
    description: "Queue session marks offline (future)",
  },
];

export const defaultVerseStatuses = [
  {
    slug: "correct",
    labelEn: "Correct",
    labelAr: "صحيح",
    scorePoints: 100,
    color: "#0d5c4b",
    sortOrder: 0,
    isDefaultImplicit: true,
  },
  {
    slug: "reminder_required",
    labelEn: "Reminder Required",
    labelAr: "تذكير",
    scorePoints: 85,
    color: "#f59e0b",
    sortOrder: 1,
    isDefaultImplicit: false,
  },
  {
    slug: "second_attempt",
    labelEn: "Second Attempt",
    labelAr: "المحاولة الثانية",
    scorePoints: 70,
    color: "#f97316",
    sortOrder: 2,
    isDefaultImplicit: false,
  },
  {
    slug: "third_attempt",
    labelEn: "Third Attempt",
    labelAr: "المحاولة الثالثة",
    scorePoints: 60,
    color: "#ef4444",
    sortOrder: 3,
    isDefaultImplicit: false,
  },
  {
    slug: "prompting_required",
    labelEn: "Prompting Required",
    labelAr: "تلميح",
    scorePoints: 50,
    color: "#dc2626",
    sortOrder: 4,
    isDefaultImplicit: false,
  },
  {
    slug: "incomplete",
    labelEn: "Incomplete",
    labelAr: "غير مكتمل",
    scorePoints: 0,
    color: "#9f1239",
    sortOrder: 5,
    isDefaultImplicit: false,
  },
];

export const defaultMistakeCategories = [
  { slug: "memorization", labelEn: "Memorization", labelAr: "حفظ", sortOrder: 0 },
  { slug: "tajweed", labelEn: "Tajweed", labelAr: "تجويد", sortOrder: 1 },
  { slug: "behavior", labelEn: "Behavior", labelAr: "سلوك", sortOrder: 2 },
];

export const defaultMistakeSubcategories = [
  { categorySlug: "memorization", slug: "forgotten_word", labelEn: "Forgotten word", sortOrder: 0 },
  { categorySlug: "memorization", slug: "forgotten_verse", labelEn: "Forgotten verse", sortOrder: 1 },
  { categorySlug: "memorization", slug: "similar_verse_confusion", labelEn: "Similar verse confusion", sortOrder: 2 },
  { categorySlug: "memorization", slug: "word_order", labelEn: "Word order", sortOrder: 3 },
  { categorySlug: "memorization", slug: "missing_phrase", labelEn: "Missing phrase", sortOrder: 4 },
  { categorySlug: "tajweed", slug: "madd", labelEn: "Madd", sortOrder: 0 },
  { categorySlug: "tajweed", slug: "ghunnah", labelEn: "Ghunnah", sortOrder: 1 },
  { categorySlug: "tajweed", slug: "noon_meem_rules", labelEn: "Noon/Meem rules", sortOrder: 2 },
  { categorySlug: "tajweed", slug: "waqf_ibtida", labelEn: "Waqf/Ibtida", sortOrder: 3 },
  { categorySlug: "tajweed", slug: "pronunciation", labelEn: "Pronunciation", sortOrder: 4 },
  { categorySlug: "tajweed", slug: "articulation", labelEn: "Articulation", sortOrder: 5 },
  { categorySlug: "behavior", slug: "hesitation", labelEn: "Hesitation", sortOrder: 0 },
  { categorySlug: "behavior", slug: "slow_recall", labelEn: "Slow recall", sortOrder: 1 },
  { categorySlug: "behavior", slug: "lack_of_confidence", labelEn: "Lack of confidence", sortOrder: 2 },
  { categorySlug: "behavior", slug: "loss_of_concentration", labelEn: "Loss of concentration", sortOrder: 3 },
];
