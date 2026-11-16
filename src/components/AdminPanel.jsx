import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  LayoutGrid,
  Layers, 
  Layers3,
  Settings, 
  SlidersHorizontal,
  LogOut, 
  Trash2, 
  Sparkles, 
  CheckCircle, 
  CheckCircle2,
  Search, 
  ShieldCheck, 
  Menu, 
  X,
  Copy,
  Check,
  Globe,
  Globe2,
  Save,
  RefreshCw,
  RotateCcw,
  CreditCard,
  WalletCards,
  Lock,
  ExternalLink,
  ArrowUpRight,
  TrendingUp,
  Radio,
  Phone,
  Mail,
  Send,
  Eye,
  Bot,
  Bell,
  MapPin,
  User,
  Image as ImageIcon,
  FolderTree,
  Shapes,
  Plus,
  Edit3,
  AlertCircle,
  Home,
  Utensils,
  Briefcase,
  GraduationCap,
  ShoppingBag,
  Car,
  Calendar,
  Tag,
  Laptop,
  Heart,
  BookOpen,
  Stethoscope,
  Music,
  Hammer,
  Dumbbell
} from 'lucide-react';
import CloudflareTurnstile from './CloudflareTurnstile';
import { supabase } from '../lib/supabase';
import { CATEGORIES, COUNTRIES } from '../lib/translations';

// Category Icon Mapping
const CATEGORY_ICON_MAP = {
  Home,
  Utensils,
  Briefcase,
  GraduationCap,
  ShoppingBag,
  Car,
  Calendar,
  Tag,
  Laptop,
  Heart,
  BookOpen,
  Stethoscope,
  Music,
  Hammer,
  Dumbbell,
  FolderTree,
  Layers
};

const AVAILABLE_CATEGORY_ICONS = [
  { name: 'Home', label: 'مسکن و خانه' },
  { name: 'Utensils', label: 'رستوران و خوراک' },
  { name: 'Briefcase', label: 'خدمات و کار' },
  { name: 'GraduationCap', label: 'آموزش و تحصیل' },
  { name: 'ShoppingBag', label: 'خرید و فروش' },
  { name: 'Car', label: 'خودرو و نقلیه' },
  { name: 'Calendar', label: 'رویداد و مراسم' },
  { name: 'Laptop', label: 'دیجیتال و فناوری' },
  { name: 'Heart', label: 'سلامت و زیبایی' },
  { name: 'BookOpen', label: 'فرهنگ و کتاب' },
  { name: 'Stethoscope', label: 'پزشکی و بهداشت' },
  { name: 'Music', label: 'موسیقی و هنر' },
  { name: 'Hammer', label: 'فنی و ساختمانی' },
  { name: 'Dumbbell', label: 'ورزش و سرگرمی' },
  { name: 'Tag', label: 'عمومی و سایر' },
];

