import React from 'react';
import { ShieldCheck, Lock, PlusCircle, KeyRound } from 'lucide-react';
import { CATEGORIES } from '../lib/translations';

const currentYear = new Date().getFullYear();

export default function Footer({ 
  siteName = 'سوئد پرشیا',
  logoUrl = '',
  onSelectCategory, 
  onSelectCity, 
  onOpenPostAd,
  onOpenManageAd,
  onOpenAdmin 
}) {
  // Scandinavian cities without emoji flags to prevent Windows raw ISO code rendering
  const scandiCities = [
    { name: 'استکهلم (سوئد)', id: 'Stockholm' },
    { name: 'اسلو (نروژ)', id: 'Oslo' },
    { name: 'کپنهاگ (دانمارک)', id: 'Copenhagen' },
    { name: 'یوتبوری (سوئد)', id: 'Göteborg' },
    { name: 'مالمو (سوئد)', id: 'Malmö' },
    { name: 'هلسینکی (فنلاند)', id: 'Helsinki' },
  ];

  return (
    <footer className="border-t border-slate-200/80 bg-white pt-12 pb-8 text-slate-600 text-xs select-none font-vazir" dir="rtl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={siteName} 
                  className="h-8 max-w-[120px] object-contain rounded-lg"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white font-extrabold text-xs">
                  <span className="font-mono text-emerald-400">SP</span>
                </div>
              )}
              <span className="font-extrabold text-base text-slate-900 tracking-tight">{siteName}</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-xs">
              پلتفرم جامع و رایگان نیازمندی‌ها، رهن و اجاره مسکن، رستوران‌های ایرانی، استخدام و مشاغل برای جامعه ایرانیان و فارسی‌زبانان مقیم سوئد، نروژ، دانمارک و فنلاند.
            </p>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              دسته‌های پرطرفدار
            </h4>
            <ul className="space-y-2">
              {CATEGORIES.slice(1, 6).map(cat => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory?.(cat.id)}
                    className="hover:text-blue-600 transition-colors text-right cursor-pointer"
                  >
                    {cat.fa}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Major Scandinavian Cities */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              شهرهای اسکاندیناوی
            </h4>
            <ul className="space-y-2">
              {scandiCities.map(city => (
                <li key={city.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCity?.(city.id)}
                    className="hover:text-blue-600 transition-colors text-right cursor-pointer"
                  >
                    {city.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Access & Admin Login */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              دسترسی سریع و مدیریت
            </h4>
            <ul className="space-y-2.5">
              {onOpenPostAd && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenPostAd}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <PlusCircle size={13} className="text-blue-500" />
                    <span>ثبت رایگان آگهی</span>
                  </button>
                </li>
              )}
              {onOpenManageAd && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenManageAd}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <KeyRound size={13} className="text-amber-500" />
                    <span>پیگیری و مدیریت آگهی</span>
                  </button>
                </li>
              )}
              {/* Normal admin login link URL */}
              <li>
                <a
                  href="?admin=1"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenAdmin?.();
                  }}
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer font-medium"
                >
                  <Lock size={13} className="text-slate-400 group-hover:text-blue-600" />
                  <span>ورود به پنل مدیریت</span>
                </a>
              </li>
            </ul>

            {/* Safe Community Info */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-1 text-[11px] leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                <span>معامله مطمئن و بدون واسطه</span>
              </div>
              <p className="text-slate-500 text-[10.5px]">
                هر آگهی دارای کد پیگیری اختصاصی و رمز ۴ رقمی برای ویرایش یا حذف است.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © {currentYear} {siteName} • سامانه نیازمندی‌های ایرانیان اسکاندیناوی
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-slate-400">سوئد • نروژ • دانمارک • فنلاند</span>
            
            {/* Standard Login URL in footer */}
            <a
              href="?admin=1"
              onClick={(e) => {
                e.preventDefault();
                onOpenAdmin?.();
              }}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer text-[11px] font-medium"
              title="ورود مدیریت سایت"
            >
              <Lock size={12} className="text-slate-400" />
              <span>ورود مدیریت</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
