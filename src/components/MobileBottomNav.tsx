import React, { useState } from 'react';
import { ToolTab, AppLanguage } from '../types';
import { 
  Clock, 
  BookOpen, 
  Compass, 
  BookMarked, 
  BarChart3, 
  MoreHorizontal, 
  Sparkles, 
  HeartHandshake, 
  Calculator, 
  Users, 
  Calendar, 
  Search, 
  X,
  Languages,
  SunMoon
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: ToolTab;
  setActiveTab: (tab: ToolTab) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  cycleTheme: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  cycleTheme
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainNavItems: { id: ToolTab; labelEn: string; labelAr: string; labelId: string; icon: React.ReactNode }[] = [
    { id: 'prayer', labelEn: 'Prayer', labelAr: 'الصلاة', labelId: 'Sholat', icon: <Clock className="w-5 h-5" /> },
    { id: 'quran', labelEn: 'Quran', labelAr: 'القرآن', labelId: 'Qur\'an', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'qibla', labelEn: 'Qibla', labelAr: 'القبلة', labelId: 'Kiblat', icon: <Compass className="w-5 h-5" /> },
    { id: 'hadith', labelEn: 'Hadith', labelAr: 'الحديث', labelId: 'Hadis', icon: <BookMarked className="w-5 h-5" /> },
    { id: 'tracker', labelEn: 'Tracker', labelAr: 'الإنجاز', labelId: 'Pelacak', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const secondaryNavItems: { id: ToolTab; labelEn: string; labelAr: string; labelId: string; icon: React.ReactNode }[] = [
    { id: 'search', labelEn: 'Search Engine', labelAr: 'البحث الشامل', labelId: 'Pencarian Islam', icon: <Search className="w-4 h-4" /> },
    { id: 'tasbeeh', labelEn: 'Tasbeeh Counter', labelAr: 'المسبحة الإلكترونية', labelId: 'Tasbih Digital', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'adhkar', labelEn: 'Daily Adhkar', labelAr: 'الأذكار والأدعية', labelId: 'Dzikir & Doa', icon: <HeartHandshake className="w-4 h-4" /> },
    { id: 'zakat', labelEn: 'Zakat Calculator', labelAr: 'حاسبة الزكاة', labelId: 'Kalkulator Zakat', icon: <Calculator className="w-4 h-4" /> },
    { id: 'inheritance', labelEn: 'Inheritance Shares', labelAr: 'حاسبة المواريث', labelId: 'Kalkulator Waris', icon: <Users className="w-4 h-4" /> },
    { id: 'names', labelEn: '99 Names of Allah', labelAr: 'أسماء الله الحسنى', labelId: '99 Asmaul Husna', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'calendar', labelEn: 'Hijri Calendar', labelAr: 'التقويم الهجري', labelId: 'Kalender Hijriah', icon: <Calendar className="w-4 h-4" /> },
  ];

  const handleSelectTab = (tab: ToolTab) => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    setActiveTab(tab);
    setIsMoreOpen(false);
  };

  const cycleLang = () => {
    const langs: AppLanguage[] = ['en', 'ar', 'id'];
    const nextIndex = (langs.indexOf(language) + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  const getLangLabel = () => {
    if (language === 'ar') return 'العربية';
    if (language === 'id') return 'Indonesian';
    return 'English';
  };

  return (
    <>
      {/* Fixed Bottom Bar for Mobile Devices */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#2C332B] text-[#F9F7F2] border-t border-[#C5A059]/40 shadow-2xl px-1 py-1 flex items-center justify-around select-none">
        {mainNavItems.map((item) => {
          const isActive = activeTab === item.id;
          const label = language === 'ar' ? item.labelAr : language === 'id' ? item.labelId : item.labelEn;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-sm transition-all active:scale-95 ${
                isActive ? 'text-[#C5A059] font-bold' : 'text-[#A8B5A3] hover:text-[#F9F7F2]'
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? 'bg-[#C5A059]/20' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-serif leading-none mt-1">{label}</span>
            </button>
          );
        })}

        {/* More Menu Trigger */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-sm transition-all active:scale-95 ${
            isMoreOpen ? 'text-[#C5A059] font-bold' : 'text-[#A8B5A3] hover:text-[#F9F7F2]'
          }`}
        >
          <div className="p-1 rounded-full">
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-serif leading-none mt-1">
            {language === 'ar' ? 'المزيد' : language === 'id' ? 'Lainnya' : 'More'}
          </span>
        </button>
      </nav>

      {/* Mobile Drawer Overlay for "More" tools */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 bg-[#2C332B]/80 backdrop-blur-xs flex flex-col justify-end md:hidden animate-fade-in">
          <div className="bg-[#F9F7F2] text-[#2C332B] rounded-t-lg p-5 border-t-2 border-[#C5A059] shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-[#E6E1D3]">
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif text-[#3A4D39]">Noorm Mobile Menu</span>
                <span className="text-xs font-arabic text-[#C5A059]">نُورْمْ</span>
              </div>
              <button 
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full bg-[#E6E1D3]/50 text-[#3A4D39] hover:bg-[#E6E1D3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar inside Menu */}
            <div className="flex items-center justify-between p-3 rounded-sm bg-[#3A4D39] text-[#F9F7F2] text-xs">
              <span className="font-serif font-semibold text-[#C5A059]">Language & Appearance</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={cycleLang}
                  className="px-2.5 py-1 rounded-sm bg-[#F9F7F2] text-[#3A4D39] font-serif font-bold text-[11px] flex items-center gap-1"
                >
                  <Languages className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{getLangLabel()}</span>
                </button>
                <button
                  onClick={cycleTheme}
                  className="p-1.5 rounded-sm bg-[#F9F7F2] text-[#3A4D39]"
                >
                  <SunMoon className="w-4 h-4 text-[#C5A059]" />
                </button>
              </div>
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              {secondaryNavItems.map((item) => {
                const isActive = activeTab === item.id;
                const label = language === 'ar' ? item.labelAr : language === 'id' ? item.labelId : item.labelEn;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-sm text-xs font-serif text-left border transition-all active:scale-98 ${
                      isActive 
                        ? 'bg-[#3A4D39] text-[#F9F7F2] border-[#3A4D39]' 
                        : 'bg-[#FFFFFF] text-[#3A4D39] border-[#E6E1D3] hover:border-[#C5A059]'
                    }`}
                  >
                    <span className={isActive ? 'text-[#C5A059]' : 'text-[#8C8474]'}>{item.icon}</span>
                    <span className="font-semibold">{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-center pt-2 text-[10px] font-serif text-[#8C8474] border-t border-[#E6E1D3]">
              Noorm Mobile Suite • Sadaqah Jariyah
            </div>
          </div>
        </div>
      )}
    </>
  );
};
