import React, { useState, useEffect } from 'react';
import { LocationState, UserSettings, PrayerTime, AppLanguage } from '../types';
import { calculatePrayerTimes, getDistanceToKaaba } from '../utils/prayerTimes';
import { Clock, MapPin, Compass, Volume2, RefreshCw, ChevronRight, Settings2, Calendar } from 'lucide-react';

interface PrayerTimesViewProps {
  location: LocationState;
  setLocation: (loc: LocationState) => void;
  settings: UserSettings;
  updateSettings: (s: Partial<UserSettings>) => void;
  language: AppLanguage;
}

const WORLD_CITIES = [
  { city: 'Makkah', country: 'Saudi Arabia', lat: 21.4225, lng: 39.8262 },
  { city: 'Madinah', country: 'Saudi Arabia', lat: 24.4672, lng: 39.6108 },
  { city: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
  { city: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
  { city: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060 },
  { city: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784 },
  { city: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708 },
  { city: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456 },
  { city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lng: 101.6869 },
  { city: 'Karachi', country: 'Pakistan', lat: 24.8607, lng: 67.0011 },
  { city: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753 },
  { city: 'Amman', country: 'Jordan', lat: 31.9454, lng: 35.9284 },
  { city: 'Baghdad', country: 'Iraq', lat: 33.3152, lng: 44.3661 },
  { city: 'Rabat', country: 'Morocco', lat: 34.0209, lng: -6.8416 },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 }
];

export const PrayerTimesView: React.FC<PrayerTimesViewProps> = ({
  location,
  setLocation,
  settings,
  updateSettings,
  language
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [citySearch, setCitySearch] = useState<string>('');
  const [isPlayingAdhan, setIsPlayingAdhan] = useState<boolean>(false);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { prayerList, nextPrayer, qiblaDirection } = calculatePrayerTimes(
    location.latitude,
    location.longitude,
    now,
    settings.calculationMethod,
    settings.asrJuristic
  );

  const kaabaDist = getDistanceToKaaba(location.latitude, location.longitude);

  // Time remaining to next prayer calculation
  const getTimeRemainingStr = () => {
    if (!nextPrayer) return '--:--:--';
    const diff = nextPrayer.date.getTime() - now.getTime();
    if (diff <= 0) return '00:00:00';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            city: 'My Location (GPS)',
            country: 'Auto Detected',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            isAuto: true
          });
        },
        (err) => {
          alert('Could not access device location. Please select your city manually.');
        }
      );
    }
  };

  const playSampleAdhan = () => {
    if (isPlayingAdhan && audioObj) {
      audioObj.pause();
      setIsPlayingAdhan(false);
      return;
    }

    const audio = new Audio('https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3');
    audio.play();
    setAudioObj(audio);
    setIsPlayingAdhan(true);
    audio.onended = () => setIsPlayingAdhan(false);
  };

  const filteredCities = WORLD_CITIES.filter(c =>
    c.city.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Current & Next Prayer Editorial Hero Section */}
      <div className="relative overflow-hidden rounded-sm bg-[#3A4D39] text-[#F9F7F2] p-8 border border-[#3A4D39] shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#F9F7F2]/10 border border-[#F9F7F2]/20 text-[#F9F7F2] px-3.5 py-1 rounded-sm text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{location.city}, {location.country}</span>
              <button 
                onClick={handleGeolocate} 
                className="ml-2 hover:text-[#C5A059] underline font-serif italic text-[11px]"
              >
                (Use GPS)
              </button>
            </div>

            {nextPrayer ? (
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#A8B5A3] font-semibold block mb-1">
                  {language === 'ar' ? 'الصلاة القادمة' : 'NEXT PRAYER'}
                </span>
                <h2 className="text-4xl sm:text-5xl font-serif tracking-tight text-[#F9F7F2] flex items-baseline gap-3">
                  <span>{nextPrayer.name}</span>
                  <span className="font-arabic font-normal text-3xl sm:text-4xl text-[#C5A059]">{nextPrayer.arabicName}</span>
                </h2>
                <p className="text-[#A8B5A3] text-base font-serif italic mt-1">at {nextPrayer.time}</p>
              </div>
            ) : (
              <h2 className="text-3xl font-serif text-[#C5A059]">Calculating Prayer Times...</h2>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#A8B5A3] pt-1">
              <span className="flex items-center gap-1.5 bg-[#2C332B]/50 px-3 py-1 rounded-sm border border-[#ffffff15]">
                <Compass className="w-3.5 h-3.5 text-[#C5A059]" />
                Qibla: <strong className="text-[#F9F7F2] font-mono">{qiblaDirection}°</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-[#2C332B]/50 px-3 py-1 rounded-sm border border-[#ffffff15]">
                Distance to Kaaba: <strong className="text-[#F9F7F2] font-mono">{kaabaDist.toLocaleString()} km</strong>
              </span>
            </div>
          </div>

          {/* Real-time Countdown Box */}
          <div className="bg-[#2C332B]/70 border border-[#C5A059]/40 rounded-sm p-6 text-center min-w-[260px] shadow-sm">
            <span className="text-[10px] font-semibold text-[#A8B5A3] uppercase tracking-[0.25em] block mb-2">
              {language === 'ar' ? 'الوقت المتبقي' : 'TIME REMAINING'}
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-bold tracking-wider text-[#C5A059] my-2">
              {getTimeRemainingStr()}
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={playSampleAdhan}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isPlayingAdhan 
                    ? 'bg-[#C5A059] text-[#2C332B] font-bold animate-pulse' 
                    : 'bg-[#3A4D39] hover:bg-[#3A4D39]/80 text-[#F9F7F2] border border-[#A8B5A3]/30'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                {isPlayingAdhan ? 'Pause Adhan' : 'Test Adhan'}
              </button>

              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-1.5 rounded-sm bg-[#3A4D39] hover:bg-[#3A4D39]/80 border border-[#A8B5A3]/30 text-[#A8B5A3] hover:text-[#F9F7F2] transition-colors"
                title="Prayer Calculation Settings"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Prayer Schedule Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-[#E6E1D3] pb-2">
          <h3 className="text-xl font-serif text-[#3A4D39] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C5A059]" />
            <span>Today's Prayer Schedule</span>
          </h3>
          <span className="text-[11px] uppercase tracking-wider text-[#8C8474]">
            Method: {settings.calculationMethod} ({settings.asrJuristic.toUpperCase()})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {prayerList.map((prayer) => {
            return (
              <div
                key={prayer.name}
                className={`p-5 rounded-sm border transition-all duration-200 flex flex-col justify-between ${
                  prayer.isNext
                    ? 'bg-[#3A4D39] text-[#F9F7F2] border-2 border-[#C5A059] shadow-sm font-semibold'
                    : prayer.isCurrent
                    ? 'bg-[#5C635A] text-white border-[#3A4D39] shadow-xs'
                    : 'bg-[#FFFFFF] text-[#2C332B] border border-[#E6E1D3] hover:border-[#C5A059]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${prayer.isNext ? 'text-[#C5A059]' : 'text-[#8C8474]'}`}>
                    {prayer.name}
                  </span>
                  {prayer.isNext && (
                    <span className="text-[9px] bg-[#C5A059] text-[#2C332B] px-1.5 py-0.5 rounded-xs font-bold tracking-widest">
                      NEXT
                    </span>
                  )}
                </div>

                <div className="my-3">
                  <div className="text-2xl font-serif font-bold tracking-tight">
                    {prayer.time}
                  </div>
                  <div className={`font-arabic text-lg ${prayer.isNext ? 'text-[#C5A059]' : 'text-[#5C635A]'}`}>
                    {prayer.arabicName}
                  </div>
                </div>

                <div className={`text-[10px] uppercase tracking-wider ${prayer.isNext ? 'text-[#A8B5A3]' : 'text-[#8C8474]'}`}>
                  {prayer.name === 'Sunrise' ? 'Ishraq / Duha start' : 'Salah Time'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popular Cities Grid */}
      <div className="bg-[#FFFFFF] rounded-sm p-6 border border-[#E6E1D3]">
        <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C8474] mb-4 flex items-center justify-between">
          <span>Popular Islamic Cities</span>
          <input
            type="text"
            placeholder="Search city..."
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] focus:outline-none focus:border-[#C5A059]"
          />
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
          {filteredCities.slice(0, 16).map((c) => (
            <button
              key={`${c.city}-${c.country}`}
              onClick={() => setLocation({
                city: c.city,
                country: c.country,
                latitude: c.lat,
                longitude: c.lng,
                isAuto: false
              })}
              className={`p-2.5 rounded-sm text-xs font-medium text-left border transition-colors ${
                location.city === c.city 
                  ? 'bg-[#3A4D39] text-[#F9F7F2] border-[#3A4D39] font-bold' 
                  : 'bg-[#F9F7F2] text-[#2C332B] border-[#E6E1D3] hover:border-[#C5A059]'
              }`}
            >
              <div className="truncate font-serif">{c.city}</div>
              <div className="text-[10px] text-[#8C8474] truncate">{c.country}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-[#2C332B]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] text-[#2C332B] rounded-sm p-6 max-w-md w-full border border-[#E6E1D3] shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-[#E6E1D3]">
              <h3 className="font-serif font-bold text-xl text-[#3A4D39]">Prayer Calculation Settings</h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-[#8C8474] hover:text-[#2C332B]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#8C8474]">
                  Calculation Method
                </label>
                <select
                  value={settings.calculationMethod}
                  onChange={(e) => updateSettings({ calculationMethod: e.target.value })}
                  className="w-full p-2.5 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-sm text-[#2C332B] focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="MWL">Muslim World League (MWL)</option>
                  <option value="Egyptian">Egyptian General Authority of Survey</option>
                  <option value="ISNA">Islamic Society of North America (ISNA)</option>
                  <option value="UmmAlQura">Umm Al-Qura University, Makkah</option>
                  <option value="Gulf">Gulf Region / Dubai</option>
                  <option value="Turkey">Diyanet İşleri Başkanlığı (Turkey)</option>
                  <option value="Karachi">University of Islamic Sciences, Karachi</option>
                  <option value="Moonsighting">Moonsighting Committee Worldwide</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#8C8474]">
                  Asr Juristic Method (Madhab)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSettings({ asrJuristic: 'shafi' })}
                    className={`p-2.5 rounded-sm border text-xs font-medium ${
                      settings.asrJuristic === 'shafi' 
                        ? 'bg-[#3A4D39] text-[#F9F7F2] border-[#3A4D39] font-bold' 
                        : 'bg-[#F9F7F2] text-[#2C332B] border-[#E6E1D3]'
                    }`}
                  >
                    Shafi'i / Maliki / Hanbali
                  </button>
                  <button
                    onClick={() => updateSettings({ asrJuristic: 'hanafi' })}
                    className={`p-2.5 rounded-sm border text-xs font-medium ${
                      settings.asrJuristic === 'hanafi' 
                        ? 'bg-[#3A4D39] text-[#F9F7F2] border-[#3A4D39] font-bold' 
                        : 'bg-[#F9F7F2] text-[#2C332B] border-[#E6E1D3]'
                    }`}
                  >
                    Hanafi
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E6E1D3] flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 bg-[#3A4D39] hover:bg-[#3A4D39]/90 text-[#F9F7F2] font-semibold rounded-sm text-xs uppercase tracking-wider"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
