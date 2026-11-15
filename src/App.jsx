import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  PlusCircle, 
  KeyRound, 
  Filter, 
  Grid, 
  SlidersHorizontal,
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
      
      {/* Top Navbar */}
      <Navbar
        lang={lang}
        setLang={setLang}
        onOpenPostAd={() => setPostAdOpen(true)}
        onOpenManageAd={() => setManageAdOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-stone-900 text-white px-4 py-3 shadow-2xl border border-stone-800 text-xs font-bold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-[#11141a] to-stone-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-emerald-600/20 to-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold text-emerald-300 shadow-sm backdrop-blur-md">
            <Sparkles size={14} className="text-amber-400" />
            <span>{currentT.heroBadge}</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            {currentT.heroHeading}
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            {currentT.heroSubheading}
          </p>

          {/* Search Box Card */}
          <div className="bg-white/95 rounded-2xl p-2 sm:p-2.5 shadow-2xl border border-stone-200/50 max-w-3xl mx-auto flex flex-col sm:flex-row gap-2 text-stone-900 backdrop-blur-md">
            
            {/* City Dropdown */}
            <div className="relative sm:w-44 shrink-0">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-11 rounded-xl bg-stone-100 pl-9 pr-3 text-xs font-bold text-stone-800 border-0 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder={currentT.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 rounded-xl bg-stone-50 pl-9 pr-4 text-xs font-medium text-stone-900 border-0 focus:ring-2 focus:ring-emerald-500 placeholder-stone-400"
              />
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => {}}
              className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Search size={14} />
              <span>{currentT.searchBtn}</span>
            </button>

          </div>

          {/* Quick Action Pills under search */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <button
              onClick={() => setSelectedCategory('bostad')}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 transition-colors"
            >
              🏠 {lang === 'fa' ? 'مسکن و خانه' : 'Bostad & Rum'}
            </button>
            <button
              onClick={() => setSelectedCategory('restaurang')}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 transition-colors"
            >
              🥘 {lang === 'fa' ? 'رستوران و غذای ایرانی' : 'Persisk mat & kebab'}
            </button>
            <button
              onClick={() => setSelectedCategory('tjanster')}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 transition-colors"
            >
              ⚖️ {lang === 'fa' ? 'مترجم رسمی و وکیل' : 'Tolk & juridik'}
            </button>
            <button
              onClick={() => setSelectedCategory('jobb')}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 transition-colors"
            >
              💼 {lang === 'fa' ? 'فرصت‌های شغلی' : 'Jobb & karriär'}
            </button>
          </div>

        </div>

      </section>

      {/* Category Pills Bar (Horizontal Scrollable) */}
      <section className="bg-white border-b border-stone-200/80 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(cat => {
              const IconComp = CATEGORY_ICONS[cat.icon] || Tag;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                    isSelected
                      ? 'bg-stone-900 text-white font-bold shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                  }`}
                >
                  <IconComp size={15} className={isSelected ? 'text-emerald-400' : 'text-stone-500'} />
                  <span>{lang === 'fa' ? cat.fa : cat.sv}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* VIP / Featured Section (if any) */}
        {featuredAds.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Sparkles size={16} />
                </div>
                <h2 className="text-base font-extrabold text-stone-900">
                  {currentT.featuredAds}
                </h2>
              </div>
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                {featuredAds.length} {lang === 'fa' ? 'آگهی ویژه' : 'utvalda'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-stone-900">
              {currentT.recentAds}
              <span className="ml-2 text-xs font-medium text-stone-500 font-normal">
                ({filteredAds.length} st)
              </span>
            </h2>

            {/* Clear filters if active */}
            {(selectedCategory !== 'all' || selectedCity !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedCity('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <RefreshCw size={12} />
                <span>{lang === 'fa' ? 'پاک کردن فیلترها' : 'Rensa filter'}</span>
              </button>
            )}
          </div>

          {loading ? (
            /* Loading skeletons */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-stone-200/70 animate-pulse" />
              ))}
            </div>
          ) : filteredAds.length === 0 ? (
            /* Empty State */
            <div className="rounded-3xl border-2 border-dashed border-stone-200 bg-white p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                <Search size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-800">
                  {currentT.noAdsFound}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === 'fa' 
                    ? 'اولین نفری باشید که در این دسته آگهی ثبت می‌کند!' 
                    : 'Bli den första att lägga upp en annons i denna kategori!'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPostAdOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
              >
                <PlusCircle size={15} />
                <span>{currentT.postAdBtn}</span>
              </button>
            </div>
          ) : (
            /* Ads Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
        onSelectCity={(cityId) => {
          setSelectedCity(cityId);
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
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
            showToast(lang === 'fa' ? `آگهی ${newAd.reference_number} ثبت شد!` : `Annons ${newAd.reference_number} har publicerats!`);
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
            showToast(lang === 'fa' ? 'آگهی با موفقیت حذف شد.' : 'Annonsen har raderats.');
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
