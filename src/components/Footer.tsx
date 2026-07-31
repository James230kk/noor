import React from 'react';
import { ToolTab } from '../types';
import { Shield } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: ToolTab) => void;
  language: 'en' | 'ar';
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, language }) => {
  return (
    <footer className="mt-20 bg-[#2C332B] text-[#F9F7F2] border-t border-[#3A4D39] pt-12 pb-14">
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Logo & Sadaqah Note */}
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-serif text-[#F9F7F2]">
                Noor<span className="text-[#C5A059]">.</span>
              </h3>
              <span className="font-arabic text-xl text-[#C5A059]">نُورْ</span>
            </div>
            <p className="text-xs text-[#A8B5A3] leading-relaxed">
              Built as <strong>Sadaqah Jariyah (صدقة جارية)</strong> for Muslims worldwide. 100% free, 100% client-side, ad-free, with complete user privacy. May Allah accept it from us and you.
            </p>
          </div>

          {/* Quick Tools Links */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-semibold text-[#C5A059] uppercase tracking-[0.25em]">Quick Islamic Suite</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#A8B5A3]">
              <button onClick={() => setActiveTab('prayer')} className="text-left hover:text-[#C5A059] transition-colors">Prayer Times</button>
              <button onClick={() => setActiveTab('quran')} className="text-left hover:text-[#C5A059] transition-colors">Quran & Tafseer</button>
              <button onClick={() => setActiveTab('hadith')} className="text-left hover:text-[#C5A059] transition-colors">Hadith Library</button>
              <button onClick={() => setActiveTab('tasbeeh')} className="text-left hover:text-[#C5A059] transition-colors">Tasbeeh Counter</button>
              <button onClick={() => setActiveTab('qibla')} className="text-left hover:text-[#C5A059] transition-colors">Qibla Finder</button>
              <button onClick={() => setActiveTab('zakat')} className="text-left hover:text-[#C5A059] transition-colors">Zakat Calculator</button>
              <button onClick={() => setActiveTab('inheritance')} className="text-left hover:text-[#C5A059] transition-colors">Inheritance Shares</button>
              <button onClick={() => setActiveTab('names')} className="text-left hover:text-[#C5A059] transition-colors">99 Names of Allah</button>
            </div>
          </div>

          {/* Du'a & Verse */}
          <div className="p-5 rounded-sm bg-[#3A4D39]/50 border border-[#5C635A]/50 text-xs space-y-3 text-center">
            <div className="font-arabic text-xl text-[#C5A059] font-medium">
              "رَبَّنَا تَقَبَّلْ مِنَّا ۖ إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ"
            </div>
            <div className="text-[#F9F7F2] italic font-serif text-sm">
              "Our Lord, accept [this] from us. Indeed You are the Hearing, the Knowing." (2:127)
            </div>
          </div>
        </div>

        <div className="border-t border-[#3A4D39] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C8474] gap-4">
          <span>© {new Date().getFullYear()} Noor Islamic Suite • Sadaqah Jariyah</span>
          <span className="flex items-center gap-2 text-[#C5A059]">
            <Shield className="w-4 h-4" /> No Cookies or Tracking • Complete Privacy
          </span>
        </div>
      </div>
    </footer>
  );
};

