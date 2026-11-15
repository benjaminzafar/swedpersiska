import React from 'react';
import { MapPin, Eye, Clock } from 'lucide-react';
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
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] hover:border-slate-300 transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.99]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={ad.title}
          className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          loading="lazy"
        />

        {/* Featured pill (Clean Meta style, no screaming yellow) */}
        {ad.is_featured && (
          <div className="absolute top-2.5 start-2.5 rounded-full bg-slate-900/85 text-white border border-white/20 px-2.5 py-0.5 text-[10.5px] font-semibold backdrop-blur-xs shadow-2xs">
            {lang === 'fa' ? 'برگزیده' : 'Utvald'}
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute top-2.5 end-2.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-700 shadow-2xs border border-slate-200/70 backdrop-blur-xs">
          {catName}
        </div>

        {/* City Pill */}
        <div className="absolute bottom-2.5 start-2.5 flex items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-200 backdrop-blur-xs">
          <MapPin size={11} className="text-blue-400 shrink-0" />
          <span>{ad.city}{ad.area ? ` • ${ad.area}` : ''}</span>
        </div>
      </div>

      {/* Body details */}
      <div className="flex flex-1 flex-col p-4 justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-extrabold text-slate-950 tabular-nums tracking-tight">
              <bdi>{displayPrice}</bdi>
            </span>
            <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
              <bdi>{ad.reference_number}</bdi>
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[14px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {lang === 'fa' && ad.title_fa ? ad.title_fa : ad.title}
          </h3>

          {/* Description */}
          <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">
            {ad.description}
          </p>
        </div>

        {/* Footer info */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
          <div className="flex items-center gap-1 font-medium">
            <Clock size={11} />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-1 font-medium">
            <Eye size={11} />
            <span>{ad.views_count || 1} {lang === 'fa' ? 'بازدید' : 'visningar'}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
