import React, { useState } from 'react';
import { 
  Plus, 
  KeyRound, 
  Menu, 
  X,
  ChevronRight
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

  const mainNavItems = [
    { id: 'bostad', sv: 'Bostad', fa: 'مسکن' },
    { id: 'restaurang', sv: 'Restaurang & Mat', fa: 'رستوران' },
    { id: 'tjanster', sv: 'Tjänster & Tolk', fa: 'خدمات و حقوقی' },
    { id: 'jobb', sv: 'Jobb', fa: 'کار و استخدام' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          
          {/* Brand - Meta style clean typography */}
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white font-bold text-xs tracking-wider">
                SP
              </div>
              <span className="font-bold text-[18px] tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                SwedPersiska
              </span>
            </a>

            {/* Desktop Category Nav Links (Meta.com style) */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainNavItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(item.id);
                  }}
                  className="px-3 py-1.5 rounded-full text-[13px] font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 transition-all cursor-pointer"
                >
                  {lang === 'fa' ? item.fa : item.sv}
                </button>
              ))}
            </nav>
          </div>

          {/* Desktop Right Controls (Meta Clean) */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Minimalist Language Switcher */}
            <div className="flex items-center rounded-full bg-slate-100 p-0.5 border border-slate-200/70 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLang('sv')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  lang === 'sv' 
                    ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                SV
              </button>
              <button
                type="button"
                onClick={() => setLang('fa')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer font-vazir ${
                  lang === 'fa' 
                    ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                فارسی
              </button>
            </div>

            {/* Manage Ad Button */}
            <button
              type="button"
              onClick={onOpenManageAd}
              className="px-3.5 py-2 rounded-full text-[13px] font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            >
              {currentT.manageAdBtn}
            </button>

            {/* Post Ad Button - Meta Blue or Clean Black rounded-full */}
            <button
              type="button"
              onClick={onOpenPostAd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white text-[13px] font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>{currentT.postAdBtn}</span>
            </button>

          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            
            {/* Language toggle */}
            <button
              type="button"
              onClick={() => setLang(lang === 'sv' ? 'fa' : 'sv')}
              className="h-8 px-2.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200"
            >
              {lang === 'sv' ? 'فارسی' : 'SV'}
            </button>

            {/* Post button */}
            <button
              type="button"
              onClick={onOpenPostAd}
              className="flex items-center gap-1 h-8 px-3 rounded-full bg-[#1877F2] text-white text-xs font-bold active:scale-95"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>{lang === 'fa' ? 'ثبت' : 'Annonsera'}</span>
            </button>

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 active:scale-95"
              aria-label="Meny"
            >
              <Menu size={20} />
            </button>

          </div>

        </div>
      </div>

      {/* Meta Style Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-full bg-white rounded-t-3xl border-t border-slate-200 p-5 space-y-4 shadow-2xl z-10 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-1" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">SwedPersiska</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Language Switch */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-slate-100">
              <button
                type="button"
                onClick={() => { setLang('sv'); setMobileMenuOpen(false); }}
                className={`py-2 rounded-full text-xs font-bold transition-all ${
                  lang === 'sv' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Svenska
              </button>
              <button
                type="button"
                onClick={() => { setLang('fa'); setMobileMenuOpen(false); }}
                className={`py-2 rounded-full text-xs font-bold transition-all font-vazir ${
                  lang === 'fa' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                فارسی
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => { onOpenPostAd(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#1877F2] text-white font-semibold text-xs active:scale-95 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Plus size={18} strokeWidth={2.5} />
                  <span>{currentT.postAdBtn}</span>
                </div>
                <ChevronRight size={16} className="text-white/70" />
              </button>

              <button
                type="button"
                onClick={() => { onOpenManageAd(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/70 text-slate-900 font-semibold text-xs active:scale-95 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound size={17} className="text-slate-600" />
                  <span>{currentT.manageAdBtn}</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Categories */}
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 pb-1">
                {lang === 'fa' ? 'دسته‌بندی‌ها' : 'Kategorier'}
              </span>
              {mainNavItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-medium text-left"
                >
                  <span>{lang === 'fa' ? item.fa : item.sv}</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
