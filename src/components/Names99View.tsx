import React, { useState } from 'react';
import { NAMES_OF_ALLAH } from '../data/names99Data';
import { NameOfAllah } from '../types';
import { Search, Sparkles, Volume2 } from 'lucide-react';

export const Names99View: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);

  const filteredNames = NAMES_OF_ALLAH.filter(n =>
    n.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.nameArabic.includes(searchQuery) ||
    n.number.toString() === searchQuery
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#3A4D39] text-[#F9F7F2] p-8 rounded-sm border border-[#3A4D39] shadow-xs space-y-3 text-center">
        <div className="inline-flex items-center gap-1.5 bg-[#F9F7F2]/10 text-[#C5A059] px-3 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-[0.2em] border border-[#F9F7F2]/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Asma-ul-Husna • أسماء الله الحسنى</span>
        </div>
        <h2 className="text-3xl font-serif text-[#F9F7F2]">The 99 Beautiful Names of Allah</h2>
        <p className="text-xs font-serif italic text-[#A8B5A3] max-w-xl mx-auto">
          "And to Allah belong the best names, so invoke Him by them." (Surah Al-A'raf 7:180)
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md mx-auto">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8C8474]" />
        <input
          type="text"
          placeholder="Search by name, meaning (e.g. Ar-Rahman, Merciful, 1-99)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-[#E6E1D3] bg-[#FFFFFF] text-[#2C332B] text-sm focus:outline-none focus:border-[#C5A059] shadow-xs font-serif"
        />
      </div>

      {/* Grid of 99 Names */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredNames.map((item) => (
          <button
            key={item.number}
            onClick={() => setSelectedName(item)}
            className="p-4 rounded-sm bg-[#FFFFFF] text-[#2C332B] border border-[#E6E1D3] hover:border-[#C5A059] transition-all duration-200 hover:shadow-xs text-center space-y-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[10px] text-[#C5A059] font-semibold font-sans w-full">
              <span>#{item.number}</span>
            </div>

            <div className="font-arabic text-3xl text-[#3A4D39] my-1">
              {item.nameArabic}
            </div>

            <div>
              <div className="text-xs font-serif font-bold text-[#3A4D39]">{item.transliteration}</div>
              <div className="text-[11px] font-serif italic text-[#8C8474] truncate">{item.meaning}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Name Details Modal */}
      {selectedName && (
        <div className="fixed inset-0 z-50 bg-[#2C332B]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] text-[#2C332B] rounded-sm p-8 max-w-md w-full border border-[#E6E1D3] shadow-lg space-y-4 text-center">
            <div className="flex justify-between items-center text-xs text-[#C5A059] font-semibold uppercase tracking-wider border-b pb-2 border-[#E6E1D3]">
              <span>Name #{selectedName.number} of 99</span>
              <button 
                onClick={() => setSelectedName(null)}
                className="text-[#8C8474] hover:text-[#2C332B] font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="font-arabic text-6xl text-[#3A4D39] py-3">
              {selectedName.nameArabic}
            </div>

            <div>
              <h3 className="text-2xl font-serif text-[#3A4D39]">{selectedName.transliteration}</h3>
              <p className="text-sm font-serif italic text-[#C5A059] font-medium mt-1">{selectedName.meaning}</p>
            </div>

            <div className="p-4 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] text-xs text-[#5C635A] leading-relaxed font-serif">
              {selectedName.explanation}
            </div>

            <button
              onClick={() => setSelectedName(null)}
              className="w-full py-2.5 rounded-sm bg-[#3A4D39] hover:bg-[#3A4D39]/90 text-[#F9F7F2] font-semibold text-xs uppercase tracking-wider shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
