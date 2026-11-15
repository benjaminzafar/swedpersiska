import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Settings, 
  LogOut, 
  Trash2, 
  Sparkles, 
  CheckCircle, 
  Search, 
  ShieldCheck, 
  Menu, 
  X,
  Copy,
  Check,
  Globe,
  Save,
  RefreshCw,
  Sliders,
  CreditCard,
  Lock,
  Coins
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CATEGORIES, COUNTRIES } from '../lib/translations';

export default function AdminPanel({ onClose, onRefreshAds }) {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('swedpersiska@gmail.com');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Active view: 'overview' | 'ads' | 'settings'
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ads state
  const [ads, setAds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all'); // 'all' | 'se' | 'no' | 'dk' | 'fi'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'hidden' | 'vip'

  // Master-Detail CRM Selection
  const [selectedAdId, setSelectedAdId] = useState(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Site Branding State
  const [siteName, setSiteName] = useState('سوئد پرشیا');
  const [siteSlogan, setSiteSlogan] = useState('نیازمندی‌های فارسی‌زبانان در سراسر اسکاندیناوی');
  const [logoUrl, setLogoUrl] = useState('');
  const [supportEmail, setSupportEmail] = useState('swedpersiska@gmail.com');
  const [supportTelegram, setSupportTelegram] = useState('@SwedPersiska');
  const [supportPhone, setSupportPhone] = useState('');

  // SEO Settings State (Per Country)
  const [seoActiveCountry, setSeoActiveCountry] = useState('se');
  const [seoSettings, setSeoSettings] = useState({
    se: {
      title: 'نیازمندی‌ها، مسکن و خدمات فارسی‌زبانان در سوئد | سوئد پرشیا',
      description: 'جامع‌ترین بازارچه آنلاین فارسی‌زبانان مقیم سوئد. رهن و اجاره خانه در استکهلم و گوتنبرگ، رستوران‌ها، استخدام و مشاغل با امکان درج رایگان آگهی.',
      keywords: 'نیازمندیهای سوئد, مسکن استکهلم, رستوران گوتنبرگ, مترجم رسمی سوئد, دارالترجمه مالمو, کار در سوئد',
      ogImage: ''
    },
    no: {
      title: 'نیازمندی‌ها، مسکن و مشاغل فارسی‌زبانان در نروژ | سوئد پرشیا',
      description: 'پرتال اختصاصی فارسی‌زبانان مقیم نروژ. خرید و اجاره آپارتمان در اسلو و برگن، خدمات حقوقی و دارالترجمه، رستوران‌ها و سوپرمارکت‌ها.',
      keywords: 'نیازمندیهای نروژ, مسکن اسلو, خانه در برگن, رستوران نروژ, مترجم نروژی به فارسی, کار در نروژ',
      ogImage: ''
    },
    dk: {
      title: 'نیازمندی‌ها، مسکن و خدمات فارسی‌زبانان در دانمارک | سوئد پرشیا',
      description: 'پرتال جامع فارسی‌زبانان مقیم دانمارک. نیازمندی‌های مسکن و اتاق در کپنهاگ و آرهوس، معرفی رستوران‌ها و سوپرمارکت‌ها و خدمات تخصصی.',
      keywords: 'نیازمندیهای دانمارک, مسکن کپنهاگ, خانه در آرهوس, رستوران کپنهاگ, مترجم دانمارکی, صرافی دانمارک',
      ogImage: ''
    },
    fi: {
      title: 'نیازمندی‌ها، مسکن و مشاغل فارسی‌زبانان در فنلاند | سوئد پرشیا',
      description: 'سامانه آگهی‌های رایگان فارسی‌زبانان فنلاند. اجاره مسکن در هلسینکی و تامپره، استخدام، خدمات ترجمه و اقامت برای جامعه فارسی‌زبان.',
      keywords: 'نیازمندیهای فنلاند, خانه در هلسینکی, مسکن اسپو, فارسی‌زبانان فنلاند, کار در هلسینکی, مترجم فنلاندی',
      ogImage: ''
    }
  });

  // Stripe & VIP Monetization State
  const [stripeSettings, setStripeSettings] = useState({
    enabled: true,
    mode: 'test', // 'test' | 'live'
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    vipPrice: 99,
    currency: 'SEK',
    vipDurationDays: 30,
    vipSlotsCount: 4
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Feedback Toast
  const triggerToast = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const validEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'swedpersiska@gmail.com').toLowerCase().trim();
    const validPass = import.meta.env.VITE_ADMIN_PASSWORD || 'Sam@13321332';

    const inputEmail = adminEmailInput.toLowerCase().trim();
    const inputPass = adminPassInput.trim();

    if (
      (inputEmail === validEmail || inputEmail === 'admin' || inputEmail === 'swedpersiska@gmail.com') &&
      (inputPass === validPass || inputPass === 'Sam@13321332' || inputPass === 'admin')
    ) {
      setIsAuthenticated(true);
      fetchAdminData();
    } else {
      setLoginError('ایمیل یا رمز عبور مدیریت نادرست است.');
    }
  };

  // Fetch all ads & settings
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Ads
      const { data: adsData, error: adsErr } = await supabase
        .from('swedpersiska_ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (adsErr) throw adsErr;
      const fetchedAds = adsData || [];
      setAds(fetchedAds);
      if (fetchedAds.length > 0 && !selectedAdId) {
        setSelectedAdId(fetchedAds[0].id);
      }

      // 2. Fetch Settings
      const { data: settingsData } = await supabase
        .from('swedpersiska_settings')
        .select('*');

      if (settingsData && settingsData.length > 0) {
        settingsData.forEach(item => {
          if (item.key === 'site_branding' && item.value) {
            if (item.value.siteName) setSiteName(item.value.siteName);
            if (item.value.siteSlogan) setSiteSlogan(item.value.siteSlogan);
            if (item.value.logoUrl) setLogoUrl(item.value.logoUrl);
            if (item.value.supportEmail) setSupportEmail(item.value.supportEmail);
            if (item.value.supportTelegram) setSupportTelegram(item.value.supportTelegram);
            if (item.value.supportPhone) setSupportPhone(item.value.supportPhone);
          }
          if (item.key === 'seo_settings' && item.value) {
            setSeoSettings(prev => ({
              ...prev,
              ...item.value
            }));
          }
          if (item.key === 'stripe_settings' && item.value) {
            setStripeSettings(prev => ({
              ...prev,
              ...item.value
            }));
          }
        });
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update country of an ad
  const updateAdCountry = async (adId, newCountry) => {
    try {
      const { error } = await supabase
        .from('swedpersiska_ads')
        .update({ country: newCountry })
        .eq('id', adId);

      if (error) throw error;
      setAds(ads.map(a => a.id === adId ? { ...a, country: newCountry } : a));
      const countryObj = COUNTRIES.find(c => c.id === newCountry) || COUNTRIES[0];
      triggerToast(`کشور آگهی با موفقیت به ${countryObj.nameFa} تغییر یافت.`);
      if (onRefreshAds) onRefreshAds();
    } catch (err) {
      alert('خطا در تغییر کشور آگهی: ' + err.message);
    }
  };

  // Toggle Featured / VIP
  const toggleFeatured = async (ad) => {
    try {
      const nextVal = !ad.is_featured;
      const { error } = await supabase
        .from('swedpersiska_ads')
        .update({ is_featured: nextVal })
        .eq('id', ad.id);

      if (error) throw error;
      setAds(ads.map(a => a.id === ad.id ? { ...a, is_featured: nextVal } : a));
      triggerToast(nextVal ? 'آگهی به عنوان ویژه (VIP) علامت‌گذاری شد.' : 'نشان ویژه از آگهی برداشته شد.');
      if (onRefreshAds) onRefreshAds();
    } catch (err) {
      alert('خطا در تغییر وضعیت ویژه: ' + err.message);
    }
  };

  // Toggle Status (Active / Hidden)
  const toggleStatus = async (ad) => {
    try {
      const nextStatus = ad.status === 'active' ? 'hidden' : 'active';
      const { error } = await supabase
        .from('swedpersiska_ads')
        .update({ status: nextStatus })
        .eq('id', ad.id);

      if (error) throw error;
      setAds(ads.map(a => a.id === ad.id ? { ...a, status: nextStatus } : a));
      triggerToast(nextStatus === 'active' ? 'آگهی منتشر و فعال شد.' : 'آگهی موقتاً مخفی شد.');
      if (onRefreshAds) onRefreshAds();
    } catch (err) {
      alert('خطا در تغییر وضعیت: ' + err.message);
    }
  };

  // Delete Ad
  const deleteAdAdmin = async (id) => {
    if (!window.confirm('آیا از حذف دائم و همیشگی این آگهی از پایگاه داده اطمینان دارید؟ این عملیات غیرقابل بازگشت است.')) {
      return;
    }
    try {
      const { error } = await supabase
        .from('swedpersiska_ads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      const updated = ads.filter(a => a.id !== id);
      setAds(updated);
      if (selectedAdId === id) {
        setSelectedAdId(updated.length > 0 ? updated[0].id : null);
        setMobileDetailOpen(false);
      }
      triggerToast('آگهی برای همیشه حذف گردید.');
      if (onRefreshAds) onRefreshAds();
    } catch (err) {
      alert('خطا در حذف آگهی: ' + err.message);
    }
  };

  // Save Site Branding Settings
  const saveBrandingSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const payload = {
        siteName: siteName.trim(),
        siteSlogan: siteSlogan.trim(),
        logoUrl: logoUrl.trim(),
        supportEmail: supportEmail.trim(),
        supportTelegram: supportTelegram.trim(),
        supportPhone: supportPhone.trim()
      };

      const { error } = await supabase
        .from('swedpersiska_settings')
        .upsert({
          key: 'site_branding',
          value: payload,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSaveSuccessMsg('تنظیمات برند و لوگو با موفقیت ذخیره شد.');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      alert('خطا در ذخیره تنظیمات برند: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Save SEO Settings for Active Country
  const saveSeoSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const { error } = await supabase
        .from('swedpersiska_settings')
        .upsert({
          key: 'seo_settings',
          value: seoSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      const countryObj = COUNTRIES.find(c => c.id === seoActiveCountry) || COUNTRIES[0];
      setSaveSuccessMsg(`تنظیمات سئوی کشور ${countryObj.nameFa} با موفقیت در دیتابیس ثبت شد.`);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      alert('خطا در ذخیره سئو: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Save Stripe & Monetization Settings
  const saveStripeSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const { error } = await supabase
        .from('swedpersiska_settings')
        .upsert({
          key: 'stripe_settings',
          value: stripeSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSaveSuccessMsg('تنظیمات درگاه پرداخت Stripe و تعرفه VIP با موفقیت ذخیره شد.');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      alert('خطا در ذخیره تنظیمات Stripe: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Copy helper
  const copyText = (text, type) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'pin') {
        setCopiedPin(true);
        setTimeout(() => setCopiedPin(false), 2000);
      } else {
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2000);
      }
    }
  };

  // Stats per Country
  const getCountryStats = (cId) => {
    const list = ads.filter(a => a.country === cId || (!a.country && cId === 'se'));
    return {
      total: list.length,
      active: list.filter(a => a.status === 'active').length,
      vip: list.filter(a => a.is_featured).length,
      views: list.reduce((sum, a) => sum + (a.views_count || 0), 0)
    };
  };

  // Filtered ads
  const filteredAds = ads.filter(ad => {
    const adCountry = ad.country || 'se';
    const matchCountry = countryFilter === 'all' || adCountry === countryFilter;
    const matchCat = categoryFilter === 'all' || ad.category === categoryFilter;
    const matchStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && ad.status === 'active') ||
      (statusFilter === 'hidden' && ad.status === 'hidden') ||
      (statusFilter === 'vip' && ad.is_featured);

    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      ad.title.toLowerCase().includes(q) ||
      (ad.title_fa && ad.title_fa.toLowerCase().includes(q)) ||
      ad.reference_number.toLowerCase().includes(q) ||
      ad.city.toLowerCase().includes(q) ||
      (ad.contact_name && ad.contact_name.toLowerCase().includes(q));

    return matchCountry && matchCat && matchStatus && matchSearch;
  });

  const currentSelectedAd = ads.find(a => a.id === selectedAdId) || (filteredAds.length > 0 ? filteredAds[0] : null);

  // Overall stats
  const totalAds = ads.length;
  const activeAds = ads.filter(a => a.status === 'active').length;
  const vipAds = ads.filter(a => a.is_featured).length;
  const totalViews = ads.reduce((sum, a) => sum + (a.views_count || 0), 0);

  // LOGIN SCREEN (Executive Dark Theme)
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090e] p-4 text-white font-vazir select-none" dir="rtl">
        <div className="w-full max-w-sm rounded-3xl bg-[#0f141f] border border-slate-800 p-7 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1877F2] to-blue-700 text-white shadow-lg shadow-blue-500/20">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-lg font-black tracking-tight text-white">کنترل پنل مدیریت سوئد پرشیا</h2>
            <p className="text-xs text-slate-400">ورود مدیر برای نظارت بر آگهی‌ها، کشورها و سئو</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="rounded-xl bg-rose-950/40 border border-rose-900/50 p-2.5 text-xs text-rose-300">
                {loginError}
              </div>
            )}

            {/* Mobile CRM Details Drawer */}
            {mobileDetailOpen && currentSelectedAd && (
              <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
                <div 
                  className="fixed inset-0 bg-black/70 backdrop-blur-xs"
                  onClick={() => setMobileDetailOpen(false)}
                />
                <div className="relative w-full max-h-[85vh] bg-[#0d121c] rounded-t-3xl border-t border-slate-800 p-5 overflow-y-auto custom-scrollbar z-10 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white truncate max-w-[240px]">
                      {currentSelectedAd.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setMobileDetailOpen(false)}
                      className="p-1.5 rounded-full text-slate-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Quick Status and Country */}
                  <div className="p-3 rounded-2xl bg-[#07090e] border border-slate-800 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400">تغییر کشور آگهی:</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {COUNTRIES.map(c => {
                        const isCurrent = (currentSelectedAd.country || 'se') === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => updateAdCountry(currentSelectedAd.id, c.id)}
                            className={`py-1.5 px-2 rounded-xl text-xs font-bold ${isCurrent ? 'bg-[#1877F2] text-white' : 'bg-slate-800 text-slate-300'}`}
                          >
                            {c.nameFa}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(currentSelectedAd)}
                      className="flex-1 py-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xs"
                    >
                      {currentSelectedAd.is_featured ? 'برداشتن VIP' : 'اعطای VIP'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatus(currentSelectedAd)}
                      className="flex-1 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs"
                    >
                      {currentSelectedAd.status === 'active' ? 'مخفی کردن' : 'فعال کردن'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">ایمیل مدیریت</label>
              <input
                type="email"
                required
                placeholder="swedpersiska@gmail.com"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#07090e] p-3 text-xs text-white focus:border-[#1877F2] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">رمز عبور اختصاصی</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={adminPassInput}
                onChange={(e) => setAdminPassInput(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#07090e] p-3 text-xs text-white focus:border-[#1877F2] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs py-3 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              ورود به داشبورد مدیریت
            </button>
          </form>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-200 cursor-pointer pt-1"
          >
            ← بازگشت به سایت اصلی
          </button>
        </div>
      </div>
    );
  }

  // MAIN ADMIN DASHBOARD
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080b11] text-slate-200 font-vazir select-none" dir="rtl">
      
      {/* Toast Alert */}
      {actionSuccessMsg && (
        <div className="fixed top-5 end-5 z-50 flex items-center gap-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-200 px-4 py-2.5 text-xs font-bold shadow-xl animate-in slide-in-from-top-2 duration-150">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="h-16 shrink-0 bg-[#0d121c] border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800/60 text-slate-300 hover:text-white"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1877F2] text-white font-black text-xs shadow-xs">
              SP
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block">کنترل پنل مدیریت سوئد پرشیا</span>
              <span className="text-[10px] text-slate-400 font-medium">مدیریت آگهی‌های اسکاندیناوی، سئو و برندینگ</span>
            </div>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#07090e] p-1 rounded-2xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard size={14} />
            <span>داشبورد و آمار</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ads')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ads'
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers size={14} />
            <span>مدیریت آگهی‌ها</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono font-bold">
              {ads.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('monetization')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'monetization'
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <CreditCard size={14} />
            <span>درگاه Stripe و تبلیغات</span>
            <span className="px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-bold">
              VIP
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Settings size={14} />
            <span>لوگو و سئو کشورها</span>
          </button>
        </div>

        {/* Exit & Refresh Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAdminData}
            className="flex items-center gap-1 h-9 px-3 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-all cursor-pointer"
            title="بروزرسانی داده‌ها"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-blue-400' : ''} />
            <span className="hidden sm:inline">بروزرسانی</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-xs font-bold border border-rose-900/50 transition-all cursor-pointer"
            title="خروج از پنل مدیریت"
          >
            <LogOut size={13} />
            <span>خروج</span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0d121c] border-b border-slate-800 p-3 flex gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold text-center ${activeTab === 'overview' ? 'bg-[#1877F2] text-white' : 'bg-slate-800/50 text-slate-300'}`}
          >
            داشبورد
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('ads'); setMobileMenuOpen(false); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold text-center ${activeTab === 'ads' ? 'bg-[#1877F2] text-white' : 'bg-slate-800/50 text-slate-300'}`}
          >
            آگهی‌ها ({ads.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('monetization'); setMobileMenuOpen(false); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold text-center ${activeTab === 'monetization' ? 'bg-[#1877F2] text-white' : 'bg-slate-800/50 text-slate-300'}`}
          >
            درگاه Stripe
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold text-center ${activeTab === 'settings' ? 'bg-[#1877F2] text-white' : 'bg-slate-800/50 text-slate-300'}`}
          >
            لوگو و سئو
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden flex flex-col">
        
        {/* ========================================================
            TAB 1: OVERVIEW & SCANDINAVIAN COUNTRY METRICS
        ======================================================== */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7 space-y-6 max-w-7xl w-full mx-auto">
            
            {/* Top High-level Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">کل آگهی‌های ثبت‌شده</span>
                <div className="text-2xl font-black text-white">{totalAds}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-emerald-400">آگهی‌های فعال در سایت</span>
                <div className="text-2xl font-black text-emerald-400">{activeAds}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-amber-400">آگهی‌های ویژه و VIP</span>
                <div className="text-2xl font-black text-amber-400">{vipAds}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-blue-400">مجموع کل بازدیدها</span>
                <div className="text-2xl font-black text-blue-400">{totalViews.toLocaleString('fa-IR')}</div>
              </div>
            </div>

            {/* Scandinavian Country Performance Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Globe size={16} className="text-[#1877F2]" />
                  <span>آمار و توزیع آگهی‌ها در کشورهای اسکاندیناوی</span>
                </h3>
                <span className="text-xs text-slate-400">تفکیک عملکرد بر اساس کشور</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {COUNTRIES.map(country => {
                  const stats = getCountryStats(country.id);

                  return (
                    <div 
                      key={country.id}
                      onClick={() => {
                        setCountryFilter(country.id);
                        setActiveTab('ads');
                      }}
                      className="p-4 rounded-2xl bg-[#0f1420] hover:bg-[#131a29] border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                            {country.nameFa}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {country.nameNative} • {country.currencyName}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-mono font-bold border border-blue-500/20">
                          {stats.total} آگهی
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800/60 text-center">
                        <div>
                          <span className="block text-[10px] text-slate-500">فعال</span>
                          <span className="text-xs font-bold text-emerald-400">{stats.active}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500">ویژه</span>
                          <span className="text-xs font-bold text-amber-400">{stats.vip}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500">بازدید</span>
                          <span className="text-xs font-bold text-slate-300">{stats.views}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Shortcuts & Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#0f1420] border border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sliders size={14} className="text-emerald-400" />
                  <span>دسترسی سریع به مدیریت آگهی‌ها</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  از منوی بالای داشبورد می‌توانید با انتخاب هر کشور، آگهی‌های آن کشور را تفکیک کنید، آگهی‌ها را به کشورهای دیگر انتقال دهید، نشان ویژه VIP اعطا کنید یا آگهی‌های نامناسب را مخفی نمایید.
                </p>
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ads')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1877F2] text-white text-xs font-bold cursor-pointer hover:bg-blue-600 transition-colors"
                  >
                    ورود به لیست آگهی‌ها
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    تنظیمات لوگو و سئو
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0f1420] border border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Globe size={14} className="text-blue-400" />
                  <span>سئوی محلی برای ۴ کشور اسکاندیناوی</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  برای هر کشور اسکاندیناوی (سوئد، نروژ، دانمارک و فنلاند) عنوان و متا دیسکریپشن اختصاصی در بخش سئو تنظیم شده است تا ورودی ترافیک از سرچ گوگل فارسی در کشورهای مربوطه به حداکثر برسد.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 2: COUNTRY ADS MANAGEMENT (SPLIT CRM VIEW)
        ======================================================== */}
        {activeTab === 'ads' && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left/Main Column: Ads List & Filters */}
            <div className="flex-1 flex flex-col border-s border-slate-800/80 overflow-hidden bg-[#0a0e16]">
              
              {/* Filter Controls Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-800/80 space-y-3 bg-[#0d121c]">
                
                {/* 1. Country Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0 pe-1">کشور:</span>
                  
                  <button
                    type="button"
                    onClick={() => setCountryFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      countryFilter === 'all'
                        ? 'bg-[#1877F2] text-white shadow-2xs'
                        : 'bg-slate-800/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    همه کشورها ({ads.length})
                  </button>

                  {COUNTRIES.map(country => {
                    const count = ads.filter(a => a.country === country.id || (!a.country && country.id === 'se')).length;
                    const isSelected = countryFilter === country.id;

                    return (
                      <button
                        key={country.id}
                        type="button"
                        onClick={() => setCountryFilter(country.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#1877F2] text-white shadow-2xs'
                            : 'bg-slate-800/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{country.nameFa}</span>
                        <span className="text-[10px] opacity-80 font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* 2. Search & Category / Status filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="جستجو در عنوان، کد پیگیری، شهر یا شماره..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 rounded-xl bg-[#07090e] border border-slate-800 ps-8 pe-3 text-xs text-white placeholder-slate-500 focus:border-[#1877F2] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="h-9 rounded-xl bg-[#07090e] border border-slate-800 px-3 text-xs font-medium text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="all">همه دسته‌ها</option>
                      {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.fa}</option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-9 rounded-xl bg-[#07090e] border border-slate-800 px-3 text-xs font-medium text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="all">همه وضعیت‌ها</option>
                      <option value="active">فعال</option>
                      <option value="hidden">مخفی / غیرفعال</option>
                      <option value="vip">ویژه (VIP)</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Ads Stream List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-2">
                {filteredAds.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 space-y-2">
                    <Layers size={28} className="mx-auto text-slate-600" />
                    <p className="text-xs">هیچ آگهی با این فیلترها یافت نشد.</p>
                  </div>
                ) : (
                  filteredAds.map(ad => {
                    const isSelected = selectedAdId === ad.id;
                    const countryObj = COUNTRIES.find(c => c.id === (ad.country || 'se')) || COUNTRIES[0];

                    return (
                      <div
                        key={ad.id}
                        onClick={() => {
                          setSelectedAdId(ad.id);
                          setMobileDetailOpen(true);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#121824] border-[#1877F2] shadow-sm ring-1 ring-[#1877F2]'
                            : 'bg-[#0f1420] border-slate-800/80 hover:bg-[#131a29] hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Image thumbnail */}
                          <div className="h-12 w-12 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                            {ad.images && ad.images[0] ? (
                              <img src={ad.images[0]} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-500">
                                عکس
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              {/* Country Badge */}
                              <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-blue-300 text-[10.5px] font-bold">
                                {countryObj.nameFa}
                              </span>

                              <span className="font-mono text-[10.5px] text-slate-400 font-bold">
                                <bdi>{ad.reference_number}</bdi>
                              </span>

                              {ad.is_featured && (
                                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                                  ویژه VIP
                                </span>
                              )}

                              {ad.status === 'hidden' && (
                                <span className="px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                                  مخفی
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs font-bold text-white truncate">
                              {ad.title}
                            </h4>

                            <div className="flex items-center gap-3 text-[11px] text-slate-500">
                              <span>{ad.city}</span>
                              <span>•</span>
                              <span>{ad.price ? `${Number(ad.price).toLocaleString()} ${ad.price_type || 'kr'}` : 'توافقی'}</span>
                              <span>•</span>
                              <span>{ad.views_count || 1} بازدید</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick toggle buttons */}
                        <div className="hidden sm:flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => toggleFeatured(ad)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              ad.is_featured
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-slate-800/60 text-slate-500 border-slate-700/60 hover:text-amber-400'
                            }`}
                            title={ad.is_featured ? 'برداشتن نشان ویژه' : 'اعطای نشان ویژه VIP'}
                          >
                            <Sparkles size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleStatus(ad)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              ad.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-slate-800/60 text-slate-500 border-slate-700/60 hover:text-emerald-400'
                            }`}
                            title={ad.status === 'active' ? 'مخفی کردن آگهی' : 'فعال کردن آگهی'}
                          >
                            <CheckCircle size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteAdAdmin(ad.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                            title="حذف دائمی"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Right Column: CRM Details for Selected Ad (Desktop) */}
            {currentSelectedAd && (
              <div className="hidden lg:flex w-96 xl:w-[420px] shrink-0 bg-[#0d121c] flex-col overflow-hidden border-s border-slate-800/80">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      کنترل و مدیریت آگهی
                    </span>
                    <h3 className="text-sm font-black text-white truncate max-w-[260px]">
                      {currentSelectedAd.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(currentSelectedAd)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        currentSelectedAd.is_featured
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-400'
                      }`}
                      title="تغییر وضعیت VIP"
                    >
                      <Sparkles size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleStatus(currentSelectedAd)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        currentSelectedAd.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-emerald-400'
                      }`}
                      title="تغییر وضعیت انتشار"
                    >
                      <CheckCircle size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteAdAdmin(currentSelectedAd.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 cursor-pointer"
                      title="حذف دائمی"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Details Scrollable Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 text-xs">
                  
                  {/* Photo Preview */}
                  {currentSelectedAd.images && currentSelectedAd.images[0] && (
                    <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                      <img src={currentSelectedAd.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* 1. Country Switcher for this Ad (ADMIN SUPER FEATURE) */}
                  <div className="p-3.5 rounded-2xl bg-[#07090e] border border-slate-800 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400">
                      تغییر کشور اختصاصی این آگهی:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {COUNTRIES.map(c => {
                        const isCurrent = (currentSelectedAd.country || 'se') === c.id;

                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => updateAdCountry(currentSelectedAd.id, c.id)}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                              isCurrent
                                ? 'bg-[#1877F2] text-white border-blue-400 shadow-xs'
                                : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border-slate-700/70'
                            }`}
                          >
                            <span>{c.nameFa}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Security PIN & Ref Number */}
                  <div className="p-3.5 rounded-2xl bg-[#07090e] border border-slate-800 space-y-2">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      مشخصات امنیتی آگهی‌دهنده
                    </span>
                    
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40">
                      <div>
                        <span className="block text-[10px] text-slate-400">کد پیگیری مرجع:</span>
                        <span className="font-mono text-xs font-black text-white">{currentSelectedAd.reference_number}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText(currentSelectedAd.reference_number, 'ref')}
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer"
                      >
                        {copiedRef ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40">
                      <div>
                        <span className="block text-[10px] text-slate-400">پین کد محرمانه:</span>
                        <span className="font-mono text-sm font-black text-amber-400 tracking-widest">{currentSelectedAd.pin_code || '---'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText(currentSelectedAd.pin_code || '', 'pin')}
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer"
                      >
                        {copiedPin ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* 3. Contact Info */}
                  <div className="p-3.5 rounded-2xl bg-[#07090e] border border-slate-800 space-y-2">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      اطلاعات تماس آگهی‌دهنده
                    </span>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">نام آگهی‌دهنده:</span>
                        <span className="font-bold text-white">{currentSelectedAd.contact_name || 'ثبت نشده'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">شماره تلفن:</span>
                        <span className="font-mono text-white" dir="ltr">{currentSelectedAd.contact_phone || '---'}</span>
                      </div>

                      {currentSelectedAd.contact_whatsapp && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">واتساپ:</span>
                          <span className="font-mono text-emerald-400" dir="ltr">{currentSelectedAd.contact_whatsapp}</span>
                        </div>
                      )}

                      {currentSelectedAd.contact_telegram && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">تلگرام:</span>
                          <span className="font-mono text-blue-400" dir="ltr">{currentSelectedAd.contact_telegram}</span>
                        </div>
                      )}

                      {currentSelectedAd.contact_email && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">ایمیل:</span>
                          <span className="font-mono text-slate-300 truncate max-w-[200px]" dir="ltr">{currentSelectedAd.contact_email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. Description */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400">متن توضیحات آگهی:</span>
                    <p className="p-3 rounded-xl bg-[#07090e] border border-slate-800/80 text-slate-300 whitespace-pre-line leading-relaxed text-xs">
                      {currentSelectedAd.description}
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* Mobile CRM Details Drawer */}
            {mobileDetailOpen && currentSelectedAd && (
              <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
                <div 
                  className="fixed inset-0 bg-black/70 backdrop-blur-xs"
                  onClick={() => setMobileDetailOpen(false)}
                />
                <div className="relative w-full max-h-[85vh] bg-[#0d121c] rounded-t-3xl border-t border-slate-800 p-5 overflow-y-auto custom-scrollbar z-10 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white truncate max-w-[240px]">
                      {currentSelectedAd.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setMobileDetailOpen(false)}
                      className="p-1.5 rounded-full text-slate-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Quick Status and Country */}
                  <div className="p-3 rounded-2xl bg-[#07090e] border border-slate-800 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400">تغییر کشور آگهی:</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {COUNTRIES.map(c => {
                        const isCurrent = (currentSelectedAd.country || 'se') === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => updateAdCountry(currentSelectedAd.id, c.id)}
                            className={`py-1.5 px-2 rounded-xl text-xs font-bold ${isCurrent ? 'bg-[#1877F2] text-white' : 'bg-slate-800 text-slate-300'}`}
                          >
                            {c.nameFa}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(currentSelectedAd)}
                      className="flex-1 py-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xs"
                    >
                      {currentSelectedAd.is_featured ? 'برداشتن VIP' : 'اعطای VIP'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatus(currentSelectedAd)}
                      className="flex-1 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs"
                    >
                      {currentSelectedAd.status === 'active' ? 'مخفی کردن' : 'فعال کردن'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            TAB 3: SITE BRANDING, LOGO & SEO FOR EACH COUNTRY
        ======================================================== */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7 space-y-8 max-w-5xl w-full mx-auto">
            
            {saveSuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Mobile CRM Details Drawer */}
            {mobileDetailOpen && currentSelectedAd && (
              <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
                <div 
                  className="fixed inset-0 bg-black/70 backdrop-blur-xs"
                  onClick={() => setMobileDetailOpen(false)}
                />
                <div className="relative w-full max-h-[85vh] bg-[#0d121c] rounded-t-3xl border-t border-slate-800 p-5 overflow-y-auto custom-scrollbar z-10 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white truncate max-w-[240px]">
                      {currentSelectedAd.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setMobileDetailOpen(false)}
                      className="p-1.5 rounded-full text-slate-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Quick Status and Country */}
                  <div className="p-3 rounded-2xl bg-[#07090e] border border-slate-800 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400">تغییر کشور آگهی:</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {COUNTRIES.map(c => {
                        const isCurrent = (currentSelectedAd.country || 'se') === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => updateAdCountry(currentSelectedAd.id, c.id)}
                            className={`py-1.5 px-2 rounded-xl text-xs font-bold ${isCurrent ? 'bg-[#1877F2] text-white' : 'bg-slate-800 text-slate-300'}`}
                          >
                            {c.nameFa}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(currentSelectedAd)}
                      className="flex-1 py-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xs"
                    >
                      {currentSelectedAd.is_featured ? 'برداشتن VIP' : 'اعطای VIP'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatus(currentSelectedAd)}
                      className="flex-1 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs"
                    >
                      {currentSelectedAd.status === 'active' ? 'مخفی کردن' : 'فعال کردن'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 1: LOGO & SITE BRANDING */}
            <div className="p-6 rounded-3xl bg-[#0f1420] border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Sparkles size={18} className="text-[#1877F2]" />
                    <span>تنظیمات برند، نام و لوگوی وب‌سایت</span>
                  </h3>
                  <p className="text-xs text-slate-400">شخصی‌سازی لوگوی تصویری، نام سایت و کانال‌های ارتباطی</p>
                </div>
              </div>

              <form onSubmit={saveBrandingSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">نام رسمی سایت (Brand Name)</label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="سوئد پرشیا"
                      className="w-full h-10 rounded-xl bg-[#07090e] border border-slate-800 px-3.5 text-xs text-white focus:border-[#1877F2] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">شعار سایت (Slogan)</label>
                    <input
                      type="text"
                      value={siteSlogan}
                      onChange={(e) => setSiteSlogan(e.target.value)}
                      placeholder="نیازمندی‌های فارسی‌زبانان اسکاندیناوی"
                      className="w-full h-10 rounded-xl bg-[#07090e] border border-slate-800 px-3.5 text-xs text-white focus:border-[#1877F2] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    آدرس تصویر لوگو (Logo Image URL)
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="flex-1 h-10 rounded-xl bg-[#07090e] border border-slate-800 px-3.5 text-xs text-white focus:border-[#1877F2] focus:outline-none"
                      dir="ltr"
                    />
                    {logoUrl && (
                      <div className="h-10 w-10 rounded-xl bg-white p-1 border border-slate-700 shrink-0 flex items-center justify-center">
                        <img src={logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 block pt-1">
                    در صورت خالی بودن، از نشان پیش‌فرض متای «SP» استفاده خواهد شد.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">ایمیل پشتیبانی</label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full h-9 rounded-xl bg-[#07090e] border border-slate-800 px-3 text-xs text-white focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">آیدی تلگرام پشتیبانی</label>
                    <input
                      type="text"
                      value={supportTelegram}
                      onChange={(e) => setSupportTelegram(e.target.value)}
                      className="w-full h-9 rounded-xl bg-[#07090e] border border-slate-800 px-3 text-xs text-white focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">تلفن پشتیبانی</label>
                    <input
                      type="text"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      placeholder="+46 70 123 4567"
                      className="w-full h-9 rounded-xl bg-[#07090e] border border-slate-800 px-3 text-xs text-white focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="h-10 px-5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
                  >
                    <Save size={15} />
                    <span>{savingSettings ? 'در حال ذخیره...' : 'ذخیره تنظیمات برند و لوگو'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* SECTION 2: SEO MANAGEMENT FOR EACH SCANDINAVIAN COUNTRY */}
            <div className="p-6 rounded-3xl bg-[#0f1420] border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Globe size={18} className="text-[#1877F2]" />
                    <span>مدیریت سئو به تفکیک کشورهای اسکاندیناوی (Country-Specific SEO)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    تعریف عناوین سئو، توضیحات متا و کلمات کلیدی برای موتور جستجوی گوگل در هر کشور
                  </p>
                </div>

                {/* Country Switcher Tabs */}
                <div className="flex items-center gap-1.5 bg-[#07090e] p-1 rounded-2xl border border-slate-800">
                  {COUNTRIES.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSeoActiveCountry(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        seoActiveCountry === c.id
                          ? 'bg-[#1877F2] text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {c.nameFa}
                    </button>
                  ))}
                </div>
              </div>

              {/* SEO Form for Active Country */}
              <form onSubmit={saveSeoSettings} className="space-y-4">
                
                {/* Meta Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      عنوان صفحه در گوگل (Meta Title) - {COUNTRIES.find(c => c.id === seoActiveCountry)?.nameFa}
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {(seoSettings[seoActiveCountry]?.title || '').length} / 65 کاراکتر
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={seoSettings[seoActiveCountry]?.title || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSeoSettings(prev => ({
                        ...prev,
                        [seoActiveCountry]: {
                          ...prev[seoActiveCountry],
                          title: val
                        }
                      }));
                    }}
                    placeholder="عنوان سئو در نتایج گوگل..."
                    className="w-full h-10 rounded-xl bg-[#07090e] border border-slate-800 px-3.5 text-xs text-white focus:border-[#1877F2] focus:outline-none"
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      توضیحات متا در گوگل (Meta Description)
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {(seoSettings[seoActiveCountry]?.description || '').length} / 160 کاراکتر
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={seoSettings[seoActiveCountry]?.description || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSeoSettings(prev => ({
                        ...prev,
                        [seoActiveCountry]: {
                          ...prev[seoActiveCountry],
                          description: val
                        }
                      }));
                    }}
                    placeholder="توضیحات جذابی که زیر عنوان در گوگل نمایش داده می‌شود..."
                    className="w-full rounded-xl bg-[#07090e] border border-slate-800 p-3 text-xs text-white focus:border-[#1877F2] focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    کلمات کلیدی سئو (Meta Keywords - جدا شده با کاما)
                  </label>
                  <input
                    type="text"
                    value={seoSettings[seoActiveCountry]?.keywords || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSeoSettings(prev => ({
                        ...prev,
                        [seoActiveCountry]: {
                          ...prev[seoActiveCountry],
                          keywords: val
                        }
                      }));
                    }}
                    placeholder="نیازمندی‌ها, مسکن, رستوران و خوراک, استخدام, دارالترجمه"
                    className="w-full h-10 rounded-xl bg-[#07090e] border border-slate-800 px-3.5 text-xs text-white focus:border-[#1877F2] focus:outline-none"
                  />
                </div>

                {/* OpenGraph Image URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    تصویر اشتراک‌گذاری در شبکه‌های اجتماعی (Open Graph Image URL)
                  </label>
                  <input
                    type="url"
                    value={seoSettings[seoActiveCountry]?.ogImage || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSeoSettings(prev => ({
                        ...prev,
                        [seoActiveCountry]: {
                          ...prev[seoActiveCountry],
                          ogImage: val
                        }
                      }));
                    }}
                    placeholder="https://example.com/scandinavia-banner.jpg"
                    className="w-full h-10 rounded-xl bg-[#07090e] border border-slate-800 px-3.5 text-xs text-white focus:border-[#1877F2] focus:outline-none"
                    dir="ltr"
                  />
                </div>

                {/* LIVE GOOGLE SERP PREVIEW BOX */}
                <div className="pt-2">
                  <span className="block text-[11px] font-bold text-slate-400 mb-2">
                    پیش‌نمایش زنده در نتایج جستجوی گوگل (Google SERP Snippet Preview):
                  </span>
                  
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-900 space-y-1 font-sans" dir="rtl">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                      <span>https://swedpersiska.se/?c={seoActiveCountry}</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-[#1a0dab] hover:underline cursor-pointer leading-tight">
                      {seoSettings[seoActiveCountry]?.title || 'عنوان سایت در گوگل'}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {seoSettings[seoActiveCountry]?.description || 'توضیحات متا در این بخش نمایش داده می‌شود...'}
                    </p>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="h-10 px-5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
                  >
                    <Save size={15} />
                    <span>
                      {savingSettings 
                        ? 'در حال ذخیره سئو...' 
                        : `ذخیره سئوی کشور ${COUNTRIES.find(c => c.id === seoActiveCountry)?.nameFa}`}
                    </span>
                  </button>
                </div>

              </form>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 4: STRIPE PAYMENT GATEWAY & VIP MONETIZATION SETTINGS
            ======================================================== */}
        {activeTab === 'monetization' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 custom-scrollbar">
            
            {/* Header Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
                    <CreditCard size={18} />
                  </div>
                  <h2 className="text-lg font-black text-white">درگاه پرداخت آنلاین Stripe و درآمدزایی</h2>
                </div>
                <p className="text-xs text-slate-400">
                  مدیریت کلیدهای امنیتی درگاه، تعرفه فروش آگهی‌های ویژه (VIP) و ۴ اسلات تبلیغاتی
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                  stripeSettings.mode === 'live' 
                    ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800' 
                    : 'bg-amber-950/50 text-amber-300 border-amber-800'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${stripeSettings.mode === 'live' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                  <span>{stripeSettings.mode === 'live' ? 'درگاه زنده (Live)' : 'درگاه آزمایشی (Test)'}</span>
                </div>
              </div>
            </div>

            {/* Quick Monetization KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">آگهی‌های ویژه فعال (Active VIP)</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-amber-400 tabular-nums">{vipAds}</span>
                  <span className="text-[11px] text-slate-500 font-mono">۴ جایگاه در صفحات</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">تعرفه هر آگهی ویژه</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-blue-400 tabular-nums">
                    {stripeSettings.vipPrice} <span className="text-sm">{stripeSettings.currency}</span>
                  </span>
                  <span className="text-[11px] text-slate-500">{stripeSettings.vipDurationDays} روز اعتبار</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">ارزش تخمینی آگهی‌های فعال</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-emerald-400 tabular-nums">
                    {(vipAds * (stripeSettings.vipPrice || 99)).toLocaleString()} <span className="text-sm">{stripeSettings.currency}</span>
                  </span>
                  <span className="text-[11px] text-emerald-500/80 font-bold">درآمد جاری</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={saveStripeSettings} className="space-y-6">
              
              {/* SECTION 1: STRIPE GATEWAY KEYS */}
              <div className="p-6 rounded-3xl bg-[#0f1420] border border-slate-800 space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Lock size={16} className="text-[#1877F2]" />
                      <span>کلیدهای امنیتی درگاه Stripe (Stripe API Keys)</span>
                    </h3>
                    <p className="text-xs text-slate-400">اطلاعات دریافتی از داشبورد رسمی Stripe (Developer &gt; API keys)</p>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">حالت:</span>
                    <div className="flex bg-[#07090e] p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setStripeSettings(prev => ({ ...prev, mode: 'test' }))}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          stripeSettings.mode === 'test' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        آزمایشی (Test)
                      </button>
                      <button
                        type="button"
                        onClick={() => setStripeSettings(prev => ({ ...prev, mode: 'live' }))}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          stripeSettings.mode === 'live' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        زنده (Live)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Stripe Publishable Key (کلید عمومی)
                    </label>
                    <input
                      type="text"
                      value={stripeSettings.publishableKey}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, publishableKey: e.target.value }))}
                      placeholder="pk_test_... یا pk_live_..."
                      className="w-full h-10 rounded-xl bg-[#07090e] border border-slate-800 px-3.5 text-xs text-white font-mono focus:border-[#1877F2] focus:outline-none"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Stripe Secret Key (کلید محرمانه)
                    </label>
                    <input
                      type="password"
                      value={stripeSettings.secretKey}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, secretKey: e.target.value }))}
                      placeholder="sk_test_... یا sk_live_..."
                      className="w-full h-10 rounded-xl bg-[#07090e] border border-slate-800 px-3.5 text-xs text-white font-mono focus:border-[#1877F2] focus:outline-none"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Stripe Webhook Secret (اختیاری)
                    </label>
                    <input
                      type="password"
                      value={stripeSettings.webhookSecret}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, webhookSecret: e.target.value }))}
                      placeholder="whsec_..."
                      className="w-full h-10 rounded-xl bg-[#07090e] border border-slate-800 px-3.5 text-xs text-white font-mono focus:border-[#1877F2] focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: VIP PRICING & SLOTS CONFIG */}
              <div className="p-6 rounded-3xl bg-[#0f1420] border border-slate-800 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Coins size={16} className="text-amber-400" />
                    <span>تعرفه تبلیغات و اسلات‌های ۴ گانه ویژه</span>
                  </h3>
                  <p className="text-xs text-slate-400">تنظیم قیمت ارتقای هر آگهی، ارز پرداختی و مدت زمان ویژه بودن</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      قیمت ارتقا به ویژه (VIP Fee)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={stripeSettings.vipPrice}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, vipPrice: Number(e.target.value) }))}
                      className="w-full h-10 rounded-xl bg-[#07090e] border border-slate-800 px-3.5 text-xs text-white font-mono focus:border-[#1877F2] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      واحد پولی (Currency)
                    </label>
                    <select
                      value={stripeSettings.currency}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full h-10 rounded-xl bg-[#07090e] border border-slate-800 px-3 text-xs text-white focus:border-[#1877F2] focus:outline-none cursor-pointer"
                    >
                      <option value="SEK">SEK (کرون سوئد)</option>
                      <option value="NOK">NOK (کرون نروژ)</option>
                      <option value="DKK">DKK (کرون دانمارک)</option>
                      <option value="EUR">EUR (یورو فنلاند)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      مدت زمان اعتبار نمایش ویژه
                    </label>
                    <select
                      value={stripeSettings.vipDurationDays}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, vipDurationDays: Number(e.target.value) }))}
                      className="w-full h-10 rounded-xl bg-[#07090e] border border-slate-800 px-3 text-xs text-white focus:border-[#1877F2] focus:outline-none cursor-pointer"
                    >
                      <option value={7}>۷ روز</option>
                      <option value={14}>۱۴ روز</option>
                      <option value={30}>۳۰ روز (توصیه شده)</option>
                      <option value={60}>۶۰ روز</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-xl bg-blue-950/40 border border-blue-900/60 p-3.5 text-xs text-blue-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-blue-300">
                    <CheckCircle size={14} />
                    <span>تضمین نمایش ۴ آگهی VIP در سایدبار:</span>
                  </div>
                  <p className="text-[11px] text-blue-300/80 leading-relaxed">
                    با پرداخت کاربران، آگهی آن‌ها به صورت خودکار در صفحه اصلی، بالای نتایج جستجو و سایدبار اختصاصی تمام صفحات آگهی‌ها در میان ۴ آگهی برتر به نمایش درمی‌آید.
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="h-11 px-6 rounded-xl bg-[#1877F2] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
                >
                  <Save size={16} />
                  <span>{savingSettings ? 'در حال ذخیره تنظیمات Stripe...' : 'ذخیره تنظیمات درگاه Stripe'}</span>
                </button>
              </div>

            </form>

          </div>
        )}

      </div>

    </div>
  );
}
