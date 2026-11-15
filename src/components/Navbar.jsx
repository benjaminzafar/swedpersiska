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
  ShoppingBag,
  Car,
  Tag,
  Trash2,
  Edit3,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { CATEGORIES, COUNTRIES } from '../lib/translations';

export default function Navbar({ 
  selectedCountry = 'se',
  onSelectCountry,
  onOpenCountryModal,
  onOpenPostAd, 
  onOpenManageAd,
  onSelectCategory
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [manageDropdownOpen, setManageDropdownOpen] = useState(false);
  const [postDropdownOpen, setPostDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  const manageMenuRef = useRef(null);
  const postMenuRef = useRef(null);
  const categoriesMenuRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (manageMenuRef.current && !manageMenuRef.current.contains(event.target)) {
        setManageDropdownOpen(false);
      }
      if (postMenuRef.current && !postMenuRef.current.contains(event.target)) {
        setPostDropdownOpen(false);
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

  const postCategories = [
    { id: 'bostad', title: 'ثبت آگهی مسکن و خانه', desc: 'رهن، اجاره آپارتمان یا اتاق', Icon: Home },
    { id: 'restaurang', title: 'ثبت آگهی رستوران و مواد غذایی', desc: 'چلوکباب، سوپرمارکت و کیترینگ', Icon: Utensils },
    { id: 'tjanster', title: 'ثبت آگهی خدمات و دارالترجمه', desc: 'مترجم رسمی، وکالت، مشاوره حقوقی', Icon: Briefcase },
    { id: 'jobb', title: 'ثبت آگهی استخدام و کار', desc: 'استخدام نیرو یا درخواست کار', Icon: GraduationCap },
    { id: 'kop-salj', title: 'ثبت آگهی خرید و فروش', desc: 'فرش، لوازم منزل، وسایل ایرانی', Icon: ShoppingBag },
    { id: 'fordon', title: 'ثبت آگهی خودرو و وسایل نقلیه', desc: 'خرید، فروش یا اجاره خودرو', Icon: Car },
    { id: 'ovrigt', title: 'سایر نیازمندی‌ها', desc: 'سایر آگهی‌های متفرقه', Icon: Tag },
  ];

  const currentCountryObj = COUNTRIES.find(c => c.id === selectedCountry);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 select-none font-vazir" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white font-extrabold text-xs shadow-xs border border-slate-800 transition-all duration-150 group-hover:scale-105 active:scale-95">
                <span className="font-mono text-emerald-400 font-black">SP</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[17px] tracking-tight text-slate-950 group-hover:text-blue-600 transition-colors">
                    سوئد پرشیا
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold hidden sm:inline">
                    SwedPersiska
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  نیازمندی‌های ایرانیان اسکاندیناوی
                </span>
              </div>
            </a>

            {/* Scandinavian Country Selector Pill (Opens Pop-Up Modal) */}
            <button
              type="button"
              onClick={onOpenCountryModal}
              className="flex items-center gap-2 h-9 px-3 rounded-full bg-slate-100 hover:bg-slate-200/90 border border-slate-200/90 text-xs font-bold text-slate-800 transition-all active:scale-95 cursor-pointer shadow-2xs group"
              title="تغییر کشور اسکاندیناوی"
            >
              <span className="text-base">{currentCountryObj ? currentCountryObj.flag : '🌍'}</span>
              <span>{currentCountryObj ? currentCountryObj.nameFa : 'همه اسکاندیناوی'}</span>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200/60 group-hover:bg-[#1877F2] group-hover:text-white transition-colors">
                تغییر
              </span>
            </button>

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

          {/* Desktop Right Actions (Both with Dropdown Menus) */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* BUTTON 1: "مدیریت آگهی‌ها" WITH DROPDOWN MENU */}
            <div className="relative" ref={manageMenuRef}>
              <button
                type="button"
                onClick={() => setManageDropdownOpen(!manageDropdownOpen)}
                className={`flex items-center gap-2 h-10 px-4 rounded-full text-[13px] font-semibold transition-all cursor-pointer border ${
                  manageDropdownOpen 
                    ? 'bg-slate-100 text-slate-950 border-slate-300 shadow-2xs' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-200/80'
                }`}
                aria-expanded={manageDropdownOpen}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/15 text-amber-700">
                  <KeyRound size={13} />
                </div>
                <span>مدیریت آگهی‌ها</span>
                <ChevronDown size={14} className={`transition-transform duration-200 text-slate-400 ${manageDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Manage Ads Dropdown Menu */}
              {manageDropdownOpen && (
                <div className="absolute end-0 top-full mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-[0_12px_36px_rgba(0,0,0,0.12)] p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 mb-1">
                    <span className="block text-xs font-bold text-slate-900">کنترل پنل آگهی‌دهندگان</span>
                    <span className="text-[11px] text-slate-500">
                      ورود با کد پیگیری و رمز اختصاصی (پین کد)
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenManageAd();
                        setManageDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-right text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                          <Edit3 size={15} />
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900">ویرایش و تغییر آگهی</span>
                          <span className="text-[10.5px] text-slate-500 font-normal">تغییر قیمت، توضیحات یا تلفن</span>
                        </div>
                      </div>
                      <ChevronLeft size={14} className="text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenManageAd();
                        setManageDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-right text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100">
                          <Trash2 size={15} />
                        </div>
                        <div>
                          <span className="block font-bold text-rose-900">حذف فوری آگهی</span>
                          <span className="text-[10.5px] text-rose-600/80 font-normal">برداشتن همیشگی آگهی با پین کد</span>
                        </div>
                      </div>
                      <ChevronLeft size={14} className="text-rose-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenManageAd();
                        setManageDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-right text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-200">
                          <Eye size={15} />
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900">پیگیری وضعیت و آمار</span>
                          <span className="text-[10.5px] text-slate-500 font-normal">مشاهده تعداد بازدیدها و اعتبار</span>
                        </div>
                      </div>
                      <ChevronLeft size={14} className="text-slate-400" />
                    </button>
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-100 px-3 py-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                    <span>رمز ۴ رقمی هنگام ثبت آگهی به شما داده می‌شود.</span>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTON 2: "+ ثبت آگهی" WITH DROPDOWN MENU */}
            <div className="relative" ref={postMenuRef}>
              <div className="flex items-center rounded-full bg-[#1877F2] hover:bg-[#166fe5] shadow-xs transition-all">
                {/* Main Action (Direct Post) */}
                <button
                  type="button"
                  onClick={() => onOpenPostAd()}
                  className="flex items-center gap-2 h-10 ps-4 pe-2.5 text-white font-bold text-[13px] active:scale-95 transition-all cursor-pointer"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>ثبت آگهی رایگان</span>
                </button>

                {/* Dropdown Chevron Toggle */}
                <button
                  type="button"
                  onClick={() => setPostDropdownOpen(!postDropdownOpen)}
                  className="h-10 ps-1 pe-3 text-white/90 hover:text-white border-s border-blue-400/40 cursor-pointer active:scale-95"
                  title="انتخاب سریع دسته‌بندی"
                  aria-expanded={postDropdownOpen}
                >
                  <ChevronDown size={14} className={`transition-transform duration-200 ${postDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Post Ad Category Presets Dropdown */}
              {postDropdownOpen && (
                <div className="absolute end-0 top-full mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-[0_12px_36px_rgba(0,0,0,0.12)] p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-900">انتخاب دسته برای ثبت آگهی</span>
                      <span className="text-[11px] text-slate-500">انتشار فوری و رایگان</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                      رایگان
                    </span>
                  </div>

                  <div className="space-y-0.5 max-h-72 overflow-y-auto no-scrollbar">
                    {postCategories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          onOpenPostAd(cat.id);
                          setPostDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-right text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <cat.Icon size={15} />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900">{cat.title}</span>
                            <span className="text-[10.5px] text-slate-500 font-normal">{cat.desc}</span>
                          </div>
                        </div>
                        <ChevronLeft size={13} className="text-slate-300 group-hover:text-slate-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            
            {/* Quick Post Ad */}
            <button
              type="button"
              onClick={() => onOpenPostAd()}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#1877F2] text-white text-xs font-bold shadow-xs active:scale-95"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>ثبت</span>
            </button>

            {/* Manage Ad button on mobile */}
            <button
              type="button"
              onClick={() => onOpenManageAd()}
              className="flex items-center justify-center h-9 w-9 rounded-full bg-slate-100 text-slate-700 border border-slate-200 active:scale-95"
              title="مدیریت آگهی"
            >
              <KeyRound size={16} />
            </button>

            {/* Menu Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95"
              aria-label="منو"
            >
              <Menu size={20} />
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer (100% Persian, with Country Switcher) */}
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
                <span className="text-[11px] text-slate-500">نیازمندی‌های اسکاندیناوی</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Country Switcher */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                کشور انتخابی در اسکاندیناوی
              </span>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenCountryModal) onOpenCountryModal();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-900 font-bold text-xs active:scale-95 transition-all text-right cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{currentCountryObj ? currentCountryObj.flag : '🌍'}</span>
                  <div>
                    <span className="block text-sm text-slate-900">{currentCountryObj ? currentCountryObj.nameFa : 'همه اسکاندیناوی'}</span>
                    <span className="text-[11px] text-slate-500 font-normal">کلیک جهت تغییر کشور و باز شدن پنجره انتخاب</span>
                  </div>
                </div>
                <span className="text-xs text-blue-600 font-bold bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">تغییر کشور</span>
              </button>
            </div>

            {/* Quick Actions Cards */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => { onOpenPostAd(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#1877F2] text-white font-bold text-xs active:scale-95 transition-all text-right shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white">
                    <Plus size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="block text-sm font-extrabold">ثبت آگهی رایگان</span>
                    <span className="text-[11px] text-blue-100 font-normal">در تمام شهرهای اسکاندیناوی با کد اختصاصی</span>
                  </div>
                </div>
                <ChevronLeft size={16} className="text-white/70" />
              </button>

              <button
                type="button"
                onClick={() => { onOpenManageAd(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 text-right active:scale-95 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-900">مدیریت و حذف آگهی</span>
                    <span className="text-[11px] text-slate-500 font-normal">ویرایش یا حذف فوری با کد پیگیری و پین</span>
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
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-xs font-semibold text-slate-700 text-right active:scale-95 transition-all"
                  >
                    <Tag size={13} className="text-blue-500 shrink-0" />
                    <span className="truncate">{cat.fa}</span>
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
