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
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { CATEGORIES, t } from '../lib/translations';

export default function AdDetailModal({ ad, lang, onClose }) {
  if (!ad) return null;
  const currentT = t[lang];
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
              {ad.reference_number}
            </span>
            <span className="text-xs font-semibold text-stone-500">
              {catName}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={shareAd}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-stone-600 hover:bg-stone-200/70 active:scale-95 transition-all text-xs font-semibold"
              title="Dela annons"
            >
              {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>{copiedLink ? currentT.copied : (lang === 'fa' ? 'اشتراک' : 'Dela')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-200/70 active:scale-95 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* Main Gallery */}
          <div className="space-y-2">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/60 shadow-xs">
              <img
                src={images[activeImageIdx]}
                alt={ad.title}
                className="w-full h-full object-cover"
              />
              {ad.is_featured && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-amber-500 text-white px-3 py-1 text-xs font-bold shadow-md">
                  <Sparkles size={14} />
                  <span>VIP / ویژه</span>
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`relative h-16 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIdx === i ? 'border-emerald-600 scale-95 shadow-xs' : 'border-transparent opacity-60 hover:opacity-100'
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-tight">
                {lang === 'fa' && ad.title_fa ? ad.title_fa : ad.title}
              </h2>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight shrink-0">
                {displayPrice}
              </div>
            </div>

            {/* Persian translation subtitle if Swedish active, or vice versa */}
            {ad.title_fa && (
              <p className="text-sm font-medium text-stone-500 font-sans">
                {lang === 'fa' ? ad.title : ad.title_fa}
              </p>
            )}

            {/* Location & Metadata Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-stone-500">
              <div className="flex items-center gap-1 font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                <MapPin size={14} className="text-emerald-600" />
                <span>{ad.city}{ad.area ? ` (${ad.area})` : ''}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock size={13} />
                <span>{new Date(ad.created_at).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'sv-SE')}</span>
              </div>

              <div className="flex items-center gap-1">
                <Eye size={13} />
                <span>{ad.views_count || 1} {currentT.views}</span>
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className="border-t border-stone-100 pt-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              {lang === 'fa' ? 'توضیحات کامل آگهی' : 'Beskrivning'}
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-stone-700 whitespace-pre-line font-sans">
              {ad.description}
            </p>
          </div>

          {/* Contact Box with Instant Action Buttons */}
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-stone-50 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  {currentT.contactSeller}
                </span>
                <p className="text-base font-extrabold text-stone-900 mt-0.5">
                  {ad.contact_name}
                </p>
              </div>
              <ShieldCheck size={28} className="text-emerald-600" />
            </div>

            {/* Direct Contact Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ad.contact_phone && (
                <a
                  href={`tel:${ad.contact_phone}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 shadow-xs active:scale-95 transition-all text-center"
                >
                  <Phone size={15} />
                  <span>{currentT.call}</span>
                </a>
              )}

              {ad.contact_whatsapp && (
                <a
                  href={`https://wa.me/${ad.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs py-2.5 px-3 shadow-xs active:scale-95 transition-all text-center"
                >
                  <MessageSquare size={15} />
                  <span>{currentT.whatsapp}</span>
                </a>
              )}

              {ad.contact_telegram && (
                <a
                  href={ad.contact_telegram.startsWith('http') ? ad.contact_telegram : `https://t.me/${ad.contact_telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] hover:bg-[#1d87ba] text-white font-bold text-xs py-2.5 px-3 shadow-xs active:scale-95 transition-all text-center"
                >
                  <Send size={15} />
                  <span>{currentT.telegram}</span>
                </a>
              )}

              {ad.contact_email && (
                <a
                  href={`mailto:${ad.contact_email}?subject=Angående annons ${ad.reference_number}: ${ad.title}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs py-2.5 px-3 shadow-xs active:scale-95 transition-all text-center"
                >
                  <Mail size={15} />
                  <span>{currentT.email}</span>
                </a>
              )}
            </div>
          </div>

          {/* Safety Notice Box */}
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{currentT.safetyNoticeTitle}</p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                {currentT.safetyNoticeText}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
