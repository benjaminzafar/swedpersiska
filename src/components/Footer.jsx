import React from 'react';
import { Heart, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { CITIES, CATEGORIES, t } from '../lib/translations';

export default function Footer({ lang, onSelectCategory, onSelectCity }) {
  const currentT = t[lang];

  return (
    <footer className="border-t border-stone-200 bg-white pt-12 pb-8 text-stone-600 text-xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-amber-600 text-white font-extrabold text-xs">
                SP
              </div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight">SwedPersiska</span>
            </div>
            <p className="text-stone-500 leading-relaxed text-xs">
              {lang === 'fa' 
                ? 'پل ارتباطی و پایگاه جامع نیازمندی‌های ایرانیان و فارسی‌زبانان مقیم سوئد. بستری رایگان و امن برای مسکن، رستوران‌ها، کار و خدمات روزمره.'
                : 'Den centrala mötesplatsen och marknadsplatsen för iranier och persisktalande i Sverige. Hitta bostäder, restauranger, jobb och vardagliga tjänster.'}
            </p>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="font-bold text-stone-900 mb-3 text-xs uppercase tracking-wider">
              {lang === 'fa' ? 'دسته‌های پرطرفدار' : 'Populära kategorier'}
            </h4>
            <ul className="space-y-2">
              {CATEGORIES.slice(1, 6).map(cat => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className="hover:text-emerald-700 hover:underline transition-colors text-left"
                  >
                    {lang === 'fa' ? cat.fa : cat.sv}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Major Cities */}
          <div>
            <h4 className="font-bold text-stone-900 mb-3 text-xs uppercase tracking-wider">
              {lang === 'fa' ? 'شهرهای سوئد' : 'Städer i Sverige'}
            </h4>
            <ul className="space-y-2">
              {CITIES.slice(1, 6).map(city => (
                <li key={city.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCity(city.id)}
                    className="hover:text-emerald-700 hover:underline transition-colors text-left"
                  >
                    {lang === 'fa' ? city.fa : city.sv}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Safe Community Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              {lang === 'fa' ? 'امنیت و راهنما' : 'Trygghet & Riktlinjer'}
            </h4>
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-1.5 text-[11px] leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>{lang === 'fa' ? 'معامله مستقیم و مطمئن' : 'Direkt & säker kontakt'}</span>
              </div>
              <p className="text-stone-500">
                {lang === 'fa' 
                  ? 'هر آگهی دارای کد مرجع یکتا و رمز اختصاصی است تا آگهی‌دهنده بتواند در هر لحظه آن را مدیریت یا حذف نماید.'
                  : 'Varje annons har ett unikt referensnummer och PIN för enkel hantering och omedelbar borttagning av annonsören.'}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400">
          <div>
            © {new Date().getFullYear()} SwedPersiska.se • سوئد پرشیا
          </div>
          <div className="flex items-center gap-1">
            <span>Byggd för den iranska och persisktalande gemenskapen i Sverige</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
