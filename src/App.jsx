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
import CountryBanner from './components/CountryBanner';
import AdCard from './components/AdCard';
import AdDetailModal from './components/AdDetailModal';
import PostAdModal from './components/PostAdModal';
import ManageAdModal from './components/ManageAdModal';
import AdminPanel from './components/AdminPanel';
import { supabase } from './lib/supabase';
import { COUNTRIES, CATEGORIES, t } from './lib/translations';

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
  const lang = 'fa'; // Complete Persian Language
  const currentT = t.fa;

  // Ads state
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return localStorage.getItem('scandi_country_selected') || 'se';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  const handleCountryChange = (c) => {
    setSelectedCountry(c);
    setSelectedCity('all');
    localStorage.setItem('scandi_country_selected', c);
  };

  // Modals
  const [activeAdDetail, setActiveAdDetail] = useState(null);
  const [postAdOpen, setPostAdOpen] = useState(false);
  const [postAdCategory, setPostAdCategory] = useState('bostad');
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

  // Strict Persian RTL
  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'fa';
  }, []);

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

  // Active country details
  const currentCountryObj = COUNTRIES.find(c => c.id === selectedCountry) || COUNTRIES[0];

  // Dynamic available cities for current country
  const availableCities = selectedCountry === 'all'
    ? [
        { id: 'all', fa: 'تمام شهرهای اسکاندیناوی' },
        ...COUNTRIES.flatMap(c => c.cities.filter(city => city.id !== 'all').map(city => ({
          id: city.id,
          fa: `${city.fa} (${c.flag})`
        })))
      ]
    : currentCountryObj.cities;

  // Dynamic Hero Titles based on selected country
  let heroHeading = 'مسکن، رستوران‌ها و خدمات ایرانی در سوئد 🇸🇪';
  let heroSubheading = 'جامع‌ترین پرتال نیازمندی‌های ایرانیان در استکهلم، یوتبوری، مالمو و سراسر سوئد.';

  if (selectedCountry === 'all') {
    heroHeading = 'مسکن، رستوران‌ها و خدمات ایرانی در سراسر اسکاندیناوی';
    heroSubheading = 'جامع‌ترین بازارچه آنلاین ایرانیان مقیم سوئد 🇸🇪، نروژ 🇳🇴، دانمارک 🇩🇰 و فنلاند 🇫🇮. ثبت رایگان آگهی با کد پیگیری اختصاصی.';
  } else if (selectedCountry === 'no') {
    heroHeading = 'مسکن، رستوران‌ها و مشاغل ایرانی در نروژ 🇳🇴';
    heroSubheading = 'جامع‌ترین پرتال نیازمندی‌های ایرانیان در اسلو، برگن، تروندهایم و سراسر نروژ.';
  } else if (selectedCountry === 'dk') {
    heroHeading = 'مسکن، رستوران‌ها و خدمات ایرانی در دانمارک 🇩🇰';
    heroSubheading = 'جامع‌ترین پرتال فارسی‌زبانان در کپنهاگ، آرهوس، اودنسه و سراسر دانمارک.';
  } else if (selectedCountry === 'fi') {
    heroHeading = 'مسکن، رستوران‌ها و مشاغل ایرانی در فنلاند 🇫🇮';
    heroSubheading = 'جامع‌ترین بازارچه و پرتال نیازمندی‌های ایرانیان در هلسینکی، اسپو، تامپره و سراسر فنلاند.';
  }

  // Filter ads
  const filteredAds = ads.filter(ad => {
    const matchCountry = selectedCountry === 'all' || ad.country === selectedCountry || (!ad.country && selectedCountry === 'se');
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

    return matchCountry && matchCat && matchCity && matchSearch;
  });

  // Featured ads subset
  const featuredAds = filteredAds.filter(a => a.is_featured);

  return (
    <div className={`min-h-screen flex flex-col bg-[#f8fafc] text-stone-900 ${lang === 'fa' ? 'font-vazir' : ''}`}>
      
      {/* Geolocation Scandinavian Detection Banner */}
      <CountryBanner
        selectedCountry={selectedCountry}
        onSelectCountry={handleCountryChange}
      />

      {/* Top Navbar (100% Persian, Meta Style with Dropdown Menus & Country Switcher) */}
      <Navbar
        selectedCountry={selectedCountry}
        onSelectCountry={handleCountryChange}
        onOpenPostAd={(catId) => {
          setPostAdCategory(catId || 'bostad');
          setPostAdOpen(true);
        }}
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

      {/* Hero Section - Meta.com clean light canvas & typography */}
      <section className="bg-white border-b border-slate-200/70 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            {heroHeading}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            {heroSubheading}
          </p>

          {/* Meta Floating Search Capsule */}
          <div className="pt-2">
            <div className="bg-white rounded-full p-1.5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-slate-200/90 hover:border-slate-300 max-w-2xl mx-auto flex flex-col sm:flex-row gap-1.5 transition-all">
              
              {/* City Dropdown */}
              <div className="relative sm:w-48 shrink-0">
                <MapPin size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full h-11 rounded-full bg-slate-50 hover:bg-slate-100 ps-9 pe-4 text-xs font-semibold text-slate-800 border-0 focus:ring-1 focus:ring-slate-300 cursor-pointer"
                >
                  {availableCities.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fa}
                    </option>
                  ))}
                </select>
              </div>

              {/* Keyword Input */}
              <div className="relative flex-1">
                <Search size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={currentT.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 rounded-full bg-transparent ps-9 pe-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* CTA Button (Meta Blue) */}
              <button
                type="button"
                className="h-11 px-6 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Search size={14} />
                <span>{currentT.searchBtn}</span>
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* Category Pills Bar (Meta.com Rounded-full Pills) */}
      <section className="bg-white/95 backdrop-blur-md border-b border-slate-200/70 sticky top-16 z-30">
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <IconComp size={14} className={isSelected ? 'text-blue-400' : 'text-slate-500'} />
                  <span>{lang === 'fa' ? cat.fa : cat.sv}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* VIP / Featured Section */}
        {featuredAds.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {currentT.featuredAds}
              </h2>
              <span className="text-xs font-medium text-slate-500">
                {featuredAds.length} {lang === 'fa' ? 'آگهی' : 'annonser'}
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
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {currentT.recentAds}
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
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} />
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
          initialCategory={postAdCategory}
          selectedCountry={selectedCountry}
          onClose={() => setPostAdOpen(false)}
          onCreated={(newAd) => {
            fetchAds();
            showToast(`آگهی با کد مرجع ${newAd.reference_number} با موفقیت ثبت شد.`);
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
