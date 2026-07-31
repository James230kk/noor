export type ToolTab = 
  | 'prayer' 
  | 'quran' 
  | 'hadith' 
  | 'search'
  | 'tracker'
  | 'tasbeeh' 
  | 'adhkar' 
  | 'qibla' 
  | 'zakat' 
  | 'inheritance' 
  | 'names' 
  | 'calendar';

export interface ActivityLogItem {
  id: string;
  date: string; // ISO string or short time string
  type: 'quran' | 'hadith' | 'tasbeeh' | 'istighfar';
  title: string;
  count?: number;
}

export interface UserProgressState {
  readSurahs: number[]; // Array of surah numbers completed
  readAyahs: string[]; // Format: "surahNum:ayahNum" e.g. "1:1", "1:2"
  hadithReadCounts: Record<string, number>; // Map of hadithId -> count
  tasbeehTotalCount: number;
  istighfarTotalCount: number;
  lastActiveDate: string;
  dailyStreak: number;
  activityHistory: ActivityLogItem[];
}

export interface LocationState {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  isAuto: boolean;
}

export interface PrayerTime {
  name: string;
  arabicName: string;
  time: string; // "05:15"
  date: Date;
  isNext?: boolean;
  isCurrent?: boolean;
}

export interface SurahMeta {
  number: number;
  name: string; // Arabic name e.g. "الفاتحة"
  englishName: string; // e.g. "Al-Fatiha"
  englishNameTranslation: string; // e.g. "The Opening"
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string; // Arabic text
  translation?: string; // English translation
  transliteration?: string;
  juz?: number;
  page?: number;
  audioUrl?: string;
  tafseerText?: string;
}

export interface Hadith {
  id: string;
  collection: 'nawawi40' | 'bukhari' | 'muslim' | 'riyad';
  number: number;
  title: string;
  titleArabic: string;
  arabicText: string;
  englishText: string;
  narrator: string;
  category: string;
  explanation?: string;
}

export interface DhikrItem {
  id: string;
  category: 'morning' | 'evening' | 'after_prayer' | 'sleep' | 'general';
  arabic: string;
  transliteration: string;
  translation: string;
  benefit?: string;
  targetCount: number;
  currentCount?: number;
}

export interface NameOfAllah {
  number: number;
  nameArabic: string;
  transliteration: string;
  meaning: string;
  explanation: string;
}

export interface HeirInput {
  husband: boolean;
  wifeCount: number; // 0, 1, 2, 3, 4
  father: boolean;
  mother: boolean;
  sons: number;
  daughters: number;
  paternalGrandfather: boolean;
  paternalGrandmother: boolean;
  maternalGrandmother: boolean;
  fullBrothers: number;
  fullSisters: number;
  paternalBrothers: number;
  paternalSisters: number;
  maternalBrothersSisters: number; // Akh li-Umm / Ukht li-Umm
}

export interface HeirResult {
  name: string;
  arabicName: string;
  shareFraction: string;
  shareDecimal: number;
  amount: number;
  notes: string;
  quranicEvidence?: string;
}

export interface InheritanceCalculationResult {
  grossEstate: number;
  netEstate: number;
  funeralExpenses: number;
  debts: number;
  bequests: number;
  heirs: HeirResult[];
  awlFactor?: number;
  raddFactor?: number;
  explanation: string;
}

export interface ZakatInputs {
  cashOnHand: number;
  cashInBank: number;
  goldGram24k: number;
  goldGram22k: number;
  goldGram21k: number;
  goldGram18k: number;
  silverGrams: number;
  stocksCrypto: number;
  businessGoods: number;
  receivables: number;
  shortTermDebts: number;
  goldPricePerGram24k: number;
  silverPricePerGram: number;
}

export interface BookmarkAyah {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  date: string;
}

export interface UserSettings {
  theme: 'emerald' | 'dark' | 'sepia';
  arabicFont: 'Amiri' | 'Scheherazade New' | 'Traditional';
  arabicFontSize: number;
  reciter: string;
  calculationMethod: string;
  asrJuristic: 'shafi' | 'hanafi';
  adhanSoundEnabled: boolean;
  translation: 'saheeh' | 'clearquran' | 'yusufali';
}
