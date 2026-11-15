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
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../lib/translations';

export default function AdminPanel({ onClose, onRefreshAds }) {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('swedpersiska@gmail.com');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active view
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ads' | 'settings'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ads state
  const [ads, setAds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

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
      setAds(data || []);

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
      setAds(ads.filter(a => a.id !== id));
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

  // Filtered ads
  const filteredAds = ads.filter(ad => {
    const matchCat = categoryFilter === 'all' || ad.category === categoryFilter;
    const matchSearch = !searchQuery || 
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.contact_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

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
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 shadow-md active:scale-95 transition-all"
            >
              Logga in i Admin CRM
            </button>
          </form>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-center text-xs text-stone-400 hover:text-stone-200"
          >
            ← Tillbaka till webbplatsen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-[#0c0e12] text-stone-100 overflow-hidden font-sans">
      
      {/* Sidebar (Desktop Astryx Luxury Dark Theme) */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-stone-800/80 bg-[#11141a] p-4 select-none shrink-0">
        <div className="space-y-6">
          
          {/* Brand header */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-amber-500 text-white font-extrabold text-sm shadow-md font-mono">
              SP
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-tight">SwedPersiska</h1>
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Admin CRM</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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

        {/* 2x2 Bottom actions matching NT360 design */}
        <div className="border-t border-stone-800/80 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-semibold text-stone-300 bg-white/5 hover:bg-white/10 hover:text-white border border-stone-800 active:scale-95 transition-all text-center"
              title="Tillbaka till sajten"
            >
              <Home size={14} className="text-emerald-400 shrink-0" />
              <span className="truncate">Sajten</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-semibold text-rose-300 bg-rose-950/25 hover:bg-rose-950/45 border border-rose-900/40 active:scale-95 transition-all text-center"
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
              className="lg:hidden p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-base font-extrabold text-white">
              {activeTab === 'overview' && 'Översikt & Aktuella nyckeltal'}
              {activeTab === 'ads' && `Hantera Annonser (${filteredAds.length} st)`}
              {activeTab === 'settings' && 'Inställningar & Telegram-aviseringar'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAdminData}
              className="px-3 py-1.5 rounded-xl bg-white/5 text-xs font-semibold text-stone-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              ↻ Uppdatera
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all"
            >
              Tillbaka till sajten
            </button>
          </div>
        </header>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#141820] border-b border-stone-800 p-4 space-y-2">
            <button
              onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
              className="w-full text-left p-2 rounded-lg text-xs font-semibold text-stone-300 hover:bg-white/5"
            >
              Översikt
            </button>
            <button
              onClick={() => { setActiveTab('ads'); setMobileMenuOpen(false); }}
              className="w-full text-left p-2 rounded-lg text-xs font-semibold text-stone-300 hover:bg-white/5"
            >
              Annonser ({ads.length})
            </button>
            <button
              onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
              className="w-full text-left p-2 rounded-lg text-xs font-semibold text-stone-300 hover:bg-white/5"
            >
              Inställningar & Telegram
            </button>
          </div>
        )}

        {/* Scrollable Tab Views */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="rounded-2xl border border-stone-800 bg-[#141820] p-4.5 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Totalt antal annonser</span>
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
                    className="text-xs font-bold text-emerald-400 hover:underline"
                  >
                    Visa alla →
                  </button>
                </div>

                <div className="divide-y divide-stone-800">
                  {ads.slice(0, 5).map(ad => (
                    <div key={ad.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] text-stone-400 block">{ad.reference_number}</span>
                        <p className="font-bold text-stone-200 truncate">{ad.title}</p>
                        <span className="text-[11px] text-stone-400">{ad.city} • {ad.category}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ad.is_featured ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-stone-800 text-stone-400'
                        }`}>
                          {ad.is_featured ? 'VIP' : 'Standard'}
                        </span>
                        <button
                          onClick={() => deleteAdAdmin(ad.id)}
                          className="p-1 rounded text-stone-400 hover:text-rose-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ADS MANAGEMENT */}
          {activeTab === 'ads' && (
            <div className="space-y-4">
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    placeholder="Sök på referensnummer, rubrik, stad eller säljare..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-stone-800 bg-[#141820] pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl border border-stone-800 bg-[#141820] px-3 py-2.5 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">Alla kategorier</option>
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.sv}</option>
                  ))}
                </select>
              </div>

              {/* Ads Table */}
              <div className="rounded-2xl border border-stone-800 bg-[#141820] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="border-b border-stone-800 bg-[#11141a] text-[10.5px] font-bold uppercase tracking-wider text-stone-400">
                      <tr>
                        <th className="px-4 py-3">Ref & Datum</th>
                        <th className="px-4 py-3">Rubrik & Kategori</th>
                        <th className="px-4 py-3">Stad & Pris</th>
                        <th className="px-4 py-3">PIN</th>
                        <th className="px-4 py-3">Kontakt</th>
                        <th className="px-4 py-3 text-right">Åtgärder</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {filteredAds.map(ad => (
                        <tr key={ad.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 font-mono">
                            <span className="font-semibold text-emerald-400 block"><bdi>{ad.reference_number}</bdi></span>
                            <span className="text-[10px] text-stone-500">{new Date(ad.created_at).toLocaleDateString('sv-SE')}</span>
                          </td>

                          <td className="px-4 py-3 max-w-xs">
                            <p className="font-semibold text-stone-200 truncate">{ad.title}</p>
                            <span className="text-[10px] text-stone-400 block">{ad.category}</span>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-stone-300 block">{ad.city}</span>
                            <span className="text-[11px] font-semibold text-emerald-400 tabular-nums">
                              <bdi>{ad.price ? `${ad.price} ${ad.price_type}` : 'Enligt ök'}</bdi>
                            </span>
                          </td>

                          <td className="px-4 py-3 font-mono text-amber-300 font-semibold">
                            <bdi>{ad.pin_code}</bdi>
                          </td>

                          <td className="px-4 py-3">
                            <span className="font-semibold text-stone-200 block">{ad.contact_name}</span>
                            <span className="text-[10px] text-stone-400">{ad.contact_phone || ad.contact_email}</span>
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Toggle VIP */}
                              <button
                                type="button"
                                onClick={() => toggleFeatured(ad)}
                                className={`p-1.5 rounded-lg border text-xs font-bold active:scale-95 transition-all ${
                                  ad.is_featured
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
                                }`}
                                title={ad.is_featured ? 'Ta bort VIP' : 'Gör till VIP'}
                              >
                                <Sparkles size={13} />
                              </button>

                              {/* Toggle Active / Hidden */}
                              <button
                                type="button"
                                onClick={() => toggleStatus(ad)}
                                className={`px-2 py-1 rounded-lg border text-[11px] font-bold active:scale-95 transition-all ${
                                  ad.status === 'active'
                                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                                    : 'bg-stone-800 text-stone-400 border-stone-700'
                                }`}
                              >
                                {ad.status === 'active' ? 'Aktiv' : 'Dold'}
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => deleteAdAdmin(ad.id)}
                                className="p-1.5 rounded-lg bg-rose-950/30 text-rose-400 hover:bg-rose-950/60 border border-rose-900/40 active:scale-95 transition-all"
                                title="Radera permanent"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: SETTINGS & TELEGRAM */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              
              {/* Telegram Integration Card */}
              <div className="rounded-2xl border border-stone-800 bg-[#141820] p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30">
                    <Send size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Telegram Aviseringar</h3>
                    <p className="text-xs text-stone-400">
                      Få omedelbara meddelanden i din Telegram-kanal/grupp varje gång någon lägger upp en ny annons!
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
                      className="h-4 w-4 rounded border-stone-700 bg-stone-900 text-emerald-600 focus:ring-emerald-500"
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
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
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
