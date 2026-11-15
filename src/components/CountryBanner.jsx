import React, { useState, useEffect } from 'react';
import { MapPin, X, Check, Globe, ArrowLeft } from 'lucide-react';
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

    // Check if user already confirmed or dismissed
    const saved = localStorage.getItem('scandi_country_selected');
    const dismissed = sessionStorage.getItem('scandi_popup_dismissed');

    if (!saved && !dismissed) {
      // First visit: open pop-up and set detected as default choice
      setActiveChoice(detected);
      setIsVisible(true);
    } else if (saved) {
      setActiveChoice(saved);
    }

    // Background IP country check (progressive enhancement)
    fetch('https://api.country.is/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country) {
          const code = data.country.toLowerCase();
          if (['se', 'no', 'dk', 'fi'].includes(code)) {
            setDetectedCountryId(code);
            if (!localStorage.getItem('scandi_country_selected') && !sessionStorage.getItem('scandi_popup_dismissed')) {
              setActiveChoice(code);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleConfirm = (countryId) => {
    const finalId = countryId || activeChoice;
    setActiveChoice(finalId);
    if (onSelectCountry) onSelectCountry(finalId);
    localStorage.setItem('scandi_country_selected', finalId);
    sessionStorage.setItem('scandi_popup_dismissed', 'true');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('scandi_popup_dismissed', 'true');
    setIsVisible(false);
  };

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) return null;

  const detectedObj = COUNTRIES.find(c => c.id === detectedCountryId) || COUNTRIES[0];
  const chosenObj = COUNTRIES.find(c => c.id === activeChoice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-vazir select-none" dir="rtl">
      
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        onClick={handleDismiss}
      />

      {/* Pop-Up Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-slate-200/90 overflow-hidden z-10 animate-in zoom-in-95 duration-200 p-6 sm:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-5 start-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          title="بستن پنجره"
        >
          <X size={18} />
        </button>

        {/* Header with Icon Badge */}
        <div className="text-center space-y-3 pt-2">
          
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
            <Globe size={28} className="text-[#1877F2]" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              نیازمندی‌های اسکاندیناوی
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight pt-1">
              خوش آمدید به سوئد پرشیا
            </h2>
          </div>

          {/* Detected location notification banner */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-center justify-center gap-2">
            <MapPin size={15} className="text-blue-600 shrink-0" />
            <span>
              ما تشخیص دادیم شما از کشور{' '}
              <strong className="font-extrabold text-slate-900 inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <span>{detectedObj.flag}</span>
                <span>{detectedObj.nameFa}</span>
              </strong>{' '}
              وارد شده‌اید.
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            لطفاً کشوری را که مایلید نیازمندی‌ها، مسکن و خدمات آن را مشاهده کنید، انتخاب فرمایید:
          </p>
        </div>

        {/* Scandinavian Countries Selection Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {COUNTRIES.map(country => {
            const isSelected = activeChoice === country.id;
            const isDetected = detectedCountryId === country.id;

            return (
              <button
                key={country.id}
                type="button"
                onClick={() => setActiveChoice(country.id)}
                className={`relative flex items-center justify-between p-3.5 rounded-2xl border text-right transition-all cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? 'border-[#1877F2] bg-blue-50/70 shadow-2xs ring-1 ring-[#1877F2]'
                    : 'border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{country.flag}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[13px] font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                        {country.nameFa}
                      </span>
                      {isDetected && (
                        <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                          شما
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {country.nameNative}
                    </span>
                  </div>
                </div>

                <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                  isSelected 
                    ? 'border-[#1877F2] bg-[#1877F2] text-white' 
                    : 'border-slate-300 bg-white'
                }`}>
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
              </button>
            );
          })}

          {/* Option: All Scandinavian Countries (Span 2 cols) */}
          <button
            type="button"
            onClick={() => setActiveChoice('all')}
            className={`col-span-2 relative flex items-center justify-between p-3.5 rounded-2xl border text-right transition-all cursor-pointer active:scale-[0.98] ${
              activeChoice === 'all'
                ? 'border-[#1877F2] bg-blue-50/70 shadow-2xs ring-1 ring-[#1877F2]'
                : 'border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🌍</span>
              <div>
                <span className={`text-[13px] font-bold block ${activeChoice === 'all' ? 'text-blue-900' : 'text-slate-900'}`}>
                  همه کشورهای اسکاندیناوی
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  نمایش آگهی‌های سوئد، نروژ، دانمارک و فنلاند به صورت یکپارچه
                </span>
              </div>
            </div>

            <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
              activeChoice === 'all' 
                ? 'border-[#1877F2] bg-[#1877F2] text-white' 
                : 'border-slate-300 bg-white'
            }`}>
              {activeChoice === 'all' && <Check size={12} strokeWidth={3} />}
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => handleConfirm(activeChoice)}
            className="w-full h-12 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs sm:text-sm font-bold active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <span>
              {activeChoice === 'all' 
                ? 'ورود به بخش همه اسکاندیناوی' 
                : `ورود به بخش ${chosenObj ? `${chosenObj.nameFa} ${chosenObj.flag}` : 'انتخاب شده'}`}
            </span>
            <ArrowLeft size={16} />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full h-9 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            بعداً انتخاب می‌کنم (بستن پنجره)
          </button>
        </div>

      </div>
    </div>
  );
}
