import React from 'react';
import { MapPin, Eye, Clock, Sparkles } from 'lucide-react';
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
      className="group relative flex flex-col bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-sm hover:border-stone-400 transition-all duration-150 cursor-pointer overflow-hidden active:scale-[0.99]"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
        <img
          src={coverImage}
          alt={ad.title}
          className="h-full w-full object-cover group-hover:opacity-95 transition-opacity"
          loading="lazy"
        />

        {/* Featured VIP badge - calm craft, no pulse */}
        {ad.is_featured && (
          <div className="absolute top-2.5 start-2.5 flex items-center gap-1 rounded-md bg-stone-900/90 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-xs">
            <Sparkles size={11} className="text-amber-400" />
            <span>VIP</span>
          </div>
        )}

        {/* City Pill */}
        <div className="absolute bottom-2.5 start-2.5 flex items-center gap-1 rounded-md bg-stone-950/80 px-2 py-0.5 text-[11px] font-medium text-stone-200 backdrop-blur-xs">
          <MapPin size={11} className="text-emerald-400 shrink-0" />
          <span>{ad.city}{ad.area ? ` • ${ad.area}` : ''}</span>
        </div>

        {/* Category Pill */}
        <div className="absolute top-2.5 end-2.5 rounded-md bg-white/95 px-2 py-0.5 text-[10.5px] font-semibold text-stone-700 shadow-2xs border border-stone-200/60 backdrop-blur-xs">
          {catName}
        </div>
      </div>

      {/* Body details */}
      <div className="flex flex-1 flex-col p-4 justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Price & Ref */}
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-stone-950 tabular-nums">
              <bdi>{displayPrice}</bdi>
            </span>
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
              <bdi>{ad.reference_number}</bdi>
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[13.5px] font-semibold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
            {lang === 'fa' && ad.title_fa ? ad.title_fa : ad.title}
          </h3>

          {/* Short description preview */}
          <p className="text-[12px] text-stone-500 line-clamp-2 leading-relaxed">
            {ad.description}
          </p>
        </div>

        {/* Footer info: views, date */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 tabular-nums">
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={11} />
            <span>{ad.views_count || 1} {lang === 'fa' ? 'بازدید' : 'visningar'}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
