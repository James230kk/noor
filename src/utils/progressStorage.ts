import { UserProgressState, ActivityLogItem } from '../types';

const STORAGE_KEY = 'nur_user_progress_v1';

export const INITIAL_PROGRESS: UserProgressState = {
  readSurahs: [],
  readAyahs: [],
  hadithReadCounts: {},
  tasbeehTotalCount: 0,
  istighfarTotalCount: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  dailyStreak: 1,
  activityHistory: []
};

export function getStoredProgress(): UserProgressState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return INITIAL_PROGRESS;
    const parsed = JSON.parse(saved);
    return {
      ...INITIAL_PROGRESS,
      ...parsed,
      readSurahs: parsed.readSurahs || [],
      readAyahs: parsed.readAyahs || [],
      hadithReadCounts: parsed.hadithReadCounts || {},
      activityHistory: parsed.activityHistory || []
    };
  } catch (e) {
    console.warn("Failed to load user progress state", e);
    return INITIAL_PROGRESS;
  }
}

export function saveStoredProgress(progress: UserProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn("Failed to save user progress state", e);
  }
}

export function logActivity(
  type: ActivityLogItem['type'],
  title: string,
  count?: number
): UserProgressState {
  const current = getStoredProgress();
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Update streak if active on a new day
  let newStreak = current.dailyStreak || 1;
  if (current.lastActiveDate) {
    const lastDate = new Date(current.lastActiveDate);
    const todayDate = new Date(todayStr);
    const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  const newItem: ActivityLogItem = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    date: new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    type,
    title,
    count
  };

  const updated: UserProgressState = {
    ...current,
    lastActiveDate: todayStr,
    dailyStreak: newStreak,
    activityHistory: [newItem, ...current.activityHistory].slice(0, 50) // keep last 50
  };

  saveStoredProgress(updated);
  return updated;
}

export function toggleSurahReadState(surahNumber: number, surahName: string): UserProgressState {
  const current = getStoredProgress();
  const isRead = current.readSurahs.includes(surahNumber);
  let updatedSurahs: number[];
  
  if (isRead) {
    updatedSurahs = current.readSurahs.filter(n => n !== surahNumber);
  } else {
    updatedSurahs = [...current.readSurahs, surahNumber];
    logActivity('quran', `Completed Surah ${surahName} (#${surahNumber})`);
  }

  const updated = {
    ...getStoredProgress(), // reload after logActivity
    readSurahs: updatedSurahs
  };
  saveStoredProgress(updated);
  return updated;
}

export function toggleAyahReadState(surahNumber: number, ayahNumberInSurah: number): UserProgressState {
  const current = getStoredProgress();
  const key = `${surahNumber}:${ayahNumberInSurah}`;
  const isRead = current.readAyahs.includes(key);
  let updatedAyahs: string[];

  if (isRead) {
    updatedAyahs = current.readAyahs.filter(k => k !== key);
  } else {
    updatedAyahs = [...current.readAyahs, key];
  }

  const updated = {
    ...current,
    readAyahs: updatedAyahs
  };
  saveStoredProgress(updated);
  return updated;
}

export function incrementHadithReadCount(hadithId: string, title: string): UserProgressState {
  const current = getStoredProgress();
  const existingCount = current.hadithReadCounts[hadithId] || 0;
  const newCount = existingCount + 1;

  const updatedCounts = {
    ...current.hadithReadCounts,
    [hadithId]: newCount
  };

  logActivity('hadith', `Read Hadith: ${title}`, newCount);

  const updated = {
    ...getStoredProgress(),
    hadithReadCounts: updatedCounts
  };
  saveStoredProgress(updated);
  return updated;
}

export function incrementTasbeehCount(countToAdd: number = 1, phraseName: string = 'Tasbeeh'): UserProgressState {
  const current = getStoredProgress();
  const newTotal = (current.tasbeehTotalCount || 0) + countToAdd;
  
  const isIstighfar = phraseName.toLowerCase().includes('istighfar') || phraseName.includes('أستغفر');
  const newIstighfar = isIstighfar 
    ? (current.istighfarTotalCount || 0) + countToAdd 
    : (current.istighfarTotalCount || 0);

  const updated = {
    ...current,
    tasbeehTotalCount: newTotal,
    istighfarTotalCount: newIstighfar
  };

  saveStoredProgress(updated);
  return updated;
}
