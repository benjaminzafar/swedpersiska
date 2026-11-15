import React, { useState } from 'react';
import { 
  Home, 
  LayoutGrid, 
  Globe, 
  Plus, 
  KeyRound, 
  X, 
  ChevronLeft,
  Utensils,
  Briefcase,
  GraduationCap,
  ShoppingBag,
  Car,
  Calendar,
  Tag,
  Layers,
  Check
} from 'lucide-react';
import { CATEGORIES, COUNTRIES } from '../lib/translations';

// Map icon strings to Lucide components with semantic colors
const CATEGORY_META = {
  all: { Icon: Layers, bg: 'bg-slate-100 text-slate-800 border-slate-200' },
  bostad: { Icon: Home, bg: 'bg-blue-50 text-blue-600 border-blue-200/80' },
  restaurang: { Icon: Utensils, bg: 'bg-amber-50 text-amber-600 border-amber-200/80' },
  tjanster: { Icon: Briefcase, bg: 'bg-purple-50 text-purple-600 border-purple-200/80' },
  jobb: { Icon: GraduationCap, bg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80' },
  'kop-salj': { Icon: ShoppingBag, bg: 'bg-rose-50 text-rose-600 border-rose-200/80' },
  fordon: { Icon: Car, bg: 'bg-cyan-50 text-cyan-600 border-cyan-200/80' },
  evenemang: { Icon: Calendar, bg: 'bg-indigo-50 text-indigo-600 border-indigo-200/80' },
  ovrigt: { Icon: Tag, bg: 'bg-stone-100 text-stone-700 border-stone-200' },
};

export default function MobileBottomNav({
  selectedCategory = 'all',
  selectedCountry = 'se',
  onSelectCategory,
  onOpenCountryModal,
  onOpenPostAd,
  onOpenManageAd,
}) {
  const [collectionSheetOpen, setCollectionSheetOpen] = useState(false);

  // Find country name
  const currentCountryObj = COUNTRIES.find(c => c.id === selectedCountry) || COUNTRIES[0];

  const handleCategoryClick = (catId) => {
    onSelectCategory?.(catId);
    setCollectionSheetOpen(false);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    onSelectCategory?.('all');
    setCollectionSheetOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHomeActive = selectedCategory === 'all' && !collectionSheetOpen;
  const isCollectionActive = collectionSheetOpen || selectedCategory !== 'all';

  return (
    <>
      {/* 1. Sleek Compact Mobile Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-3px_16px_rgba(0,0,0,0.05)] px-2 pt-1 pb-[max(env(safe-area-inset-bottom),0.25rem)] font-vazir select-none"
        dir="rtl"
        aria-label="منوی دسترسی موبایل"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          
          {/* Tab 1: خانه (Home) */}
          <button
            type="button"
            onClick={handleGoHome}
            className={`flex flex-col items-center gap-0.5 py-0.5 px-2.5 rounded-xl transition-all cursor-pointer ${
              isHomeActive 
                ? 'text-[#1877F2] font-black' 
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className={`p-0.5 rounded-lg transition-all ${isHomeActive ? 'text-[#1877F2]' : ''}`}>
              <Home size={18} strokeWidth={isHomeActive ? 2.5 : 2} />
            </div>
            <span className="text-[9.5px]">خانه</span>
          </button>

          {/* Tab 2: کالکشن‌ها (Collections / Categories) */}
          <button
            type="button"
            onClick={() => setCollectionSheetOpen(true)}
            className={`relative flex flex-col items-center gap-0.5 py-0.5 px-2.5 rounded-xl transition-all cursor-pointer ${
              isCollectionActive 
                ? 'text-[#1877F2] font-black' 
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className={`p-0.5 rounded-lg transition-all ${isCollectionActive ? 'text-[#1877F2]' : ''}`}>
              <LayoutGrid size={18} strokeWidth={isCollectionActive ? 2.5 : 2} />
            </div>
            <span className="text-[9.5px]">کالکشن‌ها</span>

            {/* Active Category Indicator Dot */}
            {selectedCategory !== 'all' && (
              <span className="absolute top-0.5 end-2.5 h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-white" />
            )}
          </button>

          {/* Tab 3: دکمه مرکزی ثبت آگهی (Post Ad) */}
          <button
            type="button"
            onClick={onOpenPostAd}
            className="flex flex-col items-center gap-0.5 -mt-2 py-0.5 px-2 group cursor-pointer"
            title="ثبت رایگان آگهی"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1877F2] text-white shadow-sm shadow-blue-500/25 group-active:scale-95 transition-all">
              <Plus size={19} strokeWidth={2.7} />
            </div>
            <span className="text-[9.5px] font-bold text-slate-800">ثبت آگهی</span>
          </button>

          {/* Tab 4: انتخاب کشور (Country Selector) */}
          <button
            type="button"
            onClick={onOpenCountryModal}
            className="flex flex-col items-center gap-0.5 py-0.5 px-2.5 rounded-xl text-slate-500 hover:text-slate-900 font-medium transition-all cursor-pointer"
            title="تغییر کشور"
          >
            <div className="p-0.5 rounded-lg">
              <Globe size={18} className="text-slate-600" />
            </div>
            <span className="text-[9.5px] font-semibold text-slate-700">
              {currentCountryObj.nameFa}
            </span>
          </button>

          {/* Tab 5: مدیریت آگهی (Manage Ad) */}
          <button
            type="button"
            onClick={onOpenManageAd}
            className="flex flex-col items-center gap-0.5 py-0.5 px-2.5 rounded-xl text-slate-500 hover:text-slate-900 font-medium transition-all cursor-pointer"
            title="مدیریت یا حذف آگهی با پین کد"
          >
            <div className="p-0.5 rounded-lg">
              <KeyRound size={17} className="text-amber-600" />
            </div>
            <span className="text-[9.5px]">مدیریت</span>
          </button>

        </div>
      </nav>

      {/* 2. Collections Bottom Sheet Drawer (Meta/Astryx UI) */}
      {collectionSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden font-vazir" dir="rtl">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setCollectionSheetOpen(false)}
          />

          {/* Bottom Sheet Card */}
          <div className="relative w-full bg-white rounded-t-[28px] border-t border-slate-200 p-5 pb-8 space-y-4 shadow-2xl z-10 animate-in slide-in-from-bottom duration-250 max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* Grab Handle Pill */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-2 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <LayoutGrid size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-950">
                    کالکشن‌های نیازمندی‌ها
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    دسته‌بندی موضوعی آگهی‌های جامعه ایرانیان اسکاندیناوی
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCollectionSheetOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Collections Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {CATEGORIES.map(cat => {
                const meta = CATEGORY_META[cat.id] || CATEGORY_META.ovrigt;
                const IconComponent = meta.Icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-right transition-all cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? 'border-[#1877F2] bg-blue-50/80 shadow-2xs ring-1 ring-[#1877F2]'
                        : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl border shrink-0 ${meta.bg}`}>
                        <IconComponent size={18} />
                      </div>
                      <span className={`text-xs truncate ${isSelected ? 'font-black text-blue-900' : 'font-bold text-slate-800'}`}>
                        {cat.fa}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1877F2] text-white shrink-0 ms-1">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions within sheet */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setCollectionSheetOpen(false);
                  onOpenCountryModal?.();
                }}
                className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer font-medium"
              >
                <Globe size={14} className="text-slate-400" />
                <span>تغییر کشور ({currentCountryObj.nameFa})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCollectionSheetOpen(false);
                  onOpenPostAd?.();
                }}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold transition-colors cursor-pointer"
              >
                <span>+ ثبت آگهی جدید</span>
                <ChevronLeft size={14} />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
