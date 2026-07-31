export interface IslamicEvent {
  title: string;
  arabicTitle: string;
  hijriMonth: number; // 1 to 12
  hijriDay: number;
  description: string;
  significance: string;
}

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    title: "Islamic New Year (1st Muharram)",
    arabicTitle: "رأس السنة الهجرية",
    hijriMonth: 1,
    hijriDay: 1,
    description: "Beginning of the Hijri year marking the Migration (Hijrah) of Prophet Muhammad (ﷺ) from Makkah to Madinah.",
    significance: "A time for reflection, gratitude, and setting spiritual goals for the new year."
  },
  {
    title: "Day of Ashura (10th Muharram)",
    arabicTitle: "يوم عاشوراء",
    hijriMonth: 1,
    hijriDay: 10,
    description: "The day Prophet Musa (Moses) and the Children of Israel were saved from Pharaoh.",
    significance: "Recommended sunnah fasting that expiates the sins of the preceding year."
  },
  {
    title: "Mawlid an-Nabi (12th Rabi' al-Awwal)",
    arabicTitle: "المولد النبوي الشريف",
    hijriMonth: 3,
    hijriDay: 12,
    description: "Commemoration of the birth of the final Prophet Muhammad (ﷺ).",
    significance: "Reciting Salawat, studying the Seerah (biography) of the Prophet, and sending peace upon him."
  },
  {
    title: "Isra and Mi'raj (27th Rajab)",
    arabicTitle: "الإسراء والمعراج",
    hijriMonth: 7,
    hijriDay: 27,
    description: "The miraculous Night Journey of the Prophet (ﷺ) from Makkah to Jerusalem and ascension to the heavens.",
    significance: "The 5 daily prayers were prescribed during this miraculous journey."
  },
  {
    title: "Mid-Sha'ban (15th Sha'ban)",
    arabicTitle: "نصف شعبان",
    hijriMonth: 8,
    hijriDay: 15,
    description: "Night of forgiveness and preparation for the holy month of Ramadan.",
    significance: "Increased voluntary prayer, supplication, and seeking Allah's mercy."
  },
  {
    title: "First Day of Ramadan (1st Ramadan)",
    arabicTitle: "أول أيام شهر رمضان المبارك",
    hijriMonth: 9,
    hijriDay: 1,
    description: "Beginning of the blessed month of obligatory fasting, Quranic recitation, and Tarawih prayers.",
    significance: "The month in which the Holy Quran was first revealed."
  },
  {
    title: "Laylat al-Qadr (Odd Nights of Last 10 Days of Ramadan)",
    arabicTitle: "ليلة القدر",
    hijriMonth: 9,
    hijriDay: 27,
    description: "The Night of Decree, better than a thousand months.",
    significance: "Angels descend, prayers are answered, and worship equals over 83 years of devotion."
  },
  {
    title: "Eid al-Fitr (1st Shawwal)",
    arabicTitle: "عيد الفطر المبارك",
    hijriMonth: 10,
    hijriDay: 1,
    description: "Celebration marking the conclusion of the holy month of Ramadan.",
    significance: "Festival of gratitude, community prayer, Takbeerat, and giving Zakat al-Fitr."
  },
  {
    title: "Day of Arafah (9th Dhul Hijjah)",
    arabicTitle: "يوم عرفة",
    hijriMonth: 12,
    hijriDay: 9,
    description: "The climax of the Hajj pilgrimage where pilgrims stand on Mount Arafah.",
    significance: "Fasting on this day for non-pilgrims expiates sins of the past year and the coming year."
  },
  {
    title: "Eid al-Adha (10th Dhul Hijjah)",
    arabicTitle: "عيد الأضحى المبارك",
    hijriMonth: 12,
    hijriDay: 10,
    description: "Feast of Sacrifice commemorating Prophet Ibrahim's unwavering devotion to Allah.",
    significance: "Eid prayers, Udhiyah/Qurbani sacrifice, sharing meat with the needy and loved ones."
  }
];

export const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhul Qi'dah", "Dhul Hijjah"
];

export const HIJRI_MONTHS_AR = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر",
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

// Basic approximation for Gregorian to Hijri
export function getHijriDate(date: Date = new Date()): { day: number; month: number; monthNameEn: string; monthNameAr: string; year: number } {
  try {
    // Intl.DateTimeFormat with islamic-umalqura calendar
    const formatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(date);
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '1446', 10);

    return {
      day,
      month,
      monthNameEn: HIJRI_MONTHS_EN[month - 1] || "Ramadan",
      monthNameAr: HIJRI_MONTHS_AR[month - 1] || "رمضان",
      year
    };
  } catch (e) {
    // Math fallback formula
    const gYear = date.getFullYear();
    const hYear = Math.round((gYear - 622) * (33 / 32));
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      monthNameEn: HIJRI_MONTHS_EN[date.getMonth()] || "Ramadan",
      monthNameAr: HIJRI_MONTHS_AR[date.getMonth()] || "رمضان",
      year: hYear
    };
  }
}
