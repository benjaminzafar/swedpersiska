import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  PlusCircle, 
  CheckCircle2, 
  RefreshCw,
  X,
  ChevronDown
} from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import CountryBanner from './components/CountryBanner';
import AdCard from './components/AdCard';
import AdDetailModal from './components/AdDetailModal';
import PostAdModal from './components/PostAdModal';
import ManageAdModal from './components/ManageAdModal';
import AdminPanel from './components/AdminPanel';
import { supabase } from './lib/supabase';
import { COUNTRIES, CATEGORIES, t } from './lib/translations';



export default function App() {
  const lang = 'fa'; // Complete Persian Language
  const currentT = t.fa;

  // Ads state
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Country & URL synchronization (Address bar: /?c=se, /?c=no, etc.)
  const [selectedCountry, setSelectedCountry] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlC = (params.get('c') || params.get('country') || '').toLowerCase();
      if (['se', 'no', 'dk', 'fi'].includes(urlC)) {
        return urlC;
      }
    } catch {}
    const saved = localStorage.getItem('scandi_country_selected');
    if (['se', 'no', 'dk', 'fi'].includes(saved)) {
      return saved;
    }
    return 'se';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  const handleCountryChange = (c) => {
    const valid = ['se', 'no', 'dk', 'fi'].includes(c) ? c : 'se';
    setSelectedCountry(valid);
    setSelectedCity('all');
    localStorage.setItem('scandi_country_selected', valid);
    // Update address bar with country code
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('c', valid);
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  // Sync address bar on mount
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (!url.searchParams.get('c')) {
        url.searchParams.set('c', selectedCountry);
        window.history.replaceState({}, '', url.toString());
      }
    } catch {}
  }, [selectedCountry]);

  // Modals
  const [countryModalOpen, setCountryModalOpen] = useState(() => {
    return !localStorage.getItem('scandi_country_popup_seen');
  });
  const [activeAdDetail, setActiveAdDetail] = useState(null);
  const [postAdOpen, setPostAdOpen] = useState(false);
  const [postAdCategory, setPostAdCategory] = useState('bostad');
  const [manageAdOpen, setManageAdOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [siteName, setSiteName] = useState('سوئد پرشیا');
  const [logoUrl, setLogoUrl] = useState('');

  // Fetch Site Branding & Settings
  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('swedpersiska_settings').select('*');
      if (data) {
        const branding = data.find(item => item.key === 'site_branding')?.value;
        if (branding) {
          if (branding.siteName) setSiteName(branding.siteName);
          if (branding.logoUrl) setLogoUrl(branding.logoUrl);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Dynamic Country SEO Document Title
  useEffect(() => {
    const titles = {
      se: 'نیازمندی‌ها، مسکن و خدمات فارسی‌زبانان در سوئد | سوئد پرشیا',
      no: 'نیازمندی‌ها، مسکن و مشاغل فارسی‌زبانان در نروژ | سوئد پرشیا',
      dk: 'نیازمندی‌ها، مسکن و خدمات فارسی‌زبانان در دانمارک | سوئد پرشیا',
      fi: 'نیازمندی‌ها، مسکن و مشاغل فارسی‌زبانان در فنلاند | سوئد پرشیا'
    };
    document.title = titles[selectedCountry] || titles.se;
  }, [selectedCountry]);

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
  const availableCities = currentCountryObj.cities;

  // Dynamic Hero Architectural Cityscape Backgrounds
  const HERO_BACKGROUNDS = {
    se: {
      image: '/images/cities/stockholm.jpg',
      cityFa: 'استکهلم، سوئد',
      cityEn: 'Stockholm, Sweden'
    },
    no: {
      image: '/images/cities/oslo.jpg',
      cityFa: 'اسلو، نروژ',
      cityEn: 'Oslo, Norway'
    },
    dk: {
      image: '/images/cities/copenhagen.jpg',
      cityFa: 'کپنهاگ، دانمارک',
      cityEn: 'Copenhagen, Denmark'
    },
    fi: {
      image: '/images/cities/helsinki.jpg',
      cityFa: 'هلسینکی، فنلاند',
      cityEn: 'Helsinki, Finland'
    }
  };

  const activeHero = HERO_BACKGROUNDS[selectedCountry] || HERO_BACKGROUNDS.se;

  // Dynamic Hero Titles based on selected country
  let heroHeading = 'مسکن، رستوران‌ها و خدمات فارسی‌زبانان در سوئد';
  let heroSubheading = 'جامع‌ترین پرتال نیازمندی‌های فارسی‌زبانان در استکهلم، یوتبوری، مالمو و سراسر سوئد.';

  if (selectedCountry === 'no') {
    heroHeading = 'مسکن، رستوران‌ها و مشاغل فارسی‌زبانان در نروژ';
    heroSubheading = 'جامع‌ترین پرتال نیازمندی‌های فارسی‌زبانان در اسلو، برگن، تروندهایم و سراسر نروژ.';
  } else if (selectedCountry === 'dk') {
    heroHeading = 'مسکن، رستوران‌ها و خدمات فارسی‌زبانان در دانمارک';
    heroSubheading = 'جامع‌ترین پرتال نیازمندی‌های فارسی‌زبانان در کپنهاگ، آرهوس، اودنسه و سراسر دانمارک.';
  } else if (selectedCountry === 'fi') {
    heroHeading = 'مسکن، رستوران‌ها و مشاغل فارسی‌زبانان در فنلاند';
    heroSubheading = 'جامع‌ترین بازارچه و پرتال نیازمندی‌های فارسی‌زبانان در هلسینکی، اسپو، تامپره و سراسر فنلاند.';
  }

  // Filter ads
  const filteredAds = ads.filter(ad => {
    const matchCountry = ad.country === selectedCountry || (!ad.country && selectedCountry === 'se');
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
    <div className={`min-h-screen flex flex-col bg-[#f8fafc] text-stone-900 overflow-x-hidden w-full max-w-full pb-16 md:pb-0 ${lang === 'fa' ? 'font-vazir' : ''}`}>
      
      {/* Geolocation Scandinavian Detection Pop-Up Modal */}
      <CountryBanner
        isOpen={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        selectedCountry={selectedCountry}
        onSelectCountry={handleCountryChange}
      />

      {/* Top Navbar */}
      <Navbar
        siteName={siteName}
        logoUrl={logoUrl}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        availableCities={availableCities}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCountryModal={() => setCountryModalOpen(true)}
        onOpenPostAd={(catId) => {
          setPostAdCategory(catId || 'bostad');
          setPostAdOpen(true);
        }}
        onOpenManageAd={() => setManageAdOpen(true)}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Spacer for Fixed Top Navbar */}
      <div className="h-16 md:h-16 shrink-0" aria-hidden="true" />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 end-5 z-50 flex items-center gap-2 rounded-xl bg-stone-900 text-white px-3.5 py-2.5 shadow-lg border border-stone-800 text-xs font-medium animate-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Section - Displayed only on Home (selectedCategory === 'all') */}
      {selectedCategory === 'all' && (
        <section className="relative overflow-hidden bg-[#07090e] border-b border-slate-800/80 pt-6 sm:pt-14 pb-7 sm:pb-16 px-4 sm:px-6 lg:px-8 w-full animate-in fade-in duration-200">
          
          {/* Dynamic Darkened Architectural Cityscape Backdrop - NO white smudges */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
            <img
              key={activeHero.image}
              src={activeHero.image}
              alt={activeHero.cityFa}
              className="w-full h-full object-cover object-center opacity-25 filter brightness-75 contrast-125 transition-all duration-700 ease-out"
            />
            {/* Deep Dark Vignette - 100% black/dark for maximum crisp readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#07090e]/80 via-transparent to-[#07090e]" />
            <div className="absolute inset-0 bg-radial from-transparent via-[#07090e]/40 to-[#07090e]/90" />
          </div>

          {/* Discreet City Landmark Badge (Corner credit on Desktop) */}
          <div className="hidden sm:inline-flex absolute bottom-4 end-5 z-10 items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white/90 text-[11px] font-medium border border-slate-700/80 shadow-sm">
            <MapPin size={11} className="text-blue-400 shrink-0" />
            <span>{activeHero.cityFa}</span>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-2.5 sm:space-y-3.5">
            
            {/* Nordic Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 backdrop-blur-md text-blue-400 text-[10.5px] sm:text-[11px] font-bold border border-blue-500/20 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>پرتال نیازمندی‌های فارسی‌زبانان در سراسر اسکاندیناوی</span>
            </div>

            <h1 className="text-xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-snug sm:leading-tight px-1 break-words">
              {heroHeading}
            </h1>

            <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed px-2 font-normal">
              {heroSubheading}
            </p>

            {/* Meta Floating Search Capsule (Desktop Only) */}
            <div className="pt-2 px-1 hidden md:block">
              <div className="bg-white/95 backdrop-blur-md rounded-full p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] border border-white/20 max-w-2xl mx-auto flex flex-row gap-1.5 transition-all">
                
                {/* City Dropdown */}
                <div className="relative w-48 shrink-0">
                  <MapPin size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full h-11 rounded-full bg-slate-50 hover:bg-slate-100 ps-8 pe-8 text-xs font-semibold text-slate-800 border-0 focus:ring-1 focus:ring-slate-300 cursor-pointer appearance-none text-right"
                  >
                    {availableCities.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fa}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Keyword Input */}
                <div className="relative flex-1">
                  <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder={currentT.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 rounded-full bg-transparent border-0 ps-8 pe-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none text-right"
                  />
                </div>

                {/* CTA Button (Meta Blue) */}
                <button
                  type="button"
                  className="h-11 px-6 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <Search size={14} />
                  <span>{currentT.searchBtn}</span>
                </button>

              </div>
            </div>

          </div>
        </section>
      )}

      {/* Horizontal Sticky Category Strip - Exactly matching user screenshot */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-2 sm:py-2.5 px-3 sm:px-6 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-950'
                }`}
              >
                {cat.fa}
              </button>
            );
          })}
        </div>
      </div>

      

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
        
        {/* VIP / Featured Section */}
        {featuredAds.length > 0 && (
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {currentT.featuredAds}
              </h2>
              <span className="text-[11px] sm:text-xs font-medium text-slate-500">
                {featuredAds.length} {lang === 'fa' ? 'آگهی' : 'annonser'}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
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
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {currentT.recentAds}
              </h2>
              {selectedCategory !== 'all' && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                  <span>{CATEGORIES.find(c => c.id === selectedCategory)?.fa}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="hover:text-blue-900 p-0.5 cursor-pointer"
                    title="حذف فیلتر دسته"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
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
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>{lang === 'fa' ? 'پاک کردن فیلترها' : 'Rensa filter'}</span>
              </button>
            )}
          </div>

          {loading ? (
            /* Loading skeletons */
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-56 sm:h-64 rounded-xl sm:rounded-2xl bg-stone-200/60 animate-pulse" />
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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
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
        siteName={siteName}
        logoUrl={logoUrl}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCity={(cityId) => {
          setSelectedCity(cityId);
          window.scrollTo({ top: 380, behavior: 'smooth' });
        }}
        onOpenPostAd={() => {
          setPostAdCategory('bostad');
          setPostAdOpen(true);
        }}
        onOpenManageAd={() => setManageAdOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Mobile Sticky Bottom Menu for Collections & Quick Actions */}
      <MobileBottomNav
        selectedCategory={selectedCategory}
        selectedCountry={selectedCountry}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        onOpenCountryModal={() => setCountryModalOpen(true)}
        onOpenPostAd={() => {
          setPostAdCategory('bostad');
          setPostAdOpen(true);
        }}
        onOpenManageAd={() => setManageAdOpen(true)}
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
          onRefreshAds={() => {
            fetchAds();
            fetchSettings();
          }}
        />
      )}

    </div>
  );
}
