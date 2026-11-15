import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { CITIES, CATEGORIES } from '../lib/translations';

const currentYear = new Date().getFullYear();

export default function Footer({ onSelectCategory, onSelectCity, onOpenAdmin }) {
  return (
    <footer className="border-t border-slate-200/80 bg-white pt-12 pb-8 text-slate-600 text-xs select-none font-vazir" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white font-extrabold text-xs">
                <span className="font-mono text-emerald-400">SP</span>
              </div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight">سوئد پرشیا</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-xs">
              پلتفرم جامع و رایگان نیازمندی‌ها، رهن و اجاره مسکن، رستوران‌های ایرانی، استخدام و مشاغل برای جامعه ایرانیان و فارسی‌زبانان مقیم سوئد.
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
                    onClick={() => onSelectCategory(cat.id)}
                    className="hover:text-blue-600 transition-colors text-right cursor-pointer"
                  >
                    {cat.fa}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Major Cities */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              شهرهای سوئد
            </h4>
            <ul className="space-y-2">
              {CITIES.slice(1, 6).map(city => (
                <li key={city.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCity(city.id)}
                    className="hover:text-blue-600 transition-colors text-right cursor-pointer"
                  >
                    {city.fa}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Safe Community Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              امنیت و راهنمای معاملات
            </h4>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5 text-[11px] leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                <span>معامله مطمئن و ارتباط مستقیم</span>
              </div>
              <p className="text-slate-500">
                هر آگهی دارای کد پیگیری اختصاصی و رمز ۴ رقمی است تا آگهی‌دهنده بتواند در هر زمان آن را ویرایش یا حذف نماید.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © {currentYear} سوئد پرشیا • SwedPersiska.se
          </div>
          
          <div className="flex items-center gap-4">
            <span>سامانه نیازمندی‌های ایرانیان در سوئد</span>
            
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-[10.5px]"
                title="ورود مدیریت"
              >
                <Lock size={11} />
                <span>مدیریت</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
