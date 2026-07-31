import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, Plus, Target, Volume2, VolumeX, Award } from 'lucide-react';
import { incrementTasbeehCount } from '../utils/progressStorage';

interface DhikrPreset {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  target: number;
}

const PRESETS: DhikrPreset[] = [
  { id: 'subhanallah', arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'SubhanAllah', translation: 'Glory be to Allah', target: 33 },
  { id: 'alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', translation: 'Praise be to Allah', target: 33 },
  { id: 'allahuakbar', arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', translation: 'Allah is Most Great', target: 34 },
  { id: 'tahlil', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', transliteration: 'La ilaha illallah', translation: 'There is no deity except Allah', target: 100 },
  { id: 'istighfar', arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', transliteration: 'Astaghfirullah wa atubu ilayh', translation: 'I seek forgiveness from Allah and repent', target: 100 },
  { id: 'salawat', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ', transliteration: 'Allahumma salli \'ala Muhammad', translation: 'O Allah, send blessings upon Muhammad', target: 100 },
  { id: 'hawqala', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration: 'La hawla wa la quwwata illa billah', translation: 'There is no power nor strength except with Allah', target: 33 }
];

export const TasbeehView: React.FC = () => {
  const [activePreset, setActivePreset] = useState<DhikrPreset>(PRESETS[0]);
  const [count, setCount] = useState<number>(0);
  const [totalToday, setTotalToday] = useState<number>(() => {
    return parseInt(localStorage.getItem('tasbeeh_total_today') || '0', 10);
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(true);
  const [targetCount, setTargetCount] = useState<number>(33);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem('tasbeeh_total_today', totalToday.toString());
  }, [totalToday]);

  const playClickAudio = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      // ignore
    }
  };

  const handleIncrement = () => {
    playClickAudio();

    if (vibrateEnabled && navigator.vibrate) {
      navigator.vibrate(20);
    }

    const nextVal = count + 1;
    setCount(nextVal);
    setTotalToday(prev => prev + 1);
    incrementTasbeehCount(1, activePreset.transliteration);

    // Target reached check
    if (nextVal >= targetCount) {
      setCyclesCompleted(prev => prev + 1);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      setCount(0); // Reset for next loop
    }
  };

  const handleReset = () => {
    if (confirm('Reset current counter to 0?')) {
      setCount(0);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#3A4D39] text-[#F9F7F2] p-8 rounded-sm border border-[#3A4D39] shadow-xs text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-[#F9F7F2]/10 text-[#C5A059] px-3 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-[0.2em] border border-[#F9F7F2]/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Digital Tasbeeh Counter • المسبحة الإلكترونية</span>
        </div>
        <h2 className="text-3xl font-serif text-[#F9F7F2]">Interactive Dhikr Counter</h2>
        <p className="text-xs font-serif italic text-[#A8B5A3]">
          Keep track of your daily Tasbeeh, Tahmeed, Takbeer, and Salawat with tactile audio feedback.
        </p>
      </div>

      {/* Preset Selector Tabs */}
      <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#E6E1D3] shadow-xs space-y-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C8474] block">Select Dhikr Phrase</span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActivePreset(p);
                setTargetCount(p.target);
                setCount(0);
              }}
              className={`px-3.5 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider whitespace-nowrap border transition-all ${
                activePreset.id === p.id
                  ? 'bg-[#3A4D39] text-[#F9F7F2] border-[#C5A059] shadow-xs'
                  : 'bg-[#F9F7F2] text-[#5C635A] border-[#E6E1D3]'
              }`}
            >
              {p.transliteration}
            </button>
          ))}
        </div>
      </div>

      {/* Active Dhikr Display Card */}
      <div className="bg-[#3A4D39] text-[#F9F7F2] rounded-sm p-8 border border-[#3A4D39] shadow-xs text-center space-y-3">
        <div className="font-arabic text-4xl text-[#C5A059]">
          {activePreset.arabic}
        </div>
        <div className="text-base font-serif font-semibold text-[#F9F7F2]">
          {activePreset.transliteration}
        </div>
        <div className="text-xs text-[#A8B5A3] italic font-serif">
          "{activePreset.translation}"
        </div>
      </div>

      {/* Main Clicker Wheel / Button */}
      <div className="bg-[#FFFFFF] rounded-sm p-8 border border-[#E6E1D3] shadow-xs flex flex-col items-center justify-center space-y-6">
        {/* Counter Display Ring */}
        <div className="relative flex items-center justify-center">
          <div className="w-56 h-56 rounded-full border-4 border-[#E6E1D3] flex flex-col items-center justify-center bg-[#F9F7F2]">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C8474] font-semibold mb-1">
              CURRENT COUNT
            </span>
            <span className="text-6xl font-serif font-bold text-[#3A4D39] tracking-wider">
              {count}
            </span>
            <span className="text-xs font-serif text-[#8C8474] mt-1">
              Target: {targetCount}
            </span>
          </div>
        </div>

        {/* Large Tactile Click Button */}
        <button
          onClick={handleIncrement}
          className="w-full py-5 rounded-sm bg-[#3A4D39] hover:bg-[#3A4D39]/90 text-[#F9F7F2] font-semibold text-lg uppercase tracking-wider shadow-xs active:scale-98 transition-all border border-[#3A4D39] flex items-center justify-center gap-3"
        >
          <Sparkles className="w-5 h-5 text-[#C5A059]" />
          <span>Tap To Count • اضغط للتسبيح</span>
        </button>

        {/* Controls Row */}
        <div className="flex items-center justify-between w-full pt-4 border-t border-[#E6E1D3] text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-sm border ${soundEnabled ? 'bg-[#3A4D39] text-[#C5A059] border-[#3A4D39]' : 'bg-[#F9F7F2] text-[#8C8474] border-[#E6E1D3]'}`}
              title="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <span className="text-[#8C8474] font-serif">
              Completed Loops: <strong className="text-[#3A4D39] font-sans">{cyclesCompleted}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#8C8474] font-serif">
              Total Today: <strong className="text-[#3A4D39] font-sans">{totalToday}</strong>
            </span>

            <button
              onClick={handleReset}
              className="p-2 rounded-sm bg-[#F9F7F2] text-[#8C8474] border border-[#E6E1D3] hover:text-red-700 transition-colors"
              title="Reset Count"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
