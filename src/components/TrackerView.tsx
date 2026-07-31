import React, { useState, useEffect } from 'react';
import { SURAH_LIST } from '../data/quranData';
import { HADITH_COLLECTION } from '../data/hadithData';
import { UserProgressState } from '../types';
import { 
  getStoredProgress, 
  toggleSurahReadState, 
  incrementHadithReadCount, 
  incrementTasbeehCount,
  saveStoredProgress,
  logActivity
} from '../utils/progressStorage';
import { 
  BarChart3, 
  CheckCircle2, 
  Flame, 
  BookOpen, 
  BookMarked, 
  Sparkles, 
  HeartHandshake, 
  History, 
  Plus, 
  RotateCcw, 
  Search, 
  Award,
  Calendar,
  Check,
  TrendingUp,
  Layers
} from 'lucide-react';

interface TrackerViewProps {
  setActiveTab?: (tab: any) => void;
}

export const TrackerView: React.FC<TrackerViewProps> = () => {
  const [progress, setProgress] = useState<UserProgressState>(getStoredProgress());
  const [surahTab, setSurahTab] = useState<'all' | 'completed' | 'unread'>('all');
  const [surahFilterQuery, setSurahFilterQuery] = useState<string>('');

  // Quick Tasbeeh/Istighfar counter state inside tracker
  const [quickCounter, setQuickCounter] = useState<number>(0);
  const [selectedDhikr, setSelectedDhikr] = useState<'istighfar' | 'subhanallah' | 'alhamdulillah' | 'allahuakbar'>('istighfar');

  // Reload progress periodically or on window focus
  useEffect(() => {
    const handleFocus = () => setProgress(getStoredProgress());
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleToggleSurah = (surahNum: number, surahName: string) => {
    const updated = toggleSurahReadState(surahNum, surahName);
    setProgress(updated);
  };

  const handleLogHadithRead = (hadithId: string, title: string) => {
    const updated = incrementHadithReadCount(hadithId, title);
    setProgress(updated);
  };

  const handleAddQuickDhikr = (count: number) => {
    const labels = {
      istighfar: 'Istighfar (أستغفر الله)',
      subhanallah: 'SubhanAllah (سبحان الله)',
      alhamdulillah: 'Alhamdulillah (الحمد لله)',
      allahuakbar: 'Allahu Akbar (الله أكبر)'
    };
    
    incrementTasbeehCount(count, labels[selectedDhikr]);
    logActivity('tasbeeh', `Recited ${count}x ${labels[selectedDhikr]}`);
    setProgress(getStoredProgress());
    setQuickCounter(0);
  };

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset your progress tracker history?")) {
      const resetState: UserProgressState = {
        readSurahs: [],
        readAyahs: [],
        hadithReadCounts: {},
        tasbeehTotalCount: 0,
        istighfarTotalCount: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        dailyStreak: 1,
        activityHistory: []
      };
      saveStoredProgress(resetState);
      setProgress(resetState);
    }
  };

  // Filter Surahs
  const filteredSurahs = SURAH_LIST.filter(s => {
    const isCompleted = progress.readSurahs.includes(s.number);
    if (surahTab === 'completed' && !isCompleted) return false;
    if (surahTab === 'unread' && isCompleted) return false;

    if (surahFilterQuery) {
      const q = surahFilterQuery.toLowerCase();
      return (
        s.name.includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.number.toString() === q
      );
    }
    return true;
  });

  const quranCompletionPercent = ((progress.readSurahs.length / 114) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#3A4D39] text-[#F9F7F2] p-8 rounded-sm border border-[#3A4D39] shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-[#F9F7F2]/10 text-[#C5A059] px-3 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-[0.2em] border border-[#F9F7F2]/20">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>User Progress & Spiritual Dashboard • متابعة الإنجاز والعبادات</span>
        </div>
        <h2 className="text-3xl font-serif text-[#F9F7F2]">Personal Progress Tracker</h2>
        <p className="text-xs font-serif italic text-[#A8B5A3]">
          Log Quran completion, Hadith study counts, Tasbeeh & Istighfar routines over time.
        </p>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak & Consistency */}
        <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#E6E1D3] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-serif text-[#8C8474]">
            <span className="uppercase tracking-wider font-semibold">Daily Active Streak</span>
            <Flame className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="flex items-baseline gap-2">
            <strong className="text-3xl font-serif text-[#3A4D39]">{progress.dailyStreak || 1}</strong>
            <span className="text-xs font-serif text-[#8C8474]">Days Active</span>
          </div>
          <p className="text-[11px] font-serif text-[#5C635A]">
            Last active: {progress.lastActiveDate || 'Today'}
          </p>
        </div>

        {/* Quran Progress */}
        <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#E6E1D3] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-serif text-[#8C8474]">
            <span className="uppercase tracking-wider font-semibold">Quran Completion</span>
            <BookOpen className="w-4 h-4 text-[#3A4D39]" />
          </div>
          <div className="flex items-baseline gap-2">
            <strong className="text-3xl font-serif text-[#3A4D39]">{progress.readSurahs.length}</strong>
            <span className="text-xs font-serif text-[#8C8474]">/ 114 Surahs ({quranCompletionPercent}%)</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#F9F7F2] h-2 rounded-full overflow-hidden border border-[#E6E1D3]">
            <div 
              className="bg-[#3A4D39] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(2, (progress.readSurahs.length / 114) * 100))}%` }}
            />
          </div>
        </div>

        {/* Hadith Readings Logged */}
        <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#E6E1D3] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-serif text-[#8C8474]">
            <span className="uppercase tracking-wider font-semibold">Hadith Readings Log</span>
            <BookMarked className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="flex items-baseline gap-2">
            <strong className="text-3xl font-serif text-[#3A4D39]">
              {Object.keys(progress.hadithReadCounts || {}).length}
            </strong>
            <span className="text-xs font-serif text-[#8C8474]">Unique Hadiths Read</span>
          </div>
          <p className="text-[11px] font-serif text-[#5C635A]">
            Total Read Sessions: {Object.values(progress.hadithReadCounts || {}).reduce((a: number, b: number) => a + b, 0)}
          </p>
        </div>

        {/* Tasbeeh & Istighfar */}
        <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#E6E1D3] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-serif text-[#8C8474]">
            <span className="uppercase tracking-wider font-semibold">Total Tasbeeh & Istighfar</span>
            <Sparkles className="w-4 h-4 text-[#3A4D39]" />
          </div>
          <div className="flex items-baseline gap-2">
            <strong className="text-3xl font-serif text-[#3A4D39]">
              {(progress.tasbeehTotalCount || 0).toLocaleString()}
            </strong>
            <span className="text-xs font-serif text-[#8C8474]">Counts</span>
          </div>
          <p className="text-[11px] font-serif text-[#5C635A]">
            Istighfar Total: <strong>{(progress.istighfarTotalCount || 0).toLocaleString()}</strong>
          </p>
        </div>
      </div>

      {/* Main Grid: Quran Tracker & Hadith/Dhikr Loggers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Quran Surahs Checklist */}
        <div className="lg:col-span-2 bg-[#FFFFFF] p-6 rounded-sm border border-[#E6E1D3] shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-[#E6E1D3]">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#3A4D39] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#C5A059]" />
                <span>Quran Chapters Tracker (114 Surahs)</span>
              </h3>
              <p className="text-xs text-[#8C8474] font-serif">
                Mark completed Surahs as you progress through your recitation or Khatm.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {(['all', 'completed', 'unread'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSurahTab(tab)}
                  className={`px-3 py-1 rounded-sm text-xs font-serif font-semibold uppercase tracking-wider ${
                    surahTab === tab
                      ? 'bg-[#3A4D39] text-[#F9F7F2]'
                      : 'bg-[#F9F7F2] text-[#5C635A] border border-[#E6E1D3]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Search Surah */}
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8C8474]" />
            <input
              type="text"
              placeholder="Filter Surahs by name or number..."
              value={surahFilterQuery}
              onChange={(e) => setSurahFilterQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-xs font-serif focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Surahs Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[480px] overflow-y-auto pr-1">
            {filteredSurahs.map((surah) => {
              const isDone = progress.readSurahs.includes(surah.number);
              return (
                <div
                  key={surah.number}
                  onClick={() => handleToggleSurah(surah.number, surah.englishName)}
                  className={`p-3 rounded-sm border cursor-pointer transition-all flex items-center justify-between ${
                    isDone
                      ? 'bg-[#3A4D39]/10 border-[#3A4D39]'
                      : 'bg-[#F9F7F2] border-[#E6E1D3] hover:border-[#C5A059]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-sans font-bold text-[#8C8474] w-6">
                      #{surah.number}
                    </span>
                    <div>
                      <div className="text-xs font-serif font-bold text-[#3A4D39]">
                        {surah.englishName}
                      </div>
                      <div className="text-[10px] font-arabic text-[#C5A059]">
                        {surah.name} ({surah.numberOfAyahs} v.)
                      </div>
                    </div>
                  </div>

                  <div className={`p-1 rounded-sm ${isDone ? 'bg-[#3A4D39] text-[#F9F7F2]' : 'text-[#8C8474]'}`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Quick Dhikr Logger & Hadith Tracker & Activity History */}
        <div className="space-y-6">
          {/* Quick Dhikr / Istighfar Interactive Logger */}
          <div className="bg-[#FFFFFF] p-6 rounded-sm border border-[#E6E1D3] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#3A4D39] flex items-center gap-2 border-b pb-2 border-[#E6E1D3]">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>Quick Tasbeeh & Istighfar Logger</span>
            </h3>

            <div>
              <label className="block text-[11px] font-serif text-[#8C8474] mb-1 uppercase tracking-wider">
                Select Dhikr Phrase
              </label>
              <select
                value={selectedDhikr}
                onChange={(e) => setSelectedDhikr(e.target.value as any)}
                className="w-full p-2 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-xs font-serif text-[#2C332B]"
              >
                <option value="istighfar">Astaghfirullah (أَسْتَغْفِرُ اللَّهَ)</option>
                <option value="subhanallah">SubhanAllah (سُبْحَانَ اللَّهِ)</option>
                <option value="alhamdulillah">Alhamdulillah (الْحَمْدُ لِلَّهِ)</option>
                <option value="allahuakbar">Allahu Akbar (اللَّهُ أَكْبَرُ)</option>
              </select>
            </div>

            {/* Counter Preset Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-serif text-[#8C8474] block">Log Preset Counts:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAddQuickDhikr(33)}
                  className="py-2 rounded-sm bg-[#3A4D39] text-[#F9F7F2] text-xs font-serif font-bold hover:bg-[#3A4D39]/90"
                >
                  +33 Counts
                </button>
                <button
                  onClick={() => handleAddQuickDhikr(100)}
                  className="py-2 rounded-sm bg-[#3A4D39] text-[#F9F7F2] text-xs font-serif font-bold hover:bg-[#3A4D39]/90"
                >
                  +100 Counts
                </button>
                <button
                  onClick={() => handleAddQuickDhikr(500)}
                  className="py-2 rounded-sm bg-[#3A4D39] text-[#F9F7F2] text-xs font-serif font-bold hover:bg-[#3A4D39]/90"
                >
                  +500 Counts
                </button>
              </div>
            </div>
          </div>

          {/* Hadiths Study Log */}
          <div className="bg-[#FFFFFF] p-6 rounded-sm border border-[#E6E1D3] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#3A4D39] flex items-center gap-2 border-b pb-2 border-[#E6E1D3]">
              <BookMarked className="w-4 h-4 text-[#C5A059]" />
              <span>Hadith Collection Readings</span>
            </h3>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {HADITH_COLLECTION.slice(0, 8).map((hadith) => {
                const count = progress.hadithReadCounts[hadith.id] || 0;
                return (
                  <div
                    key={hadith.id}
                    className="p-3 bg-[#F9F7F2] rounded-sm border border-[#E6E1D3] flex items-center justify-between text-xs font-serif"
                  >
                    <div className="truncate max-w-[180px]">
                      <div className="font-bold text-[#3A4D39] truncate">{hadith.title}</div>
                      <div className="text-[10px] text-[#8C8474]">{hadith.narrator}</div>
                    </div>

                    <button
                      onClick={() => handleLogHadithRead(hadith.id, hadith.title)}
                      className="px-2.5 py-1 rounded-sm bg-[#3A4D39] text-[#F9F7F2] text-[10px] font-serif font-bold hover:bg-[#3A4D39]/90 shrink-0"
                    >
                      +1 Read ({count})
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-[#FFFFFF] p-6 rounded-sm border border-[#E6E1D3] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2 border-[#E6E1D3]">
              <h3 className="font-serif font-bold text-base text-[#3A4D39] flex items-center gap-2">
                <History className="w-4 h-4 text-[#C5A059]" />
                <span>Recent Activity Feed</span>
              </h3>

              {progress.activityHistory.length > 0 && (
                <button
                  onClick={handleResetProgress}
                  className="text-[10px] font-serif text-red-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Tracker
                </button>
              )}
            </div>

            {progress.activityHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#8C8474] font-serif italic">
                No activity logged yet. Start reading Quran or Hadith to populate your timeline!
              </div>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {progress.activityHistory.slice(0, 10).map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs font-serif">
                    <span className="w-2 h-2 rounded-full bg-[#C5A059] mt-1.5 shrink-0" />
                    <div>
                      <div className="text-[#3A4D39] font-medium">{act.title}</div>
                      <div className="text-[10px] text-[#8C8474]">{act.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
