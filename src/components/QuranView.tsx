import React, { useState, useEffect, useRef } from 'react';
import { SURAH_LIST, RECITERS, fetchSurahAyahs } from '../data/quranData';
import { Ayah, BookmarkAyah, SurahMeta, UserSettings } from '../types';
import { TafseerModal } from './TafseerModal';
import { toggleSurahReadState, toggleAyahReadState, getStoredProgress } from '../utils/progressStorage';
import { 
  Search, 
  Play, 
  Pause, 
  Volume2, 
  Bookmark, 
  BookmarkCheck, 
  BookOpen, 
  FileText, 
  ArrowLeft, 
  Type, 
  Share2, 
  Copy, 
  Check, 
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface QuranViewProps {
  settings: UserSettings;
  updateSettings: (s: Partial<UserSettings>) => void;
  bookmarks: BookmarkAyah[];
  toggleBookmark: (bm: BookmarkAyah) => void;
  language: 'en' | 'ar';
}

export const QuranView: React.FC<QuranViewProps> = ({
  settings,
  updateSettings,
  bookmarks,
  toggleBookmark,
  language
}) => {
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(SURAH_LIST[0]); // Al-Fatiha by default
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeAyahIndex, setActiveAyahIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedTafseerAyah, setSelectedTafseerAyah] = useState<Ayah | null>(null);
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);
  const [viewTab, setViewTab] = useState<'surahs' | 'reader' | 'bookmarks'>('surahs');
  const [readSurahs, setReadSurahs] = useState<number[]>([]);
  const [readAyahs, setReadAyahs] = useState<string[]>([]);

  useEffect(() => {
    const prog = getStoredProgress();
    setReadSurahs(prog.readSurahs || []);
    setReadAyahs(prog.readAyahs || []);
  }, []);

  const handleToggleSurahRead = (surahNum: number, surahName: string) => {
    const updated = toggleSurahReadState(surahNum, surahName);
    setReadSurahs(updated.readSurahs);
  };

  const handleToggleAyahRead = (surahNum: number, ayahNum: number) => {
    const updated = toggleAyahReadState(surahNum, ayahNum);
    setReadAyahs(updated.readAyahs);
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load Ayahs when selectedSurah or reciter changes
  useEffect(() => {
    if (!selectedSurah) return;
    async function loadData() {
      setLoading(true);
      const data = await fetchSurahAyahs(selectedSurah!.number, settings.reciter);
      setAyahs(data);
      setLoading(false);
      setActiveAyahIndex(null);
      setIsPlaying(false);
    }
    loadData();
  }, [selectedSurah, settings.reciter]);

  // Handle playing specific Ayah audio
  const playAyahAudio = (index: number) => {
    if (index < 0 || index >= ayahs.length) {
      setIsPlaying(false);
      setActiveAyahIndex(null);
      return;
    }

    const ayah = ayahs[index];
    if (!ayah.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const newAudio = new Audio(ayah.audioUrl);
    audioRef.current = newAudio;
    setActiveAyahIndex(index);
    setIsPlaying(true);

    newAudio.play().catch(e => console.warn('Audio play error', e));

    newAudio.onended = () => {
      // Auto-advance to next verse in Surah
      if (index + 1 < ayahs.length) {
        playAyahAudio(index + 1);
      } else {
        setIsPlaying(false);
        setActiveAyahIndex(null);
      }
    };
  };

  const togglePlayPause = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (activeAyahIndex !== null) {
        playAyahAudio(activeAyahIndex);
      } else {
        playAyahAudio(0);
      }
    }
  };

  const handleCopyAyah = (ayah: Ayah) => {
    const text = `[Surah ${selectedSurah?.englishName} ${selectedSurah?.number}:${ayah.numberInSurah}]\n${ayah.text}\n\n"${ayah.translation}"`;
    navigator.clipboard.writeText(text);
    setCopiedAyahNumber(ayah.numberInSurah);
    setTimeout(() => setCopiedAyahNumber(null), 2000);
  };

  const isBookmarked = (surahNum: number, ayahNum: number) => {
    return bookmarks.some(b => b.surahNumber === surahNum && b.ayahNumber === ayahNum);
  };

  const filteredSurahs = SURAH_LIST.filter(s =>
    s.name.includes(searchQuery) ||
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.number.toString() === searchQuery
  );

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar inside Quran Module */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FFFFFF] p-4 rounded-sm border border-[#E6E1D3] shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewTab('surahs')}
            className={`px-3.5 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors ${
              viewTab === 'surahs' 
                ? 'bg-[#3A4D39] text-[#F9F7F2] shadow-xs' 
                : 'bg-[#F9F7F2] text-[#5C635A] hover:text-[#2C332B] border border-[#E6E1D3]'
            }`}
          >
            All Surahs ({SURAH_LIST.length})
          </button>

          {selectedSurah && (
            <button
              onClick={() => setViewTab('reader')}
              className={`px-3.5 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                viewTab === 'reader' 
                  ? 'bg-[#3A4D39] text-[#F9F7F2] shadow-xs' 
                  : 'bg-[#F9F7F2] text-[#5C635A] hover:text-[#2C332B] border border-[#E6E1D3]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Read Surah {selectedSurah.englishName}</span>
            </button>
          )}

          <button
            onClick={() => setViewTab('bookmarks')}
            className={`px-3.5 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              viewTab === 'bookmarks' 
                ? 'bg-[#3A4D39] text-[#F9F7F2] shadow-xs' 
                : 'bg-[#F9F7F2] text-[#5C635A] hover:text-[#2C332B] border border-[#E6E1D3]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Bookmarks ({bookmarks.length})</span>
          </button>
        </div>

        {/* Font & Audio Reciter Controls */}
        <div className="flex items-center gap-3">
          <select
            value={settings.reciter}
            onChange={(e) => updateSettings({ reciter: e.target.value })}
            className="px-3 py-1.5 rounded-sm text-xs border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] focus:outline-none focus:border-[#C5A059]"
          >
            {RECITERS.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-[#F9F7F2] p-1 rounded-sm border border-[#E6E1D3]">
            <button
              onClick={() => updateSettings({ arabicFontSize: Math.max(18, settings.arabicFontSize - 2) })}
              className="px-2 py-0.5 text-xs font-bold rounded-xs hover:bg-[#C5A059] hover:text-[#2C332B]"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-[11px] font-mono px-1 text-[#5C635A]">{settings.arabicFontSize}px</span>
            <button
              onClick={() => updateSettings({ arabicFontSize: Math.min(36, settings.arabicFontSize + 2) })}
              className="px-2 py-0.5 text-xs font-bold rounded-xs hover:bg-[#C5A059] hover:text-[#2C332B]"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* VIEW TAB 1: SURAH LIST GRID */}
      {viewTab === 'surahs' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8C8474]" />
            <input
              type="text"
              placeholder="Search Surah by name (e.g. Al-Kahf, Yaseen, البقرة) or number (1-114)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-sm border border-[#E6E1D3] bg-[#FFFFFF] text-[#2C332B] text-sm focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredSurahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => {
                  setSelectedSurah(surah);
                  setViewTab('reader');
                }}
                className={`p-4 rounded-sm border text-left flex items-center justify-between transition-all duration-150 ${
                  selectedSurah?.number === surah.number
                    ? 'bg-[#3A4D39] text-[#F9F7F2] border-[#C5A059] shadow-xs'
                    : 'bg-[#FFFFFF] text-[#2C332B] border-[#E6E1D3] hover:border-[#C5A059]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] text-[#C5A059] font-serif font-bold flex items-center justify-center text-xs">
                    {surah.number}
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-base leading-tight">{surah.englishName}</h4>
                    <p className="text-[11px] text-[#8C8474]">
                      {surah.englishNameTranslation} • {surah.numberOfAyahs} v.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-arabic text-xl text-[#C5A059]">{surah.name}</div>
                  <span className="text-[9px] uppercase tracking-wider text-[#8C8474]">
                    {surah.revelationType}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW TAB 2: SURAH READER */}
      {viewTab === 'reader' && selectedSurah && (
        <div className="space-y-6">
          {/* Surah Header Card */}
          <div className="relative overflow-hidden rounded-sm bg-[#3A4D39] text-[#F9F7F2] p-8 border border-[#3A4D39] shadow-xs text-center space-y-3">
            <div className="flex items-center justify-between text-xs text-[#A8B5A3] font-semibold uppercase tracking-widest">
              <span>Surah #{selectedSurah.number}</span>
              <span className="bg-[#FFFFFF]/10 border border-[#FFFFFF]/20 px-2.5 py-0.5 rounded-sm">{selectedSurah.revelationType}</span>
              <span>{selectedSurah.numberOfAyahs} Verses</span>
            </div>

            <h2 className="font-arabic text-5xl font-normal text-[#C5A059] my-2">
              {selectedSurah.name}
            </h2>
            <h3 className="text-xl font-serif text-[#F9F7F2] tracking-wide">
              {selectedSurah.englishName} <span className="text-[#A8B5A3] font-sans font-normal text-sm">({selectedSurah.englishNameTranslation})</span>
            </h3>

            {/* Audio Recitation & Progress Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-[#ffffff15]">
              <button
                onClick={togglePlayPause}
                className="px-6 py-2.5 rounded-sm bg-[#C5A059] hover:bg-[#C5A059]/90 text-[#2C332B] font-semibold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pause Recitation' : 'Play Full Surah'}</span>
              </button>

              <button
                onClick={() => handleToggleSurahRead(selectedSurah.number, selectedSurah.englishName)}
                className={`px-5 py-2.5 rounded-sm font-semibold text-xs uppercase tracking-wider flex items-center gap-2 border transition-all ${
                  readSurahs.includes(selectedSurah.number)
                    ? 'bg-[#FFFFFF] text-[#3A4D39] border-[#FFFFFF]'
                    : 'bg-transparent text-[#F9F7F2] border-[#F9F7F2]/40 hover:border-[#F9F7F2]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                <span>{readSurahs.includes(selectedSurah.number) ? 'Surah Completed ✓' : 'Mark Surah Read'}</span>
              </button>
            </div>
          </div>

          {/* Bismillah Header */}
          {selectedSurah.number !== 9 && (
            <div className="text-center font-arabic text-3xl text-[#C5A059] py-4 border-b border-[#E6E1D3]">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
          )}

          {/* Verses Container */}
          {loading ? (
            <div className="text-center py-12 text-[#8C8474] font-serif italic">
              Loading sacred Ayahs...
            </div>
          ) : (
            <div className="space-y-4">
              {ayahs.map((ayah, idx) => {
                const isActive = activeAyahIndex === idx;
                const bookmarked = isBookmarked(selectedSurah.number, ayah.numberInSurah);

                return (
                  <div
                    key={ayah.numberInSurah}
                    id={`ayah-${ayah.numberInSurah}`}
                    className={`p-6 rounded-sm border transition-all duration-150 space-y-4 ${
                      isActive
                        ? 'bg-[#F9F7F2] border-2 border-[#C5A059] shadow-xs'
                        : 'bg-[#FFFFFF] text-[#2C332B] border-[#E6E1D3] hover:border-[#C5A059]/50'
                    }`}
                  >
                    {/* Verse Controls Top Bar */}
                    <div className="flex items-center justify-between text-xs border-b pb-3 border-[#E6E1D3]">
                      <span className="w-7 h-7 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] text-[#C5A059] font-serif font-bold flex items-center justify-center text-xs">
                        {ayah.numberInSurah}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => playAyahAudio(idx)}
                          className={`p-1.5 rounded-sm border transition-colors ${
                            isActive
                              ? 'bg-[#3A4D39] text-[#F9F7F2] border-[#3A4D39]'
                              : 'bg-[#F9F7F2] text-[#5C635A] border-[#E6E1D3] hover:text-[#C5A059]'
                          }`}
                          title="Play Ayah Audio"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>

                        <button
                          onClick={() => handleToggleAyahRead(selectedSurah.number, ayah.numberInSurah)}
                          className={`px-2.5 py-1 rounded-sm border transition-colors flex items-center gap-1 font-medium text-xs ${
                            readAyahs.includes(`${selectedSurah.number}:${ayah.numberInSurah}`)
                              ? 'bg-[#3A4D39] text-[#F9F7F2] border-[#3A4D39]'
                              : 'bg-[#F9F7F2] text-[#5C635A] border-[#E6E1D3] hover:text-[#C5A059]'
                          }`}
                          title="Mark Ayah Read"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>{readAyahs.includes(`${selectedSurah.number}:${ayah.numberInSurah}`) ? 'Read' : 'Mark Read'}</span>
                        </button>

                        <button
                          onClick={() => setSelectedTafseerAyah(ayah)}
                          className="px-2.5 py-1 rounded-sm bg-[#F9F7F2] text-[#3A4D39] border border-[#E6E1D3] hover:border-[#C5A059] flex items-center gap-1 font-medium text-xs"
                          title="Read Tafseer"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>Tafseer</span>
                        </button>

                        <button
                          onClick={() => toggleBookmark({
                            surahNumber: selectedSurah.number,
                            surahName: selectedSurah.englishName,
                            ayahNumber: ayah.numberInSurah,
                            text: ayah.text,
                            date: new Date().toLocaleDateString()
                          })}
                          className={`p-1.5 rounded-sm border transition-colors ${
                            bookmarked
                              ? 'bg-[#C5A059] text-[#2C332B] border-[#C5A059]'
                              : 'bg-[#F9F7F2] text-[#5C635A] border-[#E6E1D3] hover:text-[#C5A059]'
                          }`}
                          title="Bookmark Verse"
                        >
                          {bookmarked ? <BookmarkCheck className="w-3.5 h-3.5 fill-current" /> : <Bookmark className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleCopyAyah(ayah)}
                          className="p-1.5 rounded-sm bg-[#F9F7F2] text-[#5C635A] border border-[#E6E1D3] hover:text-[#C5A059] transition-colors"
                          title="Copy Verse"
                        >
                          {copiedAyahNumber === ayah.numberInSurah ? <Check className="w-3.5 h-3.5 text-[#3A4D39]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Arabic Verse Text */}
                    <div 
                      className="text-right font-arabic leading-[2.2] tracking-wide text-[#3A4D39] font-medium"
                      style={{ fontSize: `${settings.arabicFontSize}px` }}
                    >
                      {ayah.text} ﴿{ayah.numberInSurah}﴾
                    </div>

                    {/* Translation */}
                    <div className="text-base text-[#2C332B] font-serif leading-relaxed border-t pt-3 border-[#E6E1D3]">
                      {ayah.translation}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW TAB 3: BOOKMARKS */}
      {viewTab === 'bookmarks' && (
        <div className="space-y-4">
          <h3 className="text-xl font-serif text-[#3A4D39] flex items-center gap-2 border-b border-[#E6E1D3] pb-2">
            <Bookmark className="w-5 h-5 text-[#C5A059]" />
            <span>Saved Verse Bookmarks</span>
          </h3>

          {bookmarks.length === 0 ? (
            <div className="text-center py-12 bg-[#FFFFFF] rounded-sm border border-[#E6E1D3] text-[#8C8474] space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-[#C5A059] opacity-50" />
              <p className="font-serif italic">No saved bookmarks yet. Click the bookmark icon on any Ayah while reading!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarks.map((bm) => {
                const surahObj = SURAH_LIST.find(s => s.number === bm.surahNumber);
                return (
                  <div
                    key={`${bm.surahNumber}-${bm.ayahNumber}`}
                    className="p-5 rounded-sm bg-[#FFFFFF] border border-[#E6E1D3] space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs font-serif font-bold text-[#3A4D39]">
                      <span>Surah {bm.surahName} • Verse {bm.ayahNumber}</span>
                      <span className="text-[#8C8474] font-sans font-normal">{bm.date}</span>
                    </div>
                    <p className="font-arabic text-xl text-[#3A4D39] truncate">{bm.text}</p>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E1D3]">
                      <button
                        onClick={() => {
                          if (surahObj) {
                            setSelectedSurah(surahObj);
                            setViewTab('reader');
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-sm text-xs bg-[#3A4D39] text-[#F9F7F2] font-semibold uppercase tracking-wider"
                      >
                        Read Surah
                      </button>
                      <button
                        onClick={() => toggleBookmark(bm)}
                        className="px-3.5 py-1.5 rounded-sm text-xs bg-[#F9F7F2] text-[#8C8474] border border-[#E6E1D3] hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tafseer Modal Trigger */}
      {selectedTafseerAyah && selectedSurah && (
        <TafseerModal
          surah={selectedSurah}
          ayah={selectedTafseerAyah}
          onClose={() => setSelectedTafseerAyah(null)}
        />
      )}
    </div>
  );
};
