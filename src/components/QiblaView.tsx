import React, { useState, useEffect, useCallback } from 'react';
import { LocationState } from '../types';
import { calculatePrayerTimes, getDistanceToKaaba } from '../utils/prayerTimes';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  Info, 
  RotateCw, 
  Crosshair, 
  AlertTriangle, 
  CheckCircle2, 
  Smartphone,
  Zap,
  Globe
} from 'lucide-react';

interface QiblaViewProps {
  location: LocationState;
  setLocation: (loc: LocationState) => void;
}

export const QiblaView: React.FC<QiblaViewProps> = ({ location, setLocation }) => {
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [hasCompassSensor, setHasCompassSensor] = useState<boolean>(false);
  const [permissionRequested, setPermissionRequested] = useState<boolean>(false);
  
  // Real GPS state
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLiveGpsActive, setIsLiveGpsActive] = useState<boolean>(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Calibration modal state
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);

  // Calculate Qibla angle based on current location coordinates
  const { qiblaDirection } = calculatePrayerTimes(
    location.latitude,
    location.longitude,
    new Date()
  );

  const distanceToKaabaKm = getDistanceToKaaba(location.latitude, location.longitude);
  const distanceToKaabaMiles = Math.round(distanceToKaabaKm * 0.621371);

  // Handle device orientation events (compass)
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading: number | null = null;
      
      // iOS Webkit Compass Heading
      const iosCompass = (e as any).webkitCompassHeading;
      if (iosCompass !== undefined && iosCompass !== null) {
        heading = iosCompass;
        setHasCompassSensor(true);
      } else if (e.alpha !== null) {
        // Standard Android / Chrome relative or absolute heading
        // e.alpha represents rotation around Z-axis [0, 360]
        heading = (360 - e.alpha) % 360;
        setHasCompassSensor(true);
      }

      if (heading !== null) {
        setDeviceHeading(Math.round(heading));
      }
    };

    // Try attaching both standard and absolute orientation listeners
    window.addEventListener('deviceorientationabsolute' as any, handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientationabsolute' as any, handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  // Request Orientation permission on iOS 13+ devices
  const requestCompassPermission = async () => {
    setPermissionRequested(true);
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setHasCompassSensor(true);
        } else {
          setGpsError('Device orientation permission denied.');
        }
      } catch (err) {
        console.warn('Compass permission error', err);
      }
    } else {
      setHasCompassSensor(true);
    }
  };

  // Acquire Real GPS Location
  const requestGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsGpsLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGpsAccuracy(Math.round(pos.coords.accuracy));

        // Try reverse geocoding city name if possible, or fallback
        let cityName = 'Live GPS Location';
        let countryName = '';

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
          );
          if (response.ok) {
            const data = await response.json();
            cityName = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'GPS Spot';
            countryName = data.address?.country || '';
          }
        } catch (e) {
          // Ignore network errors in geocode lookup
        }

        setLocation({
          city: cityName,
          country: countryName || `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
          latitude: lat,
          longitude: lng
        });

        // Trigger light haptic feedback on success
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      },
      (err) => {
        setIsGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Please allow GPS access in browser permissions.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsError('GPS signal unavailable. Try stepping outdoors.');
        } else {
          setGpsError('Failed to acquire GPS location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }, [setLocation]);

  // Toggle Continuous Real GPS Tracking
  const toggleLiveGpsWatch = () => {
    if (isLiveGpsActive && watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsLiveGpsActive(false);
    } else {
      if (!navigator.geolocation) return;
      setIsLiveGpsActive(true);
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsAccuracy(Math.round(pos.coords.accuracy));
          setLocation({
            ...location,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        (err) => console.warn('Watch GPS Error', err),
        { enableHighAccuracy: true }
      );
      setWatchId(id);
    }
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Alignment Calculation
  const currentHeading = deviceHeading ?? 0;
  const compassDialRotation = 360 - currentHeading;
  
  // Angle difference between device heading and qibla
  const headingDiff = Math.abs((currentHeading - qiblaDirection + 540) % 360 - 180);
  const isAligned = deviceHeading !== null && headingDiff <= 6;

  // Haptic feedback on exact alignment
  useEffect(() => {
    if (isAligned && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [isAligned]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#3A4D39] text-[#F9F7F2] p-8 rounded-sm border border-[#3A4D39] shadow-xs text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-[#F9F7F2]/10 text-[#C5A059] px-3 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-[0.2em] border border-[#F9F7F2]/20">
          <Compass className="w-3.5 h-3.5" />
          <span>Real GPS Qibla Compass • اتجاه القبلة بالبوصلة ونظام تحديد المواقع</span>
        </div>
        <h2 className="text-3xl font-serif text-[#F9F7F2]">Precision Qibla Direction Finder</h2>
        <p className="text-xs font-serif italic text-[#A8B5A3]">
          Live GPS coordinates and device magnetometer bearing towards the Holy Kaaba in Makkah.
        </p>
      </div>

      {/* GPS Location & Compass Controls */}
      <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#E6E1D3] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b pb-4 border-[#E6E1D3]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#C5A059]" />
            <div>
              <div className="font-serif font-bold text-[#3A4D39] text-sm">
                {location.city}, {location.country}
              </div>
              <div className="text-[#8C8474] text-[11px] font-mono">
                Lat: {location.latitude.toFixed(4)}°, Lon: {location.longitude.toFixed(4)}°
                {gpsAccuracy && ` (Accuracy: ±${gpsAccuracy}m)`}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={requestGpsLocation}
              disabled={isGpsLoading}
              className="px-3.5 py-2 rounded-sm bg-[#3A4D39] hover:bg-[#3A4D39]/90 text-[#F9F7F2] text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 disabled:opacity-50"
            >
              <Crosshair className={`w-3.5 h-3.5 text-[#C5A059] ${isGpsLoading ? 'animate-spin' : ''}`} />
              <span>{isGpsLoading ? 'Locating...' : 'Get Live GPS'}</span>
            </button>

            <button
              onClick={toggleLiveGpsWatch}
              className={`px-3 py-2 rounded-sm text-xs font-serif font-semibold uppercase tracking-wider flex items-center gap-1 border ${
                isLiveGpsActive 
                  ? 'bg-[#C5A059] text-[#2C332B] border-[#C5A059]' 
                  : 'bg-[#F9F7F2] text-[#3A4D39] border-[#E6E1D3] hover:border-[#C5A059]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isLiveGpsActive ? 'Live Watch: ON' : 'Live Watch'}</span>
            </button>
          </div>
        </div>

        {gpsError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-sm text-xs flex items-center gap-2 font-serif">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* Qibla Angle Metrics & Distance */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-xs">
          <div className="p-3 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] font-serif">
            <span className="block text-[10px] text-[#8C8474] uppercase tracking-wider">Required Qibla Bearing</span>
            <strong className="text-xl text-[#3A4D39] font-sans font-bold">{qiblaDirection}° N</strong>
          </div>

          <div className="p-3 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] font-serif">
            <span className="block text-[10px] text-[#8C8474] uppercase tracking-wider">Distance to Makkah</span>
            <strong className="text-xl text-[#3A4D39] font-sans font-bold">{distanceToKaabaKm.toLocaleString()} km</strong>
            <span className="block text-[10px] text-[#8C8474]">({distanceToKaabaMiles.toLocaleString()} miles)</span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] font-serif">
            <span className="block text-[10px] text-[#8C8474] uppercase tracking-wider">Device Heading</span>
            <strong className="text-xl text-[#C5A059] font-sans font-bold">
              {deviceHeading !== null ? `${deviceHeading}°` : 'Sensor Offline'}
            </strong>
          </div>
        </div>
      </div>

      {/* Alignment Status Toast */}
      {isAligned ? (
        <div className="bg-[#3A4D39] text-[#F9F7F2] p-4 rounded-sm border-2 border-[#C5A059] text-center space-y-1 shadow-md animate-pulse">
          <div className="font-serif font-bold text-lg text-[#C5A059] flex items-center justify-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-[#C5A059]" />
            <span>ALIGNED WITH KAABA! 🕋</span>
          </div>
          <p className="text-xs font-serif text-[#A8B5A3]">
            You are currently facing directly towards the Holy Kaaba in Makkah ({qiblaDirection}°).
          </p>
        </div>
      ) : null}

      {/* Visual Compass Canvas Dial */}
      <div className="bg-[#FFFFFF] rounded-sm p-8 border border-[#E6E1D3] shadow-xs flex flex-col items-center justify-center space-y-6">
        <div className="relative w-72 h-72 rounded-full border-8 border-[#E6E1D3] bg-[#3A4D39] flex items-center justify-center shadow-inner overflow-hidden">
          {/* Compass Rose Ring */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${compassDialRotation}deg)` }}
          >
            {/* Cardinal Direction Indicators */}
            <span className="absolute top-3 font-serif font-bold text-[#C5A059] text-base">N</span>
            <span className="absolute bottom-3 font-serif font-bold text-[#A8B5A3] text-sm">S</span>
            <span className="absolute right-3 font-serif font-bold text-[#A8B5A3] text-sm">E</span>
            <span className="absolute left-3 font-serif font-bold text-[#A8B5A3] text-sm">W</span>

            {/* Inner Ticks ring */}
            <div className="absolute inset-4 rounded-full border border-[#ffffff15] pointer-events-none"></div>

            {/* Qibla Needle Pointing to Kaaba relative to North */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ transform: `rotate(${qiblaDirection}deg)` }}
            >
              <div className="w-2 h-32 bg-[#C5A059] rounded-full flex flex-col items-center justify-start -mt-32 shadow-lg">
                <div className="w-8 h-8 rounded-sm bg-[#C5A059] text-[#2C332B] font-bold text-xs flex items-center justify-center shadow-md -mt-4 border border-[#3A4D39]">
                  🕋
                </div>
              </div>
            </div>
          </div>

          {/* Current Device Forward Arrow */}
          <div className="absolute top-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-12 border-b-[#C5A059] z-20 pointer-events-none" />

          {/* Center Hub */}
          <div className="w-16 h-16 rounded-full bg-[#C5A059] text-[#2C332B] font-serif font-bold text-xs flex flex-col items-center justify-center shadow-md z-10 border-2 border-[#3A4D39]">
            <span className="text-[10px] tracking-widest uppercase">KAABA</span>
            <span className="text-xs font-sans font-bold">{qiblaDirection}°</span>
          </div>
        </div>

        {/* Orientation & Sensor Calibration Tools */}
        <div className="p-5 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] text-xs text-[#5C635A] space-y-3 text-center w-full">
          <div className="font-serif font-bold text-[#3A4D39] flex items-center justify-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Smartphone className="w-4 h-4 text-[#C5A059]" />
            <span>Compass Calibration & Device Alignment</span>
          </div>

          <p className="font-serif">
            Hold your mobile device flat in your hand. Rotate until the green/gold Kaaba needle points straight up to top arrow.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {!permissionRequested && (
              <button
                onClick={requestCompassPermission}
                className="px-3.5 py-1.5 rounded-sm bg-[#3A4D39] text-[#F9F7F2] font-serif font-semibold text-xs uppercase tracking-wider hover:bg-[#3A4D39]/90"
              >
                Enable Compass Sensor (iOS/Android)
              </button>
            )}

            <button
              onClick={() => setShowCalibrationModal(true)}
              className="px-3.5 py-1.5 rounded-sm bg-[#FFFFFF] text-[#3A4D39] border border-[#E6E1D3] font-serif font-semibold text-xs uppercase tracking-wider hover:border-[#C5A059]"
            >
              How to Calibrate Compass
            </button>
          </div>
        </div>
      </div>

      {/* Calibration Instruction Modal */}
      {showCalibrationModal && (
        <div className="fixed inset-0 z-50 bg-[#2C332B]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] text-[#2C332B] rounded-sm p-6 max-w-md w-full border border-[#E6E1D3] shadow-lg space-y-4">
            <div className="flex justify-between items-center text-xs font-serif font-bold text-[#3A4D39] uppercase tracking-wider border-b pb-2 border-[#E6E1D3]">
              <span>Calibrate Mobile Magnetometer Sensor</span>
              <button onClick={() => setShowCalibrationModal(false)} className="text-[#8C8474] font-bold text-base">✕</button>
            </div>

            <div className="space-y-3 text-xs font-serif text-[#5C635A] leading-relaxed">
              <div className="text-center font-bold text-base text-[#3A4D39]">
                Move phone in a Figure-8 Pattern ♾️
              </div>
              <p>
                Magnetic interference from metals, electronic devices, or phone covers can misalign your device's compass.
              </p>
              <ol className="list-decimal list-inside space-y-1.5 bg-[#F9F7F2] p-3 rounded-sm border border-[#E6E1D3]">
                <li>Hold your device firmly in front of you.</li>
                <li>Wave your phone smoothly in a figure-eight motion 3-5 times.</li>
                <li>Ensure you are away from large metallic objects or heavy electronics.</li>
                <li>Keep the device laying flat horizontally on your palm.</li>
              </ol>
            </div>

            <button
              onClick={() => setShowCalibrationModal(false)}
              className="w-full py-2.5 rounded-sm bg-[#3A4D39] text-[#F9F7F2] font-serif font-semibold text-xs uppercase tracking-wider"
            >
              Done & Calibrated
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

