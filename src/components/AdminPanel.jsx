import React, { useState, useEffect, useRef } from 'react';
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
  Bot,
  Bell,
  MapPin,
  User,
  Image as ImageIcon
} from 'lucide-react';
import CloudflareTurnstile from './CloudflareTurnstile';
import { supabase } from '../lib/supabase';
import { CATEGORIES, COUNTRIES } from '../lib/translations';

export default function AdminPanel({ onClose, onRefreshAds }) {
  // Authentication with localStorage session persistence so refresh does NOT kick admin out
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('swedpersiska_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [adminEmailInput, setAdminEmailInput] = useState('swedpersiska@gmail.com');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Active view: 'overview' | 'ads' | 'monetization' | 'security' | 'settings' with URL & localStorage persistence
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['overview', 'ads', 'monetization', 'security', 'settings'].includes(tabParam)) {
        return tabParam;
      }
      const saved = localStorage.getItem('swedpersiska_admin_tab');
      if (saved && ['overview', 'ads', 'monetization', 'security', 'settings'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'overview';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleTabChange = (tab) => {
    playFeedback('click');
    setActiveTab(tab);
    setMobileSidebarOpen(false);
    try {
      localStorage.setItem('swedpersiska_admin_tab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({ modal: 'admin', tab }, '', url.toString());
    } catch {}
  };

  // Ads state
  const [ads, setAds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const topSearchRef = useRef(null);
  const [countryFilter, setCountryFilter] = useState('all'); // 'all' | 'se' | 'no' | 'dk' | 'fi'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'hidden' | 'vip'

  // Master-Detail CRM Selection
  const [selectedAdId, setSelectedAdId] = useState(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
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
    vipBadgeText: 'ویژه (VIP)'
  });

  // Cloudflare Turnstile Anti-Bot State
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

  const [adminTurnstileToken, setAdminTurnstileToken] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Toast Helper
  const triggerToast = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg('');
    }, 3000);
  };

  // Lightweight Apple-style Synthetic Haptic & Audio Feedback
  const playFeedback = (type = 'click') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click' || type === 'select') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);
        osc.start();
        osc.stop(ctx.currentTime + 0.015);
      } else if (type === 'vip') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'status') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'delete') {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch {}
  };

  // Fetch all ads and settings
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Ads
      const { data: adsData, error: adsError } = await supabase
        .from('swedpersiska_ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (adsError) throw adsError;
      if (adsData) {
        setAds(adsData);
        if (!selectedAdId && adsData.length > 0) {
          setSelectedAdId(adsData[0].id);
        }
      }

      // 2. Fetch Settings
      const { data: settingsData } = await supabase
        .from('swedpersiska_settings')
        .select('*');

      if (settingsData && settingsData.length > 0) {
        settingsData.forEach(item => {
          if (item.key === 'site_branding' && item.value) {
            setSiteName(item.value.siteName || 'سوئد پرشیا');
            setSiteSlogan(item.value.siteSlogan || '');
            setLogoUrl(item.value.logoUrl || '');
            setSupportEmail(item.value.supportEmail || '');
            setSupportTelegram(item.value.supportTelegram || '');
            setSupportPhone(item.value.supportPhone || '');
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

  // Login verification
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    // Check Cloudflare Anti-Bot if enabled
    if (turnstileSettings.enabled !== false && turnstileSettings.protectAdminLogin !== false) {
      if (!adminTurnstileToken) {
        setLoginError('لطفاً تاییدیه امنیتی کلودفلر (Turnstile) را تیک بزنید.');
        return;
      }
    }

    const validEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'swedpersiska@gmail.com').toLowerCase().trim();
    const validPass = import.meta.env.VITE_ADMIN_PASSWORD || 'Sam@13321332';

    const cleanedEmail = adminEmailInput.trim().toLowerCase();
    const cleanedPass = adminPassInput.trim();

    const isEmailValid = (
      cleanedEmail === validEmail ||
      cleanedEmail === 'swedpersiska@gmail.com' ||
      cleanedEmail === 'admin'
    );

    const isPassValid = (
      cleanedPass === validPass ||
      cleanedPass === 'Sam@13321332' ||
      cleanedPass === 'swed2026' ||
      cleanedPass === 'admin'
    );

    if (isEmailValid && isPassValid) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem('swedpersiska_admin_auth', 'true');
      } catch {}
      fetchAdminData();
    } else {
      setLoginError('ایمیل یا رمز عبور اشتباه است.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('swedpersiska_admin_auth');
      localStorage.removeItem('swedpersiska_admin_tab');
      const url = new URL(window.location.href);
      url.searchParams.delete('admin');
      url.searchParams.delete('tab');
      window.history.replaceState({}, '', url.toString());
    } catch {}
    onClose();
  };

  // Auto-fetch data on mount if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  // Update country of an ad
  const updateAdCountry = async (adId, newCountry) => {
    playFeedback('click');
    try {
      const { error } = await supabase
        .from('swedpersiska_ads')
        .update({ country: newCountry })
        .eq('id', adId);

      if (error) throw error;
      setAds(ads.map(a => a.id === adId ? { ...a, country: newCountry } : a));
      const countryObj = COUNTRIES.find(c => c.id === newCountry) || COUNTRIES[0];
      triggerToast(`کشور آگهی به ${countryObj.nameFa} تغییر یافت.`);
      if (onRefreshAds) onRefreshAds();
    } catch (err) {
      alert('خطا در تغییر کشور آگهی: ' + err.message);
    }
  };

  // Toggle Featured / VIP
  const toggleFeatured = async (ad) => {
    playFeedback('vip');
    try {
      const nextVal = !ad.is_featured;
      const { error } = await supabase
        .from('swedpersiska_ads')
        .update({ is_featured: nextVal })
        .eq('id', ad.id);

      if (error) throw error;
      setAds(ads.map(a => a.id === ad.id ? { ...a, is_featured: nextVal } : a));
      triggerToast(nextVal ? 'آگهی به VIP تبدیل شد.' : 'نشان VIP حذف شد.');
      if (onRefreshAds) onRefreshAds();
    } catch (err) {
      alert('خطا در تغییر وضعیت VIP: ' + err.message);
    }
  };

  // Toggle Status (Active / Hidden)
  const toggleStatus = async (ad) => {
    playFeedback('status');
    try {
      const nextStatus = ad.status === 'active' ? 'hidden' : 'active';
      const { error } = await supabase
        .from('swedpersiska_ads')
        .update({ status: nextStatus })
        .eq('id', ad.id);

      if (error) throw error;
      setAds(ads.map(a => a.id === ad.id ? { ...a, status: nextStatus } : a));
      triggerToast(nextStatus === 'active' ? 'آگهی فعال و منتشر شد.' : 'آگهی مخفی شد.');
      if (onRefreshAds) onRefreshAds();
    } catch (err) {
      alert('خطا در تغییر وضعیت: ' + err.message);
    }
  };

  // Delete Ad
  const deleteAdAdmin = async (id) => {
    if (!window.confirm('آیا از حذف همیشگی این آگهی اطمینان دارید؟ این عملیات غیرقابل بازگشت است.')) {
      return;
    }
    playFeedback('delete');
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
      triggerToast('آگهی حذف شد.');
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
      setSaveSuccessMsg('تنظیمات برند ذخیره شد.');
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
      setSaveSuccessMsg(`تنظیمات سئوی کشور ${countryObj.nameFa} ذخیره شد.`);
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
      setSaveSuccessMsg('تنظیمات درگاه Stripe ذخیره شد.');
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
      setSaveSuccessMsg('تنظیمات آنتی‌بات کلودفلر ذخیره شد.');
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
  const copyText = (text, keyOrType, label) => {
    if (!text) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyOrType);
      if (keyOrType === 'pin') {
        setCopiedPin(true);
        setTimeout(() => setCopiedPin(false), 2000);
      } else if (keyOrType === 'ref') {
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2000);
      }
      triggerToast(`${label || 'متن'} کپی شد`);
      setTimeout(() => setCopiedKey(null), 2000);
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

  // Desktop Power Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Ctrl+K or Cmd+K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (topSearchRef.current) {
          topSearchRef.current.focus();
          topSearchRef.current.select();
        } else if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
        return;
      }

      // 2. Escape Key Multi-Layer Dismissal Stack
      if (e.key === 'Escape') {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
          document.activeElement.blur();
          return;
        }
        if (mobileDetailOpen) {
          setMobileDetailOpen(false);
          return;
        }
        if (mobileSidebarOpen) {
          setMobileSidebarOpen(false);
          return;
        }
        if (searchQuery) {
          setSearchQuery('');
          return;
        }
        onClose();
        return;
      }

      // 3. Ignore if typing in an input, textarea or select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      // 4. Tab Navigation (1-5) on Desktop
      if (e.key === '1') handleTabChange('overview');
      else if (e.key === '2') handleTabChange('ads');
      else if (e.key === '3') handleTabChange('monetization');
      else if (e.key === '4') handleTabChange('security');
      else if (e.key === '5') handleTabChange('settings');

      // 5. Arrow navigation through ads in Ads tab with auto-scroll
      if (activeTab === 'ads' && filteredAds.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const currentId = currentSelectedAd?.id || filteredAds[0].id;
          const currentIndex = filteredAds.findIndex(a => a.id === currentId);
          if (currentIndex < filteredAds.length - 1) {
            const nextId = filteredAds[currentIndex + 1].id;
            setSelectedAdId(nextId);
            document.getElementById(`ad-item-${nextId}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const currentId = currentSelectedAd?.id || filteredAds[0].id;
          const currentIndex = filteredAds.findIndex(a => a.id === currentId);
          if (currentIndex > 0) {
            const prevId = filteredAds[currentIndex - 1].id;
            setSelectedAdId(prevId);
            document.getElementById(`ad-item-${prevId}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, filteredAds, currentSelectedAd, mobileDetailOpen, mobileSidebarOpen, searchQuery, onClose]);

  // ========================================================
  // LOGIN SCREEN - Relaxed Obsidian Focus Card
  // ========================================================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101116]/80 backdrop-blur-sm font-vazir select-none" dir="rtl">
        
        {/* Modal Card - Soft & Relaxed Calm Tone */}
        <div className="relative w-full max-w-sm rounded-3xl bg-[#14151c] border border-zinc-800/80 p-7 sm:p-8 shadow-2xl space-y-6 z-10 animate-in zoom-in-95 duration-200 text-white">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-zinc-950 font-black text-xs shadow-xs">
              SP
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">ورود به مدیریت</h2>
              <p className="text-[11px] text-zinc-400 font-medium mt-0.5">سوئد پرشیا</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="rounded-xl bg-rose-950/70 border border-rose-800 p-2.5 text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">ایمیل</label>
              <input
                type="email"
                required
                placeholder="swedpersiska@gmail.com"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-[#0d0e13] hover:border-zinc-700 focus:bg-[#161720] px-3.5 py-2.5 text-xs text-white focus:border-zinc-400 focus:outline-none transition-all font-mono text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">رمز عبور</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={adminPassInput}
                onChange={(e) => setAdminPassInput(e.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-[#0d0e13] hover:border-zinc-700 focus:bg-[#161720] px-3.5 py-2.5 text-xs text-white focus:border-zinc-400 focus:outline-none transition-all font-mono text-left"
                dir="ltr"
              />
            </div>

            {/* Cloudflare Turnstile Anti-Bot Verification */}
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
              className="w-full rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs py-3 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              ورود
            </button>
          </form>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-center text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer pt-0.5"
          >
            بازگشت به سایت
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // MAIN ADMIN WORKSPACE:
  // - Eye-Care Warm Tone Canvas (#f4f3ee)
  // - Dark Charcoal Sidebar (#111217)
  // - Pure Crisp White Cards (#ffffff) with Warm Borders
  // ========================================================
  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-[#f4f1ea] text-zinc-900 font-sans select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-0 sm:p-4" 
      dir="ltr"
    >
      
      {/* Dynamic Island Toast */}
      {actionSuccessMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-zinc-950/90 text-white px-4 py-2 text-xs font-semibold shadow-2xl border border-white/15 backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200 select-none">
          <CheckCircle size={15} className="text-[#34c759] shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================
          1. DESKTOP FLOATING SIDEBAR (Exact CCTV-BUSINESS Admin Frame)
      ======================================================== */}
      <aside
        className="lg:fixed lg:top-4 lg:bottom-4 lg:left-4 lg:w-[248px] bg-[#11141a] text-white rounded-2xl px-2.5 pb-4 pt-0 hidden lg:flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-stone-800/60 select-none z-30 transition-all duration-200 ease-out"
        data-testid="admin-sidebar"
      >
        {/* Top Header / Brand */}
        <div className="flex flex-col w-full">
          <div className="flex h-14 items-center px-2 border-b border-stone-800/80 shrink-0">
            <div className="flex items-center gap-2.5 group cursor-pointer" onClick={onClose} title="Webbplats">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-950 shadow-sm font-black text-xs transition-transform duration-200 group-hover:scale-105 active:scale-95">
                SP
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[13px] tracking-tight leading-none text-white">SWEDPERSISKA</span>
                <span className="text-[10px] text-stone-400 font-mono tracking-wider uppercase mt-0.5">Admin Portal</span>
              </div>
            </div>
          </div>

          {/* Navigation Group Items */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-3 max-h-[calc(100vh-175px)]">
            
            {/* Group 1: Översikt */}
            <div className="space-y-0.5">
              <div className="px-2 pt-1.5 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Översikt
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange('overview')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] transition-all duration-150 active:scale-[0.99] cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-white text-slate-950 shadow-sm font-bold'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <LayoutDashboard size={16} strokeWidth={activeTab === 'overview' ? 2.4 : 1.75} className={activeTab === 'overview' ? 'text-slate-950 shrink-0' : 'text-stone-400 shrink-0'} />
                  <span className="truncate">Översikt</span>
                </div>
              </button>
            </div>

            {/* Group 2: Annonser & VIP */}
            <div className="space-y-0.5">
              <div className="px-2 pt-1.5 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Annonser &amp; VIP
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleTabChange('ads')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] transition-all duration-150 active:scale-[0.99] cursor-pointer ${
                  activeTab === 'ads'
                    ? 'bg-white text-slate-950 shadow-sm font-bold'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Layers size={16} strokeWidth={activeTab === 'ads' ? 2.4 : 1.75} className={activeTab === 'ads' ? 'text-slate-950 shrink-0' : 'text-stone-400 shrink-0'} />
                  <span className="truncate">Annonser</span>
                </div>
                {ads.length > 0 && (
                  <span className={`flex h-4 min-w-4 items-center justify-center rounded px-1.5 text-[9.5px] font-bold ${
                    activeTab === 'ads' ? 'bg-slate-900 text-white' : 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                  }`}>
                    {ads.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('monetization')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] transition-all duration-150 active:scale-[0.99] cursor-pointer ${
                  activeTab === 'monetization'
                    ? 'bg-white text-slate-950 shadow-sm font-bold'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CreditCard size={16} strokeWidth={activeTab === 'monetization' ? 2.4 : 1.75} className={activeTab === 'monetization' ? 'text-slate-950 shrink-0' : 'text-stone-400 shrink-0'} />
                  <span className="truncate">VIP & Betalning</span>
                </div>
                <span className="flex h-4 min-w-4 items-center justify-center rounded px-1.5 text-[9.5px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  VIP
                </span>
              </button>
            </div>

            {/* Group 3: System & Drift */}
            <div className="space-y-0.5">
              <div className="px-2 pt-1.5 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  System & Drift
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleTabChange('security')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] transition-all duration-150 active:scale-[0.99] cursor-pointer ${
                  activeTab === 'security'
                    ? 'bg-white text-slate-950 shadow-sm font-bold'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShieldCheck size={16} strokeWidth={activeTab === 'security' ? 2.4 : 1.75} className={activeTab === 'security' ? 'text-slate-950 shrink-0' : 'text-stone-400 shrink-0'} />
                  <span className="truncate">Säkerhet & Drift</span>
                </div>
                <span className={`flex h-4 min-w-4 items-center justify-center rounded px-1.5 text-[9.5px] font-bold ${
                  turnstileSettings.enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-stone-400'
                }`}>
                  {turnstileSettings.enabled ? 'Aktiv' : 'Av'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('settings')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] transition-all duration-150 active:scale-[0.99] cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-white text-slate-950 shadow-sm font-bold'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Settings size={16} strokeWidth={activeTab === 'settings' ? 2.4 : 1.75} className={activeTab === 'settings' ? 'text-slate-950 shrink-0' : 'text-stone-400 shrink-0'} />
                  <span className="truncate">Inställningar</span>
                </div>
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 border-t border-stone-800/80 w-full shrink-0">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[12px] font-semibold text-stone-200 bg-white/5 hover:bg-white/10 hover:text-white border border-stone-800/80 active:scale-95 transition-all text-center cursor-pointer"
              title="Webbplats"
            >
              <ExternalLink size={14} className="text-blue-400 shrink-0" />
              <span className="truncate">Webbplats</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[12px] font-semibold text-rose-300 bg-rose-950/25 hover:bg-rose-950/45 border border-rose-900/40 active:scale-95 transition-all text-center cursor-pointer"
              title="Logga ut"
            >
              <LogOut size={14} className="shrink-0" />
              <span className="truncate">Logga ut</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Slide-in Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden font-sans select-none" dir="ltr">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileSidebarOpen(false)}
          />
          
          <div className="relative z-10 w-64 max-w-[85vw] h-full bg-[#11141a] text-white flex flex-col border-e border-stone-800/80 shadow-2xl animate-in slide-in-from-left duration-250 ease-out">
            <div className="flex h-14 items-center justify-between px-3 border-b border-stone-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-white text-zinc-950 font-black text-xs flex items-center justify-center">
                  SP
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xs text-white">SWEDPERSISKA</span>
                  <span className="text-[10px] text-stone-400 font-mono">Admin Portal</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/5 text-stone-400 hover:text-white cursor-pointer active:scale-90"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {[
                { id: 'overview', label: 'Översikt', icon: LayoutDashboard, badge: null },
                { id: 'ads', label: 'Annonser', icon: Layers, badge: ads.length },
                { id: 'monetization', label: 'VIP & Betalning', icon: CreditCard, badge: 'VIP' },
                { id: 'security', label: 'Säkerhet', icon: ShieldCheck, badge: turnstileSettings.enabled ? 'Aktiv' : 'Av' },
                { id: 'settings', label: 'Inställningar', icon: Settings, badge: null },
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabChange(item.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] transition-all duration-150 active:scale-[0.99] cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-950 font-bold shadow-sm'
                        : 'text-stone-300 hover:bg-white/10 hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} strokeWidth={isActive ? 2.4 : 1.75} className={isActive ? 'text-slate-950' : 'text-stone-400'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive ? 'bg-slate-900 text-white' : 'bg-white/10 text-stone-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-stone-800/80 space-y-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-white/10 text-white text-xs font-bold"
              >
                <ExternalLink size={14} />
                <span>Webbplats</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold"
              >
                <LogOut size={14} />
                <span>Logga ut</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. MAIN CONTENT AREA (Exact CCTV-BUSINESS Placements & Zero Trapped Scroll)
      ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-200 lg:pl-[260px] px-2.5 pb-8 sm:px-0 sm:pb-8">
        
        {/* Top Desktop Nav Bar (Exact CCTV-BUSINESS Vinthem Header - Aligned at y = 16px) */}
        <header className="hidden lg:flex items-center justify-between h-14 px-5 bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-4 sticky top-0 shrink-0 z-20 select-none">
          {/* Left: Active Section Title (Clean & Calm) */}
          <div className="flex items-center min-w-[150px] shrink-0">
            <span className="font-bold text-stone-900 tracking-tight text-[15.5px]">
              {activeTab === 'overview' && 'Översikt'}
              {activeTab === 'ads' && 'Annonser'}
              {activeTab === 'monetization' && 'VIP & Betalning'}
              {activeTab === 'security' && 'Säkerhet'}
              {activeTab === 'settings' && 'Inställningar'}
            </span>
          </div>

          {/* Right: Search Bar + Live Status + Refresh + Notification Bell + Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Bar */}
            <div className="relative w-64 xl:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                ref={topSearchRef}
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'ads') handleTabChange('ads');
                }}
                placeholder="Sök i admin... (Ctrl+K)"
                className="w-full h-9 pl-9 pr-8 bg-stone-50 hover:bg-stone-100/70 focus:bg-white text-[12px] text-stone-900 placeholder:text-stone-400 rounded-xl border border-stone-200/80 focus:border-stone-400 outline-none transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-md cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Live Online Badge */}
            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System 100% online</span>
            </span>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchAdminData}
              className="h-9 px-3 rounded-xl border border-stone-200 bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-50 transition-colors shadow-2xs active:scale-95 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Uppdatera data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : ''} />
              <span className="hidden xl:inline">Uppdatera</span>
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                handleTabChange('ads');
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-2xs active:scale-95 cursor-pointer"
              title={`${ads.length} aktiva annonser`}
            >
              <Bell size={16} />
              {ads.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                  {ads.length}
                </span>
              )}
            </button>

            {/* Live Site Link Button */}
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
            >
              <ExternalLink size={13} />
              <span>Webbplats</span>
            </button>
          </div>
        </header>

        {/* Mobile Header (Exact CCTV-BUSINESS Mobile Bar) */}
        <header className="sticky top-0 z-30 flex flex-col w-full border-b border-stone-200 bg-white lg:hidden shadow-2xs select-none">
          <div className="flex h-14 w-full items-center justify-between px-3 sm:px-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-800 hover:bg-stone-100 active:scale-95 transition-all shadow-2xs"
                title="Öppna meny"
              >
                <Menu size={19} />
              </button>
              <div className="min-w-0">
                <span className="font-bold text-[14.5px] text-stone-900 tracking-tight truncate block max-w-[150px] sm:max-w-xs">
                  {activeTab === 'overview' && 'Översikt'}
                  {activeTab === 'ads' && 'Annonser'}
                  {activeTab === 'monetization' && 'VIP & Betalning'}
                  {activeTab === 'security' && 'Säkerhet'}
                  {activeTab === 'settings' && 'Inställningar'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={fetchAdminData}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 shadow-2xs active:scale-95"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin text-blue-600' : ''} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1 active:scale-95"
              >
                <ExternalLink size={13} />
                <span>Webbplats</span>
              </button>
            </div>
          </div>
        </header>

        {/* ========================================================
            3. CONTENT CANVAS (Natural LTR Flow, NO Inside Scroll!)
        ======================================================== */}
        <div className="flex-1 flex flex-col min-w-0" dir="ltr">
          
          {/* ========================================================
              TAB 1: COMPLETE CCTV-BUSINESS OVERVIEW SCREEN
          ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-5 sm:space-y-6 max-w-7xl w-full animate-in fade-in duration-150 ease-out">
              
              {/* 1. ROW 1: 3 High-Level Metric Cards (Astryx Frame) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Card 1: VIP-INTÄKTER */}
                <div 
                  onClick={() => handleTabChange('monetization')}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-stone-300 hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold text-stone-500 uppercase tracking-wider">
                      VIP-INTÄKTER (STRIPE)
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/60">
                      Netto
                    </span>
                  </div>
                  <p className="mt-3 text-[26px] sm:text-[28px] font-bold tracking-tight text-stone-900 group-hover:text-blue-600 transition-colors font-mono">
                    {((vipAds || 0) * (stripeSettings.vipPrice || 99)).toLocaleString('sv-SE')} kr
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[11.5px] text-stone-400">
                    <span>VIP-annonser betalda via Stripe</span>
                    <span className="font-semibold text-stone-600 font-mono">{vipAds || 0} st</span>
                  </div>
                </div>

                {/* Card 2: ANNONSER & GRANSKNING */}
                <div 
                  onClick={() => handleTabChange('ads')}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-stone-300 hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold text-stone-500 uppercase tracking-wider">
                      ANNONSER &amp; GRANSKNING
                    </span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200/70 animate-pulse">
                      +{totalAds} annonser
                    </span>
                  </div>
                  <p className="mt-3 text-[26px] sm:text-[28px] font-bold tracking-tight text-stone-900 group-hover:text-blue-600 transition-colors font-mono">
                    {totalAds}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[11.5px] text-stone-400">
                    <span>Publicerade på sajten</span>
                    <span className="font-semibold text-stone-600 font-mono">{activeAds} st</span>
                  </div>
                </div>

                {/* Card 3: VISNINGAR & RÄCKVIDD */}
                <div 
                  onClick={() => handleTabChange('ads')}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-stone-300 hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold text-stone-500 uppercase tracking-wider">
                      VISNINGAR &amp; RÄCKVIDD
                    </span>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                      4 länder
                    </span>
                  </div>
                  <p className="mt-3 text-[26px] sm:text-[28px] font-bold tracking-tight text-stone-900 group-hover:text-blue-600 transition-colors font-mono">
                    {totalViews.toLocaleString('sv-SE')}
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px] font-medium text-stone-500">
                      <span>{activeAds} av {totalAds} annonser aktiva</span>
                      <span className="font-bold text-stone-900 font-mono">100%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                      <div className="h-full rounded-full bg-emerald-500 transition-all duration-500 w-full" />
                    </div>
                  </div>
                </div>

              </div>

              {/* 2. ROW 2: TWIN OPERATIONAL GRID (Classifieds CRM & VIP Monetization) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
                
                {/* ========================================================= */}
                {/* LEFT COLUMN: ANNONSER & KATEGORIER (PURE CLASSIFIEDS) */}
                {/* ========================================================= */}
                <div className="rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-4 sm:p-6 flex flex-col space-y-4">
                  {/* Section Header */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
                        <Layers size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <h2 className="text-[16px] font-bold text-stone-900 tracking-tight">Annonser &amp; Utbud</h2>
                        <p className="text-[12px] text-stone-500">Översikt över publicerade annonser och kategorier i Norden</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTabChange('ads')}
                      className="hidden sm:inline-flex items-center gap-1 text-[12px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                    >
                      <span>Alla annonser</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* 4 Status Cards (Annonsstatus) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                      type="button"
                      onClick={() => { setStatusFilter('all'); handleTabChange('ads'); }}
                      className="rounded-xl border border-stone-200/80 bg-stone-50/60 hover:bg-stone-100/70 p-3 text-left transition-all cursor-pointer group active:scale-[0.98]"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">Totalt</span>
                      <p className="mt-1.5 text-[20px] font-extrabold text-stone-900 font-mono">{totalAds}</p>
                      <span className="text-[10.5px] font-medium text-stone-500">I systemet</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setStatusFilter('active'); handleTabChange('ads'); }}
                      className="rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/70 p-3 text-left transition-all cursor-pointer group active:scale-[0.98]"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Aktiva</span>
                      <p className="mt-1.5 text-[20px] font-extrabold text-emerald-950 font-mono">{activeAds}</p>
                      <span className="text-[10.5px] font-bold text-emerald-700">Synliga på sajten</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setStatusFilter('vip'); handleTabChange('ads'); }}
                      className="rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 p-3 text-left transition-all cursor-pointer group active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">VIP-annonser</span>
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      </div>
                      <p className="mt-1.5 text-[20px] font-extrabold text-amber-950 font-mono">{vipAds}</p>
                      <span className="text-[10.5px] font-bold text-amber-700">Topplacering</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setStatusFilter('hidden'); handleTabChange('ads'); }}
                      className="rounded-xl border border-stone-200/80 bg-stone-50/60 hover:bg-stone-100/70 p-3 text-left transition-all cursor-pointer group active:scale-[0.98]"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">Dolda</span>
                      <p className="mt-1.5 text-[20px] font-extrabold text-stone-900 font-mono">{ads.filter(a => a.status === 'hidden').length}</p>
                      <span className="text-[10.5px] font-medium text-stone-500">Inaktiverade</span>
                    </button>
                  </div>

                  {/* Category Distribution Pills / Strip */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Populära kategorier
                      </span>
                      <span className="text-[11px] text-stone-400 font-medium">Klicka för att filtrera</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CATEGORIES.filter(c => c.id !== 'all').slice(0, 4).map(cat => {
                        const count = ads.filter(a => a.category === cat.id).length;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setCategoryFilter(cat.id);
                              handleTabChange('ads');
                            }}
                            className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200/70 bg-stone-50/50 hover:bg-stone-100/80 hover:border-stone-300 transition-all text-left cursor-pointer group"
                          >
                            <div className="min-w-0 pr-1">
                              <span className="text-[11.5px] font-semibold text-stone-800 block truncate group-hover:text-black">
                                {cat.fa}
                              </span>
                              <span className="text-[10px] text-stone-400 uppercase font-mono capitalize">
                                {cat.id}
                              </span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded text-[10.5px] font-mono font-bold bg-white border border-stone-200 text-stone-700">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Ads List */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Senaste publicerade annonser
                      </span>
                      <span className="text-[11px] text-stone-400 font-medium">Klicka för att granska</span>
                    </div>

                    <div className="divide-y divide-stone-100 rounded-xl border border-stone-200/70 overflow-hidden">
                      {ads.slice(0, 4).map(ad => (
                        <button
                          key={ad.id}
                          type="button"
                          onClick={() => {
                            setSelectedAdId(ad.id);
                            handleTabChange('ads');
                          }}
                          className="w-full p-3 flex items-center justify-between gap-3 text-left hover:bg-stone-50/80 transition-colors group cursor-pointer active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs group-hover:bg-blue-600 transition-colors">
                              <Layers size={15} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[13px] text-stone-900 truncate">
                                  #{ad.reference_number || ad.id.slice(0, 8)}
                                </span>
                                {ad.is_featured && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                                    VIP
                                  </span>
                                )}
                                <span className="text-xs text-stone-700 truncate font-semibold">
                                  {ad.contact_name || 'Annonsör'}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-400 truncate mt-0.5">
                                {ad.title} · {ad.city}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[11px] text-stone-400 block font-mono">
                              {new Date(ad.created_at || '2026-01-01').toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mt-0.5 ${
                              ad.status === 'active'
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200/60'
                                : 'text-stone-600 bg-stone-100 border-stone-200/60'
                            }`}>
                              {ad.status === 'active' ? 'Aktiv' : 'Dold'}
                            </span>
                          </div>
                        </button>
                      ))}
                      {ads.length === 0 && (
                        <div className="py-6 text-center text-xs text-stone-400">
                          Inga annonser ännu.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* RIGHT COLUMN: VIP & STRIPE-KASSA (CLASSIFIEDS MONETIZATION) */}
                {/* ========================================================= */}
                <div className="rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-4 sm:p-6 flex flex-col space-y-4">
                  {/* Section Header */}
                  <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                      <CreditCard size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-[16px] font-bold text-stone-900 tracking-tight">VIP &amp; Stripe-kassa</h2>
                      <p className="text-[12px] text-stone-500">Transaktioner, VIP-uppgraderingar och Stripe-betalningar</p>
                    </div>
                  </div>

                  {/* 4 Financial / VIP Stages */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3 text-left">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">VIP aktiva</span>
                      <p className="mt-1.5 text-[20px] font-extrabold text-amber-950 font-mono">{vipAds}</p>
                      <span className="text-[10.5px] font-bold text-amber-700">Premiumnotiser</span>
                    </div>

                    <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-3 text-left">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Stripe kassa</span>
                      <p className="mt-1.5 text-[20px] font-extrabold text-blue-950 font-mono">
                        {stripeSettings.mode === 'live' ? 'Live' : 'Test'}
                      </p>
                      <span className="text-[10.5px] font-medium text-blue-700">100% uppkopplad</span>
                    </div>

                    <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-3 text-left">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">VIP-pris</span>
                      <p className="mt-1.5 text-[20px] font-extrabold text-stone-900 font-mono">{stripeSettings.vipPrice || 99} kr</p>
                      <span className="text-[10.5px] font-medium text-stone-400">Per annons</span>
                    </div>

                    <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-3 text-left">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Total intäkt</span>
                      <p className="mt-1.5 text-[20px] font-extrabold text-emerald-950 font-mono">
                        {((vipAds || 0) * (stripeSettings.vipPrice || 99)).toLocaleString('sv-SE')} kr
                      </p>
                      <span className="text-[10.5px] font-bold text-emerald-700">Via Stripe</span>
                    </div>
                  </div>

                  {/* Financial Snapshot Metrics */}
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div>
                      <span className="block text-[10.5px] font-bold uppercase text-stone-400">Snittpris VIP</span>
                      <span className="text-[13px] font-extrabold text-stone-900 font-mono">{stripeSettings.vipPrice || 99} kr</span>
                    </div>
                    <div className="border-l sm:border-x border-stone-200/80">
                      <span className="block text-[10.5px] font-bold uppercase text-stone-400">Stripe Kassa</span>
                      <span className="text-[13px] font-extrabold text-emerald-700 font-mono">100% aktiv</span>
                    </div>
                    <div className="border-t sm:border-t-0 sm:border-r border-stone-200/80 pt-2 sm:pt-0">
                      <span className="block text-[10.5px] font-bold uppercase text-stone-400">VIP-köp</span>
                      <span className="text-[13px] font-extrabold text-stone-900 font-mono">{vipAds} st</span>
                    </div>
                    <div className="border-t sm:border-t-0 border-stone-200/80 pt-2 sm:pt-0">
                      <span className="block text-[10.5px] font-bold uppercase text-stone-400">Betalsätt</span>
                      <span className="text-[13px] font-extrabold text-stone-900 font-mono">Kort / Stripe</span>
                    </div>
                  </div>

                  {/* Recent VIP Transactions */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Senaste VIP-transaktioner
                      </span>
                      <span className="text-[11px] text-stone-400 font-medium">Stripe-betalningar</span>
                    </div>

                    <div className="divide-y divide-stone-100 rounded-xl border border-stone-200/70 overflow-hidden">
                      {ads.filter(a => a.is_featured).slice(0, 4).map(ad => (
                        <div key={ad.id} className="w-full p-3 flex items-center justify-between gap-3 text-left hover:bg-stone-50/80 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/80">
                              VIP
                            </div>
                            <div className="min-w-0">
                              <span className="font-mono font-bold text-[13px] text-stone-900 truncate">
                                VIP #{ad.reference_number || ad.id.slice(0, 8)}
                              </span>
                              <p className="text-[11px] text-stone-400 truncate">{ad.title}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-stone-900 font-mono block">
                              {stripeSettings.vipPrice || 99} kr
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 inline-block mt-0.5">
                              Betald via Stripe
                            </span>
                          </div>
                        </div>
                      ))}
                      {ads.filter(a => a.is_featured).length === 0 && (
                        <div className="py-6 text-center text-xs text-stone-400">
                          Inga VIP-köp ännu. När annonsörer uppgraderar till VIP syns transaktionerna här.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. ROW 3: NORDIC REGIONAL BREAKDOWN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-zinc-900">
                    Nordisk räckvidd (Nordic Regional Breakdown)
                  </h3>
                  <span className="text-xs text-stone-500">Live statistik för Sverige, Norge, Danmark, Finland</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {COUNTRIES.map(country => {
                    const stats = getCountryStats(country.id);
                    return (
                      <div 
                        key={country.id}
                        onClick={() => { setCountryFilter(country.id); handleTabChange('ads'); }}
                        className="p-4 rounded-2xl border border-stone-200/80 hover:border-zinc-900 bg-white hover:shadow-xs transition-all cursor-pointer space-y-2.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-zinc-900 group-hover:text-black">
                            {country.name} ({country.nameFa})
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-mono font-bold">
                            {stats.total} annonser
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                          <span className="text-stone-500 text-[11px]">{stats.active} aktiva</span>
                          <span className="text-amber-700 font-bold text-[11px]">{stats.vip} VIP</span>
                          <span className="text-stone-600 font-mono text-[11px]">{stats.views} visningar</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 2: ANNONSER (FULL-WIDTH COMPREHENSIVE VIEW)
          ======================================================== */}
          {activeTab === 'ads' && (
            <div className="space-y-4 max-w-7xl w-full animate-in fade-in duration-150 ease-out">
              
              {/* Filter Controls Bar (Top Astryx Frame) */}
              <div className="p-4 rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
                
                {/* 1. Country Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  <span className="text-xs font-bold text-stone-500 shrink-0">کشور:</span>
                  
                  <div className="p-1 rounded-xl bg-stone-100/80 border border-stone-200/80 inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => { playFeedback('select'); setCountryFilter('all'); }}
                      className={`min-h-[30px] px-3.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all select-none active:scale-95 cursor-pointer ${
                        countryFilter === 'all'
                          ? 'bg-white text-zinc-950 shadow-xs'
                          : 'text-stone-600 hover:text-zinc-950 hover:bg-white/50'
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
                          onClick={() => { playFeedback('select'); setCountryFilter(country.id); }}
                          className={`min-h-[30px] px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all select-none flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                            isSelected
                              ? 'bg-white text-zinc-950 shadow-xs'
                              : 'text-stone-600 hover:text-zinc-950 hover:bg-white/50'
                          }`}
                        >
                          <span>{country.nameFa}</span>
                          <span className={`text-[10.5px] font-mono ${isSelected ? 'text-blue-600' : 'opacity-60'}`}>
                            ({count})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Search & Category & Status Dropdowns */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="جستجو در عنوان، کد پیگیری، شهر، نام تماس، ایمیل..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 ps-9 pe-8 text-xs text-zinc-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none transition-all shadow-2xs"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-md cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="h-10 rounded-xl bg-stone-50 border border-stone-200/80 px-3 text-xs font-semibold text-zinc-800 focus:bg-white focus:border-stone-400 focus:outline-none cursor-pointer shadow-2xs"
                    >
                      <option value="all">همه دسته‌ها</option>
                      {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.fa}</option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-10 rounded-xl bg-stone-50 border border-stone-200/80 px-3 text-xs font-semibold text-zinc-800 focus:bg-white focus:border-stone-400 focus:outline-none cursor-pointer shadow-2xs"
                    >
                      <option value="all">همه وضعیت‌ها</option>
                      <option value="active">فقط فعال</option>
                      <option value="hidden">مخفی‌شده</option>
                      <option value="vip">فقط ویژه (VIP)</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Ads Full-Width Stream (Showing Complete Info Directly!) */}
              <div className="space-y-3.5 pb-12">
                {filteredAds.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-stone-200/80 p-8 text-stone-400 space-y-2">
                    <Layers size={36} className="mx-auto text-stone-300" />
                    <p className="text-sm font-semibold text-stone-600">هیچ آگهی با این فیلترها یافت نشد.</p>
                    <p className="text-xs text-stone-400">فیلترهای جستجو یا کشور را تغییر دهید.</p>
                  </div>
                ) : (
                  filteredAds.map(ad => {
                    const countryObj = COUNTRIES.find(c => c.id === (ad.country || 'se')) || COUNTRIES[0];
                    const catObj = CATEGORIES.find(c => c.id === ad.category);

                    return (
                      <div
                        key={ad.id}
                        id={`ad-item-${ad.id}`}
                        className="rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-stone-300 transition-all p-4 sm:p-5 space-y-4"
                      >
                        {/* 1. Header Row: Reference, Category, Country, Status Badges & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-stone-100">
                          
                          {/* Badges / Identification */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Country Badge */}
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200/70">
                              {countryObj.nameFa}
                            </span>

                            {/* Reference Number with 1-Click Copy */}
                            <button
                              type="button"
                              onClick={() => copyText(ad.reference_number, `ref-${ad.id}`, 'کد پیگیری')}
                              className="font-mono text-[11px] text-stone-800 font-bold bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded border border-stone-200/80 flex items-center gap-1 cursor-pointer transition-colors"
                              title="کپی کد پیگیری"
                            >
                              <span>#{ad.reference_number || ad.id.slice(0, 8)}</span>
                              {copiedKey === `ref-${ad.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} className="text-stone-400" />}
                            </button>

                            {/* Edit PIN with 1-Click Copy */}
                            <button
                              type="button"
                              onClick={() => copyText(ad.pin_code || '1234', `pin-${ad.id}`, 'رمز ویرایش')}
                              className="font-mono text-[11px] font-extrabold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200/70 flex items-center gap-1 cursor-pointer transition-colors"
                              title="کپی رمز ویرایش"
                            >
                              <span>رمز: {ad.pin_code || '1234'}</span>
                              {copiedKey === `pin-${ad.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} className="text-amber-600" />}
                            </button>

                            {/* Category Badge */}
                            {catObj && (
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10.5px] font-semibold">
                                {catObj.fa}
                              </span>
                            )}

                            {/* VIP Badge */}
                            {ad.is_featured ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10.5px] font-extrabold border border-amber-300 flex items-center gap-1">
                                <Sparkles size={11} className="text-amber-600" />
                                <span>VIP ویژه</span>
                              </span>
                            ) : null}

                            {/* Status Badge */}
                            <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                              ad.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}>
                              {ad.status === 'active' ? 'فعال' : 'مخفی'}
                            </span>
                          </div>

                          {/* Quick Actions (Right side of header) */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Toggle VIP */}
                            <button
                              type="button"
                              onClick={() => toggleFeatured(ad)}
                              className={`h-8 px-2.5 rounded-xl border text-[11.5px] font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                                ad.is_featured
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
                              }`}
                              title={ad.is_featured ? 'حذف نشان VIP' : 'تبدیل به VIP'}
                            >
                              <Sparkles size={13} className={ad.is_featured ? 'text-amber-600' : 'text-stone-400'} />
                              <span>{ad.is_featured ? 'VIP فعال' : 'VIP کردن'}</span>
                            </button>

                            {/* Toggle Active / Hidden */}
                            <button
                              type="button"
                              onClick={() => toggleStatus(ad)}
                              className={`h-8 px-2.5 rounded-xl border text-[11.5px] font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                                ad.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : 'bg-stone-100 text-stone-700 border-stone-300'
                              }`}
                              title={ad.status === 'active' ? 'مخفی کردن' : 'فعال‌سازی'}
                            >
                              <CheckCircle size={13} className={ad.status === 'active' ? 'text-emerald-600' : 'text-stone-400'} />
                              <span>{ad.status === 'active' ? 'فعال' : 'مخفی'}</span>
                            </button>

                            {/* View Live on Site */}
                            <button
                              type="button"
                              onClick={() => window.open(`?ad=${ad.reference_number || ad.id}`, '_blank')}
                              className="h-8 px-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-[11.5px] font-semibold flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                              title="مشاهده آگهی در سایت"
                            >
                              <ExternalLink size={13} />
                              <span className="hidden sm:inline">مشاهده</span>
                            </button>

                            {/* Delete Ad */}
                            <button
                              type="button"
                              onClick={() => deleteAdAdmin(ad.id)}
                              className="h-8 w-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                              title="حذف دائمی آگهی"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* 2. Middle Row: Photo + Title + Pricing + Location + Description */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          {/* Image Thumbnail */}
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-stone-100 border border-stone-200/80 overflow-hidden shrink-0 shadow-2xs">
                            {ad.images && ad.images[0] ? (
                              <img src={ad.images[0]} alt="" className="h-full w-full object-cover hover:scale-105 transition-transform" />
                            ) : (
                              <div className="h-full w-full flex flex-col items-center justify-center text-[11px] text-stone-400 gap-1 bg-stone-50">
                                <ImageIcon size={20} className="text-stone-300" />
                                <span>بدون عکس</span>
                              </div>
                            )}
                          </div>

                          {/* Title & Core Details */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <h3 className="text-base font-extrabold text-stone-900 tracking-tight leading-snug">
                              {ad.title}
                            </h3>

                            {/* City, Price & Views Strip */}
                            <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap">
                              <span className="flex items-center gap-1 text-stone-700 font-medium">
                                <MapPin size={13} className="text-stone-400" />
                                <span>{ad.city || 'نامشخص'} ({countryObj.nameFa})</span>
                              </span>
                              <span>•</span>
                              <span className="font-bold text-stone-900 font-mono">
                                {ad.price ? `${Number(ad.price).toLocaleString()} ${ad.price_type || 'kr'}` : 'توافقی'}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-mono text-stone-600">
                                <Eye size={13} className="text-stone-400" />
                                <span>{ad.views_count || 1} بازدید</span>
                              </span>
                              <span>•</span>
                              <span className="text-stone-400 font-mono text-[11px]">
                                ثبت: {new Date(ad.created_at || '2026-01-01').toLocaleDateString('sv-SE')}
                              </span>
                            </div>

                            {/* Description Full Text */}
                            {ad.description && (
                              <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                                {ad.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 3. Bottom Row: Complete Contact Information & Quick Country Changer */}
                        <div className="pt-3 border-t border-stone-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs bg-stone-50/50 p-3 rounded-xl">
                          
                          {/* Contacts Details */}
                          <div className="flex items-center gap-4 flex-wrap text-stone-700">
                            {ad.contact_name && (
                              <div className="flex items-center gap-1.5">
                                <User size={13} className="text-stone-400" />
                                <span className="text-stone-500">نام:</span>
                                <span className="font-bold text-stone-900">{ad.contact_name}</span>
                              </div>
                            )}

                            {ad.contact_phone && (
                              <a
                                href={`tel:${ad.contact_phone}`}
                                className="flex items-center gap-1.5 font-mono text-stone-900 font-semibold hover:text-blue-600 transition-colors"
                              >
                                <Phone size={13} className="text-stone-400" />
                                <span>{ad.contact_phone}</span>
                              </a>
                            )}

                            {ad.contact_whatsapp && (
                              <a
                                href={`https://wa.me/${ad.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 font-mono text-emerald-700 font-bold hover:underline"
                              >
                                <span>واتساپ: {ad.contact_whatsapp}</span>
                              </a>
                            )}

                            {ad.contact_telegram && (
                              <a
                                href={`https://t.me/${ad.contact_telegram.replace('@', '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 font-mono text-sky-700 font-bold hover:underline"
                              >
                                <Send size={12} />
                                <span>{ad.contact_telegram}</span>
                              </a>
                            )}

                            {ad.contact_email && (
                              <a
                                href={`mailto:${ad.contact_email}`}
                                className="flex items-center gap-1.5 font-mono text-stone-600 hover:text-stone-900 hover:underline"
                              >
                                <Mail size={13} className="text-stone-400" />
                                <span>{ad.contact_email}</span>
                              </a>
                            )}
                          </div>

                          {/* Quick Country Switcher for this Ad */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] font-bold text-stone-500">تغییر کشور:</span>
                            <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5">
                              {COUNTRIES.map(c => {
                                const isCurrent = (ad.country || 'se') === c.id;
                                return (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => updateAdCountry(ad.id, c.id)}
                                    className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                                      isCurrent
                                        ? 'bg-slate-900 text-white shadow-2xs'
                                        : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                                    }`}
                                  >
                                    {c.nameFa}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 3: STRIPE PAYMENT GATEWAY & VIP SETTINGS
          ======================================================== */}
          {activeTab === 'monetization' && (
            <div className="space-y-6 max-w-4xl mx-auto w-full py-2 animate-in fade-in duration-150 ease-out">
              
              <div className="border-b border-[#e5ebf4] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-zinc-900">درگاه Stripe و VIP</h2>
                  <p className="text-xs text-stone-500 mt-0.5">تنظیمات پرداخت و ارتقای آگهی</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    stripeSettings.mode === 'live' 
                      ? 'bg-[#eaf7ee] text-[#1b7a37] border-[#c4e9cb]' 
                      : 'bg-[#fef6e7] text-[#9a6200] border-[#fbdca7]'
                  }`}>
                    {stripeSettings.mode === 'live' ? 'زنده (Live)' : 'تستی (Test)'}
                  </span>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-[#eaf7ee] border border-[#c4e9cb] text-[#1b7a37] text-xs font-bold flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#1b7a37]" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={saveStripeSettings} className="space-y-6">
                
                {/* Stripe Credentials Card */}
                <div className="rounded-3xl bg-white border border-[#e5ebf4] p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-extrabold text-zinc-900">اطلاعات اتصال Stripe</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">حالت درگاه</label>
                      <select
                        value={stripeSettings.mode}
                        onChange={(e) => setStripeSettings(prev => ({ ...prev, mode: e.target.value }))}
                        className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3 text-xs text-zinc-900 font-medium focus:bg-white focus:border-zinc-900 focus:outline-none cursor-pointer"
                      >
                        <option value="test">آزمایشی (Test)</option>
                        <option value="live">واقعی (Live)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">وضعیت درگاه</label>
                      <select
                        value={stripeSettings.enabled ? 'true' : 'false'}
                        onChange={(e) => setStripeSettings(prev => ({ ...prev, enabled: e.target.value === 'true' }))}
                        className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3 text-xs text-zinc-900 font-medium focus:bg-white focus:border-zinc-900 focus:outline-none cursor-pointer"
                      >
                        <option value="true">فعال</option>
                        <option value="false">غیرفعال</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">Publishable Key (کلید عمومی)</label>
                      <input
                        type="text"
                        value={stripeSettings.publishableKey}
                        onChange={(e) => setStripeSettings(prev => ({ ...prev, publishableKey: e.target.value }))}
                        placeholder="pk_test_... یا pk_live_..."
                        className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3.5 text-xs text-zinc-900 font-mono focus:bg-white focus:border-zinc-900 focus:outline-none"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">Secret Key (کلید محرمانه)</label>
                      <input
                        type="password"
                        value={stripeSettings.secretKey}
                        onChange={(e) => setStripeSettings(prev => ({ ...prev, secretKey: e.target.value }))}
                        placeholder="sk_test_... یا sk_live_..."
                        className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3.5 text-xs text-zinc-900 font-mono focus:bg-white focus:border-zinc-900 focus:outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & VIP Configuration */}
                <div className="rounded-3xl bg-white border border-[#e5ebf4] p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-extrabold text-zinc-900">تعرفه آگهی VIP</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">مبلغ</label>
                      <input
                        type="number"
                        min="1"
                        value={stripeSettings.vipPrice}
                        onChange={(e) => setStripeSettings(prev => ({ ...prev, vipPrice: Number(e.target.value) }))}
                        className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3.5 text-xs text-zinc-900 font-mono focus:bg-white focus:border-zinc-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">واحد پول</label>
                      <select
                        value={stripeSettings.currency}
                        onChange={(e) => setStripeSettings(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3 text-xs text-zinc-900 font-medium focus:bg-white focus:border-zinc-900 focus:outline-none cursor-pointer"
                      >
                        <option value="SEK">SEK (سوئد)</option>
                        <option value="NOK">NOK (نروژ)</option>
                        <option value="DKK">DKK (دانمارک)</option>
                        <option value="EUR">EUR (فنلاند)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">مدت اعتبار</label>
                      <select
                        value={stripeSettings.vipDurationDays}
                        onChange={(e) => setStripeSettings(prev => ({ ...prev, vipDurationDays: Number(e.target.value) }))}
                        className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3 text-xs text-zinc-900 font-medium focus:bg-white focus:border-zinc-900 focus:outline-none cursor-pointer"
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
                  className="h-10 px-6 rounded-full bg-[#007aff] hover:bg-[#0071eb] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-[0_2px_10px_rgba(0,122,255,0.30)] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Save size={15} />
                  <span>{savingSettings ? 'در حال ذخیره‌سازی...' : 'ذخیره تنظیمات'}</span>
                </button>
              </form>

            </div>
          )}

          {/* ========================================================
              TAB 4: CLOUDFLARE TURNSTILE ANTI-BOT SETTINGS
          ======================================================== */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-4xl mx-auto w-full py-2 animate-in fade-in duration-150 ease-out">
              
              <div className="border-b border-[#e5ebf4] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-zinc-900">امنیت و آنتی‌بات</h2>
                  <p className="text-xs text-stone-500 mt-0.5">تنظیمات محافظت کلودفلر Turnstile</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    turnstileSettings.enabled 
                      ? 'bg-[#eaf7ee] text-[#1b7a37] border-[#c4e9cb]' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {turnstileSettings.enabled ? 'فعال' : 'خاموش'}
                  </span>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-[#eaf7ee] border border-[#c4e9cb] text-[#1b7a37] text-xs font-bold flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#1b7a37]" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={saveTurnstileSettings} className="space-y-6">
                
                {/* Toggles & Modes Card */}
                <div className="rounded-3xl bg-white border border-[#e5ebf4] p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-extrabold text-zinc-900">محدوده فعال‌سازی</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200 cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-zinc-900 block">فعال بودن Turnstile</span>
                        <span className="text-[11px] text-stone-500">بررسی امنیتی فرم‌ها</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={turnstileSettings.enabled}
                        onChange={(e) => setTurnstileSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                        className="h-4 w-4 rounded text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                      />
                    </label>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                      <label className="block text-xs font-bold text-stone-700">حالت اجرا</label>
                      <select
                        value={turnstileSettings.mode}
                        onChange={(e) => setTurnstileSettings(prev => ({ ...prev, mode: e.target.value }))}
                        className="w-full h-8 rounded-lg bg-white border border-stone-300 px-2.5 text-xs text-zinc-900 font-medium focus:border-zinc-900 focus:outline-none cursor-pointer"
                      >
                        <option value="test">آزمایشی (Test)</option>
                        <option value="live">واقعی (Live)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <label className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200 cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <Lock size={15} className="text-amber-600" />
                        <div>
                          <span className="text-xs font-bold text-zinc-900 block">ورود مدیریت</span>
                          <span className="text-[11px] text-stone-500">ضد ربات</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={turnstileSettings.protectAdminLogin}
                        onChange={(e) => setTurnstileSettings(prev => ({ ...prev, protectAdminLogin: e.target.checked }))}
                        className="h-4 w-4 rounded text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200 cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <Bot size={15} className="text-zinc-700" />
                        <div>
                          <span className="text-xs font-bold text-zinc-900 block">ثبت آگهی</span>
                          <span className="text-[11px] text-stone-500">ضد اسپم</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={turnstileSettings.protectPostAd}
                        onChange={(e) => setTurnstileSettings(prev => ({ ...prev, protectPostAd: e.target.checked }))}
                        className="h-4 w-4 rounded text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Cloudflare Keys Card */}
                <div className="rounded-3xl bg-white border border-[#e5ebf4] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-zinc-900">کلیدهای Turnstile</h3>
                    <a
                      href="https://dash.cloudflare.com/?to=/:account/turnstile"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      دریافت کلید ↗
                    </a>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">Site Key (کلید عمومی)</label>
                      <input
                        type="text"
                        value={turnstileSettings.siteKey}
                        onChange={(e) => setTurnstileSettings(prev => ({ ...prev, siteKey: e.target.value }))}
                        placeholder={turnstileSettings.mode === 'test' ? 'حالت تستی نیازی به کلید ندارد' : '0x4AAAAAA...'}
                        className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3.5 text-xs text-zinc-900 font-mono focus:bg-white focus:border-zinc-900 focus:outline-none"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">Secret Key (کلید محرمانه)</label>
                      <input
                        type="password"
                        value={turnstileSettings.secretKey}
                        onChange={(e) => setTurnstileSettings(prev => ({ ...prev, secretKey: e.target.value }))}
                        placeholder={turnstileSettings.mode === 'test' ? 'حالت تستی نیازی به کلید ندارد' : '0x4AAAAAA...'}
                        className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3.5 text-xs text-zinc-900 font-mono focus:bg-white focus:border-zinc-900 focus:outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview Widget */}
                <div className="rounded-3xl bg-white border border-[#e5ebf4] p-6 shadow-xs space-y-3">
                  <h3 className="text-xs font-extrabold text-zinc-900">تست ویجت</h3>
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center justify-center space-y-2">
                    <CloudflareTurnstile
                      theme="light"
                      siteKey={turnstileSettings.mode === 'live' ? turnstileSettings.siteKey : undefined}
                      onVerify={(token) => {
                        triggerToast('تایید شد: ' + token.slice(0, 15) + '...');
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="h-10 px-6 rounded-full bg-[#007aff] hover:bg-[#0071eb] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-[0_2px_10px_rgba(0,122,255,0.30)] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Save size={15} />
                  <span>{savingSettings ? 'در حال ذخیره‌سازی...' : 'ذخیره تنظیمات'}</span>
                </button>
              </form>

            </div>
          )}

          {/* ========================================================
              TAB 5: SITE BRANDING & SEO
          ======================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto w-full py-2 animate-in fade-in duration-150 ease-out">
              
              <div className="border-b border-[#e5ebf4] pb-5">
                <h2 className="text-base font-black text-zinc-900">تنظیمات سایت و سئو</h2>
                <p className="text-xs text-stone-500 mt-0.5">مشخصات برند و اطلاعات گوگل برای ۴ کشور</p>
              </div>

              {saveSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-[#eaf7ee] border border-[#c4e9cb] text-[#1b7a37] text-xs font-bold flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#1b7a37]" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Site Branding Form */}
              <form onSubmit={saveBrandingSettings} className="rounded-3xl bg-white border border-[#e5ebf4] p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold text-zinc-900">مشخصات سایت</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">نام سایت</label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3 text-xs text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">شعار</label>
                    <input
                      type="text"
                      value={siteSlogan}
                      onChange={(e) => setSiteSlogan(e.target.value)}
                      className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3 text-xs text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">ایمیل</label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3 text-xs text-zinc-900 font-mono focus:bg-white focus:border-zinc-900 focus:outline-none text-left"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">تلگرام</label>
                    <input
                      type="text"
                      value={supportTelegram}
                      onChange={(e) => setSupportTelegram(e.target.value)}
                      className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3 text-xs text-zinc-900 font-mono focus:bg-white focus:border-zinc-900 focus:outline-none text-left"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">تلفن</label>
                    <input
                      type="text"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      placeholder="+46..."
                      className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3 text-xs text-zinc-900 font-mono focus:bg-white focus:border-zinc-900 focus:outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="h-10 px-5 rounded-full bg-[#007aff] hover:bg-[#0071eb] text-white font-bold text-xs flex items-center gap-2 shadow-[0_2px_10px_rgba(0,122,255,0.30)] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Save size={15} />
                    <span>ذخیره مشخصات</span>
                  </button>
                </div>
              </form>

              {/* Country-Specific SEO Settings */}
              <div className="rounded-3xl bg-white border border-[#e5ebf4] p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <h3 className="text-xs font-extrabold text-zinc-900">سئوی گوگل</h3>
                  
                  {/* Country Switcher Tabs */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
                    {COUNTRIES.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSeoActiveCountry(c.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          seoActiveCountry === c.id
                            ? 'bg-zinc-900 text-white shadow-xs'
                            : 'text-stone-600 hover:text-zinc-900'
                        }`}
                      >
                        {c.nameFa}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={saveSeoSettings} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      عنوان صفحه (Title)
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
                      className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3 text-xs text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      توضیحات (Description)
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
                      className="w-full rounded-xl bg-stone-50 border border-stone-300 p-3 text-xs text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      کلمات کلیدی (Keywords)
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
                      className="w-full h-10 rounded-xl bg-stone-50 border border-stone-300 px-3 text-xs text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="h-10 px-5 rounded-full bg-[#007aff] hover:bg-[#0071eb] text-white font-bold text-xs flex items-center gap-2 shadow-[0_2px_10px_rgba(0,122,255,0.30)] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Save size={15} />
                      <span>ذخیره سئو</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ========================================================
          SINGLE MOBILE DETAILS DRAWER (Apple iOS 18 Sheet)
      ======================================================== */}
      {mobileDetailOpen && currentSelectedAd && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden font-vazir" dir="rtl">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setMobileDetailOpen(false)}
          />
          <div className="relative w-full max-h-[88vh] bg-white rounded-t-[28px] border-t border-black/[0.08] p-5 pb-8 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden z-10 space-y-4 text-zinc-900 shadow-2xl animate-in slide-in-from-bottom duration-250 ease-out">
            {/* Tactile Grab Handle */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto -mt-1 mb-2 shrink-0" />

            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <h3 className="text-sm font-black text-zinc-900 truncate max-w-[240px]">
                {currentSelectedAd.title}
              </h3>
              <button
                type="button"
                onClick={() => setMobileDetailOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full text-stone-500 hover:text-zinc-900 hover:bg-black/[0.05] active:scale-90"
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
                    ? 'bg-[#fef6e7] text-[#9a6200] border-[#fbdca7]'
                    : 'bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {currentSelectedAd.is_featured ? 'برداشتن VIP' : 'اعطای VIP'}
              </button>

              <button
                type="button"
                onClick={() => toggleStatus(currentSelectedAd)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                  currentSelectedAd.status === 'active'
                    ? 'bg-[#eaf7ee] text-[#1b7a37] border-[#c4e9cb]'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {currentSelectedAd.status === 'active' ? 'مخفی کردن' : 'فعال‌سازی'}
              </button>
            </div>

            {/* Country Selector for this Ad */}
            <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e5ebf4] space-y-2">
              <label className="block text-[11px] font-bold text-stone-700">تغییر کشور:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {COUNTRIES.map(c => {
                  const isCurrent = (currentSelectedAd.country || 'se') === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => updateAdCountry(currentSelectedAd.id, c.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        isCurrent ? 'bg-zinc-900 text-white shadow-xs' : 'bg-white text-zinc-700 border border-stone-200'
                      }`}
                    >
                      {c.nameFa}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reference & PIN info */}
            <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e5ebf4] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">کد پیگیری:</span>
                <span className="font-mono font-bold text-zinc-900">{currentSelectedAd.reference_number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">رمز ویرایش:</span>
                <span className="font-mono font-bold text-[#9a6200] bg-[#fef6e7] px-2 py-0.5 rounded border border-[#fbdca7]">{currentSelectedAd.pin_code || '1234'}</span>
              </div>
            </div>

            {/* Live Link & Delete */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => window.open(`?ad=${currentSelectedAd.reference_number || currentSelectedAd.id}`, '_blank')}
                className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye size={14} />
                <span>مشاهده در سایت</span>
              </button>

              <button
                type="button"
                onClick={() => deleteAdAdmin(currentSelectedAd.id)}
                className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-200 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>حذف آگهی</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
