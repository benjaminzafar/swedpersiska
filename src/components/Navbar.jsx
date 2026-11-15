import React, { useState } from 'react';
import { 
  PlusCircle, 
  KeyRound, 
  Globe, 
  Menu, 
  X,
  ChevronRight,
  Home,
  Utensils,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { t } from '../lib/translations';

export default function Navbar({ 
  lang, 
  setLang, 
  onOpenPostAd, 
  onOpenManageAd,
  onSelectCategory
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentT = t[lang];

  const quickNavCategories = [
    { id: 'bostad', sv: 'Bostad', fa: 'مسکن', Icon: Home },
    { id: 'restaurang', sv: 'Restaurang', fa: 'رستوران', Icon: Utensils },
    { id: 'tjanster', sv: 'Tjänster', fa: 'خدمات و حقوقی', Icon: Briefcase },
    { id: 'jobb', sv: 'Jobb', fa: 'کار', Icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl select-none transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Brand & Monogram (Astryx Frame) */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white font-extrabold text-sm shadow-sm border border-slate-800 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md active:scale-95">
                <span className="font-mono text-xs font-black tracking-wider text-emerald-400">SP</span>
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-white" />
                </span>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-[16px] tracking-tight text-slate-950 group-hover:text-emerald-700 transition-colors">
                    SwedPersiska
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9.5px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200/80 tracking-wide font-mono">
                    SE • IR
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 font-sans leading-none mt-0.5">
                  {lang === 'fa' ? 'نیازمندی‌های ایرانیان سوئد' : 'Sveriges persiska marknadsplats'}
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Right Actions (Astryx Super Modern Navigation) */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Segmented Pill Language Switcher */}
            <div className="flex items-center rounded-full bg-slate-100/90 p-1 border border-slate-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setLang('sv')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                  lang === 'sv' 
                    ? 'bg-white text-slate-900 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>🇸🇪</span>
                <span>Svenska</span>
              </button>
              <button
                type="button"
                onClick={() => setLang('fa')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                  lang === 'fa' 
                    ? 'bg-white text-emerald-800 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>🇮🇷</span>
                <span className="font-vazir">فارسی</span>
              </button>
            </div>

            {/* Manage Ad Pill Button (Ref & PIN) */}
            <button
              type="button"
              onClick={onOpenManageAd}
              className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 text-slate-700 hover:text-slate-950 active:scale-[0.98] transition-all text-xs font-bold border border-slate-200/80 shadow-2xs cursor-pointer"
              title="Redigera eller ta bort med referensnummer & PIN"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
                <KeyRound size={13} />
              </div>
              <span>{currentT.manageAdBtn}</span>
              <span className="hidden lg:inline text-[9.5px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                PIN
              </span>
            </button>

            {/* Post Ad Elevated Hero Action */}
            <button
              type="button"
              onClick={onOpenPostAd}
              className="flex items-center gap-2 h-10 px-4.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-[0_2px_8px_rgba(5,150,105,0.22)] hover:shadow-[0_4px_14px_rgba(5,150,105,0.32)] active:scale-[0.98] transition-all cursor-pointer group"
            >
              <PlusCircle size={15} className="transition-transform duration-200 group-hover:rotate-90" />
              <span>{currentT.postAdBtn}</span>
              <span className="text-[10px] bg-emerald-700/60 px-1.5 py-0.5 rounded-full font-mono font-bold tracking-tight">
                {lang === 'fa' ? 'رایگان' : 'Gratis'}
              </span>
            </button>

          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            
            {/* Quick Language Toggle */}
            <button
              type="button"
              onClick={() => setLang(lang === 'sv' ? 'fa' : 'sv')}
              className="flex items-center gap-1 h-9 px-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-800 border border-slate-200/80 active:scale-95"
              title="Byt språk"
            >
              <Globe size={13} className="text-emerald-700" />
              <span>{lang === 'sv' ? 'فارسی' : 'SV'}</span>
            </button>

            {/* Quick Post Ad Button */}
            <button
              type="button"
              onClick={onOpenPostAd}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-emerald-600 text-white text-xs font-extrabold shadow-2xs active:scale-95"
            >
              <PlusCircle size={14} />
              <span>{lang === 'fa' ? 'ثبت' : 'Annonsera'}</span>
            </button>

            {/* Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200/70 active:scale-95 border border-slate-200/80"
              aria-label="Öppna meny"
            >
              <Menu size={18} />
            </button>

          </div>

        </div>
      </div>

      {/* Super Modern Astryx Mobile Bottom-Sheet Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          
          {/* Dimmed Blurred Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Bottom Sheet Modal */}
          <div className="relative w-full max-h-[85vh] bg-white rounded-t-[28px] border-t border-slate-200 p-5 space-y-4 shadow-2xl z-10 animate-in slide-in-from-bottom duration-250 overflow-y-auto">
            
            {/* Grab Handle Pill */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-2 shrink-0" />

            {/* Top Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">SwedPersiska Meny</span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  SE • IR
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Language Segmented Control */}
            <div className="space-y-1.5">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                {lang === 'fa' ? 'انتخاب زبان' : 'Välj språk'}
              </span>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => { setLang('sv'); setMobileMenuOpen(false); }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    lang === 'sv' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600'
                  }`}
                >
                  <span>🇸🇪</span>
                  <span>Svenska</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setLang('fa'); setMobileMenuOpen(false); }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    lang === 'fa' ? 'bg-white text-emerald-800 shadow-2xs font-black font-vazir' : 'text-slate-600'
                  }`}
                >
                  <span>🇮🇷</span>
                  <span>فارسی</span>
                </button>
              </div>
            </div>

            {/* Primary Action Cards (Astryx Tactile Cards) */}
            <div className="space-y-2 pt-1">
              
              {/* Post Ad Card */}
              <button
                type="button"
                onClick={() => { onOpenPostAd(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm active:scale-[0.98] transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-xs">
                    <PlusCircle size={22} />
                  </div>
                  <div>
                    <span className="block text-sm font-extrabold">{currentT.postAdBtn}</span>
                    <span className="text-[11px] text-emerald-100">
                      {lang === 'fa' ? 'رایگان همراه با کد رهگیری اختصاصی' : 'Kostnadsfritt med unikt referensnummer'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-white/70" />
              </button>

              {/* Manage Ad Card */}
              <button
                type="button"
                onClick={() => { onOpenManageAd(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200/90 active:scale-[0.98] transition-all text-left shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 border border-amber-500/20">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-900">{currentT.manageAdBtn}</span>
                    <span className="text-[11px] text-slate-500">
                      {lang === 'fa' ? 'ویرایش یا حذف با کد مرجع و PIN' : 'Ändra eller ta bort med ref & PIN'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </button>

            </div>

            {/* Quick Categories Navigation */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                {lang === 'fa' ? 'دسته‌های محبوب' : 'Snabblänkar'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {quickNavCategories.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-xs font-semibold text-slate-700 text-left active:scale-95 transition-all"
                  >
                    <item.Icon size={14} className="text-emerald-700 shrink-0" />
                    <span>{lang === 'fa' ? item.fa : item.sv}</span>
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
