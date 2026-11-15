import React, { useState } from 'react';
import { 
  X, 
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
  AlertCircle
} from 'lucide-react';
import { CATEGORIES, t } from '../lib/translations';

export default function AdDetailModal({ ad, lang, onClose }) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!ad) return null;
  const currentT = t[lang];

  const images = (ad.images && ad.images.length > 0)
    ? ad.images
    : ['https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80'];

  const catObj = CATEGORIES.find(c => c.id === ad.category);
  const catName = catObj ? (lang === 'fa' ? catObj.fa : catObj.sv) : ad.category;

  const displayPrice = ad.price 
    ? `${Number(ad.price).toLocaleString('sv-SE')} ${ad.price_type || 'kr'}`
    : (ad.price_type || (lang === 'fa' ? 'توافقی' : 'Enligt överenskommelse'));

  const shareAd = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card (Bottom-sheet on mobile, centered modal on desktop) */}
      <div className="relative w-full max-w-3xl bg-white rounded-t-[28px] sm:rounded-2xl shadow-2xl border border-stone-200/90 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] z-10 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        
        {/* Mobile Swipe Grab Handle Pill */}
        <div className="sm:hidden w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5 shrink-0" />

        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200/80 bg-stone-50/90 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-200/90 text-stone-800">
              <bdi>{ad.reference_number}</bdi>
            </span>
            <span className="text-xs font-semibold text-stone-500">
              {catName}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={shareAd}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-stone-700 bg-white hover:bg-stone-100 border border-stone-200/80 active:scale-95 transition-all text-xs font-semibold cursor-pointer shadow-2xs"
              title="Dela annons"
            >
              {copiedLink ? <Check size={13} className="text-emerald-700" /> : <Share2 size={13} />}
              <span>{copiedLink ? currentT.copied : (lang === 'fa' ? 'اشتراک' : 'Dela')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-200/70 active:scale-95 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7 space-y-6">
          
          {/* Main Gallery */}
          <div className="space-y-2">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/70">
              <img
                src={images[activeImageIdx]}
                alt={ad.title}
                className="w-full h-full object-cover"
              />
              {ad.is_featured && (
                <div className="absolute top-3 start-3 rounded-full bg-slate-900/85 text-white border border-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs shadow-2xs">
                  {lang === 'fa' ? 'آگهی برگزیده' : 'Utvald annons'}
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`relative h-14 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIdx === i ? 'border-emerald-700 scale-98 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price Header */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                {lang === 'fa' && ad.title_fa ? ad.title_fa : ad.title}
              </h2>
              <div className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight shrink-0 tabular-nums">
                <bdi>{displayPrice}</bdi>
              </div>
            </div>

            {/* Persian translation subtitle if Swedish active, or vice versa */}
            {ad.title_fa && (
              <p className="text-xs sm:text-sm text-stone-500 font-sans">
                {lang === 'fa' ? ad.title : ad.title_fa}
              </p>
            )}

            {/* Location & Metadata Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-stone-500 tabular-nums">
              <div className="flex items-center gap-1.5 font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200/60">
                <MapPin size={13} className="text-emerald-700 shrink-0" />
                <span>{ad.city}{ad.area ? ` (${ad.area})` : ''}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{new Date(ad.created_at).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'sv-SE')}</span>
              </div>

              <div className="flex items-center gap-1">
                <Eye size={12} />
                <span>{ad.views_count || 1} {currentT.views}</span>
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className="border-t border-stone-100 pt-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              {lang === 'fa' ? 'توضیحات آگهی' : 'Beskrivning'}
            </h3>
            <p className="text-sm leading-relaxed text-stone-700 whitespace-pre-line font-sans">
              {ad.description}
            </p>
          </div>

          {/* Contact Box with 42-44px tactile Action Buttons */}
          <div className="rounded-2xl border border-stone-200/90 bg-stone-50/80 p-4 sm:p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  {currentT.contactSeller}
                </span>
                <p className="text-sm sm:text-base font-extrabold text-stone-900 mt-0.5">
                  {ad.contact_name}
                </p>
              </div>
              <ShieldCheck size={24} className="text-emerald-700" />
            </div>

            {/* Direct Contact Buttons Grid with Meta Rounded-full tactile buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ad.contact_phone && (
                <a
                  href={`tel:${ad.contact_phone}`}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs h-11 px-3 shadow-xs active:scale-95 transition-all text-center"
                >
                  <Phone size={14} />
                  <span>{currentT.call}</span>
                </a>
              )}

              {ad.contact_whatsapp && (
                <a
                  href={`https://wa.me/${ad.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-full bg-[#128C7E] hover:bg-[#075E54] text-white font-semibold text-xs h-11 px-3 shadow-xs active:scale-95 transition-all text-center"
                >
                  <MessageSquare size={14} />
                  <span>{currentT.whatsapp}</span>
                </a>
              )}

              {ad.contact_telegram && (
                <a
                  href={ad.contact_telegram.startsWith('http') ? ad.contact_telegram : `https://t.me/${ad.contact_telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-full bg-[#229ED9] hover:bg-[#1d87ba] text-white font-semibold text-xs h-11 px-3 shadow-xs active:scale-95 transition-all text-center"
                >
                  <Send size={14} className="icon-flip-rtl" />
                  <span>{currentT.telegram}</span>
                </a>
              )}

              {ad.contact_email && (
                <a
                  href={`mailto:${ad.contact_email}?subject=Angående annons ${ad.reference_number}: ${ad.title}`}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-slate-900 hover:bg-black text-white font-semibold text-xs h-11 px-3 shadow-xs active:scale-95 transition-all text-center"
                >
                  <Mail size={14} />
                  <span>{currentT.email}</span>
                </a>
              )}
            </div>
          </div>

          {/* Safety Notice Box */}
          <div className="flex items-start gap-2.5 rounded-xl border border-stone-200/80 bg-white p-3.5 text-xs text-stone-600 shadow-2xs">
            <AlertCircle size={16} className="text-stone-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-800">{currentT.safetyNoticeTitle}</p>
              <p className="mt-0.5 text-stone-500 leading-relaxed">
                {currentT.safetyNoticeText}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
