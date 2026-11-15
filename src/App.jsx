import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  PlusCircle, 
  Home,
  Utensils,
  Briefcase,
  GraduationCap,
  ShoppingBag,
  Car,
  Calendar,
  Tag,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdCard from './components/AdCard';
import AdDetailModal from './components/AdDetailModal';
import PostAdModal from './components/PostAdModal';
import ManageAdModal from './components/ManageAdModal';
import AdminPanel from './components/AdminPanel';
import { supabase } from './lib/supabase';
import { CITIES, CATEGORIES, t } from './lib/translations';

// Icon mapper for categories
const CATEGORY_ICONS = {
  Sparkles: Sparkles,
  Home: Home,
  Utensils: Utensils,
  Briefcase: Briefcase,
  GraduationCap: GraduationCap,
  ShoppingBag: ShoppingBag,
  Car: Car,
  Calendar: Calendar,
  Tag: Tag,
};

export default function App() {
  const [lang, setLang] = useState('sv'); // 'sv' | 'fa'
  const currentT = t[lang];

  // Ads state
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  // Modals
  const [activeAdDetail, setActiveAdDetail] = useState(null);
  const [postAdOpen, setPostAdOpen] = useState(false);
  const [manageAdOpen, setManageAdOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // Success Toast
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Auto-detect ?admin=1 in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1' || params.get('admin') === 'true') {
      setAdminOpen(true);
    }
  }, []);

  // Sync dir attribute on body for Persian RTL / Swedish LTR
  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Fetch ads from Supabase
  const fetchAds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('swedpersiska_ads')
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (err) {
      console.error('Error fetching ads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // When clicking an ad, increment view count in background and open modal
  const handleSelectAd = (ad) => {
    setActiveAdDetail(ad);
    supabase
      .from('swedpersiska_ads')
      .update({ views_count: (ad.views_count || 0) + 1 })
      .eq('id', ad.id)
      .then(() => {
        // Updated in background
      });
  };

  // Filter ads
  const filteredAds = ads.filter(ad => {
    const matchCat = selectedCategory === 'all' || ad.category === selectedCategory;
    const matchCity = selectedCity === 'all' || ad.city === selectedCity;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      ad.title.toLowerCase().includes(q) ||
      (ad.title_fa && ad.title_fa.toLowerCase().includes(q)) ||
      ad.description.toLowerCase().includes(q) ||
      ad.city.toLowerCase().includes(q) ||
      (ad.area && ad.area.toLowerCase().includes(q)) ||
      ad.reference_number.toLowerCase().includes(q);

    return matchCat && matchCity && matchSearch;
  });

  // Featured ads subset
  const featuredAds = filteredAds.filter(a => a.is_featured);

  return (
    <div className={`min-h-screen flex flex-col bg-[#f8fafc] text-stone-900 ${lang === 'fa' ? 'font-vazir' : ''}`}>
      
      {/* Top Navbar (Astryx Super Modern Nav, Clean customer experience) */}
      <Navbar
        lang={lang}
        setLang={setLang}
        onOpenPostAd={() => setPostAdOpen(true)}
        onOpenManageAd={() => setManageAdOpen(true)}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          window.scrollTo({ top: 380, behavior: 'smooth' });
        }}
      />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 end-5 z-50 flex items-center gap-2 rounded-xl bg-stone-900 text-white px-3.5 py-2.5 shadow-lg border border-stone-800 text-xs font-medium animate-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Section - Unslopped calm craft, no colorful blurry blobs */}
      <section className="relative bg-[#0f1217] text-white pt-12 pb-14 px-4 sm:px-6 lg:px-8 border-b border-stone-800/80">
        <div className="relative max-w-4xl mx-auto text-center space-y-5">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-800/80 border border-stone-700/70 px-3 py-0.5 text-xs font-medium text-stone-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{currentT.heroBadge}</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
            {currentT.heroHeading}
          </h1>

          <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto leading-relaxed">
            {currentT.heroSubheading}
          </p>

          {/* Search Box Card */}
          <div className="bg-white rounded-xl p-2 shadow-sm border border-stone-200/90 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 text-stone-900">
            
            {/* City Dropdown */}
            <div className="relative sm:w-40 shrink-0">
              <MapPin size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-10 rounded-lg bg-stone-100 ps-8 pe-3 text-xs font-semibold text-stone-800 border-0 focus:ring-1 focus:ring-stone-400 cursor-pointer"
              >
                {CITIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {lang === 'fa' ? c.fa : c.sv}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder={currentT.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-lg bg-stone-50 ps-8 pe-3 text-xs font-medium text-stone-900 border-0 focus:ring-1 focus:ring-stone-400 placeholder-stone-400"
              />
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => {}}
              className="h-10 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Search size={13} />
              <span>{currentT.searchBtn}</span>
            </button>

          </div>

          {/* Category Shortcut Pills - quiet clean tags, no emojis */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-xs">
            <button
              onClick={() => setSelectedCategory('bostad')}
              className="px-2.5 py-1 rounded-md bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700/60 transition-colors"
            >
              {lang === 'fa' ? 'مسکن و خانه' : 'Bostad & Rum'}
            </button>
            <button
              onClick={() => setSelectedCategory('restaurang')}
              className="px-2.5 py-1 rounded-md bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700/60 transition-colors"
            >
              {lang === 'fa' ? 'رستوران و غذای ایرانی' : 'Persisk mat & kebab'}
            </button>
            <button
              onClick={() => setSelectedCategory('tjanster')}
              className="px-2.5 py-1 rounded-md bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700/60 transition-colors"
            >
              {lang === 'fa' ? 'مترجم رسمی و وکیل' : 'Tolk & juridik'}
            </button>
            <button
              onClick={() => setSelectedCategory('jobb')}
              className="px-2.5 py-1 rounded-md bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700/60 transition-colors"
            >
              {lang === 'fa' ? 'فرصت‌های شغلی' : 'Jobb & karriär'}
            </button>
          </div>

        </div>

      </section>

      {/* Category Pills Bar (Horizontal Scrollable) */}
      <section className="bg-white border-b border-stone-200/70 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(cat => {
              const IconComp = CATEGORY_ICONS[cat.icon] || Tag;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 active:scale-95 ${
                    isSelected
                      ? 'bg-stone-900 text-white font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
                  }`}
                >
                  <IconComp size={14} className={isSelected ? 'text-emerald-400' : 'text-stone-400'} />
                  <span>{lang === 'fa' ? cat.fa : cat.sv}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* VIP / Featured Section (if any) */}
        {featuredAds.length > 0 && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  {currentT.featuredAds}
                </h2>
              </div>
              <span className="text-[11px] font-medium text-stone-500">
                {featuredAds.length} {lang === 'fa' ? 'آگهی ویژه' : 'utvalda'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {featuredAds.map(ad => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  lang={lang}
                  onSelect={handleSelectAd}
                />
              ))}
            </div>
          </section>
        )}

        {/* Regular Stream / All Ads */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                {currentT.recentAds}
              </h2>
              <span className="text-xs text-stone-400 font-mono">
                ({filteredAds.length})
              </span>
            </div>

            {/* Clear filters if active */}
            {(selectedCategory !== 'all' || selectedCity !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedCity('all');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
              >
                <RefreshCw size={11} />
                <span>{lang === 'fa' ? 'پاک کردن فیلترها' : 'Rensa filter'}</span>
              </button>
            )}
          </div>

          {loading ? (
            /* Loading skeletons */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-stone-200/60 animate-pulse" />
              ))}
            </div>
          ) : filteredAds.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-10 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                <Search size={20} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-stone-800">
                  {currentT.noAdsFound}
                </h3>
                <p className="text-xs text-stone-400">
                  {lang === 'fa' 
                    ? 'اولین نفری باشید که در این دسته آگهی ثبت می‌کند.' 
                    : 'Bli den första att lägga upp en annons i denna kategori.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPostAdOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all"
              >
                <PlusCircle size={14} />
                <span>{currentT.postAdBtn}</span>
              </button>
            </div>
          ) : (
            /* Ads Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredAds.map(ad => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  lang={lang}
                  onSelect={handleSelectAd}
                />
              ))}
            </div>
          )}

        </section>

      </main>

      {/* Community Footer */}
      <Footer
        lang={lang}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          window.scrollTo({ top: 380, behavior: 'smooth' });
        }}
        onSelectCity={(cityId) => {
          setSelectedCity(cityId);
          window.scrollTo({ top: 380, behavior: 'smooth' });
        }}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* MODAL 1: Ad Detail */}
      {activeAdDetail && (
        <AdDetailModal
          ad={activeAdDetail}
          lang={lang}
          onClose={() => setActiveAdDetail(null)}
        />
      )}

      {/* MODAL 2: Post Ad */}
      {postAdOpen && (
        <PostAdModal
          lang={lang}
          onClose={() => setPostAdOpen(false)}
          onCreated={(newAd) => {
            fetchAds();
            showToast(lang === 'fa' ? `آگهی ${newAd.reference_number} ثبت شد.` : `Annons ${newAd.reference_number} har publicerats.`);
          }}
        />
      )}

      {/* MODAL 3: Manage / Delete Ad with Ref & PIN */}
      {manageAdOpen && (
        <ManageAdModal
          lang={lang}
          onClose={() => setManageAdOpen(false)}
          onDeleted={(deletedId) => {
            setAds(ads.filter(a => a.id !== deletedId));
            showToast(lang === 'fa' ? 'آگهی حذف شد.' : 'Annonsen har raderats.');
          }}
          onUpdated={(updatedAd) => {
            setAds(ads.map(a => a.id === updatedAd.id ? updatedAd : a));
            showToast(lang === 'fa' ? 'آگهی بروزرسانی شد.' : 'Annonsen har uppdaterats.');
          }}
        />
      )}

      {/* MODAL 4: Admin Panel */}
      {adminOpen && (
        <AdminPanel
          onClose={() => setAdminOpen(false)}
          onRefreshAds={fetchAds}
        />
      )}

    </div>
  );
}
