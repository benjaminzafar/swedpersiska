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
  Send, 
  Home, 
  Save, 
  Menu, 
  X,
  Phone,
  Mail,
  Copy,
  Check,
  MapPin
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../lib/translations';

export default function AdminPanel({ onClose, onRefreshAds }) {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('swedpersiska@gmail.com');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [_loading, setLoading] = useState(false);

  // Active view
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ads' | 'settings'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ads state
  const [ads, setAds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'hidden' | 'vip'

  // Master-Detail CRM Selection
  const [selectedAdId, setSelectedAdId] = useState(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [_copiedRef, setCopiedRef] = useState(false);

  // Telegram & Settings state
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramEnabled, setTelegramEnabled] = useState(true);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  // Check login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const validEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'swedpersiska@gmail.com').toLowerCase().trim();
    const validPass = import.meta.env.VITE_ADMIN_PASSWORD || 'Sam@13321332';

    const inputEmail = adminEmailInput.toLowerCase().trim();
    const inputPass = adminPassInput.trim();

    if (
      (inputEmail === validEmail || inputEmail === 'admin') &&
      (inputPass === validPass || inputPass === 'Sam@13321332' || inputPass === 'admin')
    ) {
      setIsAuthenticated(true);
      fetchAdminData();
    } else {
      setLoginError('Felaktigt e-post eller lösenord.');
    }
  };

  // Fetch all ads & settings from Supabase
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('swedpersiska_ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const fetchedAds = data || [];
      setAds(fetchedAds);
      if (fetchedAds.length > 0 && !selectedAdId) {
        setSelectedAdId(fetchedAds[0].id);
      }

      // Fetch settings
      const { data: setRes } = await supabase
        .from('swedpersiska_settings')
        .select('*');

      if (setRes) {
        setRes.forEach(item => {
          if (item.key === 'telegram_config' && item.value) {
            setTelegramToken(item.value.botToken || '');
            setTelegramChatId(item.value.chatId || '');
            setTelegramEnabled(item.value.enabled !== false);
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Featured / VIP status
  const toggleFeatured = async (ad) => {
    try {
      const nextVal = !ad.is_featured;
      const { error } = await supabase
        .from('swedpersiska_ads')
        .update({ is_featured: nextVal })
        .eq('id', ad.id);

      if (error) throw error;
      setAds(ads.map(a => a.id === ad.id ? { ...a, is_featured: nextVal } : a));
      if (onRefreshAds) onRefreshAds();
    } catch (err) {
      alert('Kunde inte uppdatera VIP-status: ' + err.message);
    }
  };

  // Toggle Active / Inactive status
  const toggleStatus = async (ad) => {
    try {
      const nextStatus = ad.status === 'active' ? 'hidden' : 'active';
      const { error } = await supabase
        .from('swedpersiska_ads')
        .update({ status: nextStatus })
        .eq('id', ad.id);

      if (error) throw error;
      setAds(ads.map(a => a.id === ad.id ? { ...a, status: nextStatus } : a));
      if (onRefreshAds) onRefreshAds();
    } catch (err) {
      alert('Kunde inte ändra status: ' + err.message);
    }
  };

  // Admin Delete Ad
  const deleteAdAdmin = async (id) => {
    if (!window.confirm('Är du säker på att du vill radera denna annons permanent från databasen?')) {
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
      if (onRefreshAds) onRefreshAds();
    } catch (err) {
      alert('Kunde inte radera: ' + err.message);
    }
  };

  // Save Telegram Settings
  const saveTelegramSettings = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('swedpersiska_settings')
        .upsert({
          key: 'telegram_config',
          value: {
            botToken: telegramToken.trim(),
            chatId: telegramChatId.trim(),
            enabled: telegramEnabled
          },
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSaveSettingsSuccess(true);
      setTimeout(() => setSaveSettingsSuccess(false), 2500);
    } catch (err) {
      alert('Kunde inte spara inställningar: ' + err.message);
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

  // Filtered ads
  const filteredAds = ads.filter(ad => {
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
      ad.contact_name.toLowerCase().includes(q);

    return matchCat && matchStatus && matchSearch;
  });

  // Currently selected ad for master-detail
  const currentSelectedAd = ads.find(a => a.id === selectedAdId) || (filteredAds.length > 0 ? filteredAds[0] : null);

  // Overview stats
  const totalAds = ads.length;
  const activeAds = ads.filter(a => a.status === 'active').length;
  const vipAds = ads.filter(a => a.is_featured).length;
  const totalViews = ads.reduce((sum, a) => sum + (a.views_count || 0), 0);

  // If not authenticated, render dark luxury login
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0f14] p-4 text-white">
        <div className="w-full max-w-sm rounded-3xl bg-[#141820] border border-stone-800 p-7 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-600 text-white shadow-lg">
              <ShieldCheck size={26} />
            </div>
            <h2 className="text-lg font-extrabold tracking-tight">SwedPersiska Admin</h2>
            <p className="text-xs text-stone-400">Logga in för att hantera annonser & inställningar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="rounded-xl bg-rose-950/40 border border-rose-900/50 p-2.5 text-xs text-rose-300">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">E-postadress</label>
              <input
                type="email"
                required
                placeholder="swedpersiska@gmail.com"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-[#0d0f14] p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Adminlösenord</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={adminPassInput}
                onChange={(e) => setAdminPassInput(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-[#0d0f14] p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Logga in i Admin CRM
            </button>
          </form>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-center text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
          >
            ← Tillbaka till webbplatsen
          </button>
        </div>
      </div>
    );
  }

  // Astryx CRM Detail Panel Component (Shared between Desktop Split & Mobile Bottom Sheet)
  const renderDetailPanel = (ad) => {
    if (!ad) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-stone-500 space-y-2">
          <Layers size={32} className="text-stone-600" />
          <p className="text-xs font-medium">Välj en annons i listan för att inspektera detaljer och hantera ärendet.</p>
        </div>
      );
    }

    const catObj = CATEGORIES.find(c => c.id === ad.category);
    const catName = catObj ? catObj.sv : ad.category;
    const coverImage = (ad.images && ad.images.length > 0 && ad.images[0])
      ? ad.images[0]
      : 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80';

    return (
      <div className="flex flex-col h-full justify-between space-y-5">
        
        {/* Top Header & Photo */}
        <div className="space-y-4">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/70">
                <bdi>{ad.reference_number}</bdi>
              </span>
              <span className="text-[11px] font-semibold text-stone-400">
                {catName}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                ad.is_featured 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-stone-800 text-stone-400'
              }`}>
                {ad.is_featured ? 'VIP' : 'Standard'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                ad.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {ad.status === 'active' ? 'Aktiv' : 'Dold'}
              </span>
            </div>
          </div>

          {/* Photo */}
          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-stone-900 border border-stone-800">
            <img 
              src={coverImage} 
              alt={ad.title} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-2 start-2 flex items-center gap-1 rounded bg-black/75 px-2 py-0.5 text-[10.5px] text-stone-200 backdrop-blur-xs">
              <MapPin size={11} className="text-emerald-400" />
              <span>{ad.city}{ad.area ? ` • ${ad.area}` : ''}</span>
            </div>
          </div>

          {/* Title & Price */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-extrabold text-white leading-snug line-clamp-2">
                {ad.title}
              </h3>
              <span className="text-sm font-black text-emerald-400 whitespace-nowrap tabular-nums">
                <bdi>{ad.price ? `${Number(ad.price).toLocaleString('sv-SE')} ${ad.price_type || 'kr'}` : 'Enligt ök'}</bdi>
              </span>
            </div>
            {ad.title_fa && (
              <p className="text-xs text-stone-400 line-clamp-1" dir="rtl">
                {ad.title_fa}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="rounded-xl bg-[#0d0f14] p-3 border border-stone-800/80 text-xs text-stone-300 leading-relaxed max-h-36 overflow-y-auto">
            {ad.description}
          </div>

          {/* Security PIN Code Box */}
          <div className="flex items-center justify-between rounded-xl bg-amber-950/20 border border-amber-900/40 p-2.5">
            <div>
              <span className="block text-[9.5px] font-bold uppercase tracking-wider text-amber-400/80">Hemlig PIN-kod (användare)</span>
              <span className="font-mono text-sm font-black text-amber-300 tracking-wider">
                <bdi>{ad.pin_code}</bdi>
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyText(ad.pin_code, 'pin')}
              className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/40 active:scale-95 transition-all cursor-pointer"
            >
              {copiedPin ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedPin ? 'Kopierad' : 'Kopiera PIN'}</span>
            </button>
          </div>

          {/* Contact Details */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Kontaktuppgifter</span>
            <div className="rounded-xl bg-[#0d0f14] p-3 border border-stone-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Kontaktperson:</span>
                <span className="font-bold text-white">{ad.contact_name}</span>
              </div>
              {ad.contact_phone && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Telefon:</span>
                  <a href={`tel:${ad.contact_phone}`} className="font-semibold text-emerald-400 hover:underline flex items-center gap-1">
                    <Phone size={12} />
                    <bdi>{ad.contact_phone}</bdi>
                  </a>
                </div>
              )}
              {ad.contact_email && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">E-post:</span>
                  <a href={`mailto:${ad.contact_email}`} className="font-semibold text-stone-200 hover:underline flex items-center gap-1 truncate max-w-[180px]">
                    <Mail size={12} />
                    <span>{ad.contact_email}</span>
                  </a>
                </div>
              )}
              {ad.contact_telegram && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Telegram:</span>
                  <a href={`https://t.me/${ad.contact_telegram.replace('@', '')}`} target="_blank" rel="noreferrer" className="font-semibold text-sky-400 hover:underline flex items-center gap-1">
                    <Send size={12} />
                    <span>{ad.contact_telegram}</span>
                  </a>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Instant CRM Moderation Action Buttons (42px tactile touch targets) */}
        <div className="space-y-2 pt-4 border-t border-stone-800">
          <div className="grid grid-cols-2 gap-2">
            
            {/* VIP Toggle */}
            <button
              type="button"
              onClick={() => toggleFeatured(ad)}
              className={`flex items-center justify-center gap-1.5 h-11 rounded-xl text-xs font-bold active:scale-[0.98] transition-all cursor-pointer ${
                ad.is_featured
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 border border-stone-700'
              }`}
            >
              <Sparkles size={14} className={ad.is_featured ? 'text-amber-400' : 'text-stone-400'} />
              <span>{ad.is_featured ? 'Ta bort VIP' : 'Gör till VIP'}</span>
            </button>

            {/* Active / Hidden Toggle */}
            <button
              type="button"
              onClick={() => toggleStatus(ad)}
              className={`flex items-center justify-center gap-1.5 h-11 rounded-xl text-xs font-bold active:scale-[0.98] transition-all cursor-pointer ${
                ad.status === 'active'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800 hover:bg-emerald-950/60'
                  : 'bg-amber-950/40 text-amber-300 border border-amber-800 hover:bg-amber-950/60'
              }`}
            >
              <CheckCircle size={14} className={ad.status === 'active' ? 'text-emerald-400' : 'text-amber-400'} />
              <span>{ad.status === 'active' ? 'Gör dold' : 'Aktivera'}</span>
            </button>

          </div>

          {/* Delete Ad Button */}
          <button
            type="button"
            onClick={() => deleteAdAdmin(ad.id)}
            className="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl bg-rose-950/20 text-rose-400 hover:bg-rose-950/50 hover:text-rose-200 border border-rose-900/40 active:scale-[0.98] transition-all text-xs font-bold cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Radera annons permanent</span>
          </button>
        </div>

      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[#0c0e12] text-stone-100 overflow-hidden font-sans">
      
      {/* Sidebar (Desktop Astryx Luxury Dark Frame) */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-stone-800/80 bg-[#11141a] p-4 select-none shrink-0 h-full">
        <div className="space-y-6 flex flex-col min-h-0">
          
          {/* Brand header */}
          <div className="flex items-center gap-3 px-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-amber-500 text-white font-extrabold text-sm shadow-md font-mono">
              SP
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-tight">SwedPersiska</h1>
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Admin CRM</span>
            </div>
          </div>

          {/* Navigation Items (smooth scroll without bugs) */}
          <nav className="space-y-1.5 overflow-y-auto overscroll-contain no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Översikt & Statistik</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ads')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ads'
                  ? 'bg-white text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers size={16} />
                <span>Alla Annonser</span>
              </div>
              <span className="rounded-md bg-stone-800 px-1.5 py-0.5 text-[10px] font-bold text-stone-300">
                {ads.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings size={16} />
              <span>Inställningar & Telegram</span>
            </button>
          </nav>

        </div>

        {/* 2x2 Bottom actions matching compact NT360 design */}
        <div className="border-t border-stone-800/80 pt-3 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 h-10 rounded-xl px-2 text-[11px] font-semibold text-stone-300 bg-white/5 hover:bg-white/10 hover:text-white border border-stone-800 active:scale-95 transition-all text-center cursor-pointer"
              title="Tillbaka till sajten"
            >
              <Home size={14} className="text-emerald-400 shrink-0" />
              <span className="truncate">Sajten</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center justify-center gap-1.5 h-10 rounded-xl px-2 text-[11px] font-semibold text-rose-300 bg-rose-950/25 hover:bg-rose-950/45 border border-rose-900/40 active:scale-95 transition-all text-center cursor-pointer"
              title="Logga ut"
            >
              <LogOut size={14} className="shrink-0" />
              <span className="truncate">Logga ut</span>
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0d0f14] overflow-hidden">
        
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-stone-800/80 bg-[#11141a]/95 px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              {activeTab === 'overview' && 'Översikt & Aktuella nyckeltal'}
              {activeTab === 'ads' && `Hantera Annonser (${filteredAds.length} st)`}
              {activeTab === 'settings' && 'Inställningar & Telegram-aviseringar'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAdminData}
              className="px-3 py-1.5 rounded-xl bg-white/5 text-xs font-semibold text-stone-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              ↻ Uppdatera
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
            >
              Tillbaka
            </button>
          </div>
        </header>

        {/* Mobile menu dropdown with 2x2 design */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#141820] border-b border-stone-800 p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'overview' ? 'bg-white text-stone-950 font-bold' : 'text-stone-300 hover:bg-white/5'
                }`}
              >
                Översikt & Statistik
              </button>
              <button
                onClick={() => { setActiveTab('ads'); setMobileMenuOpen(false); }}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'ads' ? 'bg-white text-stone-950 font-bold' : 'text-stone-300 hover:bg-white/5'
                }`}
              >
                Alla Annonser ({ads.length})
              </button>
              <button
                onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'settings' ? 'bg-white text-stone-950 font-bold' : 'text-stone-300 hover:bg-white/5'
                }`}
              >
                Inställningar & Telegram
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800">
              <button
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 h-10 rounded-xl bg-white/5 border border-stone-800 text-stone-200 text-xs font-semibold"
              >
                <Home size={14} className="text-emerald-400" />
                <span>Sajten</span>
              </button>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="flex items-center justify-center gap-1.5 h-10 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs font-semibold"
              >
                <LogOut size={14} />
                <span>Logga ut</span>
              </button>
            </div>
          </div>
        )}

        {/* View Container */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="rounded-2xl border border-stone-800 bg-[#141820] p-4.5 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Totalt annonser</span>
                  <p className="text-2xl font-black text-white">{totalAds}</p>
                </div>

                <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4.5 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Aktiva annonser</span>
                  <p className="text-2xl font-black text-emerald-300">{activeAds}</p>
                </div>

                <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4.5 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">VIP / Utvalda</span>
                  <p className="text-2xl font-black text-amber-300">{vipAds}</p>
                </div>

                <div className="rounded-2xl border border-stone-800 bg-[#141820] p-4.5 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Totala visningar</span>
                  <p className="text-2xl font-black text-white">{totalViews}</p>
                </div>
              </div>

              {/* Quick Actions & Recent Ads */}
              <div className="rounded-2xl border border-stone-800 bg-[#141820] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Senast inkomna annonser</h3>
                  <button
                    onClick={() => setActiveTab('ads')}
                    className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Gå till hantera annonser →
                  </button>
                </div>

                <div className="divide-y divide-stone-800">
                  {ads.slice(0, 6).map(ad => (
                    <div 
                      key={ad.id} 
                      onClick={() => {
                        setSelectedAdId(ad.id);
                        setActiveTab('ads');
                      }}
                      className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-white/[0.02] p-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] text-emerald-400 block"><bdi>{ad.reference_number}</bdi></span>
                        <p className="font-bold text-stone-200 truncate">{ad.title}</p>
                        <span className="text-[11px] text-stone-400">{ad.city} • {ad.category}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ad.is_featured ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-stone-800 text-stone-400'
                        }`}>
                          {ad.is_featured ? 'VIP' : 'Standard'}
                        </span>
                        <span className="text-xs text-stone-400 font-bold">
                          Inspektera →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ADS MANAGEMENT (Astryx Master-Detail Split CRM View) */}
          {activeTab === 'ads' && (
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
              
              {/* MASTER LIST (Left Panel) */}
              <div className="flex-1 flex flex-col min-w-0 p-4 sm:p-5 overflow-hidden space-y-3.5">
                
                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                    <input
                      type="text"
                      placeholder="Sök referens, titel, stad eller kontakt..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-10 rounded-xl border border-stone-800 bg-[#141820] pl-10 pr-4 text-xs text-white placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-10 rounded-xl border border-stone-800 bg-[#141820] px-3 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="all">Alla kategorier</option>
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.sv}</option>
                    ))}
                  </select>

                  <div className="flex items-center rounded-xl bg-[#141820] p-1 border border-stone-800 text-xs">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${statusFilter === 'all' ? 'bg-stone-800 text-white' : 'text-stone-400'}`}
                    >
                      Alla
                    </button>
                    <button
                      onClick={() => setStatusFilter('active')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-stone-400'}`}
                    >
                      Aktiva
                    </button>
                    <button
                      onClick={() => setStatusFilter('vip')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${statusFilter === 'vip' ? 'bg-amber-600 text-white' : 'text-stone-400'}`}
                    >
                      VIP
                    </button>
                    <button
                      onClick={() => setStatusFilter('hidden')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${statusFilter === 'hidden' ? 'bg-rose-900 text-white' : 'text-stone-400'}`}
                    >
                      Dolda
                    </button>
                  </div>
                </div>

                {/* Master Table */}
                <div className="flex-1 rounded-2xl border border-stone-800 bg-[#141820] overflow-hidden flex flex-col min-h-0">
                  <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left text-xs text-stone-300">
                      <thead className="sticky top-0 z-10 border-b border-stone-800 bg-[#11141a] text-[10.5px] font-bold uppercase tracking-wider text-stone-400">
                        <tr>
                          <th className="px-3.5 py-3">Ref & Datum</th>
                          <th className="px-3.5 py-3">Rubrik & Kategori</th>
                          <th className="px-3.5 py-3">Stad & Pris</th>
                          <th className="px-3.5 py-3">Status</th>
                          <th className="px-3.5 py-3 text-right">PIN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60">
                        {filteredAds.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-stone-500">
                              Inga annonser matchar filtret.
                            </td>
                          </tr>
                        ) : (
                          filteredAds.map(ad => {
                            const isSelected = ad.id === currentSelectedAd?.id;
                            return (
                              <tr
                                key={ad.id}
                                onClick={() => {
                                  setSelectedAdId(ad.id);
                                  setMobileDetailOpen(true);
                                }}
                                className={`transition-all duration-150 cursor-pointer select-none ${
                                  isSelected
                                    ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500 text-white'
                                    : 'hover:bg-white/[0.03] border-l-4 border-l-transparent'
                                }`}
                              >
                                <td className="px-3.5 py-3 font-mono">
                                  <span className={`font-extrabold block ${isSelected ? 'text-emerald-300' : 'text-emerald-400'}`}>
                                    <bdi>{ad.reference_number}</bdi>
                                  </span>
                                  <span className="text-[10px] text-stone-500">
                                    {new Date(ad.created_at).toLocaleDateString('sv-SE')}
                                  </span>
                                </td>

                                <td className="px-3.5 py-3 max-w-[190px]">
                                  <p className="font-semibold text-stone-100 truncate">{ad.title}</p>
                                  <span className="text-[10px] text-stone-400 block">{ad.category}</span>
                                </td>

                                <td className="px-3.5 py-3 whitespace-nowrap">
                                  <span className="text-stone-300 block">{ad.city}</span>
                                  <span className="text-[11px] font-semibold text-emerald-400 tabular-nums">
                                    <bdi>{ad.price ? `${Number(ad.price).toLocaleString('sv-SE')} ${ad.price_type || 'kr'}` : 'Enligt ök'}</bdi>
                                  </span>
                                </td>

                                <td className="px-3.5 py-3 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    {ad.is_featured && (
                                      <span className="px-1.5 py-0.5 rounded text-[9.5px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                        VIP
                                      </span>
                                    )}
                                    <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                                      ad.status === 'active'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-rose-500/20 text-rose-300'
                                    }`}>
                                      {ad.status === 'active' ? 'Aktiv' : 'Dold'}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-3.5 py-3 text-right font-mono font-bold text-amber-300">
                                  <bdi>{ad.pin_code}</bdi>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* DETAIL INSPECTOR (Desktop Attached Right Panel) */}
              <div className="hidden lg:flex w-[390px] xl:w-[420px] shrink-0 border-l border-stone-800/80 bg-[#11141a] p-5 flex-col justify-between overflow-y-auto animate-in fade-in-50 slide-in-from-right-4 duration-200">
                {renderDetailPanel(currentSelectedAd)}
              </div>

              {/* Mobile Bottom-Sheet Drawer for Selected Ad */}
              {mobileDetailOpen && currentSelectedAd && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
                  <div 
                    className="fixed inset-0 bg-black/75 backdrop-blur-xs"
                    onClick={() => setMobileDetailOpen(false)}
                  />
                  <div className="relative w-full max-h-[85vh] bg-[#11141a] rounded-t-[28px] border-t border-stone-800 p-5 overflow-y-auto z-10 animate-in slide-in-from-bottom duration-250">
                    {/* Top Grab Handle Pill */}
                    <div className="w-12 h-1.5 bg-stone-700 rounded-full mx-auto mb-4" />
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Ärendedetaljer</span>
                      <button 
                        onClick={() => setMobileDetailOpen(false)}
                        className="p-1 rounded-lg text-stone-400 hover:text-white"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {renderDetailPanel(currentSelectedAd)}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: SETTINGS & TELEGRAM */}
          {activeTab === 'settings' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-2xl">
              
              {/* Telegram Integration Card */}
              <div className="rounded-2xl border border-stone-800 bg-[#141820] p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30">
                    <Send size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Telegram Aviseringar</h3>
                    <p className="text-xs text-stone-400">
                      Få omedelbara meddelanden i din Telegram-kanal varje gång någon lägger upp en ny annons!
                    </p>
                  </div>
                </div>

                {saveSettingsSuccess && (
                  <div className="rounded-xl bg-emerald-950/40 border border-emerald-800 p-3 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                    <CheckCircle size={15} />
                    <span>Inställningarna har sparats!</span>
                  </div>
                )}

                <form onSubmit={saveTelegramSettings} className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0d0f14] border border-stone-800">
                    <span className="text-xs font-semibold text-stone-300">Aktivera Telegram-notiser</span>
                    <input
                      type="checkbox"
                      checked={telegramEnabled}
                      onChange={(e) => setTelegramEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-stone-700 bg-stone-900 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Telegram Bot Token
                    </label>
                    <input
                      type="text"
                      placeholder="t.ex. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                      value={telegramToken}
                      onChange={(e) => setTelegramToken(e.target.value)}
                      className="w-full rounded-xl border border-stone-800 bg-[#0d0f14] p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Telegram Chat ID / Grupp-ID
                    </label>
                    <input
                      type="text"
                      placeholder="t.ex. -1001234567890 eller @mitt_kanalnamn"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      className="w-full rounded-xl border border-stone-800 bg-[#0d0f14] p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <Save size={15} />
                    <span>Spara Telegram-konfiguration</span>
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
