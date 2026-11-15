import React, { useState } from 'react';
import { 
  PlusCircle, 
  KeyRound, 
  ShieldCheck, 
  Globe, 
  Menu, 
  X
} from 'lucide-react';
import { t } from '../lib/translations';

export default function Navbar({ 
  lang, 
  setLang, 
  onOpenPostAd, 
  onOpenManageAd, 
  onOpenAdmin 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentT = t[lang];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-950 text-white font-extrabold text-sm shadow-xs border border-stone-800 transition-transform duration-150 group-hover:scale-105 active:scale-95">
                <span className="font-mono text-xs font-black tracking-wider">SP</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[15px] tracking-tight text-stone-900">SwedPersiska</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200/80">
                    SE / IR
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 font-sans">
                  {lang === 'fa' ? 'نیازمندی‌های ایرانیان سوئد' : 'Marknadsplats i Sverige'}
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            
            {/* Language Switcher */}
            <div className="flex items-center rounded-xl bg-stone-100 p-1 border border-stone-200/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLang('sv')}
                className={`px-3 py-1 rounded-lg transition-all active:scale-95 cursor-pointer ${
                  lang === 'sv' 
                    ? 'bg-white text-stone-900 shadow-2xs font-extrabold' 
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                🇸🇪 Svenska
              </button>
              <button
                type="button"
                onClick={() => setLang('fa')}
                className={`px-3 py-1 rounded-lg transition-all active:scale-95 cursor-pointer ${
                  lang === 'fa' 
                    ? 'bg-white text-emerald-800 shadow-2xs font-extrabold' 
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                🇮🇷 فارسی
              </button>
            </div>

            {/* Manage Ad using Ref Number + PIN */}
            <button
              type="button"
              onClick={onOpenManageAd}
              className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-stone-700 hover:text-stone-950 hover:bg-stone-100/80 active:scale-[0.98] transition-all text-xs font-bold border border-transparent hover:border-stone-200/80 cursor-pointer"
              title="Redigera eller ta bort med referensnummer"
            >
              <KeyRound size={14} className="text-stone-400" />
              <span>{currentT.manageAdBtn}</span>
            </button>

            {/* Post Ad Primary CTA */}
            <button
              type="button"
              onClick={onOpenPostAd}
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>{currentT.postAdBtn}</span>
            </button>

            {/* Admin Link */}
            <button
              type="button"
              onClick={onOpenAdmin}
              className="flex items-center justify-center h-10 w-10 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 active:scale-95 transition-all cursor-pointer border border-transparent hover:border-stone-200"
              title="Adminpanel"
            >
              <ShieldCheck size={18} />
            </button>
          </div>

          {/* Mobile Right Quick Buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === 'sv' ? 'fa' : 'sv')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 text-xs font-bold text-stone-700 border border-stone-200 active:scale-95"
            >
              <Globe size={13} className="text-emerald-700" />
              <span>{lang === 'sv' ? 'فارسی' : 'SV'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenPostAd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-2xs active:scale-95"
            >
              <PlusCircle size={14} />
              <span>{lang === 'fa' ? 'ثبت آگهی' : 'Annonsera'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 active:scale-95"
              aria-label="Öppna meny"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200/80 bg-white px-4 pt-3 pb-5 space-y-2.5 shadow-lg animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-xs font-semibold text-stone-500">Välj språk / تغییر زبان</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setLang('sv'); setMobileMenuOpen(false); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${lang === 'sv' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'}`}
              >
                🇸🇪 Svenska
              </button>
              <button
                onClick={() => { setLang('fa'); setMobileMenuOpen(false); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${lang === 'fa' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'}`}
              >
                🇮🇷 فارسی
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { onOpenManageAd(); setMobileMenuOpen(false); }}
            className="w-full flex items-center justify-between h-11 px-3.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200/80 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2">
              <KeyRound size={15} className="text-amber-600" />
              <span>{currentT.manageAdBtn}</span>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">Ref & PIN</span>
          </button>

          <button
            type="button"
            onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
            className="w-full flex items-center justify-between h-11 px-3.5 rounded-xl bg-stone-900 text-white text-xs font-bold active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span>{currentT.adminLink}</span>
            </div>
            <span className="text-[10px] text-stone-400 font-mono">Panel</span>
          </button>
        </div>
      )}
    </header>
  );
}
