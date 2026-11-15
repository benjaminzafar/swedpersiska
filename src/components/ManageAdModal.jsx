import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  ShieldAlert, 
  ArrowRight,
  Save
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { t } from '../lib/translations';

export default function ManageAdModal({ lang, onClose, onDeleted, onUpdated }) {
  const currentT = t[lang];

  // Auth step
  const [refInput, setRefInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [matchedAd, setMatchedAd] = useState(null);

  // Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editPhone, setEditPhone] = useState('');

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Find ad by reference number and verify PIN
  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanRef = refInput.trim().toUpperCase();
    const cleanPin = pinInput.trim();

    if (!cleanRef || !cleanPin) {
      setErrorMsg(lang === 'fa' ? 'لطفا کد مرجع و پین را وارد کنید.' : 'Vänligen ange både referensnummer och PIN.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('swedpersiska_ads')
        .select('*')
        .eq('reference_number', cleanRef)
        .single();

      if (error || !data) {
        throw new Error(lang === 'fa' ? 'آگهی با این شماره مرجع یافت نشد.' : 'Hittade ingen annons med detta referensnummer.');
      }

      if (data.pin_code !== cleanPin) {
        throw new Error(lang === 'fa' ? 'پین کد وارد شده صحیح نیست.' : 'Felaktig PIN-kod för denna annons.');
      }

      setMatchedAd(data);
      setEditTitle(data.title);
      setEditPrice(data.price || '');
      setEditDesc(data.description);
      setEditStatus(data.status);
      setEditPhone(data.contact_phone || '');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Kunde inte hitta annonsen.');
    } finally {
      setLoading(false);
    }
  };

  // Permanently delete ad from Supabase
  const handleDeleteAd = async () => {
    if (!matchedAd) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('swedpersiska_ads')
        .delete()
        .eq('id', matchedAd.id)
        .eq('pin_code', matchedAd.pin_code);

      if (error) throw error;

      setDeleteSuccess(true);
      if (onDeleted) {
        onDeleted(matchedAd.id);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Kunde inte ta bort annonsen.');
    } finally {
      setLoading(false);
    }
  };

  // Save edits
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!matchedAd) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('swedpersiska_ads')
        .update({
          title: editTitle.trim(),
          price: editPrice ? parseFloat(editPrice) : null,
          description: editDesc.trim(),
          status: editStatus,
          contact_phone: editPhone.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchedAd.id)
        .select()
        .single();

      if (error) throw error;

      setMatchedAd(data);
      setIsEditing(false);
      if (onUpdated) {
        onUpdated(data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Kunde inte uppdatera annonsen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">
                {currentT.manageAdBtn}
              </h2>
              <span className="text-[11px] font-medium text-stone-500">
                {lang === 'fa' ? 'حذف یا ویرایش با کد پیگیری و پین' : 'Hantera & radera via referensnummer'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 active:scale-95 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {deleteSuccess ? (
            /* Delete Completed Screen */
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-black text-stone-900">
                {currentT.adDeletedSuccess}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {lang === 'fa' 
                  ? 'آگهی و کلیه اطلاعات مربوط به آن به صورت دائمی از پایگاه داده حذف گردید.'
                  : 'Annonsen och dess uppgifter har raderats permanent från databasen.'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs active:scale-95 transition-all"
                >
                  {currentT.close}
                </button>
              </div>
            </div>
          ) : !matchedAd ? (
            /* Step 1: Input Reference & PIN */
            <form onSubmit={handleVerify} className="space-y-4">
              
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 text-xs text-amber-900 leading-relaxed">
                {currentT.enterRefPin}
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {currentT.referenceNo} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="T.ex. SP-2611-B891"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 font-mono text-sm font-bold text-stone-900 uppercase focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {currentT.pinCode} *
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 font-mono text-base font-bold text-stone-900 tracking-widest focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs py-3 active:scale-98 transition-all disabled:opacity-50"
                >
                  <span>{loading ? (lang === 'fa' ? 'در حال بررسی...' : 'Söker...') : (lang === 'fa' ? 'یافتن و تایید آگهی' : 'Hitta annons')}</span>
                  <ArrowRight size={15} />
                </button>
              </div>

            </form>
          ) : (
            /* Step 2: Ad is Matched, Show Actions */
            <div className="space-y-5">
              
              {/* Ad Card Snapshot */}
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white text-stone-800 border border-stone-200">
                    <bdi>{matchedAd.reference_number}</bdi>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10.5px] font-semibold uppercase ${
                    matchedAd.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-stone-200 text-stone-700'
                  }`}>
                    {matchedAd.status === 'active' ? (lang === 'fa' ? 'فعال' : 'Aktiv') : matchedAd.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    {matchedAd.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-stone-500 tabular-nums">
                    <span>{matchedAd.city}</span>
                    <span>•</span>
                    <span><bdi>{matchedAd.price ? `${matchedAd.price} ${matchedAd.price_type}` : 'Enligt ök'}</bdi></span>
                    <span>•</span>
                    <span>{matchedAd.views_count || 1} visningar</span>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Editing Form if triggered */}
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-3 border-t border-stone-100 pt-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Titel</label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 p-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Pris</label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 p-2 text-xs"
                      >
                        <option value="active">Aktiv / فعال</option>
                        <option value="sold">Såld / فروخته شد</option>
                        <option value="rented">Uthyrd / اجاره داده شد</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Beskrivning</label>
                    <textarea
                      rows={3}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 p-2 text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs py-2.5 active:scale-95 transition-all"
                    >
                      <Save size={14} />
                      <span>{lang === 'fa' ? 'ذخیره تغییرات' : 'Spara ändringar'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs"
                    >
                      Avbryt
                    </button>
                  </div>
                </form>
              ) : (
                /* Action buttons: Edit or Delete */
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs py-2.5 border border-stone-200 active:scale-95 transition-all"
                  >
                    <Edit3 size={15} />
                    <span>{lang === 'fa' ? 'ویرایش اطلاعات آگهی' : 'Redigera annons'}</span>
                  </button>

                  {/* Delete Block */}
                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs py-2.5 border border-rose-200 active:scale-95 transition-all"
                    >
                      <Trash2 size={15} />
                      <span>{currentT.deleteAd}</span>
                    </button>
                  ) : (
                    <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 text-rose-900 text-xs font-bold">
                        <ShieldAlert size={16} className="text-rose-600 shrink-0" />
                        <span>{currentT.confirmDelete}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleDeleteAd}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 shadow-xs active:scale-95 transition-all"
                        >
                          <Trash2 size={14} />
                          <span>{loading ? (lang === 'fa' ? 'در حال حذف...' : 'Raderar...') : (lang === 'fa' ? 'بله، حذف کن' : 'Ja, radera nu')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="px-4 py-2 rounded-xl bg-stone-200 text-stone-800 font-bold text-xs hover:bg-stone-300"
                        >
                          {lang === 'fa' ? 'انصراف' : 'Avbryt'}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setMatchedAd(null)}
                    className="w-full text-center text-xs text-stone-500 hover:text-stone-800 pt-2"
                  >
                    ← {lang === 'fa' ? 'ورود با کد پیگیری دیگر' : 'Ange annat referensnummer'}
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
