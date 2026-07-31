import React, { useState, useEffect } from 'react';
import { ToolTab, LocationState, UserSettings, BookmarkAyah, AppLanguage } from './types';
import { Header } from './components/Header';
import { PrayerTimesView } from './components/PrayerTimesView';
import { SearchView } from './components/SearchView';
import { TrackerView } from './components/TrackerView';
import { QuranView } from './components/QuranView';
import { HadithView } from './components/HadithView';
import { TasbeehView } from './components/TasbeehView';
import { AdhkarView } from './components/AdhkarView';
import { QiblaView } from './components/QiblaView';
import { ZakatView } from './components/ZakatView';
import { InheritanceView } from './components/InheritanceView';
import { Names99View } from './components/Names99View';
import { HijriCalendarView } from './components/HijriCalendarView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<ToolTab>('prayer');
  const [language, setLanguage] = useState<AppLanguage>('en');

  const [location, setLocation] = useState<LocationState>({
    city: 'Makkah',
    country: 'Saudi Arabia',
    latitude: 21.4225,
    longitude: 39.8262,
    isAuto: false
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('nur_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      theme: 'emerald',
      arabicFont: 'Amiri',
      arabicFontSize: 24,
      reciter: 'ar.alafasy',
      calculationMethod: 'UmmAlQura',
      asrJuristic: 'shafi',
      adhanSoundEnabled: true,
      translation: 'saheeh'
    };
  });

  const [bookmarks, setBookmarks] = useState<BookmarkAyah[]>(() => {
    const saved = localStorage.getItem('nur_quran_bookmarks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('nur_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('nur_quran_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Attempt auto-geolocation on startup
  useEffect(() => {
    if (navigator.geolocation && !location.isAuto) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            city: 'Current Location',
            country: 'GPS Detected',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            isAuto: true
          });
        },
        () => {
          // Keep default Makkah if permission denied
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleBookmark = (bm: BookmarkAyah) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.surahNumber === bm.surahNumber && b.ayahNumber === bm.ayahNumber);
      if (exists) {
        return prev.filter(b => !(b.surahNumber === bm.surahNumber && b.ayahNumber === bm.ayahNumber));
      } else {
        return [...prev, bm];
      }
    });
  };

  const cycleTheme = () => {
    const themes: UserSettings['theme'][] = ['emerald', 'dark', 'sepia'];
    const nextIndex = (themes.indexOf(settings.theme) + 1) % themes.length;
    updateSettings({ theme: themes[nextIndex] });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans pb-20 md:pb-0 ${
      settings.theme === 'dark'
        ? 'bg-[#1C221B] text-[#F9F7F2]'
        : settings.theme === 'sepia'
        ? 'bg-[#F2ECE1] text-[#2C332B]'
        : 'bg-[#F9F7F2] text-[#2C332B]'
    }`}>
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        updateSettings={updateSettings}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'prayer' && (
          <PrayerTimesView
            location={location}
            setLocation={setLocation}
            settings={settings}
            updateSettings={updateSettings}
            language={language}
          />
        )}

        {activeTab === 'search' && (
          <SearchView language={language} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'tracker' && (
          <TrackerView setActiveTab={setActiveTab} />
        )}

        {activeTab === 'quran' && (
          <QuranView
            settings={settings}
            updateSettings={updateSettings}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
            language={language}
          />
        )}

        {activeTab === 'hadith' && (
          <HadithView language={language} />
        )}

        {activeTab === 'tasbeeh' && (
          <TasbeehView />
        )}

        {activeTab === 'adhkar' && (
          <AdhkarView language={language} />
        )}

        {activeTab === 'qibla' && (
          <QiblaView location={location} setLocation={setLocation} language={language} />
        )}

        {activeTab === 'zakat' && (
          <ZakatView />
        )}

        {activeTab === 'inheritance' && (
          <InheritanceView />
        )}

        {activeTab === 'names' && (
          <Names99View />
        )}

        {activeTab === 'calendar' && (
          <HijriCalendarView />
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} language={language} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        cycleTheme={cycleTheme}
      />
    </div>
  );
}
