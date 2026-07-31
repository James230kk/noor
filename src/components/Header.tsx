import React from 'react';
import { ToolTab, UserSettings } from '../types';
import { getHijriDate } from '../data/islamicEvents';
import { 
  Clock, 
  BookOpen, 
  BookMarked, 
  Compass, 
  Calculator, 
  Users, 
  Sparkles, 
  Calendar, 
  HeartHandshake,
  SunMoon,
  Volume2,
  VolumeX,
  Languages,
  Search,
  BarChart3
} from 'lucide-react';

interface HeaderProps {
  activeTab: ToolTab;
  setActiveTab: (tab: ToolTab) => void;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  updateSettings,
  language,
  setLanguage
}) => {
  const hijri = getHijriDate();
  const today = new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const tabs: { id: ToolTab; labelEn: string; labelAr: string; icon: React.ReactNode }[] = [
    { id: 'prayer', labelEn: 'Prayer Times', labelAr: 'مواقيت الصلاة', icon: <Clock className="w-4 h-4" /> },
    { id: 'search', labelEn: 'Search Engine', labelAr: 'البحث الشامل', icon: <Search className="w-4 h-4" /> },
    { id: 'tracker', labelEn: 'Progress Tracker', labelAr: 'متابعة الإنجاز', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'quran', labelEn: 'Quran & Tafseer', labelAr: 'القرآن والتفسير', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'hadith', labelEn: 'Hadith', labelAr: 'الأحاديث النبوية', icon: <BookMarked className="w-4 h-4" /> },
    { id: 'tasbeeh', labelEn: 'Tasbeeh', labelAr: 'المسبحة', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'adhkar', labelEn: 'Adhkar', labelAr: 'الأذكار', icon: <HeartHandshake className="w-4 h-4" /> },
    { id: 'qibla', labelEn: 'Qibla Finder', labelAr: 'اتجاه القبلة', icon: <Compass className="w-4 h-4" /> },
    { id: 'zakat', labelEn: 'Zakat', labelAr: 'حاسبة الزكاة', icon: <Calculator className="w-4 h-4" /> },
    { id: 'inheritance', labelEn: 'Inheritance', labelAr: 'حاسبة المواريث', icon: <Users className="w-4 h-4" /> },
    { id: 'names', labelEn: '99 Names', labelAr: 'أسماء الله الحسنى', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'calendar', labelEn: 'Hijri Calendar', labelAr: 'التقويم الهجري', icon: <Calendar className="w-4 h-4" /> },
  ];

  const cycleTheme = () => {
    const themes: UserSettings['theme'][] = ['emerald', 'dark', 'sepia'];
    const nextIndex = (themes.indexOf(settings.theme) + 1) % themes.length;
    updateSettings({ theme: themes[nextIndex] });
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#F9F7F2]/95 text-[#2C332B] border-b border-[#E6E1D3] shadow-xs">
      {/* Top Editorial Bar */}
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-[#E6E1D3]/70">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C8474] font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
            Project Sadaqah Jariyah
          </span>
          <span className="hidden sm:inline text-xs text-[#8C8474]">|</span>
          <span className="hidden sm:inline text-xs font-serif italic text-[#5C635A]">100% Client-Side • No Ads • Privacy First</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-widest text-[#8C8474]">Hijri Date</span>
              <span className="font-serif text-[#3A4D39] font-medium">{hijri.day} {language === 'ar' ? hijri.monthNameAr : hijri.monthNameEn} {hijri.year} AH</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-widest text-[#8C8474]">Today</span>
              <span className="font-serif text-[#3A4D39] font-medium">{today}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-2.5 py-1 rounded-sm bg-[#FFFFFF] hover:bg-[#E6E1D3]/50 border border-[#E6E1D3] text-[#3A4D39] flex items-center gap-1.5 text-xs font-medium transition-colors"
              title="Switch Language"
            >
              <Languages className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            <button
              onClick={cycleTheme}
              className="p-1.5 rounded-sm bg-[#FFFFFF] hover:bg-[#E6E1D3]/50 border border-[#E6E1D3] text-[#3A4D39] transition-colors"
              title={`Theme: ${settings.theme}`}
            >
              <SunMoon className="w-4 h-4 text-[#C5A059]" />
            </button>

            <button
              onClick={() => updateSettings({ adhanSoundEnabled: !settings.adhanSoundEnabled })}
              className={`p-1.5 rounded-sm border transition-colors ${
                settings.adhanSoundEnabled 
                  ? 'bg-[#3A4D39] border-[#3A4D39] text-[#F9F7F2]' 
                  : 'bg-[#FFFFFF] border-[#E6E1D3] text-[#8C8474]'
              }`}
              title={settings.adhanSoundEnabled ? 'Adhan Sound Enabled' : 'Adhan Sound Muted'}
            >
              {settings.adhanSoundEnabled ? <Volume2 className="w-4 h-4 text-[#C5A059]" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Branding & Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C8474] font-semibold mb-0.5">Islamic Suite</span>
            <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-[#3A4D39] flex items-baseline gap-1">
              Noor<span className="text-[#C5A059]">.</span>
              <span className="font-arabic font-normal text-[#C5A059] text-xl ml-1">نُورْ</span>
            </h1>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-[#3A4D39] text-[#F9F7F2] border border-[#3A4D39] shadow-xs'
                    : 'bg-[#FFFFFF] text-[#5C635A] hover:text-[#3A4D39] border border-[#E6E1D3] hover:border-[#C5A059]/60'
                }`}
              >
                <span className={isActive ? 'text-[#C5A059]' : 'text-[#8C8474]'}>{tab.icon}</span>
                <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
