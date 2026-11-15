import React from 'react';
import { MapPin, Eye, Clock, CheckCircle, Sparkles, Tag } from 'lucide-react';
import { CATEGORIES } from '../lib/translations';

export default function AdCard({ ad, lang, onSelect }) {
  const catObj = CATEGORIES.find(c => c.id === ad.category);
  const catName = catObj ? (lang === 'fa' ? catObj.fa : catObj.sv) : ad.category;
  
  // Format price
  const displayPrice = ad.price 
    ? `${Number(ad.price).toLocaleString('sv-SE')} ${ad.price_type || 'kr'}`
    : (ad.price_type || (lang === 'fa' ? 'توافقی' : 'Enligt ök'));

  const coverImage = (ad.images && ad.images.length > 0 && ad.images[0])
    ? ad.images[0]
    : 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80';

  const dateStr = new Date(ad.created_at).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'sv-SE', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <article
      onClick={() => onSelect(ad)}
      className="group relative flex flex-col bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-emerald-500/50 transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.99]"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
        <img
          src={coverImage}
          alt={ad.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Featured VIP badge */}
        {ad.is_featured && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10.5px] font-bold text-white shadow-xs backdrop-blur-xs">
            <Sparkles size={12} className="animate-pulse" />
            <span>VIP / ویژه</span>
          </div>
        )}

        {/* City Pill */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
          <MapPin size={11} className="text-emerald-400" />
          <span>{ad.city}{ad.area ? ` • ${ad.area}` : ''}</span>
        </div>

        {/* Category Pill */}
        <div className="absolute top-2.5 right-2.5 rounded-lg bg-white/90 px-2 py-0.5 text-[11px] font-bold text-stone-800 shadow-2xs backdrop-blur-xs">
          {catName}
        </div>
      </div>

      {/* Body details */}
      <div className="flex flex-1 flex-col p-4 justify-between">
        <div>
          {/* Price */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[16px] font-extrabold text-emerald-700 tracking-tight">
              {displayPrice}
            </span>
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">
              {ad.reference_number}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[14px] font-bold text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
            {lang === 'fa' && ad.title_fa ? ad.title_fa : ad.title}
          </h3>

          {/* Short description preview */}
          <p className="mt-1.5 text-[12px] text-stone-500 line-clamp-2 leading-relaxed">
            {ad.description}
          </p>
        </div>

        {/* Footer info: views, date, contact preview */}
        <div className="mt-4 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-1 text-stone-500">
            <Eye size={12} />
            <span>{ad.views_count || 1} {lang === 'fa' ? 'بازدید' : 'visningar'}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