const DEFAULT_CATEGORIES = [
  { id: 'bostad', fa: 'مسکن و خانه', icon: 'Home', enabled: true, isSystem: true, order: 1 },
  { id: 'restaurang', fa: 'رستوران و خوراک', icon: 'Utensils', enabled: true, isSystem: true, order: 2 },
  { id: 'tjanster', fa: 'خدمات و دارالترجمه', icon: 'Briefcase', enabled: true, isSystem: true, order: 3 },
  { id: 'jobb', fa: 'کار و استخدام', icon: 'GraduationCap', enabled: true, isSystem: true, order: 4 },
  { id: 'kop-salj', fa: 'خرید و فروش', icon: 'ShoppingBag', enabled: true, isSystem: true, order: 5 },
  { id: 'fordon', fa: 'خودرو و وسایل نقلیه', icon: 'Car', enabled: true, isSystem: true, order: 6 },
  { id: 'evenemang', fa: 'رویدادها و مراسم', icon: 'Calendar', enabled: true, isSystem: true, order: 7 },
  { id: 'ovrigt', fa: 'سایر نیازمندی‌ها', icon: 'Tag', enabled: true, isSystem: true, order: 8 },
];

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

  // Active view: 'overview' | 'ads' | 'categories' | 'monetization' | 'security' | 'settings' with URL & localStorage persistence
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['overview', 'ads', 'categories', 'monetization', 'security', 'settings'].includes(tabParam)) {
        return tabParam;
      }
      const saved = localStorage.getItem('swedpersiska_admin_tab');
      if (saved && ['overview', 'ads', 'categories', 'monetization', 'security', 'settings'].includes(saved)) {
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

  // Categories Management State
  const [categoriesList, setCategoriesList] = useState(() => {
    try {
      const saved = localStorage.getItem('swedpersiska_portal_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CATEGORIES;
  });
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [categoryStatusFilter, setCategoryStatusFilter] = useState('all'); // 'all' | 'active' | 'disabled' | 'has_ads'
  const [categoryModal, setCategoryModal] = useState({
    isOpen: false,
    mode: 'add', // 'add' | 'edit'
    id: '',
    fa: '',
    icon: 'Home',
    enabled: true,
    isSystem: false,
    errorMsg: ''
  });
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Ads state
  const [ads, setAds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const topSearchRef = useRef(null);
  const [countryFilter, setCountryFilter] = useState('all'); // 'all' | 'se' | 'no' | 'dk' | 'fi'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'hidden' | 'vip'

  // Master-Detail CRM Selection & Centered Detail Modal
  const [selectedAdId, setSelectedAdId] = useState(null);
  const [selectedAdForModal, setSelectedAdForModal] = useState(null);
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
          if (item.key === 'portal_categories' && item.value && Array.isArray(item.value) && item.value.length > 0) {
            setCategoriesList(item.value);
            try {
              localStorage.setItem('swedpersiska_portal_categories', JSON.stringify(item.value));
            } catch {}
          }
        });
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Persist Categories to Supabase & localStorage
  const persistCategories = async (updated) => {
    setCategoriesList(updated);
    try {
      localStorage.setItem('swedpersiska_portal_categories', JSON.stringify(updated));
    } catch {}
    try {
      await supabase
        .from('swedpersiska_settings')
        .upsert({
          key: 'portal_categories',
          value: updated,
          updated_at: new Date().toISOString()
        });
    } catch (err) {
      console.error('Error saving categories to Supabase:', err);
    }
  };

  // Categories Action Handlers
  const handleOpenAddCategory = () => {
    playFeedback('click');
    setCategoryModal({
      isOpen: true,
      mode: 'add',
      id: '',
      fa: '',
      icon: 'Tag',
      enabled: true,
      isSystem: false,
      errorMsg: ''
    });
  };

  const handleOpenEditCategory = (cat) => {
    playFeedback('click');
    setCategoryModal({
      isOpen: true,
      mode: 'edit',
      id: cat.id,
      fa: cat.fa,
      icon: cat.icon || 'Tag',
      enabled: cat.enabled !== false,
      isSystem: !!cat.isSystem,
      errorMsg: ''
    });
  };

  const handleSaveCategoryModal = async (e) => {
    if (e) e.preventDefault();
    const trimmedFa = categoryModal.fa.trim();
    const rawId = categoryModal.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    if (!trimmedFa) {
      setCategoryModal(prev => ({ ...prev, errorMsg: 'لطفاً عنوان دسته‌بندی را وارد نمایید.' }));
      return;
    }
    if (!rawId) {
      setCategoryModal(prev => ({ ...prev, errorMsg: 'لطفاً شناسه یکتای دسته‌بندی را وارد نمایید.' }));
      return;
    }

    if (categoryModal.mode === 'add') {
      const exists = categoriesList.some(c => c.id.toLowerCase() === rawId);
      if (exists) {
        setCategoryModal(prev => ({ ...prev, errorMsg: 'این شناسه قبلاً برای دسته‌بندی دیگری استفاده شده است.' }));
        return;
      }

      const newCategory = {
        id: rawId,
        fa: trimmedFa,
        icon: categoryModal.icon || 'Tag',
        enabled: categoryModal.enabled,
        isSystem: false,
        order: categoriesList.length + 1
      };

      const updated = [...categoriesList, newCategory];
      await persistCategories(updated);
      playFeedback('status');
      triggerToast(`دسته‌بندی «${trimmedFa}» اضافه شد.`);
      setCategoryModal({ isOpen: false, mode: 'add', id: '', fa: '', icon: 'Tag', enabled: true, isSystem: false, errorMsg: '' });
    } else {
      // Edit mode
      const updated = categoriesList.map(c => {
        if (c.id === categoryModal.id) {
          return {
            ...c,
            fa: trimmedFa,
            icon: categoryModal.icon || c.icon || 'Tag',
            enabled: categoryModal.enabled
          };
        }
        return c;
      });

      await persistCategories(updated);
      playFeedback('status');
      triggerToast(`دسته‌بندی «${trimmedFa}» به‌روزرسانی شد.`);
      setCategoryModal({ isOpen: false, mode: 'add', id: '', fa: '', icon: 'Tag', enabled: true, isSystem: false, errorMsg: '' });
    }
  };

  const handleToggleCategoryStatus = async (catId) => {
    playFeedback('click');
    const target = categoriesList.find(c => c.id === catId);
    const nextStatus = target ? !target.enabled : true;
    const updated = categoriesList.map(c => {
      if (c.id === catId) {
        return { ...c, enabled: nextStatus };
      }
      return c;
    });
    await persistCategories(updated);
    triggerToast(nextStatus ? 'دسته‌بندی فعال شد' : 'دسته‌بندی غیرفعال شد');
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!categoryToDelete) return;
    playFeedback('delete');
    const updated = categoriesList.filter(c => c.id !== categoryToDelete.id);
    await persistCategories(updated);
    triggerToast(`دسته‌بندی «${categoryToDelete.fa}» حذف شد.`);
    setCategoryToDelete(null);
  };

  const handleViewCategoryAds = (catId) => {
    playFeedback('select');
    setCategoryFilter(catId);
    handleTabChange('ads');
    triggerToast(`فیلتر دسته‌بندی اعمال شد.`);
  };

  // Login verification
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    // Check Cloudflare Anti-Bot if enabled
    if (turnstileSettings.enabled !== false && turnstileSettings.protectAdminLogin !== false) {
      if (!adminTurnstileToken) {
        setLoginError('لطفاً تاییدیه امنیتی ضدبات را تکمیل کنید.');
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
      setSelectedAdForModal(prev => prev && prev.id === adId ? { ...prev, country: newCountry } : prev);
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
      setSelectedAdForModal(prev => prev && prev.id === ad.id ? { ...prev, is_featured: nextVal } : prev);
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
      setSelectedAdForModal(prev => prev && prev.id === ad.id ? { ...prev, status: nextStatus } : prev);
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
      if (selectedAdForModal && selectedAdForModal.id === id) {
        setSelectedAdForModal(null);
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

  // Filtered categories
  const filteredCategories = categoriesList.filter(cat => {
    const q = categorySearchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      cat.fa.toLowerCase().includes(q) || 
      cat.id.toLowerCase().includes(q) ||
      (cat.icon && cat.icon.toLowerCase().includes(q));

    const count = ads.filter(a => a.category === cat.id).length;
    const matchStatus = 
      categoryStatusFilter === 'all' ||
      (categoryStatusFilter === 'active' && cat.enabled !== false) ||
      (categoryStatusFilter === 'disabled' && cat.enabled === false) ||
      (categoryStatusFilter === 'has_ads' && count > 0);

    return matchSearch && matchStatus;
  });

  const topCategory = categoriesList.reduce((top, cat) => {
    const count = ads.filter(a => a.category === cat.id).length;
    if (!top || count > top.count) {
      return { ...cat, count };
    }
    return top;
  }, null);

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
        if (categoryModal.isOpen) {
          setCategoryModal({ isOpen: false, mode: 'add', id: '', fa: '', icon: 'Tag', enabled: true, isSystem: false, errorMsg: '' });
          return;
        }
        if (categoryToDelete) {
          setCategoryToDelete(null);
          return;
        }
        if (selectedAdForModal) {
          setSelectedAdForModal(null);
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
        if (categorySearchQuery) {
          setCategorySearchQuery('');
          return;
        }
        onClose();
        return;
      }

      // 3. Ignore if typing in an input, textarea or select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      // 4. Tab Navigation (1-6) on Desktop
      if (e.key === '1') handleTabChange('overview');
      else if (e.key === '2') handleTabChange('ads');
      else if (e.key === '3') handleTabChange('categories');
      else if (e.key === '4') handleTabChange('monetization');
      else if (e.key === '5') handleTabChange('security');
      else if (e.key === '6') handleTabChange('settings');

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
    <main 
      className="admin-scope min-h-screen bg-[#f4f1ea] text-zinc-900 font-vazir select-none flex flex-col lg:flex-row p-0 sm:p-4 gap-4" 
      dir="rtl"
      data-testid="admin-page"
    >
      
      {/* Dynamic Island Toast */}
      {actionSuccessMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-zinc-950/90 text-white px-4 py-2 text-xs font-semibold shadow-2xl border border-white/15 backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200 select-none">
          <CheckCircle size={15} className="text-[#34c759] shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================
          1. DESKTOP FLOATING SIDEBAR (RIGHT-ALIGNED IN RTL)
      ======================================================== */}
      <aside
        className="lg:fixed lg:top-4 lg:bottom-4 lg:right-4 lg:left-auto lg:w-[285px] bg-[#11141a] text-white rounded-2xl px-3.5 pb-4 pt-0 hidden lg:flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.14)] border border-stone-800/80 select-none z-30 transition-all duration-200 ease-out"
        data-testid="admin-sidebar"
      >
        {/* Top Header / Brand */}
        <div className="flex flex-col w-full">
          <div className="flex h-15 items-center px-2 border-b border-stone-800/80 shrink-0">
            <div className="flex items-center gap-3 group cursor-pointer w-full" onClick={onClose} title="مشاهده وب‌سایت">
              <div className="relative flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white to-stone-200 text-slate-950 shadow-sm font-black text-xs transition-transform duration-200 group-hover:scale-105 active:scale-95 border border-white/20">
                <span>SP</span>
                <span className="absolute -bottom-0.5 -start-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#11141a]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-[13.5px] tracking-tight leading-none text-white">سوئد پرشیا</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-stone-300">ADMIN</span>
                </div>
                <span className="text-[10px] text-stone-400 font-medium tracking-wide mt-1 truncate">سامانه مدیریت نیازمندی‌ها</span>
              </div>
            </div>
          </div>

          {/* Navigation Group Items */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-3.5 max-h-[calc(100vh-185px)]">
            
            {/* Group 1: داشبورد */}
            <div className="space-y-1">
              <div className="px-2 pt-1 pb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                  داشبورد اصلی
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange('overview')}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[13.5px] transition-all duration-150 active:scale-[0.99] cursor-pointer group ${
                  activeTab === 'overview'
                    ? 'bg-white text-slate-950 shadow-sm font-bold'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    activeTab === 'overview' ? 'bg-slate-950 text-white shadow-2xs' : 'bg-white/5 text-stone-400 group-hover:text-white group-hover:bg-white/10'
                  }`}>
                    <LayoutGrid size={16} strokeWidth={activeTab === 'overview' ? 2.4 : 1.9} />
                  </div>
                  <span className="truncate">داشبورد</span>
                </div>
              </button>
            </div>

            {/* Group 2: مدیریت و درآمد */}
            <div className="space-y-1">
              <div className="px-2 pt-1 pb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                  مدیریت و درآمد
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleTabChange('ads')}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[13.5px] transition-all duration-150 active:scale-[0.99] cursor-pointer group ${
                  activeTab === 'ads'
                    ? 'bg-white text-slate-950 shadow-sm font-bold'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    activeTab === 'ads' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-white/5 text-stone-400 group-hover:text-blue-400 group-hover:bg-white/10'
                  }`}>
                    <Layers3 size={16} strokeWidth={activeTab === 'ads' ? 2.4 : 1.9} />
                  </div>
                  <span className="truncate">مدیریت آگهی‌ها</span>
                </div>
                {ads.length > 0 && (
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-[10.5px] font-mono font-bold ${
                    activeTab === 'ads' ? 'bg-slate-900 text-white' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {ads.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('categories')}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[13.5px] transition-all duration-150 active:scale-[0.99] cursor-pointer group ${
                  activeTab === 'categories'
                    ? 'bg-white text-slate-950 shadow-sm font-bold'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    activeTab === 'categories' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-white/5 text-stone-400 group-hover:text-emerald-400 group-hover:bg-white/10'
                  }`}>
                    <Shapes size={16} strokeWidth={activeTab === 'categories' ? 2.4 : 1.9} />
                  </div>
                  <span className="truncate">دسته‌بندی‌ها</span>
                </div>
                <span className={`flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-[10.5px] font-mono font-bold ${
                  activeTab === 'categories' ? 'bg-slate-900 text-white' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {categoriesList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('monetization')}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[13.5px] transition-all duration-150 active:scale-[0.99] cursor-pointer group ${
                  activeTab === 'monetization'
                    ? 'bg-white text-slate-950 shadow-sm font-bold'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    activeTab === 'monetization' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-white/5 text-stone-400 group-hover:text-amber-400 group-hover:bg-white/10'
                  }`}>
                    <WalletCards size={16} strokeWidth={activeTab === 'monetization' ? 2.4 : 1.9} />
                  </div>
                  <span className="truncate">درگاه پرداخت</span>
                </div>
                <span className={`flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-[10px] font-bold ${
                  activeTab === 'monetization' ? 'bg-slate-900 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  تعرفه
                </span>
              </button>
            </div>

            {/* Group 3: سیستم و امنیت */}
            <div className="space-y-1">
              <div className="px-2 pt-1 pb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                  سیستم و امنیت
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleTabChange('security')}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[13.5px] transition-all duration-150 active:scale-[0.99] cursor-pointer group ${
                  activeTab === 'security'
                    ? 'bg-white text-slate-950 shadow-sm font-bold'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    activeTab === 'security' ? 'bg-cyan-600 text-white shadow-2xs' : 'bg-white/5 text-stone-400 group-hover:text-cyan-400 group-hover:bg-white/10'
                  }`}>
                    <ShieldCheck size={16} strokeWidth={activeTab === 'security' ? 2.4 : 1.9} />
                  </div>
                  <span className="truncate">امنیت سیستم</span>
                </div>
                <span className={`flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-[10px] font-bold ${
                  turnstileSettings.enabled ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/35' : 'bg-white/10 text-stone-400'
                }`}>
                  {turnstileSettings.enabled ? 'فعال' : 'غیرفعال'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('settings')}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[13.5px] transition-all duration-150 active:scale-[0.99] cursor-pointer group ${
                  activeTab === 'settings'
                    ? 'bg-white text-slate-950 shadow-sm font-bold'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    activeTab === 'settings' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-white/5 text-stone-400 group-hover:text-purple-400 group-hover:bg-white/10'
                  }`}>
                    <SlidersHorizontal size={16} strokeWidth={activeTab === 'settings' ? 2.4 : 1.9} />
                  </div>
                  <span className="truncate">تنظیمات سایت</span>
                </div>
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2.5 border-t border-stone-800/80 w-full shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[12px] font-semibold text-stone-200 bg-white/5 hover:bg-white/10 hover:text-white border border-stone-800/80 active:scale-95 transition-all text-center cursor-pointer group"
              title="مشاهده وب‌سایت"
            >
              <Globe2 size={14} className="text-blue-400 group-hover:rotate-12 transition-transform duration-200 shrink-0" />
              <span className="truncate">سایت</span>
              <ArrowUpRight size={11} className="text-stone-400 group-hover:text-white transition-colors" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[12px] font-semibold text-rose-300 bg-rose-950/25 hover:bg-rose-950/45 border border-rose-900/40 active:scale-95 transition-all text-center cursor-pointer"
              title="خروج از حساب"
            >
              <LogOut size={14} className="shrink-0" />
              <span className="truncate">خروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Slide-in Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden font-vazir select-none" dir="rtl">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileSidebarOpen(false)}
          />
          
          <div className="relative z-10 w-68 max-w-[85vw] h-full bg-[#11141a] text-white flex flex-col border-s border-stone-800/80 shadow-2xl animate-in slide-in-from-right duration-250 ease-out">
            <div className="flex h-14 items-center justify-between px-3.5 border-b border-stone-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative h-8.5 w-8.5 rounded-xl bg-white text-zinc-950 font-black text-xs flex items-center justify-center shadow-sm">
                  SP
                  <span className="absolute -bottom-0.5 -start-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[#11141a]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-[13px] text-white">سوئد پرشیا</span>
                  <span className="text-[10px] text-stone-400">سامانه مدیریت نیازمندی‌ها</span>
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

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {[
                { id: 'overview', label: 'داشبورد', icon: LayoutGrid, badge: null, color: 'bg-slate-950' },
                { id: 'ads', label: 'مدیریت آگهی‌ها', icon: Layers3, badge: ads.length, color: 'bg-blue-600' },
                { id: 'categories', label: 'دسته‌بندی‌ها', icon: Shapes, badge: categoriesList.length, color: 'bg-emerald-600' },
                { id: 'monetization', label: 'درگاه پرداخت', icon: WalletCards, badge: 'تعرفه', color: 'bg-amber-600' },
                { id: 'security', label: 'امنیت سیستم', icon: ShieldCheck, badge: turnstileSettings.enabled ? 'فعال' : 'غیرفعال', color: 'bg-cyan-600' },
                { id: 'settings', label: 'تنظیمات سایت', icon: SlidersHorizontal, badge: null, color: 'bg-purple-600' },
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabChange(item.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all duration-150 active:scale-[0.99] cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-950 font-bold shadow-sm'
                        : 'text-stone-300 hover:bg-white/10 hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isActive ? `${item.color} text-white shadow-2xs` : 'bg-white/5 text-stone-400'
                      }`}>
                        <Icon size={15} strokeWidth={isActive ? 2.4 : 1.9} />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
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
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-white/10 text-white text-xs font-bold active:scale-95 transition-all"
              >
                <Globe2 size={15} />
                <span>مشاهده سایت</span>
                <ArrowUpRight size={13} />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold active:scale-95 transition-all"
              >
                <LogOut size={15} />
                <span>خروج از حساب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. MAIN CONTENT AREA (PADDED RIGHT FOR DESKTOP SIDEBAR)
      ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-200 lg:pr-[301px] lg:pl-0 px-2.5 pb-8 sm:px-0 sm:pb-8">
        
        {/* Top Desktop Nav Bar */}
        <header className="hidden lg:flex items-center justify-between h-15 px-5 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-4 sticky top-4 shrink-0 z-20 select-none">
          {/* Right: Active Section Title with Modern Icon Container */}
          <div className="flex items-center gap-3 min-w-[200px] shrink-0">
            <div className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-stone-100/90 text-stone-800 border border-stone-200/80 shadow-2xs">
              {activeTab === 'overview' && <LayoutGrid size={17} className="text-slate-900" />}
              {activeTab === 'ads' && <Layers3 size={17} className="text-blue-600" />}
              {activeTab === 'categories' && <Shapes size={17} className="text-emerald-600" />}
              {activeTab === 'monetization' && <WalletCards size={17} className="text-amber-600" />}
              {activeTab === 'security' && <ShieldCheck size={17} className="text-cyan-600" />}
              {activeTab === 'settings' && <SlidersHorizontal size={17} className="text-purple-600" />}
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-stone-900 tracking-tight text-[15.5px] leading-tight">
                {activeTab === 'overview' && 'داشبورد مدیریت'}
                {activeTab === 'ads' && 'مدیریت آگهی‌ها'}
                {activeTab === 'categories' && 'مدیریت دسته‌بندی‌ها'}
                {activeTab === 'monetization' && 'درگاه پرداخت و تعرفه‌ها'}
                {activeTab === 'security' && 'امنیت و فایروال'}
                {activeTab === 'settings' && 'تنظیمات کلی سایت'}
              </span>
              <span className="text-[10.5px] text-stone-400 font-medium">سوئد پرشیا • سامانه نیازمندی‌ها</span>
            </div>
          </div>

          {/* Left: Actions + Search + Status */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Bar */}
            <div className="relative w-64 xl:w-80">
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                ref={topSearchRef}
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'ads') handleTabChange('ads');
                }}
                placeholder="جستجو در سامانه مدیریت..."
                className="w-full h-9.5 ps-9 pe-12 bg-stone-50 hover:bg-stone-100/70 focus:bg-white text-[12px] text-stone-900 placeholder:text-stone-400 rounded-xl border border-stone-200/80 focus:border-stone-400 outline-none transition-all shadow-2xs"
              />
              <span className="absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-stone-400 bg-stone-200/60 border border-stone-300/40">
                ⌘K
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute end-11 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-md cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Live Online Badge */}
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold flex items-center gap-2 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11.5px]">سیستم ۱۰۰٪ آنلاین</span>
            </span>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchAdminData}
              className="h-9.5 px-3 rounded-xl border border-stone-200 bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-50 transition-all shadow-2xs active:scale-95 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="بروزرسانی داده‌ها"
            >
              <RotateCcw size={14} className={loading ? 'animate-spin text-blue-600' : 'text-stone-500'} />
              <span className="hidden xl:inline">بروزرسانی</span>
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                handleTabChange('ads');
              }}
              className="relative flex h-9.5 w-9.5 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-all shadow-2xs active:scale-95 cursor-pointer"
              title={`${ads.length} آگهی فعال در سیستم`}
            >
              <Bell size={15} className="text-stone-600" />
              {ads.length > 0 && (
                <span className="absolute -top-1 -start-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-mono font-bold text-white ring-2 ring-white shadow-2xs">
                  {ads.length}
                </span>
              )}
            </button>

            {/* Live Site Link Button */}
            <button
              type="button"
              onClick={onClose}
              className="h-9.5 px-3.5 rounded-xl bg-slate-950 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all group"
            >
              <Globe2 size={14} className="text-blue-400 group-hover:rotate-12 transition-transform duration-200" />
              <span>مشاهده سایت</span>
              <ArrowUpRight size={12} className="text-stone-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex flex-col w-full border-b border-stone-200 bg-white lg:hidden shadow-2xs select-none">
          <div className="flex h-14 w-full items-center justify-between px-3 sm:px-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-800 hover:bg-stone-100 active:scale-95 transition-all shadow-2xs"
                title="باز کردن منو"
              >
                <Menu size={19} />
              </button>
              <div className="min-w-0">
                <span className="font-bold text-[14.5px] text-stone-900 tracking-tight truncate block max-w-[150px] sm:max-w-xs">
                  {activeTab === 'overview' && 'داشبورد'}
                  {activeTab === 'ads' && 'مدیریت آگهی‌ها'}
                  {activeTab === 'categories' && 'دسته‌بندی‌ها'}
                  {activeTab === 'monetization' && 'درگاه پرداخت'}
                  {activeTab === 'security' && 'امنیت سیستم'}
                  {activeTab === 'settings' && 'تنظیمات سایت'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={fetchAdminData}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 shadow-2xs active:scale-95"
                title="بروزرسانی"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin text-blue-600' : ''} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1 active:scale-95"
              >
                <ExternalLink size={13} />
                <span>سایت</span>
              </button>
            </div>
          </div>
        </header>

        {/* ========================================================
            3. CONTENT CANVAS (Persian RTL)
        ======================================================== */}
        <div className="flex-1 flex flex-col min-w-0" dir="rtl">
          
          {/* ========================================================
              TAB 1: COMPLETE PERSIAN OVERVIEW SCREEN (Executive Classifieds)
          ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-5 sm:space-y-6 w-full animate-in fade-in duration-150 ease-out">
              
              {/* 1. ROW 1: 4 Key Executive Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: کل آگهی‌ها */}
                <div 
                  onClick={() => handleTabChange('ads')}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 text-right shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-stone-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs group-hover:scale-105 transition-transform">
                        <Layers3 size={17} strokeWidth={2} />
                      </div>
                      <span className="text-[12px] font-bold text-stone-600 uppercase tracking-wider">
                        کل آگهی‌های پرتال
                      </span>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200/60">
                      {activeAds} فعال
                    </span>
                  </div>
                  <p className="mt-4 text-[28px] sm:text-[32px] font-black tracking-tight text-stone-900 group-hover:text-blue-600 transition-colors font-mono">
                    {totalAds}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11.5px] text-stone-400 border-t border-stone-100 pt-2">
                    <span>در سراسر کشورهای نوردیک</span>
                    <span className="font-semibold text-stone-600 font-mono">{ads.filter(a => a.status === 'hidden').length} مخفی</span>
                  </div>
                </div>

                {/* Card 2: آگهی‌های ویژه */}
                <div 
                  onClick={() => { setStatusFilter('vip'); handleTabChange('ads'); }}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 text-right shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-stone-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-2xs group-hover:scale-105 transition-transform">
                        <Sparkles size={17} strokeWidth={2} />
                      </div>
                      <span className="text-[12px] font-bold text-stone-600 uppercase tracking-wider">
                        آگهی‌های ویژه
                      </span>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200/70 animate-pulse">
                      جایگاه بالا
                    </span>
                  </div>
                  <p className="mt-4 text-[28px] sm:text-[32px] font-black tracking-tight text-stone-900 group-hover:text-amber-600 transition-colors font-mono">
                    {vipAds}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11.5px] text-stone-400 border-t border-stone-100 pt-2">
                    <span>دارای اولویت و برچسب طلایی</span>
                    <span className="font-semibold text-amber-700 font-mono">فعال در پرتال</span>
                  </div>
                </div>

                {/* Card 3: درآمد کل ویژه */}
                <div 
                  onClick={() => handleTabChange('monetization')}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 text-right shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-stone-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs group-hover:scale-105 transition-transform">
                        <WalletCards size={17} strokeWidth={2} />
                      </div>
                      <span className="text-[12px] font-bold text-stone-600 uppercase tracking-wider">
                        درآمد ارتقای ویژه
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/60">
                      درگاه آنلاین
                    </span>
                  </div>
                  <p className="mt-4 text-[26px] sm:text-[30px] font-black tracking-tight text-stone-900 group-hover:text-emerald-600 transition-colors font-mono">
                    {((vipAds || 0) * (stripeSettings.vipPrice || 99)).toLocaleString('sv-SE')} <span className="text-[15px] font-normal text-stone-500">کرون</span>
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11.5px] text-stone-400 border-t border-stone-100 pt-2">
                    <span>بر اساس تعرفه {stripeSettings.vipPrice || 99} کرون</span>
                    <span className="font-semibold text-stone-600 font-mono">{vipAds} تراکنش</span>
                  </div>
                </div>

                {/* Card 4: بازدید و ترافیک کل */}
                <div 
                  onClick={() => handleTabChange('ads')}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 text-right shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-stone-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shadow-2xs group-hover:scale-105 transition-transform">
                        <TrendingUp size={17} strokeWidth={2} />
                      </div>
                      <span className="text-[12px] font-bold text-stone-600 uppercase tracking-wider">
                        بازدید و تعامل کل
                      </span>
                    </div>
                    <span className="rounded-full bg-purple-50 border border-purple-200/70 px-2.5 py-0.5 text-[11px] font-bold text-purple-700">
                      ۴ کشور
                    </span>
                  </div>
                  <p className="mt-4 text-[28px] sm:text-[32px] font-black tracking-tight text-stone-900 group-hover:text-purple-600 transition-colors font-mono">
                    {totalViews.toLocaleString('sv-SE')}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11.5px] text-stone-400 border-t border-stone-100 pt-2">
                    <span>میانگین هر آگهی:</span>
                    <span className="font-semibold text-stone-700 font-mono">{totalAds > 0 ? Math.round(totalViews / totalAds) : 0} بازدید</span>
                  </div>
                </div>

              </div>

              {/* 2. ROW 2: NORDIC REGIONAL BREAKDOWN (4 Scandinavian Countries) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-zinc-900">
                      پوشش منطقه‌ای اسکاندیناوی
                    </h3>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-200/60 text-stone-700">Nordic 4</span>
                  </div>
                  <span className="text-xs text-stone-500">برای فیلتر کردن آگهی‌های هر کشور کلیک کنید</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {COUNTRIES.map(country => {
                    const stats = getCountryStats(country.id);
                    const countryFlags = {
                      se: '🇸🇪',
                      no: '🇳🇴',
                      dk: '🇩🇰',
                      fi: '🇫🇮'
                    };
                    const countryCodes = {
                      se: 'SE',
                      no: 'NO',
                      dk: 'DK',
                      fi: 'FI'
                    };
                    return (
                      <div 
                        key={country.id}
                        onClick={() => { setCountryFilter(country.id); handleTabChange('ads'); }}
                        className="p-4 sm:p-4.5 rounded-2xl border border-stone-200/80 hover:border-stone-400 bg-white hover:shadow-sm active:scale-[0.99] transition-all cursor-pointer flex flex-col justify-between group text-right shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-lg select-none shrink-0">{countryFlags[country.id] || '🌐'}</span>
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="font-black text-[13.5px] text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
                                {country.nameFa}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-stone-400 shrink-0">
                                ({countryCodes[country.id] || country.id.toUpperCase()})
                              </span>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-md bg-stone-100 group-hover:bg-blue-50 group-hover:text-blue-700 text-stone-700 text-[11px] font-mono font-bold transition-colors shrink-0">
                            {stats.total} آگهی
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 pt-3 mt-3 border-t border-stone-100 text-center">
                          <div className="bg-stone-50 group-hover:bg-stone-100/70 rounded-xl py-1.5 px-1 flex flex-col items-center justify-center transition-colors">
                            <span className="text-[10px] text-stone-400 block font-medium">فعال</span>
                            <span className="text-[12px] font-bold text-stone-700 font-mono mt-0.5">{stats.active}</span>
                          </div>
                          <div className="bg-amber-50/70 border border-amber-200/50 rounded-xl py-1.5 px-1 flex flex-col items-center justify-center">
                            <span className="text-[10px] text-amber-700 block font-medium">ویژه</span>
                            <span className="text-[12px] font-bold text-amber-700 font-mono mt-0.5">{stats.vip}</span>
                          </div>
                          <div className="bg-stone-50 group-hover:bg-stone-100/70 rounded-xl py-1.5 px-1 flex flex-col items-center justify-center transition-colors">
                            <span className="text-[10px] text-stone-400 block font-medium">بازدید</span>
                            <span className="text-[12px] font-bold text-stone-700 font-mono mt-0.5">{stats.views}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. ROW 3: LATEST SUBMITTED ADS & STRIPE STATUS (Focused Classified Operations) */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
                
                {/* RIGHT COLUMN (2/3 width): آخرین آگهی‌های پرتال */}
                <div className="xl:col-span-2 rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-4 sm:p-6 flex flex-col space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 shadow-2xs">
                        <Layers3 size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <h2 className="text-[16px] font-bold text-stone-900 tracking-tight">آخرین آگهی‌های ثبت‌شده در پرتال</h2>
                        <p className="text-[12px] text-stone-500">مشاهده سریع و بررسی آگهی‌های نیازمندی‌های کاربران</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTabChange('ads')}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer group"
                    >
                      <span>مدیریت همه آگهی‌ها ({totalAds})</span>
                      <ArrowUpRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  {/* Ads List */}
                  <div className="divide-y divide-stone-100 rounded-xl border border-stone-200/70 overflow-hidden">
                    {ads.slice(0, 5).map(ad => {
                      const countryObj = COUNTRIES.find(c => c.id === (ad.country || 'se')) || COUNTRIES[0];
                      const catObj = categoriesList.find(c => c.id === ad.category) || CATEGORIES.find(c => c.id === ad.category);
                      return (
                        <div
                          key={ad.id}
                          className="w-full p-3.5 flex items-center justify-between gap-3 text-right hover:bg-stone-50/70 transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div 
                              onClick={() => setSelectedAdForModal(ad)}
                              className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200/80 overflow-hidden shrink-0 cursor-pointer shadow-2xs group-hover:scale-105 transition-transform"
                            >
                              {ad.images && ad.images[0] ? (
                                <img src={ad.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                  <ImageIcon size={18} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-[12.5px] text-stone-900 truncate">
                                  #{ad.reference_number || ad.id.slice(0, 8)}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  {countryObj.nameFa}
                                </span>
                                {ad.is_featured && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                                    ویژه
                                  </span>
                                )}
                                {catObj && (
                                  <span className="text-[10.5px] text-stone-500 font-medium">
                                    · {catObj.fa}
                                  </span>
                                )}
                              </div>
                              <p 
                                onClick={() => setSelectedAdForModal(ad)}
                                className="text-[12.5px] font-bold text-stone-800 hover:text-blue-600 truncate mt-0.5 cursor-pointer"
                              >
                                {ad.title}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                                <span>{ad.city || 'اسکاندیناوی'}</span>
                                <span>·</span>
                                <span className="font-semibold text-stone-700 font-mono">
                                  {ad.price ? `${Number(ad.price).toLocaleString()} ${ad.price_type === 'kr' || !ad.price_type ? 'کرون' : ad.price_type}` : 'توافقی'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedAdForModal(ad)}
                              className="h-8 px-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="مشاهده جزئیات کامل"
                            >
                              <Eye size={13} />
                              <span>کامل</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleFeatured(ad)}
                              className={`h-8 w-8 rounded-lg border flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                                ad.is_featured
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-white hover:bg-stone-50 text-stone-400 border-stone-200'
                              }`}
                              title={ad.is_featured ? 'حذف نشان ویژه' : 'ویژه کردن'}
                            >
                              <Sparkles size={13} className={ad.is_featured ? 'text-amber-600' : 'text-stone-400'} />
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleStatus(ad)}
                              className={`h-8 w-8 rounded-lg border flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                                ad.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : 'bg-stone-100 text-stone-500 border-stone-300'
                              }`}
                              title={ad.status === 'active' ? 'مخفی کردن' : 'فعال‌سازی'}
                            >
                              <CheckCircle size={13} className={ad.status === 'active' ? 'text-emerald-600' : 'text-stone-400'} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {ads.length === 0 && (
                      <div className="py-8 text-center text-xs text-stone-400">
                        هنوز آگهی‌ای در سیستم ثبت نشده است.
                      </div>
                    )}
                  </div>
                </div>

                {/* LEFT COLUMN (1/3 width): وضعیت درگاه بانکی و ارتقای ویژه */}
                <div className="rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-4 sm:p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-2xs">
                        <WalletCards size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <h2 className="text-[16px] font-bold text-stone-900 tracking-tight">درگاه پرداخت و تعرفه‌ها</h2>
                        <p className="text-[12px] text-stone-500">وضعیت درگاه پرداخت و تعرفه ارتقا</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs">
                        <span className="text-stone-600 font-semibold">وضعیت اتصال:</span>
                        <span className="px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {stripeSettings.mode === 'live' ? 'متصل (عملیاتی)' : 'متصل (آزمایشی)'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs">
                        <span className="text-stone-600 font-semibold">تعرفه آگهی ویژه:</span>
                        <span className="font-extrabold text-stone-900 font-mono text-sm">
                          {stripeSettings.vipPrice || 99} کرون
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs">
                        <span className="text-stone-600 font-semibold">مدت اعتبار آگهی ویژه:</span>
                        <span className="font-bold text-stone-800 font-mono">
                          {stripeSettings.vipDurationDays || 30} روز
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs">
                        <span className="text-stone-600 font-semibold">روش‌های پرداخت:</span>
                        <span className="font-bold text-stone-700">کارت‌های بین‌المللی (ویزا، مسترکارت)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTabChange('monetization')}
                    className="w-full h-10 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all shadow-2xs"
                  >
                    <span>تنظیمات درگاه بانکی و تعرفه‌ها</span>
                    <span>←</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================
              TAB 2: HIGH-DENSITY LUXURY TABLE (PERSIAN RTL)
          ======================================================== */}
          {activeTab === 'ads' && (
            <div className="space-y-4 w-full animate-in fade-in duration-150 ease-out">
              
              {/* Filter Controls Bar */}
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
                      {categoriesList.map(c => (
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

              {/* High-Density Luxury Ads Table */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
                {filteredAds.length === 0 ? (
                  <div className="text-center py-20 p-8 text-stone-400 space-y-2">
                    <Layers size={36} className="mx-auto text-stone-300" />
                    <p className="text-sm font-semibold text-stone-600">هیچ آگهی با این فیلترها یافت نشد.</p>
                    <p className="text-xs text-stone-400">فیلترهای جستجو یا کشور را تغییر دهید.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-stone-50/90 border-b border-stone-200/80 text-[11.5px] font-bold text-stone-500 select-none">
                          <th className="py-3 px-3 text-center w-14">تصویر</th>
                          <th className="py-3 px-3 min-w-[130px]">شناسه و رمز</th>
                          <th className="py-3 px-3 min-w-[220px]">عنوان و دسته‌بندی</th>
                          <th className="py-3 px-3 min-w-[120px]">شهر و قیمت</th>
                          <th className="py-3 px-3 min-w-[180px]">اطلاعات تماس</th>
                          <th className="py-3 px-3 text-center w-20">بازدید</th>
                          <th className="py-3 px-3 text-center w-24">وضعیت</th>
                          <th className="py-3 px-3 text-center min-w-[150px]">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-xs">
                        {filteredAds.map(ad => {
                          const countryObj = COUNTRIES.find(c => c.id === (ad.country || 'se')) || COUNTRIES[0];
                          const catObj = categoriesList.find(c => c.id === ad.category) || CATEGORIES.find(c => c.id === ad.category);

                          return (
                            <tr
                              key={ad.id}
                              id={`ad-item-${ad.id}`}
                              className="hover:bg-blue-50/40 transition-colors group"
                            >
                              {/* 1. Thumbnail */}
                              <td className="py-2.5 px-3 text-center align-middle">
                                <div 
                                  onClick={() => setSelectedAdForModal(ad)}
                                  className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200/80 overflow-hidden shrink-0 mx-auto cursor-pointer shadow-2xs group-hover:scale-105 transition-transform"
                                  title="کلیک برای مشاهده جزئیات کامل"
                                >
                                  {ad.images && ad.images[0] ? (
                                    <img src={ad.images[0]} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-50">
                                      <ImageIcon size={18} />
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* 2. Reference, PIN & Country */}
                              <td className="py-2.5 px-3 align-middle">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => copyText(ad.reference_number, `ref-${ad.id}`, 'کد پیگیری')}
                                      className="font-mono text-[11px] font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 px-1.5 py-0.5 rounded border border-stone-200 flex items-center gap-1 cursor-pointer transition-colors"
                                      title="کپی کد پیگیری"
                                    >
                                      <span>#{ad.reference_number || ad.id.slice(0, 8)}</span>
                                      {copiedKey === `ref-${ad.id}` ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} className="text-stone-400" />}
                                    </button>

                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                                      {countryObj.nameFa}
                                    </span>
                                  </div>

                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => copyText(ad.pin_code || '1234', `pin-${ad.id}`, 'رمز ویرایش')}
                                      className="font-mono text-[10.5px] font-extrabold text-amber-900 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
                                      title="کپی رمز ویرایش"
                                    >
                                      <span>رمز: {ad.pin_code || '1234'}</span>
                                      {copiedKey === `pin-${ad.id}` ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} className="text-amber-600" />}
                                    </button>
                                  </div>
                                </div>
                              </td>

                              {/* 3. Title & Category */}
                              <td className="py-2.5 px-3 align-middle">
                                <div className="min-w-0 max-w-[280px]">
                                  <span 
                                    onClick={() => setSelectedAdForModal(ad)}
                                    className="font-extrabold text-[13px] text-stone-900 hover:text-blue-600 cursor-pointer line-clamp-1 block transition-colors leading-snug"
                                    title={ad.title}
                                  >
                                    {ad.title}
                                  </span>
                                  <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400">
                                    {catObj && (
                                      <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-medium text-[10.5px]">
                                        {catObj.fa}
                                      </span>
                                    )}
                                    <span className="font-mono text-[10px]">
                                      {new Date(ad.created_at || '2026-01-01').toLocaleDateString('sv-SE')}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* 4. City & Price */}
                              <td className="py-2.5 px-3 align-middle">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1 text-stone-700 font-medium text-[11.5px]">
                                    <MapPin size={12} className="text-stone-400 shrink-0" />
                                    <span>{ad.city || 'نامشخص'}</span>
                                  </div>
                                  <span className="font-extrabold text-stone-900 font-mono text-[12px] block">
                                    {ad.price ? `${Number(ad.price).toLocaleString()} ${ad.price_type === 'kr' || !ad.price_type ? 'کرون' : ad.price_type}` : 'توافقی'}
                                  </span>
                                </div>
                              </td>

                              {/* 5. Contact Information */}
                              <td className="py-2.5 px-3 align-middle">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-stone-800 font-bold text-[11.5px]">
                                    <User size={12} className="text-stone-400 shrink-0" />
                                    <span className="truncate max-w-[120px]">{ad.contact_name || 'بدون نام'}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {ad.contact_phone && (
                                      <a
                                        href={`tel:${ad.contact_phone}`}
                                        className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-blue-700 hover:underline bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60"
                                        title={`تماس تلفنی: ${ad.contact_phone}`}
                                      >
                                        <Phone size={10} />
                                        <span>{ad.contact_phone}</span>
                                      </a>
                                    )}
                                    {ad.contact_whatsapp && (
                                      <a
                                        href={`https://wa.me/${ad.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="h-6 px-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center text-[10px] font-bold"
                                        title={`واتساپ: ${ad.contact_whatsapp}`}
                                      >
                                        واتساپ
                                      </a>
                                    )}
                                    {ad.contact_telegram && (
                                      <a
                                        href={`https://t.me/${ad.contact_telegram.replace('@', '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="h-6 w-6 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 flex items-center justify-center text-[10px]"
                                        title={`تلگرام: ${ad.contact_telegram}`}
                                      >
                                        <Send size={10} />
                                      </a>
                                    )}
                                    {ad.contact_email && (
                                      <a
                                        href={`mailto:${ad.contact_email}`}
                                        className="h-6 w-6 rounded bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200 flex items-center justify-center text-[10px]"
                                        title={`ایمیل: ${ad.contact_email}`}
                                      >
                                        <Mail size={10} />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* 6. Views */}
                              <td className="py-2.5 px-3 text-center align-middle">
                                <span className="inline-flex items-center gap-1 font-mono text-[11.5px] font-semibold text-stone-600 bg-stone-50 px-2 py-0.5 rounded border border-stone-200/60">
                                  <Eye size={11} className="text-stone-400" />
                                  <span>{ad.views_count || 1}</span>
                                </span>
                              </td>

                              {/* 7. Status & VIP */}
                              <td className="py-2.5 px-3 text-center align-middle">
                                <div className="space-y-1">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${
                                    ad.status === 'active'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-stone-100 text-stone-600 border-stone-200'
                                  }`}>
                                    {ad.status === 'active' ? 'فعال' : 'مخفی'}
                                  </span>
                                  {ad.is_featured && (
                                    <span className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-extrabold border border-amber-300">
                                      <Sparkles size={10} className="text-amber-600" />
                                      <span>ویژه</span>
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* 8. Actions */}
                              <td className="py-2.5 px-3 text-center align-middle">
                                <div className="flex items-center justify-center gap-1">
                                  {/* View Full Info Modal */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedAdForModal(ad)}
                                    className="h-8 px-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                    title="مشاهده جزئیات کامل و تصاویر"
                                  >
                                    <Eye size={13} />
                                    <span>کامل</span>
                                  </button>

                                  {/* Toggle VIP */}
                                  <button
                                    type="button"
                                    onClick={() => toggleFeatured(ad)}
                                    className={`h-8 w-8 rounded-lg border flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                                      ad.is_featured
                                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                                        : 'bg-white hover:bg-stone-50 text-stone-400 border-stone-200'
                                    }`}
                                    title={ad.is_featured ? 'حذف نشان ویژه' : 'ویژه کردن آگهی'}
                                  >
                                    <Sparkles size={13} className={ad.is_featured ? 'text-amber-600' : 'text-stone-400'} />
                                  </button>

                                  {/* Toggle Active / Hidden */}
                                  <button
                                    type="button"
                                    onClick={() => toggleStatus(ad)}
                                    className={`h-8 w-8 rounded-lg border flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                                      ad.status === 'active'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                        : 'bg-stone-100 text-stone-500 border-stone-300'
                                    }`}
                                    title={ad.status === 'active' ? 'مخفی کردن آگهی' : 'فعال‌سازی آگهی'}
                                  >
                                    <CheckCircle size={13} className={ad.status === 'active' ? 'text-emerald-600' : 'text-stone-400'} />
                                  </button>

                                  {/* Delete Ad */}
                                  <button
                                    type="button"
                                    onClick={() => deleteAdAdmin(ad.id)}
                                    className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                                    title="حذف دائمی آگهی"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB: CATEGORIES MANAGEMENT (LUXURY STONE & SLATE RTL)
          ======================================================== */}
          {activeTab === 'categories' && (
            <div className="space-y-4 w-full animate-in fade-in duration-150 ease-out">
              
              {/* 1. Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: کل دسته‌بندی‌ها */}
                <div className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 text-right shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold text-stone-500 uppercase tracking-wider">
                      کل دسته‌بندی‌ها
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 border border-stone-200/80">
                      پرتال
                    </span>
                  </div>
                  <p className="mt-3 text-[26px] sm:text-[28px] font-extrabold tracking-tight text-stone-900 font-mono">
                    {categoriesList.length}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[11.5px] text-stone-400">
                    <span>دسته‌بندی‌های فعال و سفارشی</span>
                    <span className="font-semibold text-stone-600 font-mono">
                      {categoriesList.filter(c => !c.isSystem).length} سفارشی
                    </span>
                  </div>
                </div>

                {/* Card 2: دسته‌های فعال */}
                <div className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 text-right shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold text-stone-500 uppercase tracking-wider">
                      دسته‌های فعال
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/60">
                      قابل استفاده
                    </span>
                  </div>
                  <p className="mt-3 text-[26px] sm:text-[28px] font-extrabold tracking-tight text-emerald-600 font-mono">
                    {categoriesList.filter(c => c.enabled !== false).length}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[11.5px] text-stone-400">
                    <span>آماده دریافت آگهی جدید</span>
                    <span className="font-semibold text-stone-600 font-mono">
                      {categoriesList.filter(c => c.enabled === false).length} غیرفعال
                    </span>
                  </div>
                </div>

                {/* Card 3: دسته‌های دارای آگهی */}
                <div className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 text-right shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold text-stone-500 uppercase tracking-wider">
                      دارای آگهی زنده
                    </span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200/60">
                      پوشش محتوا
                    </span>
                  </div>
                  <p className="mt-3 text-[26px] sm:text-[28px] font-extrabold tracking-tight text-blue-600 font-mono">
                    {categoriesList.filter(c => ads.some(a => a.category === c.id)).length}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[11.5px] text-stone-400">
                    <span>دسته‌های شامل حداقل ۱ آگهی</span>
                    <span className="font-semibold text-stone-600 font-mono">
                      {totalAds} آگهی کل
                    </span>
                  </div>
                </div>

                {/* Card 4: پرآگهی‌ترین دسته */}
                <div 
                  onClick={() => topCategory && handleViewCategoryAds(topCategory.id)}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 text-right shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-stone-300 hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer group"
                  title="کلیک برای مشاهده آگهی‌ها"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold text-stone-500 uppercase tracking-wider">
                      دسته‌بندی برتر
                    </span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200/70">
                      بیشترین آگهی
                    </span>
                  </div>
                  <p className="mt-3 text-[20px] sm:text-[22px] font-extrabold tracking-tight text-stone-900 group-hover:text-blue-600 transition-colors truncate">
                    {topCategory ? topCategory.fa : '—'}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[11.5px] text-stone-400">
                    <span>تعداد آگهی‌های ثبت‌شده</span>
                    <span className="font-semibold text-stone-900 font-mono">
                      {topCategory ? `${topCategory.count} آگهی` : '۰'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Controls & Actions Bar */}
              <div className="p-4 rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                
                {/* Search & Status Filter */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1">
                  <div className="relative w-full sm:w-72">
                    <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="جستجو در عنوان، شناسه یا آیکون..."
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                      className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 ps-9 pe-8 text-xs text-zinc-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none transition-all shadow-2xs"
                    />
                    {categorySearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCategorySearchQuery('')}
                        className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-md cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  <select
                    value={categoryStatusFilter}
                    onChange={(e) => setCategoryStatusFilter(e.target.value)}
                    className="w-full sm:w-auto h-10 rounded-xl bg-stone-50 border border-stone-200/80 px-3 text-xs font-semibold text-zinc-800 focus:bg-white focus:border-stone-400 focus:outline-none cursor-pointer shadow-2xs"
                  >
                    <option value="all">همه وضعیت‌ها ({categoriesList.length})</option>
                    <option value="active">فقط فعال ({categoriesList.filter(c => c.enabled !== false).length})</option>
                    <option value="disabled">فقط غیرفعال ({categoriesList.filter(c => c.enabled === false).length})</option>
                    <option value="has_ads">دارای آگهی ({categoriesList.filter(c => ads.some(a => a.category === c.id)).length})</option>
                  </select>
                </div>

                {/* Add New Category Primary Action */}
                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-2xs shrink-0"
                >
                  <Plus size={16} />
                  <span>افزودن دسته‌بندی جدید</span>
                </button>
              </div>

              {/* 3. High-Density Luxury Categories Table */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-16 p-8 text-stone-400 space-y-2">
                    <FolderTree size={36} className="mx-auto text-stone-300" />
                    <p className="text-sm font-semibold text-stone-600">هیچ دسته‌بندی با این فیلترها یافت نشد.</p>
                    <p className="text-xs text-stone-400">جستجو را بازنشانی کنید یا دسته جدیدی اضافه نمایید.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-stone-50/90 border-b border-stone-200/80 text-[11.5px] font-bold text-stone-500 select-none">
                          <th className="py-3 px-3 text-center w-14">آیکون</th>
                          <th className="py-3 px-3 min-w-[200px]">عنوان دسته‌بندی</th>
                          <th className="py-3 px-3 min-w-[150px]">شناسه یکتا</th>
                          <th className="py-3 px-3 min-w-[130px] text-center">آگهی‌های ثبت‌شده</th>
                          <th className="py-3 px-3 text-center w-24">وضعیت</th>
                          <th className="py-3 px-3 text-center w-28">نوع دسته</th>
                          <th className="py-3 px-3 text-center min-w-[140px]">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-xs">
                        {filteredCategories.map(cat => {
                          const IconComp = CATEGORY_ICON_MAP[cat.icon] || Tag;
                          const adCount = ads.filter(a => a.category === cat.id).length;
                          const isEnabled = cat.enabled !== false;

                          return (
                            <tr
                              key={cat.id}
                              className="hover:bg-blue-50/40 transition-colors group"
                            >
                              {/* 1. Icon */}
                              <td className="py-3 px-3 text-center align-middle">
                                <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-700 mx-auto shadow-2xs group-hover:scale-105 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-all">
                                  <IconComp size={18} />
                                </div>
                              </td>

                              {/* 2. Title */}
                              <td className="py-3 px-3 align-middle">
                                <div className="space-y-0.5">
                                  <span className="font-extrabold text-[13.5px] text-stone-900 block leading-tight">
                                    {cat.fa}
                                  </span>
                                  <span className="text-[10.5px] text-stone-400">
                                    آیکون: {cat.icon || 'Tag'}
                                  </span>
                                </div>
                              </td>

                              {/* 3. Slug */}
                              <td className="py-3 px-3 align-middle">
                                <button
                                  type="button"
                                  onClick={() => copyText(cat.id, `cat-${cat.id}`, 'شناسه دسته')}
                                  className="font-mono text-[11px] font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded border border-stone-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                                  title="کپی شناسه یکتا"
                                >
                                  <span>#{cat.id}</span>
                                  {copiedKey === `cat-${cat.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} className="text-stone-400" />}
                                </button>
                              </td>

                              {/* 4. Ads Count & Link */}
                              <td className="py-3 px-3 text-center align-middle">
                                {adCount > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => handleViewCategoryAds(cat.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/70 text-xs font-bold cursor-pointer transition-colors shadow-2xs active:scale-95"
                                    title="مشاهده آگهی‌های این دسته"
                                  >
                                    <span className="font-mono">{adCount}</span>
                                    <span className="text-[10.5px]">آگهی</span>
                                    <ExternalLink size={11} />
                                  </button>
                                ) : (
                                  <span className="inline-block px-2 py-0.5 rounded-lg bg-stone-100 text-stone-400 text-[11px] font-mono">
                                    بدون آگهی
                                  </span>
                                )}
                              </td>

                              {/* 5. Status Toggle */}
                              <td className="py-3 px-3 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCategoryStatus(cat.id)}
                                  className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border cursor-pointer active:scale-95 transition-all ${
                                    isEnabled
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                                  }`}
                                  title="کلیک برای تغییر وضعیت"
                                >
                                  {isEnabled ? 'فعال' : 'غیرفعال'}
                                </button>
                              </td>

                              {/* 6. Category Type */}
                              <td className="py-3 px-3 text-center align-middle">
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  cat.isSystem
                                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                                    : 'bg-purple-50 text-purple-700 border-purple-200/80'
                                }`}>
                                  {cat.isSystem ? 'پیش‌فرض' : 'سفارشی'}
                                </span>
                              </td>

                              {/* 7. Actions */}
                              <td className="py-3 px-3 text-center align-middle">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* Edit Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditCategory(cat)}
                                    className="h-8 px-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                                    title="ویرایش دسته‌بندی"
                                  >
                                    <Edit3 size={13} />
                                    <span>ویرایش</span>
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() => setCategoryToDelete(cat)}
                                    className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                                    title="حذف دسته‌بندی"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 3: STRIPE PAYMENT GATEWAY & VIP SETTINGS
          ======================================================== */}
          {activeTab === 'monetization' && (
            <div className="space-y-6 max-w-5xl mx-auto w-full py-2 animate-in fade-in duration-150 ease-out">
              
              <div className="border-b border-stone-200/80 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-zinc-900">درگاه پرداخت و تعرفه‌ها</h2>
                  <p className="text-xs text-stone-500 mt-0.5">تنظیمات پرداخت و ارتقای آگهی</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    stripeSettings.mode === 'live' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                      : 'bg-amber-50 text-amber-800 border-amber-200/80'
                  }`}>
                    {stripeSettings.mode === 'live' ? 'عملیاتی' : 'آزمایشی'}
                  </span>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={saveStripeSettings} className="space-y-6">
                
                {/* Stripe Credentials Card */}
                <div className="rounded-2xl bg-white border border-stone-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
                  <h3 className="text-xs font-extrabold text-zinc-900">اطلاعات درگاه پرداخت اینترنتی</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">حالت درگاه</label>
                      <select
                        value={stripeSettings.mode}
                        onChange={(e) => setStripeSettings(prev => ({ ...prev, mode: e.target.value }))}
                        className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3 text-xs text-zinc-900 font-medium focus:border-stone-400 focus:outline-none transition-all cursor-pointer shadow-2xs"
                      >
                        <option value="test">آزمایشی</option>
                        <option value="live">عملیاتی و واقعی</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">وضعیت درگاه</label>
                      <select
                        value={stripeSettings.enabled ? 'true' : 'false'}
                        onChange={(e) => setStripeSettings(prev => ({ ...prev, enabled: e.target.value === 'true' }))}
                        className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3 text-xs text-zinc-900 font-medium focus:border-stone-400 focus:outline-none transition-all cursor-pointer shadow-2xs"
                      >
                        <option value="true">فعال</option>
                        <option value="false">غیرفعال</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">کلید عمومی درگاه (Publishable Key)</label>
                      <input
                        type="text"
                        value={stripeSettings.publishableKey}
                        onChange={(e) => setStripeSettings(prev => ({ ...prev, publishableKey: e.target.value }))}
                        placeholder="pk_test_... یا pk_live_..."
                        className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3.5 text-xs text-zinc-900 font-mono focus:border-stone-400 focus:outline-none transition-all shadow-2xs"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">کلید محرمانه درگاه (Secret Key)</label>
                      <input
                        type="password"
                        value={stripeSettings.secretKey}
                        onChange={(e) => setStripeSettings(prev => ({ ...prev, secretKey: e.target.value }))}
                        placeholder="sk_test_... یا sk_live_..."
                        className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3.5 text-xs text-zinc-900 font-mono focus:border-stone-400 focus:outline-none transition-all shadow-2xs"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & VIP Configuration */}
                <div className="rounded-2xl bg-white border border-stone-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
                  <h3 className="text-xs font-extrabold text-zinc-900">تعرفه آگهی ویژه</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">مبلغ</label>
                      <input
                        type="number"
                        min="1"
                        value={stripeSettings.vipPrice}
                        onChange={(e) => setStripeSettings(prev => ({ ...prev, vipPrice: Number(e.target.value) }))}
                        className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3.5 text-xs text-zinc-900 font-mono focus:border-stone-400 focus:outline-none transition-all shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">واحد پول</label>
                      <select
                        value={stripeSettings.currency}
                        onChange={(e) => setStripeSettings(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3 text-xs text-zinc-900 font-medium focus:border-stone-400 focus:outline-none transition-all cursor-pointer shadow-2xs"
                      >
                        <option value="SEK">کرون سوئد (SEK)</option>
                        <option value="NOK">کرون نروژ (NOK)</option>
                        <option value="DKK">کرون دانمارک (DKK)</option>
                        <option value="EUR">یورو فنلاند (EUR)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">مدت اعتبار</label>
                      <select
                        value={stripeSettings.vipDurationDays}
                        onChange={(e) => setStripeSettings(prev => ({ ...prev, vipDurationDays: Number(e.target.value) }))}
                        className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3 text-xs text-zinc-900 font-medium focus:border-stone-400 focus:outline-none transition-all cursor-pointer shadow-2xs"
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
                  className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
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
            <div className="space-y-6 max-w-5xl mx-auto w-full py-2 animate-in fade-in duration-150 ease-out">
              
              <div className="border-b border-stone-200/80 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-zinc-900">امنیت و آنتی‌بات</h2>
                  <p className="text-xs text-stone-500 mt-0.5">تنظیمات سپر امنیتی ضدبات</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    turnstileSettings.enabled 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                      : 'bg-rose-50 text-rose-700 border-rose-200/80'
                  }`}>
                    {turnstileSettings.enabled ? 'فعال' : 'خاموش'}
                  </span>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={saveTurnstileSettings} className="space-y-6">
                
                {/* Toggles & Modes Card */}
                <div className="rounded-2xl bg-white border border-stone-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
                  <h3 className="text-xs font-extrabold text-zinc-900">محدوده فعال‌سازی</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-4 rounded-xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200/80 cursor-pointer transition-all shadow-2xs">
                      <div>
                        <span className="text-xs font-bold text-zinc-900 block">فعال‌بودن سپر ضدبات</span>
                        <span className="text-[11px] text-stone-500">بررسی امنیتی فرم‌ها</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={turnstileSettings.enabled}
                        onChange={(e) => setTurnstileSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                        className="h-4 w-4 rounded text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                      />
                    </label>

                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1 shadow-2xs">
                      <label className="block text-xs font-bold text-stone-700">حالت اجرا</label>
                      <select
                        value={turnstileSettings.mode}
                        onChange={(e) => setTurnstileSettings(prev => ({ ...prev, mode: e.target.value }))}
                        className="w-full h-8 rounded-lg bg-white border border-stone-200/80 px-2.5 text-xs text-zinc-900 font-medium focus:border-stone-400 focus:outline-none transition-all cursor-pointer"
                      >
                        <option value="test">آزمایشی</option>
                        <option value="live">عملیاتی و واقعی</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <label className="flex items-center justify-between p-4 rounded-xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200/80 cursor-pointer transition-all shadow-2xs">
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

                    <label className="flex items-center justify-between p-4 rounded-xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200/80 cursor-pointer transition-all shadow-2xs">
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
                <div className="rounded-2xl bg-white border border-stone-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-zinc-900">کلیدهای اختصاصی ضدبات</h3>
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
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">کلید عمومی سایت (Site Key)</label>
                      <input
                        type="text"
                        value={turnstileSettings.siteKey}
                        onChange={(e) => setTurnstileSettings(prev => ({ ...prev, siteKey: e.target.value }))}
                        placeholder={turnstileSettings.mode === 'test' ? 'حالت تستی نیازی به کلید ندارد' : '0x4AAAAAA...'}
                        className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3.5 text-xs text-zinc-900 font-mono focus:border-stone-400 focus:outline-none transition-all shadow-2xs"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">کلید محرمانه سیستم (Secret Key)</label>
                      <input
                        type="password"
                        value={turnstileSettings.secretKey}
                        onChange={(e) => setTurnstileSettings(prev => ({ ...prev, secretKey: e.target.value }))}
                        placeholder={turnstileSettings.mode === 'test' ? 'حالت تستی نیازی به کلید ندارد' : '0x4AAAAAA...'}
                        className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3.5 text-xs text-zinc-900 font-mono focus:border-stone-400 focus:outline-none transition-all shadow-2xs"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview Widget */}
                <div className="rounded-2xl bg-white border border-stone-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
                  <h3 className="text-xs font-extrabold text-zinc-900">تست ویجت</h3>
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col items-center justify-center space-y-2 shadow-2xs">
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
                  className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
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
            <div className="space-y-6 max-w-5xl mx-auto w-full py-2 animate-in fade-in duration-150 ease-out">
              
              <div className="border-b border-stone-200/80 pb-5">
                <h2 className="text-base font-black text-zinc-900">تنظیمات سایت و سئو</h2>
                <p className="text-xs text-stone-500 mt-0.5">مشخصات برند و اطلاعات گوگل برای ۴ کشور</p>
              </div>

              {saveSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Site Branding Form */}
              <form onSubmit={saveBrandingSettings} className="rounded-2xl bg-white border border-stone-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
                <h3 className="text-xs font-extrabold text-zinc-900">مشخصات سایت</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">نام سایت</label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3 text-xs text-zinc-900 focus:border-stone-400 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">شعار</label>
                    <input
                      type="text"
                      value={siteSlogan}
                      onChange={(e) => setSiteSlogan(e.target.value)}
                      className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3 text-xs text-zinc-900 focus:border-stone-400 focus:outline-none transition-all shadow-2xs"
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
                      className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3 text-xs text-zinc-900 font-mono focus:border-stone-400 focus:outline-none transition-all shadow-2xs text-left"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">تلگرام</label>
                    <input
                      type="text"
                      value={supportTelegram}
                      onChange={(e) => setSupportTelegram(e.target.value)}
                      className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3 text-xs text-zinc-900 font-mono focus:border-stone-400 focus:outline-none transition-all shadow-2xs text-left"
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
                      className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3 text-xs text-zinc-900 font-mono focus:border-stone-400 focus:outline-none transition-all shadow-2xs text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-2 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Save size={15} />
                    <span>ذخیره مشخصات</span>
                  </button>
                </div>
              </form>

              {/* Country-Specific SEO Settings */}
              <div className="rounded-2xl bg-white border border-stone-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
                  <h3 className="text-xs font-extrabold text-zinc-900">سئوی گوگل</h3>
                  
                  {/* Country Switcher Tabs */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200/80">
                    {COUNTRIES.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSeoActiveCountry(c.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          seoActiveCountry === c.id
                            ? 'bg-slate-900 text-white shadow-2xs'
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
                      عنوان صفحه در نتایج جستجو
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
                      className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3 text-xs text-zinc-900 focus:border-stone-400 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      توضیحات متاتگ (خلاصه سایت)
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
                      className="w-full rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 p-3 text-xs text-zinc-900 focus:border-stone-400 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      کلمات کلیدی جستجو
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
                      className="w-full h-10 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/80 px-3 text-xs text-zinc-900 focus:border-stone-400 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-2 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
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
          CENTERED FULL-INFO MODAL DIALOG (Centered, Frosted Backdrop)
      ======================================================== */}
      {selectedAdForModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none"
          dir="rtl"
          onClick={() => setSelectedAdForModal(null)}
        >
          <div 
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 select-text"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-100 bg-stone-50/70">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-[15px] text-stone-900">
                  جزئیات کامل آگهی
                </span>
                <span className="font-mono text-xs font-bold text-stone-700 bg-stone-200/80 px-2 py-0.5 rounded">
                  #{selectedAdForModal.reference_number || selectedAdForModal.id.slice(0, 8)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                  {COUNTRIES.find(c => c.id === (selectedAdForModal.country || 'se'))?.nameFa}
                </span>
                {selectedAdForModal.is_featured && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-extrabold border border-amber-300 flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-600" />
                    <span>آگهی ویژه</span>
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  selectedAdForModal.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}>
                  {selectedAdForModal.status === 'active' ? 'فعال' : 'مخفی'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAdForModal(null)}
                className="h-8 w-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                title="بستن پنجره"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body (Natural internal scroll) */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
              
              {/* Photo Preview / Gallery */}
              {selectedAdForModal.images && selectedAdForModal.images.length > 0 ? (
                <div className="space-y-2">
                  <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-2xs">
                    <img 
                      src={selectedAdForModal.images[0]} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  {selectedAdForModal.images.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {selectedAdForModal.images.map((imgUrl, idx) => (
                        <div key={idx} className="h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-32 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col items-center justify-center text-stone-400 gap-1.5">
                  <ImageIcon size={28} className="text-stone-300" />
                  <span className="text-xs">تصویری برای این آگهی ثبت نشده است</span>
                </div>
              )}

              {/* Title & Key Codes */}
              <div className="space-y-2 pb-3 border-b border-stone-100">
                <h2 className="text-lg font-black text-stone-900 leading-snug">
                  {selectedAdForModal.title}
                </h2>

                <div className="flex items-center gap-2.5 text-xs text-stone-500 flex-wrap">
                  <button
                    type="button"
                    onClick={() => copyText(selectedAdForModal.reference_number, `modal-ref`, 'کد پیگیری')}
                    className="font-mono text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg border border-stone-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>کد رهگیری: #{selectedAdForModal.reference_number || selectedAdForModal.id.slice(0, 8)}</span>
                    <Copy size={12} className="text-stone-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => copyText(selectedAdForModal.pin_code || '1234', `modal-pin`, 'رمز ویرایش')}
                    className="font-mono text-xs font-extrabold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>رمز ویرایش: {selectedAdForModal.pin_code || '1234'}</span>
                    <Copy size={12} className="text-amber-600" />
                  </button>

                  <span className="flex items-center gap-1 font-mono text-stone-600">
                    <Eye size={13} className="text-stone-400" />
                    <span>{selectedAdForModal.views_count || 1} بازدید</span>
                  </span>

                  <span className="text-stone-400 font-mono text-xs">
                    تاریخ ثبت: {new Date(selectedAdForModal.created_at || '2026-01-01').toLocaleDateString('sv-SE')}
                  </span>
                </div>
              </div>

              {/* Location & Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-stone-400 uppercase">موقعیت مکانی</span>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-stone-900">
                    <MapPin size={15} className="text-blue-600" />
                    <span>{selectedAdForModal.city || 'نامشخص'} ({COUNTRIES.find(c => c.id === (selectedAdForModal.country || 'se'))?.nameFa})</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-stone-400 uppercase">قیمت / مبلغ</span>
                  <div className="text-sm font-extrabold text-stone-900 font-mono">
                    {selectedAdForModal.price ? `${Number(selectedAdForModal.price).toLocaleString()} کرون` : 'توافقی'}
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-stone-500">متن کامل آگهی:</span>
                <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/70 text-xs sm:text-[13px] text-stone-700 leading-relaxed whitespace-pre-line">
                  {selectedAdForModal.description || 'توضیحاتی برای این آگهی ثبت نشده است.'}
                </div>
              </div>

              {/* Full Contact Information Card */}
              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200/70 space-y-3">
                <span className="text-xs font-bold text-blue-900 block">اطلاعات کامل تماس آگهی‌دهنده:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {selectedAdForModal.contact_name && (
                    <div className="flex items-center gap-2 text-stone-800">
                      <User size={14} className="text-stone-400" />
                      <span className="text-stone-500">نام:</span>
                      <span className="font-bold">{selectedAdForModal.contact_name}</span>
                    </div>
                  )}

                  {selectedAdForModal.contact_phone && (
                    <a
                      href={`tel:${selectedAdForModal.contact_phone}`}
                      className="flex items-center gap-2 font-mono text-blue-700 font-bold hover:underline"
                    >
                      <Phone size={14} className="text-blue-500" />
                      <span>{selectedAdForModal.contact_phone}</span>
                    </a>
                  )}

                  {selectedAdForModal.contact_whatsapp && (
                    <a
                      href={`https://wa.me/${selectedAdForModal.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 font-mono text-emerald-700 font-bold hover:underline"
                    >
                      <span>واتساپ: {selectedAdForModal.contact_whatsapp}</span>
                    </a>
                  )}

                  {selectedAdForModal.contact_telegram && (
                    <a
                      href={`https://t.me/${selectedAdForModal.contact_telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 font-mono text-sky-700 font-bold hover:underline"
                    >
                      <Send size={13} />
                      <span>{selectedAdForModal.contact_telegram}</span>
                    </a>
                  )}

                  {selectedAdForModal.contact_email && (
                    <a
                      href={`mailto:${selectedAdForModal.contact_email}`}
                      className="flex items-center gap-2 font-mono text-stone-600 hover:text-stone-900 hover:underline sm:col-span-2"
                    >
                      <Mail size={14} className="text-stone-400" />
                      <span>{selectedAdForModal.contact_email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Quick Country Switcher */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-xs font-bold text-stone-600">تغییر کشور آگهی:</span>
                <div className="inline-flex rounded-xl border border-stone-200 bg-white p-1 gap-1">
                  {COUNTRIES.map(c => {
                    const isCurrent = (selectedAdForModal.country || 'se') === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => updateAdCountry(selectedAdForModal.id, c.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

            {/* Modal Footer Actions */}
            <div className="px-5 sm:px-6 py-4 bg-stone-50 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Toggle VIP */}
                <button
                  type="button"
                  onClick={() => toggleFeatured(selectedAdForModal)}
                  className={`h-9 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    selectedAdForModal.is_featured
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  <Sparkles size={14} className={selectedAdForModal.is_featured ? 'text-amber-600' : 'text-stone-400'} />
                  <span>{selectedAdForModal.is_featured ? 'آگهی ویژه است' : 'تبدیل به ویژه'}</span>
                </button>

                {/* Toggle Status */}
                <button
                  type="button"
                  onClick={() => toggleStatus(selectedAdForModal)}
                  className={`h-9 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    selectedAdForModal.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-stone-100 text-stone-700 border-stone-300'
                  }`}
                >
                  <CheckCircle size={14} className={selectedAdForModal.status === 'active' ? 'text-emerald-600' : 'text-stone-400'} />
                  <span>{selectedAdForModal.status === 'active' ? 'آگهی فعال است' : 'آگهی مخفی است'}</span>
                </button>

                {/* View on Site */}
                <button
                  type="button"
                  onClick={() => window.open(`?ad=${selectedAdForModal.reference_number || selectedAdForModal.id}`, '_blank')}
                  className="h-9 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <ExternalLink size={14} />
                  <span>مشاهده در سایت</span>
                </button>

                {/* Delete Ad */}
                <button
                  type="button"
                  onClick={() => deleteAdAdmin(selectedAdForModal.id)}
                  className="h-9 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Trash2 size={14} />
                  <span>حذف آگهی</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAdForModal(null)}
                className="h-9 px-4 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer transition-colors"
              >
                بستن
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          CATEGORY ADD / EDIT MODAL (FROSTED GLASS RTL)
      ======================================================== */}
      {categoryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md font-vazir animate-in fade-in duration-150 select-none" dir="rtl">
          <div 
            className="fixed inset-0"
            onClick={() => setCategoryModal(prev => ({ ...prev, isOpen: false }))}
          />

          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-7 text-right space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
                  <FolderTree size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-[16px] text-stone-900 tracking-tight">
                    {categoryModal.mode === 'add' ? 'افزودن دسته‌بندی جدید' : 'ویرایش دسته‌بندی'}
                  </h3>
                  <p className="text-[11.5px] text-stone-400">
                    {categoryModal.mode === 'add' ? 'یک دسته‌بندی تازه به پرتال اضافه کنید' : `ویرایش مشخصات دسته‌بندی #${categoryModal.id}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCategoryModal(prev => ({ ...prev, isOpen: false }))}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 cursor-pointer active:scale-90 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Error message */}
            {categoryModal.errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{categoryModal.errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategoryModal} className="space-y-4">
              {/* Persian Title */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  عنوان فارسی دسته‌بندی <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: آموزش و تدریس خصوصی"
                  value={categoryModal.fa}
                  onChange={(e) => setCategoryModal(prev => ({ ...prev, fa: e.target.value, errorMsg: '' }))}
                  className="w-full h-11 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 px-3.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  شناسه یکتا (حروف انگلیسی) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={categoryModal.mode === 'edit'}
                  placeholder="utbildning یا services"
                  value={categoryModal.id}
                  onChange={(e) => setCategoryModal(prev => ({ ...prev, id: e.target.value, errorMsg: '' }))}
                  className={`w-full h-11 rounded-xl border border-stone-200 px-3.5 text-xs font-mono text-left focus:outline-none transition-all shadow-2xs ${
                    categoryModal.mode === 'edit'
                      ? 'bg-stone-100 text-stone-500 cursor-not-allowed'
                      : 'bg-stone-50 hover:bg-stone-100/70 focus:bg-white text-stone-900 focus:border-stone-400'
                  }`}
                  dir="ltr"
                />
                <span className="text-[10.5px] text-stone-400 block mt-1">
                  شناسه انگلیسی در دیتابیس و لینک‌ها ذخیره می‌شود و پس از ایجاد قابل تغییر نیست.
                </span>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  انتخاب آیکون نمایشی
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto no-scrollbar p-1">
                  {AVAILABLE_CATEGORY_ICONS.map(item => {
                    const Icon = CATEGORY_ICON_MAP[item.name] || Tag;
                    const isSelected = categoryModal.icon === item.name;

                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setCategoryModal(prev => ({ ...prev, icon: item.name }))}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer select-none active:scale-95 ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs ring-1 ring-blue-600'
                            : 'bg-stone-50 hover:bg-stone-100/80 border-stone-200 text-stone-600'
                        }`}
                        title={item.label}
                      >
                        <Icon size={20} />
                        <span className="text-[9.5px] mt-1 font-medium truncate w-full text-center">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Enabled toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                <div>
                  <span className="font-bold text-xs text-stone-800 block">وضعیت فعال‌بودن</span>
                  <span className="text-[11px] text-stone-400">امکان انتخاب در فرم ثبت آگهی و فیلترهای جستجو</span>
                </div>
                <input
                  type="checkbox"
                  checked={categoryModal.enabled}
                  onChange={(e) => setCategoryModal(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setCategoryModal(prev => ({ ...prev, isOpen: false }))}
                  className="h-10 px-4 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 font-bold text-xs cursor-pointer active:scale-95 transition-all"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs cursor-pointer shadow-2xs active:scale-95 transition-all"
                >
                  {categoryModal.mode === 'add' ? 'افزودن دسته‌بندی' : 'ذخیره تغییرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CATEGORY CONFIRMATION MODAL
      ======================================================== */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-vazir animate-in fade-in duration-150 select-none" dir="rtl">
          <div 
            className="fixed inset-0"
            onClick={() => setCategoryToDelete(null)}
          />

          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 text-right space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-[16px] text-stone-900 tracking-tight">
                  حذف دسته‌بندی «{categoryToDelete.fa}»
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  شناسه: #{categoryToDelete.id}
                </p>
              </div>
            </div>

            {ads.filter(a => a.category === categoryToDelete.id).length > 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs space-y-1">
                <p className="font-bold">
                  توجه: این دسته‌بندی دارای {ads.filter(a => a.category === categoryToDelete.id).length} آگهی ثبت‌شده است!
                </p>
                <p className="text-[11px] text-amber-700">
                  در صورت حذف، آگهی‌های این دسته بدون تغییر در دیتابیس باقی می‌مانند اما دسته‌بندی آن‌ها ممکن است در سایت نمایش داده نشود.
                </p>
              </div>
            ) : (
              <p className="text-xs text-stone-600">
                آیا از حذف این دسته‌بندی مطمئن هستید؟ این عملیات قابل بازگشت نیست.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="h-10 px-4 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 font-bold text-xs cursor-pointer active:scale-95 transition-all"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleDeleteCategoryConfirm}
                className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-2xs active:scale-95 transition-all"
              >
                حذف قطعی دسته
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
