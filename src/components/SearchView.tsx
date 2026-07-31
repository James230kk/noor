import React, { useState, useMemo } from 'react';
import { SURAH_LIST, SAMPLE_SURAHS } from '../data/quranData';
import { HADITH_COLLECTION } from '../data/hadithData';
import { Ayah, Hadith, SurahMeta, AppLanguage } from '../types';
import { TafseerModal } from './TafseerModal';
import { incrementHadithReadCount, toggleAyahReadState } from '../utils/progressStorage';
import { 
  Search, 
  Filter, 
  BookOpen, 
  BookMarked, 
  FileText, 
  Play, 
  Pause, 
  Check, 
  Copy, 
  Users, 
  Layers,
  Sparkles,
  X,
  ExternalLink,
  Info
} from 'lucide-react';

interface SearchViewProps {
  language: AppLanguage;
  setActiveTab?: (tab: any) => void;
}

interface SearchResultQuran {
  type: 'quran';
  surah: SurahMeta;
  ayah: Ayah;
}

interface SearchResultHadith {
  type: 'hadith';
  hadith: Hadith;
}

interface SearchResultTafseer {
  type: 'tafseer';
  surah: SurahMeta;
  ayah: Ayah;
  tafseerText: string;
}

type SearchResultItem = SearchResultQuran | SearchResultHadith | SearchResultTafseer;

