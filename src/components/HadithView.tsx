import React, { useState, useEffect } from 'react';
import { HADITH_COLLECTION } from '../data/hadithData';
import { Hadith } from '../types';
import { incrementHadithReadCount, getStoredProgress } from '../utils/progressStorage';
import { Search, BookMarked, Copy, Check, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

interface HadithViewProps {
  language: 'en' | 'ar';
}

export const HadithView: React.FC<HadithViewProps> = ({ language }) => {
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [readCounts, setReadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const prog = getStoredProgress();
    setReadCounts(prog.hadithReadCounts || {});
  }, []);

  const handleTrackRead = (hadith: Hadith) => {
    const updated = incrementHadithReadCount(hadith.id, hadith.title);
    setReadCounts(updated.hadithReadCounts);
  };

  const categories = Array.from(new Set(HADITH_COLLECTION.map(h => h.category)));

  const filteredHadiths = HADITH_COLLECTION.filter(h => {
    const matchesCollection = selectedCollection === 'all' || h.collection === selectedCollection;
    const matchesCategory = selectedCategory === 'all' || h.category === selectedCategory;
    const matchesSearch = 
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.arabicText.includes(searchQuery) ||
      h.englishText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.narrator.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCollection && matchesCategory && matchesSearch;
  });

  const handleCopy = (hadith: Hadith) => {
    const text = `[${hadith.title}]\nNarrated by: ${hadith.narrator}\n\n${hadith.arabicText}\n\n"${hadith.englishText}"`;
    navigator.clipboard.writeText(text);
    setCopiedId(hadith.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#3A4D39] text-[#F9F7F2] p-8 rounded-sm border border-[#3A4D39] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#C5A059] font-semibold text-[10px] uppercase tracking-[0.25em]">
          <BookMarked className="w-4 h-4" />
          <span>Prophetic Traditions • الأحاديث النبوية الشريفة</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif text-[#F9F7F2]">
          Authentic Hadith Collections
        </h2>
        <p className="text-sm font-serif italic text-[#A8B5A3] max-w-2xl">
          Explore Forty Nawawi, Sahih Al-Bukhari, and Sahih Muslim with Arabic text, English translation, narrator references, and practical explanations.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#E6E1D3] shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8C8474]" />
          <input
            type="text"
            placeholder="Search hadith by title, narrator (e.g. Umar, Abu Hurairah), or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] text-sm focus:outline-none focus:border-[#C5A059]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-[#8C8474] flex items-center gap-1 uppercase tracking-wider text-[10px]">
            <Filter className="w-3.5 h-3.5 text-[#C5A059]" /> Collection:
          </span>
          {['all', 'nawawi40', 'bukhari', 'muslim'].map((col) => (
            <button
              key={col}
              onClick={() => setSelectedCollection(col)}
              className={`px-3 py-1.5 rounded-sm font-medium uppercase tracking-wider text-[11px] transition-colors ${
                selectedCollection === col
                  ? 'bg-[#3A4D39] text-[#F9F7F2] font-bold'
                  : 'bg-[#F9F7F2] text-[#5C635A] border border-[#E6E1D3]'
              }`}
            >
              {col === 'all' ? 'All Collections' : col === 'nawawi40' ? '40 Nawawi' : col === 'bukhari' ? 'Sahih Bukhari' : 'Sahih Muslim'}
            </button>
          ))}

          <span className="ml-auto font-semibold text-[#8C8474] uppercase tracking-wider text-[10px]">
            Category:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] focus:outline-none focus:border-[#C5A059]"
          >
            <option value="all">All Topics</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Hadith Cards */}
      <div className="space-y-4">
        {filteredHadiths.map((hadith) => (
          <div
            key={hadith.id}
            className="p-6 rounded-sm bg-[#FFFFFF] text-[#2C332B] border border-[#E6E1D3] shadow-xs space-y-4 hover:border-[#C5A059]/60 transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-[#E6E1D3]">
              <div>
                <span className="text-[10px] uppercase tracking-widest bg-[#F9F7F2] text-[#C5A059] px-2.5 py-1 rounded-sm font-bold border border-[#E6E1D3] mr-2">
                  {hadith.collection === 'nawawi40' ? '40 Nawawi' : hadith.collection.toUpperCase()} #{hadith.number}
                </span>
                <span className="text-[10px] uppercase tracking-widest bg-[#F9F7F2] text-[#5C635A] px-2.5 py-1 rounded-sm font-medium border border-[#E6E1D3]">
                  {hadith.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTrackRead(hadith)}
                  className="px-3 py-1 rounded-sm bg-[#3A4D39] text-[#F9F7F2] border border-[#3A4D39] hover:bg-[#3A4D39]/90 text-xs flex items-center gap-1.5 font-medium transition-colors uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Mark Read ({readCounts[hadith.id] || 0})</span>
                </button>

                <button
                  onClick={() => handleCopy(hadith)}
                  className="px-3 py-1 rounded-sm bg-[#F9F7F2] text-[#5C635A] border border-[#E6E1D3] hover:text-[#C5A059] text-xs flex items-center gap-1 font-medium transition-colors"
                >
                  {copiedId === hadith.id ? <Check className="w-3.5 h-3.5 text-[#3A4D39]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === hadith.id ? 'Copied' : 'Copy Hadith'}</span>
                </button>
              </div>
            </div>

            {/* Hadith Title & Arabic Text */}
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-xl text-[#3A4D39]">
                {hadith.title}
              </h3>

              <div className="font-arabic text-2xl leading-loose text-[#C5A059] bg-[#3A4D39] p-5 rounded-sm border border-[#3A4D39] text-right">
                {hadith.arabicText}
              </div>
            </div>

            {/* Narrator & English Translation */}
            <div className="space-y-2 border-t pt-3 border-[#E6E1D3]">
              <div className="text-xs uppercase tracking-wider font-semibold text-[#8C8474]">
                Narrator: <span className="text-[#3A4D39] font-serif font-bold">{hadith.narrator}</span>
              </div>
              <p className="text-base text-[#2C332B] font-serif leading-relaxed">
                "{hadith.englishText}"
              </p>
            </div>

            {/* Explanation / Benefit */}
            {hadith.explanation && (
              <div className="p-4 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] text-xs text-[#5C635A] space-y-1">
                <span className="font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-1 text-[10px]">
                  <Sparkles className="w-3.5 h-3.5" /> Key Lesson / Benefit:
                </span>
                <p className="font-serif">{hadith.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
