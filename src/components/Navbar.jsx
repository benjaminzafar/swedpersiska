import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  KeyRound, 
  Menu, 
  X,
  ChevronDown,
  ChevronLeft,
  Home,
  Utensils,
  Briefcase,
  GraduationCap,
  Tag,
  Globe
} from 'lucide-react';
import { CATEGORIES } from '../lib/translations';

export default function Navbar({ 
  siteName = 'سوئد پرشیا',
  logoUrl,
  onOpenCountryModal,
  onOpenPostAd, 
  onOpenManageAd,
  onSelectCategory
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adDropdownOpen, setAdDropdownOpen] = useState(false);
  const [mobileAdDropdownOpen, setMobileAdDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  const adMenuRef = useRef(null);
  const mobileAdMenuRef = useRef(null);
  const categoriesMenuRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (adMenuRef.current && !adMenuRef.current.contains(event.target)) {
        setAdDropdownOpen(false);
      }
      if (mobileAdMenuRef.current && !mobileAdMenuRef.current.contains(event.target)) {
        setMobileAdDropdownOpen(false);
      }
      if (categoriesMenuRef.current && !categoriesMenuRef.current.contains(event.target)) {
        setCategoriesDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mainNavItems = [
    { id: 'bostad', title: 'مسکن و اجاره', Icon: Home },
    { id: 'restaurang', title: 'رستوران و خوراک', Icon: Utensils },
    { id: 'tjanster', title: 'خدمات و دارالترجمه', Icon: Briefcase },
    { id: 'jobb', title: 'کار و استخدام', Icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 select-none font-vazir" dir="rtl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-1.5 sm:gap-6">
          
          {/* Logo & Brand (Clean, no country/language selector) */}
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            <a href="/" className="flex items-center gap-2 group shrink-0">
              {logoUrl ? (
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl overflow-hidden bg-white shadow-xs border border-slate-200 shrink-0">
                  <img src={logoUrl} alt={siteName} className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-slate-950 text-white font-extrabold text-xs shadow-xs border border-slate-800 transition-all duration-150 group-hover:scale-105 active:scale-95 shrink-0">
                  <span className="font-mono text-emerald-400 font-black">SP</span>
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-[15px] sm:text-[17px] tracking-tight text-slate-950 group-hover:text-blue-600 transition-colors truncate max-w-[95px] sm:max-w-none">
                  {siteName}
                </span>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                  نیازمندی‌های ایرانیان اسکاندیناوی
                </span>
              </div>
            </a>

            {/* Desktop Category Navigation */}
            <nav className="hidden xl:flex items-center gap-1">
              {mainNavItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(item.id);
                  }}
                  className="px-3 py-1.5 rounded-full text-[13px] font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  {item.title}
                </button>
              ))}

              {/* More Categories Dropdown */}
              <div className="relative" ref={categoriesMenuRef}>
                <button
                  type="button"
                  onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <span>سایر دسته‌ها</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${categoriesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {categoriesDropdownOpen && (
                  <div className="absolute start-0 top-full mt-2 w-56 rounded-2xl bg-white border border-slate-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.1)] p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                    {CATEGORIES.filter(c => !mainNavItems.some(m => m.id === c.id) && c.id !== 'all').map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (onSelectCategory) onSelectCategory(cat.id);
                          setCategoriesDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors text-right cursor-pointer"
                      >
                        <Tag size={13} className="text-slate-400 shrink-0" />
                        <span>{cat.fa}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Desktop Right Action: "انتخاب کشور" WITH GLOBE ICON + "آگهی" BUTTON */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Country Selector Button with Globe icon */}
            <button
              type="button"
              onClick={onOpenCountryModal}
              className="flex items-center gap-1.5 h-10 px-3.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-700 hover:text-slate-950 text-[13px] font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs group"
              title="انتخاب کشور در اسکاندیناوی"
            >
              <Globe size={15} className="text-slate-500 group-hover:text-[#1877F2] transition-colors" />
              <span>انتخاب کشور</span>
            </button>

            <div className="relative" ref={adMenuRef}>
              <button
                type="button"
                onClick={() => setAdDropdownOpen(!adDropdownOpen)}
                className={`flex items-center gap-2 h-10 px-4 rounded-full text-[13px] font-bold text-white transition-all cursor-pointer shadow-xs active:scale-95 ${
                  adDropdownOpen 
                    ? 'bg-[#166fe5] ring-2 ring-blue-300' 
                    : 'bg-[#1877F2] hover:bg-[#166fe5]'
                }`}
                aria-expanded={adDropdownOpen}
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>آگهی</span>
                <ChevronDown size={14} className={`transition-transform duration-200 text-white/80 ${adDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Single Dropdown Menu with "ثبت آگهی" and "مدیریت آگهی" */}
              {adDropdownOpen && (
                <div className="absolute end-0 top-full mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-[0_12px_36px_rgba(0,0,0,0.12)] p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="space-y-1">
                    
                    {/* Option 1: ثبت آگهی */}
                    <button
                      type="button"
                      onClick={() => {
                        onOpenPostAd();
                        setAdDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-right text-xs font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-900 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[#1877F2] group-hover:bg-[#1877F2] group-hover:text-white transition-colors">
                          <Plus size={16} strokeWidth={2.5} />
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900">ثبت آگهی</span>
                          <span className="text-[10.5px] text-slate-500 font-normal">درج رایگان آگهی جدید</span>
                        </div>
                      </div>
                      <ChevronLeft size={14} className="text-slate-400 group-hover:text-blue-600" />
                    </button>

                    {/* Option 2: مدیریت آگهی */}
                    <button
                      type="button"
                      onClick={() => {
                        onOpenManageAd();
                        setAdDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-right text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-100 transition-colors">
                          <KeyRound size={15} />
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900">مدیریت آگهی</span>
                          <span className="text-[10.5px] text-slate-500 font-normal">ویرایش یا حذف با پین کد</span>
                        </div>
                      </div>
                      <ChevronLeft size={14} className="text-slate-400 group-hover:text-slate-600" />
                    </button>

                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Mobile Country Selector with Globe icon */}
            <button
              type="button"
              onClick={onOpenCountryModal}
              className="flex items-center gap-1 h-8 sm:h-9 px-2 sm:px-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-[11px] sm:text-xs font-semibold active:scale-95 cursor-pointer shrink-0"
              title="انتخاب کشور"
            >
              <Globe size={13} className="text-slate-500 shrink-0" />
              <span>کشور</span>
            </button>

            {/* Mobile Single Button: "آگهی" with "+" */}
            <div className="relative shrink-0" ref={mobileAdMenuRef}>
              <button
                type="button"
                onClick={() => setMobileAdDropdownOpen(!mobileAdDropdownOpen)}
                className="flex items-center gap-1 h-8 sm:h-9 px-2.5 sm:px-3 rounded-full bg-[#1877F2] text-white text-[11px] sm:text-xs font-bold shadow-xs active:scale-95 cursor-pointer shrink-0"
              >
                <Plus size={14} strokeWidth={2.5} className="shrink-0" />
                <span>آگهی</span>
                <ChevronDown size={12} className={`transition-transform duration-200 text-white/80 shrink-0 ${mobileAdDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileAdDropdownOpen && (
                <div className="absolute start-0 sm:end-0 top-full mt-2 w-52 sm:w-56 rounded-2xl bg-white border border-slate-200 shadow-[0_12px_36px_rgba(0,0,0,0.15)] p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenPostAd();
                        setMobileAdDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl text-right text-xs font-semibold text-slate-800 hover:bg-blue-50 cursor-pointer"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[#1877F2] shrink-0">
                        <Plus size={15} strokeWidth={2.5} />
                      </div>
                      <div>
                        <span className="block font-bold text-slate-900">ثبت آگهی</span>
                        <span className="text-[10px] text-slate-500">درج رایگان</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenManageAd();
                        setMobileAdDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl text-right text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700 shrink-0">
                        <KeyRound size={14} />
                      </div>
                      <div>
                        <span className="block font-bold text-slate-900">مدیریت آگهی</span>
                        <span className="text-[10px] text-slate-500">ویرایش یا حذف</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 shrink-0"
              aria-label="منو"
            >
              <Menu size={19} />
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-full bg-white rounded-t-3xl border-t border-slate-200 p-5 space-y-4 shadow-2xl z-10 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-1" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">سوئد پرشیا</span>
                <span className="text-[11px] text-slate-500">نیازمندی‌های ایرانیان اسکاندیناوی</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Actions Cards: ثبت آگهی & مدیریت آگهی */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => { onOpenPostAd(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#1877F2] text-white font-bold text-xs active:scale-95 transition-all text-right shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white">
                    <Plus size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="block text-sm font-extrabold">ثبت آگهی</span>
                    <span className="text-[11px] text-blue-100 font-normal">درج رایگان آگهی در نیازمندی‌ها</span>
                  </div>
                </div>
                <ChevronLeft size={16} className="text-white/70" />
              </button>

              <button
                type="button"
                onClick={() => { onOpenManageAd(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 text-right active:scale-95 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-900">مدیریت آگهی</span>
                    <span className="text-[11px] text-slate-500 font-normal">ویرایش یا حذف آگهی با کد پیگیری و پین</span>
                  </div>
                </div>
                <ChevronLeft size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Categories Navigation */}
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1 pb-1">
                دسته‌بندی‌های نیازمندی‌ها
              </span>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory(cat.id);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold text-right transition-colors cursor-pointer border border-slate-200/60"
                  >
                    <Tag size={13} className="text-slate-400 shrink-0" />
                    <span>{cat.fa}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
