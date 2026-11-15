import React from 'react';
import { MapPin, Eye, Clock } from 'lucide-react';
import { CATEGORIES } from '../lib/translations';

// City Persian Display Mapping to avoid RTL ellipsis corruption (e.g. "...holm")
const CITY_FA_MAP = {
  'Stockholm': 'استکهلم',
  'Göteborg': 'گوتنبرگ',
  'Goteborg': 'گوتنبرگ',
  'Malmö': 'مالمو',
  'Malmo': 'مالمو',
  'Uppsala': 'اوپسالا',
  'Västerås': 'وستروس',
  'Örebro': 'اوربرو',
  'Linköping': 'لینشوپینگ',
  'Helsingborg': 'هلسینگبوری',
  'Jönköping': 'یونشوپینگ',
  'Oslo': 'اسلو',
  'Bergen': 'برگن',
  'Trondheim': 'تروندهایم',
  'Stavanger': 'استاوانگر',
  'København': 'کپنهاگ',
  'Copenhagen': 'کپنهاگ',
  'Aarhus': 'آرهوس',
  'Helsinki': 'هلسینکی',
  'Espoo': 'اسپو',
  'Tampere': 'تامپره'
};

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

  const cityDisplay = CITY_FA_MAP[ad.city] || ad.city;

  return (
    <article
      onClick={() => onSelect(ad)}
      className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.99]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={ad.title}
          className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          loading="lazy"
        />

        {/* Featured badge */}
        {ad.is_featured && (
          <div className="absolute top-1.5 start-1.5 sm:top-2 sm:start-2 rounded-md bg-blue-600 text-white px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold shadow-xs">
            {lang === 'fa' ? 'ویژه' : 'Utvald'}
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute top-1.5 end-1.5 sm:top-2 sm:end-2 rounded-md bg-white/95 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-slate-700 shadow-2xs border border-slate-200/80 backdrop-blur-xs">
          {catName}
        </div>

        {/* City Badge - Clean, compact, never corrupted by LTR/RTL ellipsis */}
        <div className="absolute bottom-1.5 start-1.5 sm:bottom-2 sm:start-2 flex items-center gap-1 rounded-md bg-slate-950/75 px-1.5 sm:px-2 py-0.5 text-[9.5px] sm:text-[10.5px] font-semibold text-white backdrop-blur-xs">
          <MapPin size={9} className="text-blue-400 shrink-0" />
          <span>{cityDisplay}</span>
        </div>
      </div>

      {/* Body details */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3.5 justify-between space-y-1.5 sm:space-y-2">
        <div className="space-y-1">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-[13px] sm:text-[16px] font-black text-slate-950 tabular-nums tracking-tight">
              <bdi>{displayPrice}</bdi>
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[11.5px] sm:text-[13.5px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug min-h-[32px] sm:min-h-[38px]">
            {lang === 'fa' && ad.title_fa ? ad.title_fa : ad.title}
          </h3>

          {/* Description - Hidden on mobile 2x2 to keep cards ultra-clean and uniform */}
          <p className="hidden sm:block text-[11.5px] text-slate-500 line-clamp-2 leading-relaxed">
            {ad.description}
          </p>
        </div>

        {/* Footer info: Location + Date + Views */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9.5px] sm:text-[11px] text-slate-400 tabular-nums font-medium">
          <div className="flex items-center gap-1">
            <Clock size={10} className="shrink-0" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={10} className="shrink-0" />
            <span>{ad.views_count || 1}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
