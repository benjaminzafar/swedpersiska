import React, { useState, useEffect } from 'react';
import { MapPin, X, Check, Globe, ArrowLeft } from 'lucide-react';
import { COUNTRIES } from '../lib/translations';

export default function CountryBanner({ 
  isOpen, 
  onClose, 
  selectedCountry, 
  onSelectCountry 
}) {
  const [detectedCountryId, setDetectedCountryId] = useState('se');
  const [activeChoice, setActiveChoice] = useState(selectedCountry || 'se');

  // Keep activeChoice synced with selectedCountry when opened
  useEffect(() => {
    if (selectedCountry && selectedCountry !== 'all') {
      setActiveChoice(selectedCountry);
    }
  }, [selectedCountry, isOpen]);

  // Detect location via Timezone & IP
  useEffect(() => {
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

    // If first-time visitor with no prior selection, pre-select the detected country
    const saved = localStorage.getItem('scandi_country_selected');
    if (!saved) {
      setActiveChoice(detected);
    }

    // Progressive IP check
    fetch('https://api.country.is/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country) {
          const code = data.country.toLowerCase();
          if (['se', 'no', 'dk', 'fi'].includes(code)) {
            setDetectedCountryId(code);
            if (!localStorage.getItem('scandi_country_selected')) {
              setActiveChoice(code);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleConfirm = (countryId) => {
    const finalId = countryId || activeChoice || 'se';
    setActiveChoice(finalId);
    if (onSelectCountry) onSelectCountry(finalId);
    localStorage.setItem('scandi_country_selected', finalId);
    localStorage.setItem('scandi_country_popup_seen', 'true');
    if (onClose) onClose();
  };

  const handleDismiss = () => {
    localStorage.setItem('scandi_country_popup_seen', 'true');
    if (onClose) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const detectedObj = COUNTRIES.find(c => c.id === detectedCountryId) || COUNTRIES[0];
  const chosenObj = COUNTRIES.find(c => c.id === activeChoice) || COUNTRIES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-vazir select-none" dir="rtl">
      
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        onClick={handleDismiss}
      />

      {/* Pop-Up Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-slate-200/90 overflow-hidden z-10 animate-in zoom-in-95 duration-200 p-6 sm:p-7 space-y-5">
        
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
        <div className="text-center space-y-2.5 pt-1">
          
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
            <Globe size={24} className="text-[#1877F2]" />
          </div>

          <div className="space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              پرتال جامع نیازمندی‌های ایرانیان اسکاندیناوی
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight pt-1">
              انتخاب کشور مورد نظر
            </h2>
          </div>

          {/* Detected location notice (NO COUNTRY CODE, ONLY PERSIAN NAME) */}
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-center justify-center gap-2">
            <MapPin size={14} className="text-blue-600 shrink-0" />
            <span>
              موقعیت شناسایی‌شده شما:{' '}
              <strong className="font-extrabold text-slate-900 mx-0.5 px-2 py-0.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                {detectedObj.nameFa}
              </strong>
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            لطفاً کشوری را که مایلید آگهی‌ها، مسکن، رستوران‌ها و خدمات آن را مشاهده کنید، انتخاب نمایید:
          </p>
        </div>

        {/* 4 Scandinavian Countries Selection Grid (NO "ALL COUNTRIES", NO COUNTRY CODES) */}
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
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[14px] font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                      {country.nameFa}
                    </span>
                    {isDetected && (
                      <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                        شما
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block pt-0.5">
                    {country.nameNative}
                  </span>
                </div>

                <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all shrink-0 ${
                  isSelected 
                    ? 'border-[#1877F2] bg-[#1877F2] text-white' 
                    : 'border-slate-300 bg-white'
                }`}>
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons (NO COUNTRY CODE) */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => handleConfirm(activeChoice)}
            className="w-full h-11 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs sm:text-sm font-bold active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <span>
              ورود به بخش {chosenObj.nameFa}
            </span>
            <ArrowLeft size={16} />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full h-8 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>

      </div>
    </div>
  );
}
