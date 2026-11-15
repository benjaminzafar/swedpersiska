import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  MapPin, 
  Clock, 
  Eye, 
  Phone, 
  Mail, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  Share2, 
  Check, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Crown
} from 'lucide-react';
import { CATEGORIES, t } from '../lib/translations';

export default function AdDetailPage({ 
  ad, 
  allAds = [], 
  lang = 'fa', 
  onBack, 
  onSelectAd,
  onOpenPromote 
}) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const currentT = t[lang] || t.fa;

  // Scroll to top when ad changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImageIdx(0);
  }, [ad?.id]);

  if (!ad) return null;

  const images = (ad.images && ad.images.length > 0)
    ? ad.images
    : ['https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80'];

  const catObj = CATEGORIES.find(c => c.id === ad.category);
  const catName = catObj ? (lang === 'fa' ? catObj.fa : catObj.sv) : ad.category;

  const displayPrice = ad.price 
    ? `${Number(ad.price).toLocaleString('sv-SE')} ${ad.price_type || 'kr'}`
    : (ad.price_type || (lang === 'fa' ? 'توافقی' : 'Enligt överenskommelse'));

  const dateStr = ad.created_at 
    ? new Date(ad.created_at).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  const shareAd = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Find 4 VIP Promoted ads (or fallback to top featured/recent ads)
  const otherAds = allAds.filter(a => a.id !== ad.id);
  const vipAds = otherAds.filter(a => a.is_featured);
  const fallbackAds = otherAds.filter(a => !a.is_featured);
  // Guarantee exactly 4 VIP slots (using featured ads first, then other ads to fill)
  const displayVipAds = [...vipAds, ...fallbackAds].slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-stone-900 pb-20 font-vazir" dir="rtl">
      
      {/* Top Bar / Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200/90 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
          
          {/* Back button & Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <ArrowRight size={15} />
              <span>بازگشت به آگهی‌ها</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 truncate">
              <span>خانه</span>
              <span>/</span>
              <span className="text-slate-600 font-semibold">{catName}</span>
              <span>/</span>
              <span className="text-slate-900 font-bold truncate max-w-xs">{ad.title}</span>
            </div>
          </div>

          {/* Right actions: Reference Code & Share */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden xs:inline-flex font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <bdi>{ad.reference_number}</bdi>
            </span>

            <button
              type="button"
              onClick={shareAd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>{copiedLink ? currentT.copied : 'اشتراک‌گذاری'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Page Body: 2 Columns on Desktop, Single Column on Mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* MAIN CONTENT COLUMN (8 cols on Desktop) */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Gallery Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3 sm:p-5 shadow-xs overflow-hidden space-y-3">
              {/* Big Stage Image */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src={images[activeImageIdx]}
                  alt={ad.title}
                  className="w-full h-full object-contain sm:object-cover"
                />

                {/* VIP / Featured Badge */}
                {ad.is_featured && (
                  <div className="absolute top-3 start-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1877F2] text-white text-xs font-black shadow-md backdrop-blur-xs">
                    <Crown size={13} className="text-amber-300" />
                    <span>آگهی ویژه (VIP)</span>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 end-3 px-3 py-1 rounded-full bg-white/95 text-slate-800 text-xs font-bold shadow-md border border-slate-200 backdrop-blur-xs">
                  {catName}
                </div>

                {/* Arrow navigation if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute start-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-md"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute end-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-md"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative h-16 sm:h-20 aspect-[4/3] rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activeImageIdx === idx 
                          ? 'border-blue-600 ring-2 ring-blue-200 scale-95' 
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title, Price & Details Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
              
              {/* Header: Title & Price */}
              <div className="space-y-3 pb-5 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 leading-snug">
                    {lang === 'fa' && ad.title_fa ? ad.title_fa : ad.title}
                  </h1>
                  
                  {/* Price Big Badge */}
                  <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200/90 text-right sm:text-left shrink-0">
                    <span className="text-2xl sm:text-3xl font-black text-[#1877F2] tabular-nums tracking-tight">
                      <bdi>{displayPrice}</bdi>
                    </span>
                  </div>
                </div>

                {/* Meta info tags */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                    <MapPin size={13} className="text-blue-600 shrink-0" />
                    <span>{ad.city}{ad.area ? ` • ${ad.area}` : ''}</span>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-500">
                    <Clock size={13} className="shrink-0" />
                    <span>ثبت: {dateStr}</span>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-500">
                    <Eye size={13} className="shrink-0" />
                    <span>{ad.views_count || 1} بازدید</span>
                  </div>

                  <div className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-400">
                    <span>کد مرجع:</span>
                    <bdi className="font-bold text-slate-600">{ad.reference_number}</bdi>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <span>توضیحات و مشخصات کامل</span>
                </h3>
                <div className="text-sm sm:text-base text-slate-700 leading-relaxed sm:leading-loose whitespace-pre-wrap bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-100">
                  {ad.description}
                </div>
              </div>

              {/* Contact Seller Action Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">راه‌های ارتباط با آگهی‌دهنده:</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Phone */}
                  {ad.contact_phone && (
                    <a
                      href={`tel:${ad.contact_phone}`}
                      className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-xs active:scale-95 transition-all"
                    >
                      <Phone size={17} />
                      <span>تماس مستقیم: {ad.contact_phone}</span>
                    </a>
                  )}

                  {/* WhatsApp */}
                  {ad.contact_whatsapp && (
                    <a
                      href={`https://wa.me/${ad.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-sm font-bold shadow-xs active:scale-95 transition-all"
                    >
                      <MessageSquare size={17} />
                      <span>پیام در واتساپ (WhatsApp)</span>
                    </a>
                  )}

                  {/* Telegram */}
                  {ad.contact_telegram && (
                    <a
                      href={ad.contact_telegram.startsWith('http') ? ad.contact_telegram : `https://t.me/${ad.contact_telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-[#229ED9] hover:bg-[#1e8ec3] text-white text-sm font-bold shadow-xs active:scale-95 transition-all"
                    >
                      <Send size={17} />
                      <span>گفتگو در تلگرام (Telegram)</span>
                    </a>
                  )}

                  {/* Email */}
                  {ad.contact_email && (
                    <a
                      href={`mailto:${ad.contact_email}?subject=پرسش درباره آگهی ${ad.reference_number}`}
                      className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold shadow-xs active:scale-95 transition-all"
                    >
                      <Mail size={17} />
                      <span>ارسال ایمیل</span>
                    </a>
                  )}
                </div>

                {ad.contact_name && (
                  <p className="text-xs text-slate-500 pt-1 text-center sm:text-right">
                    نام آگهی‌دهنده: <span className="font-semibold text-slate-800">{ad.contact_name}</span>
                  </p>
                )}
              </div>

              {/* Safety Notice Card */}
              <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 flex items-start gap-3">
                <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-amber-900">
                  <h4 className="font-bold">راهنمای معامله امن:</h4>
                  <p className="leading-relaxed text-amber-800">
                    همیشه قبل از واریز هرگونه بیعانه یا وجه، کالا یا مسکن را شخصاً بررسی فرمایید و از قراردادهای رسمی استفاده کنید. سایت سوئد پرشیا بستر ثبت آگهی‌های رایگان جامعه فارسی‌زبان است.
                  </p>
                </div>
              </div>

            </div>

          </main>

          {/* SIDEBAR: 4 VIP PROMOTED ADS & MONETIZATION SLOTS (4 cols on Desktop) */}
          <aside className="lg:col-span-4 space-y-5">
            
            {/* VIP Sponsored Ads Box */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <Crown size={15} />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-950">آگهی‌های ویژه و برگزیده</h2>
                    <p className="text-[10px] text-slate-400 font-medium">۴ جایگاه اسپانسر شده (VIP)</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                  اسپانسر
                </span>
              </div>

              {/* The 4 VIP Cards Grid */}
              <div className="space-y-3">
                {displayVipAds.map((vipAd) => {
                  const vipCat = CATEGORIES.find(c => c.id === vipAd.category);
                  const vipCover = (vipAd.images && vipAd.images.length > 0)
                    ? vipAd.images[0]
                    : 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=400&q=80';
                  const vipPrice = vipAd.price 
                    ? `${Number(vipAd.price).toLocaleString('sv-SE')} ${vipAd.price_type || 'kr'}`
                    : (vipAd.price_type || 'توافقی');

                  return (
                    <article
                      key={vipAd.id}
                      onClick={() => onSelectAd?.(vipAd)}
                      className="group flex gap-3 p-2.5 rounded-xl border border-slate-200/70 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
                    >
                      {/* Image */}
                      <div className="relative h-20 w-24 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                        <img
                          src={vipCover}
                          alt={vipAd.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-1 start-1 px-1.5 py-0.5 rounded bg-[#1877F2] text-white text-[8px] font-black shadow-xs">
                          ویژه
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-slate-400 block truncate">
                            {vipCat?.fa || vipAd.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
                            {vipAd.title_fa || vipAd.title}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-black text-slate-950 tabular-nums">
                            {vipPrice}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <MapPin size={9} className="text-slate-400" />
                            {vipAd.city}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

            </div>

            {/* Monetization Promotion CTA Card */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-2xl sm:rounded-3xl p-5 shadow-lg border border-slate-800 space-y-3.5 relative overflow-hidden">
              <div className="absolute -end-8 -top-8 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">آگهی شما اینجا دیده شود!</h3>
                  <p className="text-[10px] text-slate-300">جذب ۳ برابری مشتریان و بازدیدکنندگان</p>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                با ارتقا به آگهی ویژه (VIP)، آگهی شما در سایدبار تمام صفحات آگهی‌ها و صدر نتایج جستجوی هزاران فارسی‌زبان سراسر اسکاندیناوی نمایش داده می‌شود.
              </p>

              <button
                type="button"
                onClick={() => onOpenPromote?.(ad)}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown size={15} className="text-amber-300" />
                <span>ارتقا و ویژه کردن این آگهی (Stripe)</span>
              </button>
            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}
