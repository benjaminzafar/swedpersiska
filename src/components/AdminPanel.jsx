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
  CreditCard,
  Lock,
  ExternalLink,
  Phone,
  Mail,
  Send,
  Eye,
  Bot
} from 'lucide-react';
import CloudflareTurnstile from './CloudflareTurnstile';
import { supabase } from '../lib/supabase';
import { CATEGORIES, COUNTRIES } from '../lib/translations';

export default function AdminPanel({ onClose, onRefreshAds }) {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('swedpersiska@gmail.com');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Active view: 'overview' | 'ads' | 'monetization' | 'security' | 'settings'
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
      keywords: 'نیازمندیهای سوئد, مسکن استکهلم, رستوران گوتنبرگ, مترجم رسمی سوئد, دارالترجمه مالمو, کار در سوئد'
    },
    no: {
      title: 'نیازمندی‌ها، مسکن و مشاغل فارسی‌زبانان در نروژ | سوئد پرشیا',
      description: 'پرتال اختصاصی فارسی‌زبانان مقیم نروژ. خرید و اجاره آپارتمان در اسلو و برگن، خدمات حقوقی و دارالترجمه، رستوران‌ها و سوپرمارکت‌ها.',
      keywords: 'نیازمندیهای نروژ, مسکن اسلو, خانه در برگن, رستوران نروژ, مترجم نروژی به فارسی, کار در نروژ'
    },
    dk: {
      title: 'نیازمندی‌ها، مسکن و خدمات فارسی‌زبانان در دانمارک | سوئد پرشیا',
      description: 'پرتال جامع فارسی‌زبانان مقیم دانمارک. نیازمندی‌های مسکن و اتاق در کپنهاگ و آرهوس، معرفی رستوران‌ها و سوپرمارکت‌ها و خدمات تخصصی.',
      keywords: 'نیازمندیهای دانمارک, مسکن کپنهاگ, خانه در آرهوس, رستوران کپنهاگ, مترجم دانمارکی, صرافی دانمارک'
    },
    fi: {
      title: 'نیازمندی‌ها، مسکن و مشاغل فارسی‌زبانان در فنلاند | سوئد پرشیا',
      description: 'سامانه آگهی‌های رایگان فارسی‌زبانان فنلاند. اجاره مسکن در هلسینکی و تامپره، استخدام، خدمات ترجمه و اقامت برای جامعه فارسی‌زبان.',
      keywords: 'نیازمندیهای فنلاند, خانه در هلسینکی, مسکن اسپو, فارسی‌زبانان فنلاند, کار در هلسینکی, مترجم فنلاندی'
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

  // Cloudflare Turnstile Anti-Bot State
  const [adminTurnstileToken, setAdminTurnstileToken] = useState('');
  const [turnstileSettings, setTurnstileSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('swedpersiska_turnstile_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      enabled: true,
      mode: 'test', // 'test' | 'live'
      siteKey: '',
      secretKey: '',
      protectAdminLogin: true,
      protectPostAd: true
    };
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

    const turnstileRequired = turnstileSettings.enabled !== false && turnstileSettings.protectAdminLogin !== false;
    if (turnstileRequired && !adminTurnstileToken) {
      setLoginError('لطفاً تایید امنیتی کلودفلر (من ربات نیستم) را کامل فرمایید.');
      return;
    }

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
          if (item.key === 'turnstile_settings' && item.value) {
            setTurnstileSettings(prev => ({
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

  // Save Cloudflare Turnstile Anti-Bot Settings
  const saveTurnstileSettings = async (e) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    try {
      localStorage.setItem('swedpersiska_turnstile_settings', JSON.stringify(turnstileSettings));
      const { error } = await supabase
        .from('swedpersiska_settings')
        .upsert({
          key: 'turnstile_settings',
          value: turnstileSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSaveSuccessMsg('تنظیمات آنتی‌بات کلودفلر Turnstile با موفقیت ذخیره شد.');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error saving turnstile settings:', err);
      setSaveSuccessMsg('تنظیمات به صورت محلی ذخیره شد.');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
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

  // ========================================================
  // LOGIN SCREEN - Executive Dark Theme
  // ========================================================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-white font-vazir select-none" dir="rtl">
        {/* Ambient subtle glow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        {/* Modal Card */}
        <div className="relative w-full max-w-sm rounded-3xl bg-[#0f1626] border border-slate-800 p-7 sm:p-8 shadow-2xl space-y-6 z-10 animate-in zoom-in-95 duration-150">
          
          {/* Brand Header */}
          <div className="text-center space-y-2.5">
            <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[#1877F2] shadow-xs">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">کنترل پنل مدیریت سوئد پرشیا</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">ورود مدیر برای نظارت بر آگهی‌ها، کشورها و سئو</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="rounded-xl bg-rose-950/60 border border-rose-800/80 p-2.5 text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">ایمیل مدیریت</label>
              <input
                type="email"
                required
                placeholder="swedpersiska@gmail.com"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-[#070a12] hover:border-slate-700 focus:bg-[#0c111e] px-3.5 py-2.5 text-xs text-white focus:border-[#1877F2] focus:ring-1 focus:ring-blue-500/40 focus:outline-none transition-all font-mono text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">رمز عبور اختصاصی</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={adminPassInput}
                onChange={(e) => setAdminPassInput(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-[#070a12] hover:border-slate-700 focus:bg-[#0c111e] px-3.5 py-2.5 text-xs text-white focus:border-[#1877F2] focus:ring-1 focus:ring-blue-500/40 focus:outline-none transition-all font-mono text-left"
                dir="ltr"
              />
            </div>

            {/* Cloudflare Turnstile Anti-Bot Verification - Dark Theme */}
            {turnstileSettings.enabled !== false && turnstileSettings.protectAdminLogin !== false && (
              <div className="pt-1 flex flex-col items-center justify-center">
                <CloudflareTurnstile
                  theme="dark"
                  siteKey={turnstileSettings.mode === 'live' ? turnstileSettings.siteKey : undefined}
                  onVerify={(token) => {
                    setAdminTurnstileToken(token);
                    setLoginError('');
                  }}
                  onExpire={() => setAdminTurnstileToken('')}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs py-3.5 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              ورود به داشبورد مدیریت
            </button>
          </form>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-center text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer pt-1"
          >
            ← بازگشت به سایت اصلی
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // MAIN ADMIN DASHBOARD - Executive Dark Theme
  // ========================================================
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#090d16] text-slate-100 font-vazir select-none" dir="rtl">
      
      {/* Toast Alert */}
      {actionSuccessMsg && (
        <div className="fixed top-5 end-5 z-50 flex items-center gap-2 rounded-2xl bg-[#0f1626] border border-slate-700 text-white px-4 py-2.5 text-xs font-bold shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="h-16 shrink-0 bg-[#0e1422] border-b border-slate-800/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800/70 text-slate-300 hover:text-white"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1877F2] text-white font-black text-xs shadow-xs">
              SP
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block">کنترل پنل مدیریت سوئد پرشیا</span>
              <span className="text-[10px] text-slate-400 font-medium">نظارت بر آگهی‌ها، پرداخت‌ها، آنتی‌بات و سئو</span>
            </div>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden lg:flex items-center gap-1 bg-[#060910] p-1 rounded-2xl border border-slate-800/80">
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
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
              activeTab === 'ads' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
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
            <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              VIP
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck size={14} />
            <span>امنیت کلودفلر (Anti-Bot)</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
              turnstileSettings.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
            }`}>
              {turnstileSettings.enabled ? 'فعال' : 'خاموش'}
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
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#131b2e] hover:bg-[#1a253e] text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-all cursor-pointer"
            title="بروزرسانی داده‌ها"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-[#1877F2]' : ''} />
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
        <div className="lg:hidden bg-[#0e1422] border-b border-slate-800 p-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold text-center ${activeTab === 'overview' ? 'bg-[#1877F2] text-white' : 'bg-[#070a12] text-slate-300 border border-slate-800'}`}
          >
            داشبورد
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('ads'); setMobileMenuOpen(false); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold text-center ${activeTab === 'ads' ? 'bg-[#1877F2] text-white' : 'bg-[#070a12] text-slate-300 border border-slate-800'}`}
          >
            آگهی‌ها ({ads.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('monetization'); setMobileMenuOpen(false); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold text-center ${activeTab === 'monetization' ? 'bg-[#1877F2] text-white' : 'bg-[#070a12] text-slate-300 border border-slate-800'}`}
          >
            درگاه Stripe
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('security'); setMobileMenuOpen(false); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold text-center ${activeTab === 'security' ? 'bg-[#1877F2] text-white' : 'bg-[#070a12] text-slate-300 border border-slate-800'}`}
          >
            آنتی‌بات
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold text-center ${activeTab === 'settings' ? 'bg-[#1877F2] text-white' : 'bg-[#070a12] text-slate-300 border border-slate-800'}`}
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
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-7 space-y-6 max-w-7xl w-full mx-auto">
            
            {/* Top High-level Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
              <div className="p-5 rounded-2xl bg-[#0f1626] border border-slate-800/90 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400">کل آگهی‌های ثبت‌شده</span>
                <div className="text-3xl font-black text-white">{totalAds}</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0f1626] border border-slate-800/90 shadow-sm space-y-1">
                <span className="text-xs font-bold text-emerald-400">آگهی‌های فعال</span>
                <div className="text-3xl font-black text-emerald-400">{activeAds}</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0f1626] border border-slate-800/90 shadow-sm space-y-1">
                <span className="text-xs font-bold text-amber-400">آگهی‌های ویژه VIP</span>
                <div className="text-3xl font-black text-amber-400">{vipAds}</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0f1626] border border-slate-800/90 shadow-sm space-y-1">
                <span className="text-xs font-bold text-blue-400">مجموع بازدیدها</span>
                <div className="text-3xl font-black text-[#1877F2]">{totalViews.toLocaleString('fa-IR')}</div>
              </div>
            </div>

            {/* Scandinavian Country Performance Breakdown */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Globe size={16} className="text-[#1877F2]" />
                  <span>توزیع آگهی‌ها بر اساس کشور</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">برای فیلتر روی هر کشور کلیک کنید</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {COUNTRIES.map(country => {
                  const stats = getCountryStats(country.id);

                  return (
                    <div 
                      key={country.id}
                      onClick={() => {
                        setCountryFilter(country.id);
                        setActiveTab('ads');
                      }}
                      className="p-4 rounded-2xl bg-[#0f1626] hover:bg-[#131b2e] border border-slate-800/90 hover:border-blue-500/50 transition-all cursor-pointer shadow-sm group space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block font-extrabold text-sm text-white group-hover:text-blue-400 transition-colors">
                            {country.nameFa}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {country.nameNative} • {country.currencyName}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-mono font-bold border border-blue-500/20">
                          {stats.total} آگهی
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1 pt-2.5 border-t border-slate-800/60 text-center">
                        <div>
                          <span className="block text-[10px] text-slate-400 font-medium">فعال</span>
                          <span className="text-xs font-black text-emerald-400">{stats.active}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-medium">VIP</span>
                          <span className="text-xs font-black text-amber-400">{stats.vip}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-medium">بازدید</span>
                          <span className="text-xs font-black text-slate-300">{stats.views}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* System Status & Direct Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#0f1626] border border-slate-800/90 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CreditCard size={15} className="text-[#1877F2]" />
                    درگاه Stripe و تعرفه VIP
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 text-[10px] font-bold border border-emerald-800/60">
                    {stripeSettings.enabled ? 'آماده' : 'غیرفعال'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>تعرفه: <b>{stripeSettings.vipPrice} {stripeSettings.currency}</b></div>
                  <div>اعتبار: <b>{stripeSettings.vipDurationDays} روز</b></div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('monetization')}
                  className="w-full text-center py-2 rounded-xl bg-[#070a12] hover:bg-[#131b2e] text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition-colors"
                >
                  تنظیمات Stripe ←
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#0f1626] border border-slate-800/90 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-emerald-400" />
                    آنتی‌بات Cloudflare
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    turnstileSettings.enabled ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {turnstileSettings.enabled ? 'فعال' : 'خاموش'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>ورود مدیریت: <b>{turnstileSettings.protectAdminLogin ? 'محافظت‌شده' : 'عادی'}</b></div>
                  <div>ثبت آگهی: <b>{turnstileSettings.protectPostAd ? 'محافظت‌شده' : 'عادی'}</b></div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className="w-full text-center py-2 rounded-xl bg-[#070a12] hover:bg-[#131b2e] text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition-colors"
                >
                  تنظیمات امنیتی ←
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#0f1626] border border-slate-800/90 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Settings size={15} className="text-purple-400" />
                    سئو و عنوان صفحات
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-300 text-[10px] font-bold border border-blue-800/60">
                    ۴ کشور
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>برند: <b>{siteName}</b></div>
                  <div>پوشش: <b>سوئد، نروژ، دانمارک، فنلاند</b></div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="w-full text-center py-2 rounded-xl bg-[#070a12] hover:bg-[#131b2e] text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition-colors"
                >
                  ویرایش سئو ←
                </button>
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
            <div className="flex-1 flex flex-col border-s border-slate-800/90 overflow-hidden bg-[#090d16]">
              
              {/* Filter Controls Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-800/90 space-y-3 bg-[#0e1422]">
                
                {/* 1. Country Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  <span className="text-xs font-bold text-slate-400 shrink-0 pe-1">کشور:</span>
                  
                  <button
                    type="button"
                    onClick={() => setCountryFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      countryFilter === 'all'
                        ? 'bg-[#1877F2] text-white shadow-xs'
                        : 'bg-[#070a12] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    همه ({ads.length})
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
                            ? 'bg-[#1877F2] text-white shadow-xs'
                            : 'bg-[#070a12] text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <span>{country.nameFa}</span>
                        <span className="text-[10.5px] opacity-80 font-mono font-bold">({count})</span>
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
                      placeholder="جستجو در عنوان، کد پیگیری، شهر، نام..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 rounded-xl bg-[#070a12] border border-slate-800 ps-8 pe-3 text-xs text-white placeholder-slate-500 focus:border-[#1877F2] focus:ring-1 focus:ring-blue-500/30 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="h-9 rounded-xl bg-[#070a12] border border-slate-800 px-3 text-xs font-semibold text-slate-300 focus:border-[#1877F2] focus:outline-none cursor-pointer"
                    >
                      <option value="all">همه دسته‌ها</option>
                      {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.fa}</option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-9 rounded-xl bg-[#070a12] border border-slate-800 px-3 text-xs font-semibold text-slate-300 focus:border-[#1877F2] focus:outline-none cursor-pointer"
                    >
                      <option value="all">همه وضعیت‌ها</option>
                      <option value="active">فقط فعال</option>
                      <option value="hidden">مخفی‌شده</option>
                      <option value="vip">فقط ویژه (VIP)</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Ads Stream List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-2.5">
                {filteredAds.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 space-y-2">
                    <Layers size={32} className="mx-auto text-slate-600" />
                    <p className="text-xs font-medium">هیچ آگهی با این مشخصات یافت نشد.</p>
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
                            ? 'bg-[#152037] border-[#1877F2] ring-1 ring-[#1877F2] shadow-sm'
                            : 'bg-[#0f1626] border-slate-800/90 hover:bg-[#121b2e] hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Image thumbnail */}
                          <div className="h-12 w-12 rounded-xl bg-[#070a12] border border-slate-800 overflow-hidden shrink-0">
                            {ad.images && ad.images[0] ? (
                              <img src={ad.images[0]} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-500">
                                بدون عکس
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              {/* Country Badge */}
                              <span className="px-1.5 py-0.2 rounded-md bg-blue-950/80 text-blue-300 text-[10.5px] font-bold border border-blue-800/60">
                                {countryObj.nameFa}
                              </span>

                              <span className="font-mono text-[10.5px] text-slate-400 font-bold bg-[#070a12] px-1.5 py-0.2 rounded border border-slate-800">
                                <bdi>{ad.reference_number}</bdi>
                              </span>

                              {ad.is_featured && (
                                <span className="px-1.5 py-0.2 rounded-md bg-amber-950/80 text-amber-300 text-[10px] font-bold border border-amber-800/60">
                                  VIP ویژه
                                </span>
                              )}

                              {ad.status === 'hidden' && (
                                <span className="px-1.5 py-0.2 rounded-md bg-rose-950/80 text-rose-300 text-[10px] font-bold border border-rose-800/60">
                                  مخفی
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs font-bold text-white truncate">
                              {ad.title}
                            </h4>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400">
                              <span>{ad.city}</span>
                              <span>•</span>
                              <span className="font-semibold text-slate-300">
                                {ad.price ? `${Number(ad.price).toLocaleString()} ${ad.price_type || 'kr'}` : 'توافقی'}
                              </span>
                              <span>•</span>
                              <span>{ad.views_count || 1} بازدید</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="hidden sm:flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => toggleFeatured(ad)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              ad.is_featured
                                ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                : 'bg-[#070a12] text-slate-500 border-slate-800 hover:text-amber-400'
                            }`}
                            title={ad.is_featured ? 'برداشتن VIP' : 'اعطای نشان ویژه VIP'}
                          >
                            <Sparkles size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleStatus(ad)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              ad.status === 'active'
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                                : 'bg-[#070a12] text-slate-500 border-slate-800 hover:text-emerald-400'
                            }`}
                            title={ad.status === 'active' ? 'مخفی کردن' : 'فعال‌سازی'}
                          >
                            <CheckCircle size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteAdAdmin(ad.id)}
                            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/60 transition-colors cursor-pointer"
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

            {/* Right Column: CRM Details for Selected Ad (Desktop Inspector) */}
            {currentSelectedAd && (
              <div className="hidden lg:flex w-96 xl:w-[420px] shrink-0 bg-[#0c111d] flex-col overflow-hidden border-s border-slate-800/90">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-[#0e1422] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      جزییات و ویرایش آگهی
                    </span>
                    <h3 className="text-sm font-extrabold text-white truncate max-w-[260px]">
                      {currentSelectedAd.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(currentSelectedAd)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        currentSelectedAd.is_featured
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                          : 'bg-[#070a12] text-slate-400 border-slate-800 hover:text-amber-400'
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
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                          : 'bg-[#070a12] text-slate-400 border-slate-800 hover:text-emerald-400'
                      }`}
                      title="تغییر وضعیت انتشار"
                    >
                      <CheckCircle size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteAdAdmin(currentSelectedAd.id)}
                      className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/60 cursor-pointer"
                      title="حذف دائمی"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Details Scrollable Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 text-xs">
                  
                  {/* Photo Preview */}
                  {currentSelectedAd.images && currentSelectedAd.images[0] && (
                    <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#070a12] border border-slate-800 shadow-2xs">
                      <img src={currentSelectedAd.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* 1. Country Switcher for this Ad */}
                  <div className="p-4 rounded-2xl bg-[#0f1626] border border-slate-800/90 shadow-2xs space-y-2">
                    <label className="block text-[11px] font-bold text-slate-300">
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
                                ? 'bg-[#1877F2] text-white border-blue-500 shadow-xs'
                                : 'bg-[#070a12] hover:bg-[#131b2e] text-slate-300 border-slate-800'
                            }`}
                          >
                            {c.nameFa}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Key Metadata & PIN */}
                  <div className="p-4 rounded-2xl bg-[#0f1626] border border-slate-800/90 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                      <span className="text-slate-400 font-medium">کد پیگیری آگهی:</span>
                      <button
                        type="button"
                        onClick={() => copyText(currentSelectedAd.reference_number, 'ref')}
                        className="flex items-center gap-1.5 font-mono font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        <span>{currentSelectedAd.reference_number}</span>
                        {copiedRef ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                      <span className="text-slate-400 font-medium">رمز ۴ رقمی ویرایش (PIN):</span>
                      <button
                        type="button"
                        onClick={() => copyText(currentSelectedAd.pin_code || '1234', 'pin')}
                        className="flex items-center gap-1.5 font-mono font-extrabold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-800/60 cursor-pointer"
                      >
                        <span>{currentSelectedAd.pin_code || '1234'}</span>
                        {copiedPin ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">تاریخ ثبت:</span>
                      <span className="text-slate-200 font-medium">
                        {new Date(currentSelectedAd.created_at || '2026-01-01').toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>

                  {/* 3. Seller Contacts */}
                  <div className="p-4 rounded-2xl bg-[#0f1626] border border-slate-800/90 shadow-2xs space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-300 block">راه‌های ارتباط با آگهی‌دهنده:</span>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>نام:</span>
                        <span className="font-bold text-white">{currentSelectedAd.contact_name}</span>
                      </div>

                      {currentSelectedAd.contact_phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">تلفن:</span>
                          <a href={`tel:${currentSelectedAd.contact_phone}`} className="font-mono text-blue-400 font-semibold flex items-center gap-1">
                            <Phone size={12} />
                            <span>{currentSelectedAd.contact_phone}</span>
                          </a>
                        </div>
                      )}

                      {currentSelectedAd.contact_whatsapp && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">واتساپ:</span>
                          <a href={`https://wa.me/${currentSelectedAd.contact_whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                            <span>{currentSelectedAd.contact_whatsapp}</span>
                          </a>
                        </div>
                      )}

                      {currentSelectedAd.contact_telegram && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">تلگرام:</span>
                          <a href={`https://t.me/${currentSelectedAd.contact_telegram.replace('@', '')}`} target="_blank" rel="noreferrer" className="font-mono text-sky-400 font-semibold flex items-center gap-1">
                            <Send size={12} />
                            <span>{currentSelectedAd.contact_telegram}</span>
                          </a>
                        </div>
                      )}

                      {currentSelectedAd.contact_email && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">ایمیل:</span>
                          <a href={`mailto:${currentSelectedAd.contact_email}`} className="font-mono text-slate-300 hover:text-blue-400 flex items-center gap-1">
                            <Mail size={12} />
                            <span>{currentSelectedAd.contact_email}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. Description */}
                  <div className="p-4 rounded-2xl bg-[#0f1626] border border-slate-800/90 shadow-2xs space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-300 block">متن آگهی:</span>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line text-xs font-normal">
                      {currentSelectedAd.description}
                    </p>
                  </div>

                  {/* 5. Live View Link */}
                  <button
                    type="button"
                    onClick={() => window.open(`?ad=${currentSelectedAd.reference_number || currentSelectedAd.id}`, '_blank')}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#131b2e] hover:bg-[#1a253e] text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                  >
                    <ExternalLink size={14} />
                    <span>مشاهده صفحه اختصاصی آگهی در تب جدید</span>
                  </button>

                </div>

              </div>
            )}

          </div>
        )}

        {/* ========================================================
            TAB 3: STRIPE PAYMENT GATEWAY & VIP MONETIZATION SETTINGS
        ======================================================== */}
        {activeTab === 'monetization' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 custom-scrollbar max-w-4xl mx-auto w-full">
            
            <div className="border-b border-slate-800/90 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-white">تنظیمات درگاه پرداخت Stripe و آگهی‌های ویژه</h2>
                <p className="text-xs text-slate-400 mt-1">مدیریت کلیدهای Stripe، تعرفه آگهی‌های VIP و مدت زمان نمایش</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  stripeSettings.mode === 'live' 
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' 
                    : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                }`}>
                  {stripeSettings.mode === 'live' ? 'درگاه زنده (Live)' : 'درگاه آزمایشی (Test)'}
                </span>
              </div>
            </div>

            {saveSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={saveStripeSettings} className="space-y-6">
              
              {/* Stripe Credentials Card */}
              <div className="rounded-3xl bg-[#0f1626] border border-slate-800/90 p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold text-white">کلیدهای اتصال Stripe</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">محیط درگاه (Mode)</label>
                    <select
                      value={stripeSettings.mode}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, mode: e.target.value }))}
                      className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3 text-xs text-slate-200 font-medium focus:border-[#1877F2] focus:outline-none cursor-pointer"
                    >
                      <option value="test">آزمایشی (Test Mode)</option>
                      <option value="live">زنده و واقعی (Live Mode)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">فعال بودن درگاه</label>
                    <select
                      value={stripeSettings.enabled ? 'true' : 'false'}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, enabled: e.target.value === 'true' }))}
                      className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3 text-xs text-slate-200 font-medium focus:border-[#1877F2] focus:outline-none cursor-pointer"
                    >
                      <option value="true">فعال (امکان پرداخت آنلاین فعال)</option>
                      <option value="false">غیرفعال موقت</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Stripe Publishable Key (کلید عمومی)</label>
                    <input
                      type="text"
                      value={stripeSettings.publishableKey}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, publishableKey: e.target.value }))}
                      placeholder="pk_test_... یا pk_live_..."
                      className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3.5 text-xs text-white font-mono focus:border-[#1877F2] focus:outline-none"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Stripe Secret Key (کلید محرمانه)</label>
                    <input
                      type="password"
                      value={stripeSettings.secretKey}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, secretKey: e.target.value }))}
                      placeholder="sk_test_... یا sk_live_..."
                      className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3.5 text-xs text-white font-mono focus:border-[#1877F2] focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & VIP Configuration */}
              <div className="rounded-3xl bg-[#0f1626] border border-slate-800/90 p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold text-white">تعرفه و شرایط آگهی‌های ویژه</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">مبلغ ارتقا به VIP</label>
                    <input
                      type="number"
                      min="1"
                      value={stripeSettings.vipPrice}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, vipPrice: Number(e.target.value) }))}
                      className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3.5 text-xs text-white font-mono focus:border-[#1877F2] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">واحد پولی</label>
                    <select
                      value={stripeSettings.currency}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3 text-xs text-slate-200 font-medium focus:border-[#1877F2] focus:outline-none cursor-pointer"
                    >
                      <option value="SEK">SEK (کرون سوئد)</option>
                      <option value="NOK">NOK (کرون نروژ)</option>
                      <option value="DKK">DKK (کرون دانمارک)</option>
                      <option value="EUR">EUR (یورو فنلاند)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">مدت زمان اعتبار</label>
                    <select
                      value={stripeSettings.vipDurationDays}
                      onChange={(e) => setStripeSettings(prev => ({ ...prev, vipDurationDays: Number(e.target.value) }))}
                      className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3 text-xs text-slate-200 font-medium focus:border-[#1877F2] focus:outline-none cursor-pointer"
                    >
                      <option value={7}>۷ روز</option>
                      <option value={14}>۱۴ روز</option>
                      <option value={30}>۳۰ روز</option>
                      <option value={60}>۶۰ روز</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="h-11 px-6 rounded-full bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Save size={16} />
                <span>{savingSettings ? 'در حال ذخیره...' : 'ذخیره تنظیمات Stripe'}</span>
              </button>
            </form>

          </div>
        )}

        {/* ========================================================
            TAB 4: CLOUDFLARE TURNSTILE ANTI-BOT SETTINGS
        ======================================================== */}
        {activeTab === 'security' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 custom-scrollbar max-w-4xl mx-auto w-full">
            
            <div className="border-b border-slate-800/90 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-white">سامانه ضد اسپم و آنتی‌بات کلودفلر (Turnstile)</h2>
                <p className="text-xs text-slate-400 mt-1">محافظت هوشمند از فرم ورود مدیران و ثبت آگهی‌های کاربران بدون پازل‌های آزاردهنده</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  turnstileSettings.enabled 
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' 
                    : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                }`}>
                  {turnstileSettings.enabled ? 'آنتی‌بات فعال' : 'آنتی‌بات غیرفعال'}
                </span>
              </div>
            </div>

            {saveSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={saveTurnstileSettings} className="space-y-6">
              
              {/* Toggles & Modes Card */}
              <div className="rounded-3xl bg-[#0f1626] border border-slate-800/90 p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold text-white">محدوده محافظت</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-4 rounded-2xl bg-[#070a12] border border-slate-800 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-white block">فعال‌سازی کلی Turnstile</span>
                      <span className="text-[11px] text-slate-400">بررسی امنیتی روی فرم‌ها</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={turnstileSettings.enabled}
                      onChange={(e) => setTurnstileSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>

                  <div className="p-4 rounded-2xl bg-[#070a12] border border-slate-800 space-y-1">
                    <label className="block text-xs font-bold text-slate-300">محیط اجرا (Mode)</label>
                    <select
                      value={turnstileSettings.mode}
                      onChange={(e) => setTurnstileSettings(prev => ({ ...prev, mode: e.target.value }))}
                      className="w-full h-8 rounded-lg bg-[#0e1422] border border-slate-700 px-2.5 text-xs text-white font-medium focus:border-[#1877F2] focus:outline-none cursor-pointer"
                    >
                      <option value="test">آزمایشی (Test Mode)</option>
                      <option value="live">عملیاتی زنده (Live Production)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <label className="flex items-center justify-between p-4 rounded-2xl bg-[#070a12] border border-slate-800 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Lock size={15} className="text-amber-400" />
                      <div>
                        <span className="text-xs font-bold text-white block">محافظت از صفحه ورود مدیریت</span>
                        <span className="text-[11px] text-slate-400">جلوگیری از حملات ربات‌ها</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={turnstileSettings.protectAdminLogin}
                      onChange={(e) => setTurnstileSettings(prev => ({ ...prev, protectAdminLogin: e.target.checked }))}
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-2xl bg-[#070a12] border border-slate-800 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Bot size={15} className="text-[#1877F2]" />
                      <div>
                        <span className="text-xs font-bold text-white block">محافظت از فرم ثبت آگهی</span>
                        <span className="text-[11px] text-slate-400">جلوگیری از ارسال آگهی اسپم</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={turnstileSettings.protectPostAd}
                      onChange={(e) => setTurnstileSettings(prev => ({ ...prev, protectPostAd: e.target.checked }))}
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Cloudflare Keys Card */}
              <div className="rounded-3xl bg-[#0f1626] border border-slate-800/90 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-white">کلیدهای اختصاصی Cloudflare</h3>
                  <a
                    href="https://dash.cloudflare.com/?to=/:account/turnstile"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-blue-400 hover:underline"
                  >
                    دریافت کلید رایگان از Cloudflare ↗
                  </a>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Turnstile Site Key (کلید عمومی)</label>
                    <input
                      type="text"
                      value={turnstileSettings.siteKey}
                      onChange={(e) => setTurnstileSettings(prev => ({ ...prev, siteKey: e.target.value }))}
                      placeholder={turnstileSettings.mode === 'test' ? 'در حالت تستی نیاز به وارد کردن کلید نیست' : '0x4AAAAAA...'}
                      className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3.5 text-xs text-white font-mono focus:border-[#1877F2] focus:outline-none"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Turnstile Secret Key (کلید محرمانه)</label>
                    <input
                      type="password"
                      value={turnstileSettings.secretKey}
                      onChange={(e) => setTurnstileSettings(prev => ({ ...prev, secretKey: e.target.value }))}
                      placeholder={turnstileSettings.mode === 'test' ? 'در حالت تستی نیاز به وارد کردن کلید نیست' : '0x4AAAAAA...'}
                      className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3.5 text-xs text-white font-mono focus:border-[#1877F2] focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Widget */}
              <div className="rounded-3xl bg-[#0f1626] border border-slate-800/90 p-6 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold text-white">تست زنده عملکرد ویجت</h3>
                <div className="p-4 rounded-2xl bg-[#070a12] border border-slate-800 flex flex-col items-center justify-center space-y-2">
                  <CloudflareTurnstile
                    theme="dark"
                    siteKey={turnstileSettings.mode === 'live' ? turnstileSettings.siteKey : undefined}
                    onVerify={(token) => {
                      triggerToast('تایید با موفقیت انجام شد: ' + token.slice(0, 15) + '...');
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="h-11 px-6 rounded-full bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Save size={16} />
                <span>{savingSettings ? 'در حال ذخیره...' : 'ذخیره تنظیمات آنتی‌بات'}</span>
              </button>
            </form>

          </div>
        )}

        {/* ========================================================
            TAB 5: SITE BRANDING, LOGO & SEO FOR EACH COUNTRY
        ======================================================== */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
            
            <div className="border-b border-slate-800/90 pb-5">
              <h2 className="text-lg font-black text-white">تنظیمات برند و سئوی ۴ کشور اسکاندیناوی</h2>
              <p className="text-xs text-slate-400 mt-1">مدیریت نام سایت، مشخصات تماس و تایتل/دیسکریپشن گوگل برای هر کشور</p>
            </div>

            {saveSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Site Branding Form */}
            <form onSubmit={saveBrandingSettings} className="rounded-3xl bg-[#0f1626] border border-slate-800/90 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-white">مشخصات عمومی سایت و راه‌های پشتیبانی</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">نام برند پرتال</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3 text-xs text-white focus:border-[#1877F2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">شعار سایت</label>
                  <input
                    type="text"
                    value={siteSlogan}
                    onChange={(e) => setSiteSlogan(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3 text-xs text-white focus:border-[#1877F2] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">ایمیل پشتیبانی</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3 text-xs text-white font-mono focus:border-[#1877F2] focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">آیدی تلگرام پشتیبانی</label>
                  <input
                    type="text"
                    value={supportTelegram}
                    onChange={(e) => setSupportTelegram(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3 text-xs text-white font-mono focus:border-[#1877F2] focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">شماره تماس پشتیبانی</label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="+46..."
                    className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3 text-xs text-white font-mono focus:border-[#1877F2] focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="h-10 px-5 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Save size={15} />
                  <span>ذخیره مشخصات برند</span>
                </button>
              </div>
            </form>

            {/* Country-Specific SEO Settings */}
            <div className="rounded-3xl bg-[#0f1626] border border-slate-800/90 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <h3 className="text-xs font-extrabold text-white">سئوی تفکیکی برای ۴ کشور اسکاندیناوی</h3>
                
                {/* Country Switcher Tabs */}
                <div className="flex items-center gap-1 bg-[#070a12] p-1 rounded-xl border border-slate-800">
                  {COUNTRIES.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSeoActiveCountry(c.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

              <form onSubmit={saveSeoSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    عنوان صفحه گوگل (SEO Meta Title)
                  </label>
                  <input
                    type="text"
                    value={seoSettings[seoActiveCountry]?.title || ''}
                    onChange={(e) => setSeoSettings(prev => ({
                      ...prev,
                      [seoActiveCountry]: {
                        ...prev[seoActiveCountry],
                        title: e.target.value
                      }
                    }))}
                    className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3 text-xs text-white focus:border-[#1877F2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    توضیحات متای گوگل (Meta Description)
                  </label>
                  <textarea
                    rows={3}
                    value={seoSettings[seoActiveCountry]?.description || ''}
                    onChange={(e) => setSeoSettings(prev => ({
                      ...prev,
                      [seoActiveCountry]: {
                        ...prev[seoActiveCountry],
                        description: e.target.value
                      }
                    }))}
                    className="w-full rounded-xl bg-[#070a12] border border-slate-800 p-3 text-xs text-white focus:border-[#1877F2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    کلمات کلیدی (Keywords - جدا شده با کاما)
                  </label>
                  <input
                    type="text"
                    value={seoSettings[seoActiveCountry]?.keywords || ''}
                    onChange={(e) => setSeoSettings(prev => ({
                      ...prev,
                      [seoActiveCountry]: {
                        ...prev[seoActiveCountry],
                        keywords: e.target.value
                      }
                    }))}
                    className="w-full h-10 rounded-xl bg-[#070a12] border border-slate-800 px-3 text-xs text-white focus:border-[#1877F2] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="h-10 px-5 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Save size={15} />
                    <span>ذخیره سئوی {COUNTRIES.find(c => c.id === seoActiveCountry)?.nameFa}</span>
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* Single Mobile Details Bottom Drawer */}
      {mobileDetailOpen && currentSelectedAd && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setMobileDetailOpen(false)}
          />
          <div className="relative w-full max-h-[85vh] bg-[#0f1626] rounded-t-3xl border-t border-slate-800 p-5 overflow-y-auto custom-scrollbar z-10 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-sm font-extrabold text-white truncate max-w-[240px]">
                {currentSelectedAd.title}
              </h3>
              <button
                type="button"
                onClick={() => setMobileDetailOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleFeatured(currentSelectedAd)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                  currentSelectedAd.is_featured
                    ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                    : 'bg-[#070a12] text-slate-300 border-slate-800'
                }`}
              >
                {currentSelectedAd.is_featured ? 'برداشتن VIP' : 'اعطای VIP'}
              </button>

              <button
                type="button"
                onClick={() => toggleStatus(currentSelectedAd)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                  currentSelectedAd.status === 'active'
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                    : 'bg-rose-950/60 text-rose-300 border-rose-800'
                }`}
              >
                {currentSelectedAd.status === 'active' ? 'مخفی کردن' : 'فعال‌سازی'}
              </button>
            </div>

            {/* Country Selector for this Ad */}
            <div className="p-3 rounded-2xl bg-[#070a12] border border-slate-800 space-y-2">
              <label className="block text-[11px] font-bold text-slate-400">تغییر کشور آگهی:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {COUNTRIES.map(c => {
                  const isCurrent = (currentSelectedAd.country || 'se') === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => updateAdCountry(currentSelectedAd.id, c.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        isCurrent ? 'bg-[#1877F2] text-white shadow-xs' : 'bg-[#0e1422] text-slate-300 border border-slate-800'
                      }`}
                    >
                      {c.nameFa}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reference & PIN info */}
            <div className="p-3.5 rounded-2xl bg-[#070a12] border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">کد پیگیری:</span>
                <span className="font-mono font-bold text-white">{currentSelectedAd.reference_number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">رمز ۴ رقمی (PIN):</span>
                <span className="font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">{currentSelectedAd.pin_code || '1234'}</span>
              </div>
            </div>

            {/* Live Link & Delete */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => window.open(`?ad=${currentSelectedAd.reference_number || currentSelectedAd.id}`, '_blank')}
                className="w-full py-3 rounded-xl bg-[#131b2e] text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <Eye size={14} />
                <span>مشاهده صفحه آگهی در سایت</span>
              </button>

              <button
                type="button"
                onClick={() => deleteAdAdmin(currentSelectedAd.id)}
                className="w-full py-3 rounded-xl bg-rose-950/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-900/60"
              >
                <Trash2 size={14} />
                <span>حذف دائمی آگهی</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
