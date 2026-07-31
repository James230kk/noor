import React, { useState } from 'react';
import { ADHKAR_COLLECTION } from '../data/adhkarData';
import { DhikrItem } from '../types';
import { HeartHandshake, CheckCircle2, Sun, Moon, Bed, ShieldCheck, Sparkles, Check } from 'lucide-react';

interface AdhkarViewProps {
  language: 'en' | 'ar';
}

export const AdhkarView: React.FC<AdhkarViewProps> = ({ language }) => {
  const [activeCategory, setActiveCategory] = useState<'morning' | 'evening' | 'after_prayer' | 'sleep'>('morning');
  const [counts, setCounts] = useState<Record<string, number>>({});

  const filteredAdhkar = ADHKAR_COLLECTION.filter(a => a.category === activeCategory);

  const handleIncrement = (id: string, target: number) => {
    setCounts(prev => {
      const current = prev[id] || 0;
      if (current >= target) return prev;
      return { ...prev, [id]: current + 1 };
    });
  };

  const categories = [
    { id: 'morning', labelEn: 'Morning Adhkar', labelAr: 'أذكار الصباح', icon: <Sun className="w-4 h-4 text-amber-400" /> },
    { id: 'evening', labelEn: 'Evening Adhkar', labelAr: 'أذكار المساء', icon: <Moon className="w-4 h-4 text-emerald-400" /> },
    { id: 'after_prayer', labelEn: 'Post-Salah Adhkar', labelAr: 'أذكار بعد الصلاة', icon: <ShieldCheck className="w-4 h-4 text-amber-500" /> },
    { id: 'sleep', labelEn: 'Sleep Adhkar', labelAr: 'أذكار النوم', icon: <Bed className="w-4 h-4 text-emerald-300" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#3A4D39] text-[#F9F7F2] p-8 rounded-sm border border-[#3A4D39] shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-[#F9F7F2]/10 text-[#C5A059] px-3 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-[0.2em] border border-[#F9F7F2]/20">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Hisn Al-Muslim • حصن المسلم</span>
        </div>
        <h2 className="text-3xl font-serif text-[#F9F7F2]">Daily Adhkar & Supplications</h2>
        <p className="text-xs font-serif italic text-[#A8B5A3]">
          Recite authentic morning, evening, post-prayer, and bedtime dhikr with built-in repetition counters.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`p-4 rounded-sm font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
              activeCategory === cat.id
                ? 'bg-[#3A4D39] text-[#F9F7F2] border-[#C5A059] shadow-xs'
                : 'bg-[#FFFFFF] text-[#5C635A] border-[#E6E1D3] hover:border-[#C5A059]'
            }`}
          >
            {cat.icon}
            <span>{language === 'ar' ? cat.labelAr : cat.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Adhkar Items Grid */}
      <div className="space-y-4">
        {filteredAdhkar.map((item) => {
          const currentCount = counts[item.id] || 0;
          const isDone = currentCount >= item.targetCount;

          return (
            <div
              key={item.id}
              className={`p-6 rounded-sm border transition-all space-y-4 ${
                isDone
                  ? 'bg-[#F9F7F2] border-[#C5A059] opacity-90'
                  : 'bg-[#FFFFFF] text-[#2C332B] border-[#E6E1D3] shadow-xs hover:border-[#C5A059]/60'
              }`}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between text-xs border-b pb-3 border-[#E6E1D3]">
                <span className="font-serif font-bold text-[#3A4D39]">
                  Repeat Goal: {item.targetCount} time(s)
                </span>

                <button
                  onClick={() => handleIncrement(item.id, item.targetCount)}
                  className={`px-4 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${
                    isDone
                      ? 'bg-[#3A4D39] text-[#F9F7F2]'
                      : 'bg-[#C5A059] text-[#2C332B] hover:bg-[#C5A059]/90'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 text-[#C5A059]" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isDone ? 'Completed!' : `Count (${currentCount}/${item.targetCount})`}</span>
                </button>
              </div>

              {/* Arabic Dhikr */}
              <div className="font-arabic text-2xl sm:text-3xl leading-loose text-[#C5A059] bg-[#3A4D39] p-5 rounded-sm border border-[#3A4D39] text-right">
                {item.arabic}
              </div>

              {/* Transliteration & Translation */}
              <div className="space-y-2 text-sm text-[#2C332B]">
                <div className="font-serif text-[#3A4D39] font-bold">{item.transliteration}</div>
                <div className="font-serif italic text-[#5C635A]">"{item.translation}"</div>
              </div>

              {/* Spiritual Benefit / Hadith Reference */}
              {item.benefit && (
                <div className="p-4 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] text-xs text-[#3A4D39] font-serif">
                  <strong className="text-[#C5A059]">Reward / Protection:</strong> {item.benefit}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
