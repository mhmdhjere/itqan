export type ActiveVerseStatus = {
  slug: string;
  labelEn: string;
  labelAr: string | null;
  scorePoints: number;
  color: string;
  sortOrder: number;
  isDefaultImplicit: boolean;
};

export type ActiveMistakeCategory = {
  slug: string;
  labelEn: string;
  labelAr: string | null;
  sortOrder: number;
};

export type ActiveMistakeSubcategory = {
  slug: string;
  categorySlug: string;
  labelEn: string;
  labelAr: string | null;
  sortOrder: number;
};

export type ActiveConfig = {
  verseStatuses: ActiveVerseStatus[];
  mistakeCategories: ActiveMistakeCategory[];
  mistakeSubcategories: ActiveMistakeSubcategory[];
  config: {
    mastery: Record<string, number>;
    review: Record<string, number>;
    live: Record<string, string | number | boolean>;
    display: Record<string, string | number>;
    system: Record<string, number>;
    features: Record<string, boolean>;
  };
  cachedAt: string;
};
