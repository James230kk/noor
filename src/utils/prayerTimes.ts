import { Coordinates, CalculationMethod, PrayerTimes, Qibla, Madhab } from 'adhan';
import { PrayerTime } from '../types';

export function calculatePrayerTimes(
  lat: number,
  lng: number,
  date: Date = new Date(),
  methodKey: string = 'MWL',
  asrJuristic: 'shafi' | 'hanafi' = 'shafi'
): { prayerList: PrayerTime[]; nextPrayer: PrayerTime | null; qiblaDirection: number; raw: PrayerTimes } {
  const coordinates = new Coordinates(lat, lng);

  let params = CalculationMethod.MuslimWorldLeague();
  switch (methodKey) {
    case 'Egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'ISNA':
      params = CalculationMethod.NorthAmerica();
      break;
    case 'UmmAlQura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'Gulf':
      params = CalculationMethod.Dubai();
      break;
    case 'Moonsighting':
      params = CalculationMethod.MoonsightingCommittee();
      break;
    case 'Karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'Singapore':
      params = CalculationMethod.Singapore();
      break;
    case 'Turkey':
      params = CalculationMethod.Turkey();
      break;
    case 'MWL':
    default:
      params = CalculationMethod.MuslimWorldLeague();
      break;
  }

  if (asrJuristic === 'hanafi') {
    params.madhab = Madhab.Hanafi;
  } else {
    params.madhab = Madhab.Shafi;
  }

  const pTimes = new PrayerTimes(coordinates, date, params);

  const formatTimeStr = (timeDate: Date) => {
    return timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const list: PrayerTime[] = [
    { name: 'Fajr', arabicName: 'الفجر', time: formatTimeStr(pTimes.fajr), date: pTimes.fajr },
    { name: 'Sunrise', arabicName: 'الشروق', time: formatTimeStr(pTimes.sunrise), date: pTimes.sunrise },
    { name: 'Dhuhr', arabicName: 'الظهر', time: formatTimeStr(pTimes.dhuhr), date: pTimes.dhuhr },
    { name: 'Asr', arabicName: 'العصر', time: formatTimeStr(pTimes.asr), date: pTimes.asr },
    { name: 'Maghrib', arabicName: 'المغرب', time: formatTimeStr(pTimes.maghrib), date: pTimes.maghrib },
    { name: 'Isha', arabicName: 'العشاء', time: formatTimeStr(pTimes.isha), date: pTimes.isha }
  ];

  const now = new Date();
  let nextP: PrayerTime | null = null;
  let currentP: PrayerTime | null = null;

  for (let i = 0; i < list.length; i++) {
    if (list[i].date > now) {
      nextP = list[i];
      if (i > 0) currentP = list[i - 1];
      break;
    }
  }

  if (!nextP) {
    // Tomorrow Fajr is next prayer
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params);
    nextP = {
      name: 'Fajr',
      arabicName: 'الفجر',
      time: formatTimeStr(tomorrowTimes.fajr),
      date: tomorrowTimes.fajr
    };
    currentP = list[list.length - 1];
  }

  const finalPrayerList = list.map(p => ({
    ...p,
    isNext: nextP?.name === p.name,
    isCurrent: currentP?.name === p.name
  }));

  const qiblaAngle = Qibla(coordinates);

  return {
    prayerList: finalPrayerList,
    nextPrayer: nextP,
    qiblaDirection: Math.round(qiblaAngle),
    raw: pTimes
  };
}

// Calculate distance from lat/lng to Kaaba in Makkah (21.4225° N, 39.8262° E)
export function getDistanceToKaaba(lat: number, lng: number): number {
  const R = 6371; // Radius of Earth in km
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;

  const dLat = (kaabaLat - lat) * (Math.PI / 180);
  const dLng = (kaabaLng - lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat * (Math.PI / 180)) *
      Math.cos(kaabaLat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
