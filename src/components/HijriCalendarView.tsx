import React, { useState } from 'react';
import { ISLAMIC_EVENTS, getHijriDate, HIJRI_MONTHS_EN } from '../data/islamicEvents';
import { Calendar, ArrowRightLeft, Sparkles, Clock } from 'lucide-react';

export const HijriCalendarView: React.FC = () => {
  const [gregorianInput, setGregorianInput] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const selectedDate = new Date(gregorianInput);
  const convertedHijri = getHijriDate(selectedDate);
  const todayHijri = getHijriDate(new Date());

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#3A4D39] text-[#F9F7F2] p-8 rounded-sm border border-[#3A4D39] shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-[#F9F7F2]/10 text-[#C5A059] px-3 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-[0.2em] border border-[#F9F7F2]/20">
          <Calendar className="w-3.5 h-3.5" />
          <span>Islamic Calendar & Events • التقويم الهجري</span>
        </div>
        <h2 className="text-3xl font-serif text-[#F9F7F2]">Hijri Date Converter & Holy Events</h2>
        <p className="text-xs font-serif italic text-[#A8B5A3]">
          Convert Gregorian dates to Hijri calendar and explore key spiritual occasions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Converter Card */}
        <div className="md:col-span-1 bg-[#FFFFFF] p-6 rounded-sm border border-[#E6E1D3] shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-sm text-[#3A4D39] uppercase tracking-wider flex items-center gap-2 border-b pb-2 border-[#E6E1D3]">
            <ArrowRightLeft className="w-4 h-4 text-[#C5A059]" />
            <span>Date Converter</span>
          </h3>

          <div>
            <label className="block text-xs font-serif text-[#8C8474] mb-1">
              Select Gregorian Date
            </label>
            <input
              type="date"
              value={gregorianInput}
              onChange={(e) => setGregorianInput(e.target.value)}
              className="w-full p-2.5 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] text-sm focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="p-5 rounded-sm bg-[#3A4D39] text-[#F9F7F2] border border-[#3A4D39] text-center space-y-1">
            <span className="text-[10px] text-[#C5A059] uppercase tracking-[0.2em] block font-semibold">EQUIVALENT HIJRI DATE</span>
            <div className="text-2xl font-serif font-bold text-[#F9F7F2]">
              {convertedHijri.day} {convertedHijri.monthNameEn} {convertedHijri.year} AH
            </div>
            <div className="font-arabic text-xl text-[#C5A059]">
              {convertedHijri.day} {convertedHijri.monthNameAr} {convertedHijri.year} هـ
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-serif font-bold text-base text-[#3A4D39] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span>Major Islamic Occasions & Holy Dates</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ISLAMIC_EVENTS.map((event) => {
              const isCurrentMonth = todayHijri.month === event.hijriMonth;

              return (
                <div
                  key={event.title}
                  className={`p-4 rounded-sm border space-y-2 transition-all ${
                    isCurrentMonth
                      ? 'bg-[#F9F7F2] border-[#C5A059] shadow-xs'
                      : 'bg-[#FFFFFF] border-[#E6E1D3]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-serif font-bold">
                    <span className="text-[#C5A059]">{event.hijriDay} {HIJRI_MONTHS_EN[event.hijriMonth - 1]}</span>
                    <span className="font-arabic font-normal text-[#3A4D39]">{event.arabicTitle}</span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#3A4D39]">{event.title}</h4>
                  <p className="text-xs font-serif text-[#5C635A]">{event.description}</p>

                  <div className="text-[11px] font-serif text-[#3A4D39] font-medium pt-1 border-t border-[#E6E1D3]">
                    <span className="text-[#C5A059]">Significance:</span> {event.significance}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