export const SearchView: React.FC<SearchViewProps> = ({ language }) => {
  const [keyword, setKeyword] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'quran' | 'hadith' | 'tafseer'>('all');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | 'all'>('all');
  const [verseNumberInput, setVerseNumberInput] = useState<string>('');
  const [selectedNarrator, setSelectedNarrator] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');

  // Audio Playback
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const [audioObject, setAudioObject] = useState<HTMLAudioElement | null>(null);

  // Tafseer Modal state
  const [tafseerTarget, setTafseerTarget] = useState<{ surah: SurahMeta; ayah: Ayah } | null>(null);

  // Copy notification
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Read indicator states
  const [readHadiths, setReadHadiths] = useState<Record<string, number>>({});

  // Extracted Narrator list from HADITH_COLLECTION
  const narratorsList = useMemo(() => {
    const set = new Set<string>();
    HADITH_COLLECTION.forEach(h => {
      if (h.narrator) set.add(h.narrator);
    });
    return Array.from(set);
  }, []);

  // All indexed Quran verses from SAMPLE_SURAHS + general Surah list entries
  const allIndexedQuranVerses = useMemo(() => {
    const list: { surah: SurahMeta; ayah: Ayah }[] = [];
    
    // Sample Ayahs in data
    Object.entries(SAMPLE_SURAHS).forEach(([surahNumStr, ayahs]) => {
      const surahNum = parseInt(surahNumStr, 10);
      const surah = SURAH_LIST.find(s => s.number === surahNum);
      if (surah) {
        ayahs.forEach(ayah => {
          list.push({ surah, ayah });
        });
      }
    });

    // Also include Ayat Al-Kursi (2:255) as a rich indexed sample
    const surah2 = SURAH_LIST.find(s => s.number === 2);
    if (surah2) {
      list.push({
        surah: surah2,
        ayah: {
          number: 255,
          numberInSurah: 255,
          text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ",
          translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them...",
          audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3"
        }
      });
    }

    return list;
  }, []);

  // Filter & Search Engine
  const searchResults = useMemo(() => {
    const results: SearchResultItem[] = [];
    const searchKeyLower = keyword.trim().toLowerCase();
    const verseNumParsed = parseInt(verseNumberInput.trim(), 10);

    // 1. QURAN SEARCH
    if (categoryFilter === 'all' || categoryFilter === 'quran') {
      allIndexedQuranVerses.forEach(({ surah, ayah }) => {
        // Surah Filter
        if (selectedSurahNumber !== 'all' && surah.number !== selectedSurahNumber) return;
        // Verse Number Filter
        if (!isNaN(verseNumParsed) && ayah.numberInSurah !== verseNumParsed) return;

        // Keyword matching
        if (searchKeyLower) {
          const matchArabic = ayah.text.includes(searchKeyLower);
          const matchTrans = (ayah.translation || '').toLowerCase().includes(searchKeyLower);
          const matchSurahName = surah.englishName.toLowerCase().includes(searchKeyLower) || surah.name.includes(searchKeyLower);
          if (!matchArabic && !matchTrans && !matchSurahName) return;
        }

        results.push({ type: 'quran', surah, ayah });
      });
    }

    // 2. HADITH SEARCH
    if (categoryFilter === 'all' || categoryFilter === 'hadith') {
      HADITH_COLLECTION.forEach(hadith => {
        // Narrator Filter
        if (selectedNarrator !== 'all' && hadith.narrator !== selectedNarrator) return;
        // Collection Filter
        if (selectedCollection !== 'all' && hadith.collection !== selectedCollection) return;

        // Keyword matching
        if (searchKeyLower) {
          const matchTitle = hadith.title.toLowerCase().includes(searchKeyLower) || hadith.titleArabic.includes(searchKeyLower);
          const matchArabic = hadith.arabicText.includes(searchKeyLower);
          const matchEnglish = hadith.englishText.toLowerCase().includes(searchKeyLower);
          const matchNarrator = hadith.narrator.toLowerCase().includes(searchKeyLower);
          const matchExplanation = (hadith.explanation || '').toLowerCase().includes(searchKeyLower);
          if (!matchTitle && !matchArabic && !matchEnglish && !matchNarrator && !matchExplanation) return;
        }

        results.push({ type: 'hadith', hadith });
      });
    }

    // 3. TAFSEER SEARCH
    if (categoryFilter === 'all' || categoryFilter === 'tafseer') {
      allIndexedQuranVerses.forEach(({ surah, ayah }) => {
        // Surah Filter
        if (selectedSurahNumber !== 'all' && surah.number !== selectedSurahNumber) return;
        // Verse Number Filter
        if (!isNaN(verseNumParsed) && ayah.numberInSurah !== verseNumParsed) return;

        const tafseerSampleText = `Exegesis for Surah ${surah.englishName} (${surah.name}) Ayah ${ayah.numberInSurah}: Commentary explains the divine depth of "${ayah.translation}". Scholars like Ibn Kathir highlight the moral guidance and spiritual lessons contained within this noble verse.`;

        if (searchKeyLower) {
          const matchKey = tafseerSampleText.toLowerCase().includes(searchKeyLower) ||
                           surah.englishName.toLowerCase().includes(searchKeyLower) ||
                           surah.name.includes(searchKeyLower);
          if (!matchKey) return;
        }

        results.push({
          type: 'tafseer',
          surah,
          ayah,
          tafseerText: tafseerSampleText
        });
      });
    }

    return results;
  }, [keyword, categoryFilter, selectedSurahNumber, verseNumberInput, selectedNarrator, selectedCollection, allIndexedQuranVerses]);

  const toggleAudio = (url: string) => {
    if (playingAudioUrl === url && audioObject) {
      audioObject.pause();
      setPlayingAudioUrl(null);
    } else {
      if (audioObject) audioObject.pause();
      const audio = new Audio(url);
      setAudioObject(audio);
      setPlayingAudioUrl(url);
      audio.play().catch(e => console.warn('Audio play error', e));
      audio.onended = () => setPlayingAudioUrl(null);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTrackHadithRead = (hadith: Hadith) => {
    const updated = incrementHadithReadCount(hadith.id, hadith.title);
    setReadHadiths(updated.hadithReadCounts);
  };

  const resetFilters = () => {
    setKeyword('');
    setCategoryFilter('all');
    setSelectedSurahNumber('all');
    setVerseNumberInput('');
    setSelectedNarrator('all');
    setSelectedCollection('all');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#3A4D39] text-[#F9F7F2] p-8 rounded-sm border border-[#3A4D39] shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-[#F9F7F2]/10 text-[#C5A059] px-3 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-[0.2em] border border-[#F9F7F2]/20">
          <Search className="w-3.5 h-3.5" />
          <span>Multisource Advanced Search • البحث الشامل في المصادر الإسلامية</span>
        </div>
        <h2 className="text-3xl font-serif text-[#F9F7F2]">Search Quran, Hadith & Tafseer</h2>
        <p className="text-xs font-serif italic text-[#A8B5A3]">
          Filter sacred texts precisely by Surah chapter, exact verse number, Hadith narrator, and specific keywords.
        </p>
      </div>

      {/* Main Search Panel */}
      <div className="bg-[#FFFFFF] p-6 rounded-sm border border-[#E6E1D3] shadow-xs space-y-6">
        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-[#8C8474]" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search keywords in Arabic or English (e.g., 'Merciful', 'الإخلاص', 'purity', 'intention')..."
            className="w-full pl-12 pr-10 py-3 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] text-sm focus:outline-none focus:border-[#C5A059] font-serif"
          />
          {keyword && (
            <button 
              onClick={() => setKeyword('')} 
              className="absolute right-3 top-3.5 text-[#8C8474] hover:text-[#2C332B]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Source Category Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-[#E6E1D3]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-serif font-semibold text-[#3A4D39] uppercase tracking-wider mr-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
              Source Category:
            </span>
            {(['all', 'quran', 'hadith', 'tafseer'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-serif font-semibold uppercase tracking-wider transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[#3A4D39] text-[#F9F7F2] border border-[#3A4D39] shadow-xs'
                    : 'bg-[#F9F7F2] text-[#5C635A] hover:text-[#2C332B] border border-[#E6E1D3]'
                }`}
              >
                {cat === 'all' && 'All Sources'}
                {cat === 'quran' && 'Quran Verses'}
                {cat === 'hadith' && 'Hadith Collections'}
                {cat === 'tafseer' && 'Tafseer Commentary'}
              </button>
            ))}
          </div>

          <button
            onClick={resetFilters}
            className="text-xs font-serif text-[#C5A059] hover:underline flex items-center gap-1"
          >
            Clear All Filters
          </button>
        </div>

        {/* Detailed Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#F9F7F2] p-4 rounded-sm border border-[#E6E1D3]">
          {/* Chapter / Surah Filter */}
          <div>
            <label className="block text-[11px] font-serif font-semibold text-[#8C8474] uppercase tracking-wider mb-1">
              Filter by Surah / Chapter
            </label>
            <select
              value={selectedSurahNumber}
              onChange={(e) => setSelectedSurahNumber(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full p-2 rounded-sm border border-[#E6E1D3] bg-[#FFFFFF] text-[#2C332B] text-xs font-serif focus:outline-none focus:border-[#C5A059]"
            >
              <option value="all">All 114 Surahs</option>
              {SURAH_LIST.map((s) => (
                <option key={s.number} value={s.number}>
                  #{s.number} - {s.englishName} ({s.name})
                </option>
              ))}
            </select>
          </div>

          {/* Verse Number Filter */}
          <div>
            <label className="block text-[11px] font-serif font-semibold text-[#8C8474] uppercase tracking-wider mb-1">
              Filter by Verse Number
            </label>
            <input
              type="number"
              min="1"
              max="286"
              placeholder="e.g. 255"
              value={verseNumberInput}
              onChange={(e) => setVerseNumberInput(e.target.value)}
              className="w-full p-2 rounded-sm border border-[#E6E1D3] bg-[#FFFFFF] text-[#2C332B] text-xs font-serif focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Narrator Filter (for Hadith) */}
          <div>
            <label className="block text-[11px] font-serif font-semibold text-[#8C8474] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-[#C5A059]" />
              Hadith Narrator
            </label>
            <select
              value={selectedNarrator}
              onChange={(e) => setSelectedNarrator(e.target.value)}
              className="w-full p-2 rounded-sm border border-[#E6E1D3] bg-[#FFFFFF] text-[#2C332B] text-xs font-serif focus:outline-none focus:border-[#C5A059]"
            >
              <option value="all">All Narrators</option>
              {narratorsList.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Hadith Collection Filter */}
          <div>
            <label className="block text-[11px] font-serif font-semibold text-[#8C8474] uppercase tracking-wider mb-1">
              Hadith Collection
            </label>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full p-2 rounded-sm border border-[#E6E1D3] bg-[#FFFFFF] text-[#2C332B] text-xs font-serif focus:outline-none focus:border-[#C5A059]"
            >
              <option value="all">All Collections</option>
              <option value="nawawi40">40 Hadith Nawawi</option>
              <option value="bukhari">Sahih Al-Bukhari</option>
              <option value="muslim">Sahih Muslim</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-serif text-[#8C8474]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#3A4D39]">{searchResults.length}</span>
            <span>Result(s) Found</span>
          </div>
          {keyword && <span>Matches for query: <strong className="text-[#3A4D39]">"{keyword}"</strong></span>}
        </div>

        {searchResults.length === 0 ? (
          <div className="bg-[#FFFFFF] p-12 text-center rounded-sm border border-[#E6E1D3] space-y-3">
            <Info className="w-8 h-8 text-[#C5A059] mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[#3A4D39]">No Matching Results</h3>
            <p className="text-xs text-[#8C8474] max-w-md mx-auto font-serif">
              Try adjusting your keyword query, resetting the Surah or verse filter, or switching to "All Sources".
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-sm bg-[#3A4D39] text-[#F9F7F2] text-xs font-serif uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {searchResults.map((item, index) => {
              const uniqueKey = item.type === 'quran'
                ? `quran-${item.surah.number}-${item.ayah.numberInSurah}`
                : item.type === 'hadith'
                ? `hadith-${item.hadith.id}`
                : `tafseer-${item.surah.number}-${item.ayah.numberInSurah}`;

              return (
                <div 
                  key={`${uniqueKey}-${index}`}
                  className="bg-[#FFFFFF] p-6 rounded-sm border border-[#E6E1D3] hover:border-[#C5A059] transition-all space-y-4"
                >
                  {/* Category Badge & Meta */}
                  <div className="flex items-center justify-between border-b pb-3 border-[#E6E1D3]">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-serif font-bold uppercase tracking-wider ${
                        item.type === 'quran' 
                          ? 'bg-[#3A4D39] text-[#F9F7F2]' 
                          : item.type === 'hadith' 
                          ? 'bg-[#C5A059] text-[#2C332B]' 
                          : 'bg-[#5C635A] text-[#F9F7F2]'
                      }`}>
                        {item.type.toUpperCase()}
                      </span>

                      {item.type === 'quran' && (
                        <span className="text-xs font-serif text-[#3A4D39] font-bold">
                          Surah {item.surah.englishName} ({item.surah.name}) • Verse {item.ayah.numberInSurah}
                        </span>
                      )}

                      {item.type === 'hadith' && (
                        <span className="text-xs font-serif text-[#3A4D39] font-bold">
                          {item.hadith.title}
                        </span>
                      )}

                      {item.type === 'tafseer' && (
                        <span className="text-xs font-serif text-[#3A4D39] font-bold">
                          Tafseer Exegesis • Surah {item.surah.englishName} ({item.surah.name}) Verse {item.ayah.numberInSurah}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.type === 'quran' && item.ayah.audioUrl && (
                        <button
                          onClick={() => toggleAudio(item.ayah.audioUrl!)}
                          className="p-1.5 rounded-sm bg-[#F9F7F2] text-[#3A4D39] border border-[#E6E1D3] hover:bg-[#E6E1D3]"
                          title="Listen Recitation"
                        >
                          {playingAudioUrl === item.ayah.audioUrl ? (
                            <Pause className="w-3.5 h-3.5 text-[#C5A059]" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-[#3A4D39]" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          const textToCopy = item.type === 'quran' 
                            ? `[Surah ${item.surah.englishName} ${item.surah.number}:${item.ayah.numberInSurah}]\n${item.ayah.text}\n"${item.ayah.translation}"`
                            : item.type === 'hadith'
                            ? `[Hadith] ${item.hadith.title}\n${item.hadith.arabicText}\n"${item.hadith.englishText}"`
                            : `[Tafseer ${item.surah.englishName} ${item.surah.number}:${item.ayah.numberInSurah}]\n${item.tafseerText}`;
                          handleCopyText(uniqueKey, textToCopy);
                        }}
                        className="p-1.5 rounded-sm bg-[#F9F7F2] text-[#8C8474] border border-[#E6E1D3] hover:text-[#2C332B]"
                        title="Copy Text"
                      >
                        {copiedId === uniqueKey ? <Check className="w-3.5 h-3.5 text-[#C5A059]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  {item.type === 'quran' && (
                    <div className="space-y-3">
                      <div className="font-arabic text-2xl text-right text-[#3A4D39] leading-loose">
                        {item.ayah.text}
                      </div>
                      <p className="text-xs font-serif text-[#5C635A] italic">
                        "{item.ayah.translation}"
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => setTafseerTarget({ surah: item.surah, ayah: item.ayah })}
                          className="text-xs font-serif font-bold text-[#C5A059] hover:underline flex items-center gap-1 uppercase tracking-wider"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          View Tafseer Commentary
                        </button>

                        <button
                          onClick={() => toggleAyahReadState(item.surah.number, item.ayah.numberInSurah)}
                          className="px-3 py-1 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] text-[11px] font-serif text-[#3A4D39] hover:bg-[#E6E1D3]"
                        >
                          Mark Verse as Read
                        </button>
                      </div>
                    </div>
                  )}

                  {item.type === 'hadith' && (
                    <div className="space-y-3">
                      <div className="font-arabic text-xl text-right text-[#3A4D39] leading-loose">
                        {item.hadith.arabicText}
                      </div>
                      <p className="text-xs font-serif text-[#2C332B] leading-relaxed">
                        "{item.hadith.englishText}"
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E6E1D3] text-xs font-serif">
                        <span className="text-[#8C8474]">
                          <strong>Narrator:</strong> {item.hadith.narrator}
                        </span>

                        <button
                          onClick={() => handleTrackHadithRead(item.hadith)}
                          className="px-3 py-1 rounded-sm bg-[#3A4D39] text-[#F9F7F2] text-[11px] font-serif uppercase tracking-wider flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>Track Reading (Read count: {readHadiths[item.hadith.id] || item.hadith.number || 1})</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {item.type === 'tafseer' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-[#F9F7F2] border border-[#E6E1D3] rounded-sm font-arabic text-xl text-right text-[#3A4D39]">
                        {item.ayah.text}
                      </div>
                      <div className="text-xs font-serif text-[#5C635A] leading-relaxed whitespace-pre-line bg-[#F9F7F2] p-4 rounded-sm border border-[#E6E1D3]">
                        {item.tafseerText}
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => setTafseerTarget({ surah: item.surah, ayah: item.ayah })}
                          className="text-xs font-serif font-bold text-[#C5A059] hover:underline flex items-center gap-1 uppercase tracking-wider"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          Open Full Tafseer Modal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tafseer Modal popup */}
      {tafseerTarget && (
        <TafseerModal
          surah={tafseerTarget.surah}
          ayah={tafseerTarget.ayah}
          onClose={() => setTafseerTarget(null)}
        />
      )}
    </div>
  );
};
