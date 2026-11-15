import React, { useState, useEffect } from 'react';
import { MapPin, X, Check, Globe } from 'lucide-react';
import { COUNTRIES } from '../lib/translations';

export default function CountryBanner({ selectedCountry, onSelectCountry }) {
  const [detectedCountryId, setDetectedCountryId] = useState('se');
  const [isVisible, setIsVisible] = useState(false);
  const [activeChoice, setActiveChoice] = useState(selectedCountry || 'se');

  useEffect(() => {
    // 1. Detect location via Timezone
    let detected = 'se';
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Oslo')) {
        detected = 'no';
      } else if (tz.includes('Copenhagen')) {
        detected = 'dk';
      } else if (tz.includes('Helsinki')) {
        detected = 'fi';
      } else if (tz.includes('Stockholm')) {
        detected = 'se';
      } else {
        // Fallback to browser languages
        const langs = navigator.languages || [navigator.language || ''];
        const isNorwegian = langs.some(l => l.startsWith('nb') || l.startsWith('nn') || l.startsWith('no'));
        const isDanish = langs.some(l => l.startsWith('da'));
        const isFinnish = langs.some(l => l.startsWith('fi'));
        if (isNorwegian) detected = 'no';
        else if (isDanish) detected = 'dk';
        else if (isFinnish) detected = 'fi';
        else detected = 'se';
      }
    } catch {
      detected = 'se';
    }

    setDetectedCountryId(detected);

    // Check if user already confirmed previously in localStorage
    const saved = localStorage.getItem('scandi_country_selected');
    if (!saved) {
      // First visit: select detected country and show banner
      setActiveChoice(detected);
      if (onSelectCountry) onSelectCountry(detected);
      setIsVisible(true);
    } else {
      setActiveChoice(saved);
      // Even if saved, allow banner to be shown if dismissed banner was not permanently closed in session
      const bannerClosed = sessionStorage.getItem('scandi_banner_dismissed');
      if (!bannerClosed) {
        setIsVisible(true);
      }
    }

    // Background IP country check (progressive enhancement)
    fetch('https://api.country.is/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country) {
          const code = data.country.toLowerCase();
          if (['se', 'no', 'dk', 'fi'].includes(code)) {
            setDetectedCountryId(code);
            if (!localStorage.getItem('scandi_country_selected')) {
              setActiveChoice(code);
              if (onSelectCountry) onSelectCountry(code);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleConfirm = (countryId) => {
    setActiveChoice(countryId);
    if (onSelectCountry) onSelectCountry(countryId);
    localStorage.setItem('scandi_country_selected', countryId);
    sessionStorage.setItem('scandi_banner_dismissed', 'true');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('scandi_banner_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const detectedObj = COUNTRIES.find(c => c.id === detectedCountryId) || COUNTRIES[0];

  return (
    <div className="relative bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white border-b border-slate-800 shadow-sm z-30 font-vazir animate-in slide-in-from-top duration-250 select-none" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Detected Country Notice */}
          <div className="flex items-center gap-2.5 text-center md:text-right">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
              <MapPin size={18} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="text-xs sm:text-[13px] font-medium text-slate-300">
                سیستم ما موقعیت مکانی شما را از کشور{' '}
                <strong className="text-white font-black inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md bg-white/10 border border-white/15">
                  <span>{detectedObj.flag}</span>
                  <span>{detectedObj.nameFa}</span>
                  <span className="text-[11px] text-slate-400 font-normal">({detectedObj.nameNative})</span>
                </strong>{' '}
                تشخیص داد:
              </span>
              <span className="text-[11.5px] text-slate-400 font-normal">
                مایلید آگهی‌ها و نیازمندی‌های کدام کشور را مشاهده فرمایید؟
              </span>
            </div>
          </div>

          {/* Interactive Country Selection Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {COUNTRIES.map(country => {
              const isSelected = activeChoice === country.id;
              const isDetected = detectedCountryId === country.id;

              return (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => handleConfirm(country.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-400 shadow-sm shadow-blue-500/30'
                      : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
                  }`}
                >
                  <span className="text-sm">{country.flag}</span>
                  <span>{country.nameFa}</span>
                  {isDetected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" title="موقعیت فعلی شما" />
                  )}
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </button>
              );
            })}

            {/* All Scandinavia Option */}
            <button
              type="button"
              onClick={() => handleConfirm('all')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer border ${
                activeChoice === 'all'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <Globe size={13} />
              <span>همه اسکاندیناوی</span>
              {activeChoice === 'all' && <Check size={12} strokeWidth={3} />}
            </button>

            {/* Dismiss Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors mr-1 cursor-pointer"
              title="بستن بنر"
            >
              <X size={16} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
