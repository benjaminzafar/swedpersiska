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
    <footer className="border-t border-slate-200/80 bg-white pt-10 pb-8 text-slate-600 text-xs select-none font-vazir" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
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
            <div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight block">{siteName}</span>
              <span className="text-[11px] text-slate-500 font-medium">پلتفرم جامع نیازمندی‌های جامعه فارسی‌زبانان اسکاندیناوی</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <span>پوشش ۴ کشور: سوئد • نروژ • دانمارک • فنلاند</span>
          </div>
        </div>

        {/* 2x2 Grid on Mobile, 4 Columns on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Column 1: دسته‌های پرطرفدار */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
              <span>دسته‌های پرطرفدار</span>
            </h4>
            <ul className="space-y-2 text-xs">
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

          {/* Column 2: شهرهای اسکاندیناوی */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
              <span>شهرهای اصلی</span>
            </h4>
            <ul className="space-y-2 text-xs">
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

          {/* Column 3: دسترسی سریع و مدیریت */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
              <span>دسترسی و مدیریت</span>
            </h4>
            <ul className="space-y-2 text-xs">
              {onOpenPostAd && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenPostAd}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <PlusCircle size={13} className="text-blue-500 shrink-0" />
                    <span>ثبت رایگان آگهی</span>
                  </button>
                </li>
              )}
              {onOpenManageAd && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenManageAd}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <KeyRound size={13} className="text-amber-500 shrink-0" />
                    <span>مدیریت با پین کد</span>
                  </button>
                </li>
              )}
              <li>
                <a
                  href="?admin=1"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenAdmin?.();
                  }}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer font-medium"
                >
                  <Lock size={13} className="text-slate-400 shrink-0" />
                  <span>ورود به پنل مدیریت</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: امنیت و راهنمای معاملات */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
              <span>معاملات امن</span>
            </h4>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-1.5 text-[11px] leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                <span>ارتباط مستقیم و بی‌واسطه</span>
              </div>
              <p className="text-slate-500 text-[10.5px]">
                هر آگهی دارای کد پیگیری اختصاصی و رمز ۴ رقمی برای ویرایش یا حذف در هر زمان است.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © {currentYear} {siteName} • سامانه نیازمندی‌های فارسی‌زبانان اسکاندیناوی
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-slate-400">سوئد • نروژ • دانمارک • فنلاند</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
