import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  KeyRound, 
  Check, 
  Copy, 
  Sparkles, 
  Image, 
  AlertCircle,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { supabase, generateReferenceNumber, generatePinCode } from '../lib/supabase';
import { CITIES, CATEGORIES, t } from '../lib/translations';

export default function PostAdModal({ lang, onClose, onCreated }) {
  const currentT = t[lang];

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  // Form fields
  const [category, setCategory] = useState('bostad');
  const [city, setCity] = useState('Stockholm');
  const [area, setArea] = useState('');
  const [title, setTitle] = useState('');
  const [titleFa, setTitleFa] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState('kr');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [contactTelegram, setContactTelegram] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagesList, setImagesList] = useState([]);
  const [pinCode, setPinCode] = useState(generatePinCode());

  // Add image to list
  const addImage = () => {
    if (imageUrl.trim()) {
      setImagesList([...imagesList, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const removeImage = (index) => {
    setImagesList(imagesList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !description.trim() || !contactName.trim()) {
      setErrorMsg(lang === 'fa' ? 'لطفا عنوان، توضیحات و نام تماس را پر کنید.' : 'Vänligen fyll i titel, beskrivning och kontaktperson.');
      return;
    }

    if (!contactPhone.trim() && !contactWhatsapp.trim() && !contactEmail.trim() && !contactTelegram.trim()) {
      setErrorMsg(lang === 'fa' ? 'حداقل یکی از راه‌های ارتباطی (تلفن، واتساپ، ایمیل یا تلگرام) را وارد کنید.' : 'Ange minst en kontaktväg (telefon, WhatsApp, e-post eller Telegram).');
      return;
    }

    const refNum = generateReferenceNumber();
    const finalPin = pinCode.trim() || generatePinCode();

    const allImages = [...imagesList];
    if (imageUrl.trim() && !allImages.includes(imageUrl.trim())) {
      allImages.push(imageUrl.trim());
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('swedpersiska_ads')
        .insert([
          {
            reference_number: refNum,
            pin_code: finalPin,
            title: title.trim(),
            title_fa: titleFa.trim() || null,
            category,
            city,
            area: area.trim() || null,
            price: price ? parseFloat(price) : null,
            price_type: priceType,
            description: description.trim(),
            contact_name: contactName.trim(),
            contact_phone: contactPhone.trim() || null,
            contact_whatsapp: contactWhatsapp.trim() || null,
            contact_telegram: contactTelegram.trim() || null,
            contact_email: contactEmail.trim() || null,
            images: allImages.length > 0 ? allImages : ['https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80'],
            is_featured: false,
            status: 'active',
            views_count: 1
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setSuccessData({
        referenceNumber: refNum,
        pinCode: finalPin,
        ad: data
      });

      if (onCreated) {
        onCreated(data);
      }
    } catch (err) {
      console.error('Error posting ad:', err);
      setErrorMsg(err.message || 'Ett fel uppstod vid publicering.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'ref') {
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2000);
      } else {
        setCopiedPin(true);
        setTimeout(() => setCopiedPin(false), 2000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <PlusCircle size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">
                {currentT.postAdBtn}
              </h2>
              <span className="text-[11px] font-medium text-stone-500">
                {lang === 'fa' ? 'ثبت آگهی رایگان همراه با کد اختصاصی' : 'Gratis annonsering med unikt referensnummer'}
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

        {/* Form Body or Success Screen */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {successData ? (
            /* Celebration Success Screen */
            <div className="py-6 text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 animate-bounce">
                <Check size={32} />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-stone-900">
                  {currentT.adCreatedSuccess}
                </h3>
                <p className="text-sm text-stone-600 max-w-md mx-auto">
                  {currentT.saveYourCredentials}
                </p>
              </div>

              {/* Reference & PIN Box */}
              <div className="max-w-md mx-auto rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/60 p-5 space-y-4 text-left">
                
                {/* Reference Number */}
                <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-emerald-200">
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      {currentT.referenceNo}
                    </span>
                    <span className="font-mono text-lg font-extrabold text-emerald-900 tracking-wider">
                      {successData.referenceNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(successData.referenceNumber, 'ref')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    {copiedRef ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedRef ? currentT.copied : currentT.copyRef}</span>
                  </button>
                </div>

                {/* Secret PIN */}
                <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-emerald-200">
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      {currentT.pinCode}
                    </span>
                    <span className="font-mono text-lg font-extrabold text-amber-700 tracking-wider">
                      {successData.pinCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(successData.pinCode, 'pin')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 active:scale-95 transition-all"
                  >
                    {copiedPin ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedPin ? currentT.copied : currentT.copyPin}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-800">
                  <KeyRound size={15} className="shrink-0 text-emerald-600" />
                  <span>
                    {lang === 'fa' 
                      ? 'با این دو مشخصه می‌توانید در هر زمان آگهی خود را ویرایش یا برای همیشه حذف کنید.'
                      : 'Använd dessa två uppgifter under "Hantera min annons" för att uppdatera eller ta bort annonsen.'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-sm shadow-sm active:scale-95 transition-all"
              >
                {currentT.close}
              </button>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Category & City row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'fa' ? 'دسته‌بندی آگهی' : 'Kategori *'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-xs font-medium text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>
                        {lang === 'fa' ? c.fa : c.sv}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'fa' ? 'شهر / استان' : 'Stad i Sverige *'}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-xs font-medium text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {CITIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>
                        {lang === 'fa' ? c.fa : c.sv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Area / Område */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fa' ? 'محله یا منطقه (اختیاری)' : 'Område / stadsdel (valfritt)'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'fa' ? 'مثال: کیستا، سلنتونا، مایورنا...' : 'T.ex. Kista, Sollentuna, Majorna...'}
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Title (Svenska) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fa' ? 'عنوان آگهی (سوئدی یا فارسی) *' : 'Annonsrubrik *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'fa' ? 'عنوان واضح آگهی خود را بنویسید' : 'En tydlig och intressant rubrik'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-xs font-medium text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Optional Title in Persian */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fa' ? 'عنوان به فارسی (اختیاری جهت نمایش دوزبانه)' : 'Farsi-rubrik (valfritt för persisk visning)'}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="عنوان فارسی برای هم‌زبانان"
                  value={titleFa}
                  onChange={(e) => setTitleFa(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Price & Price Type */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'fa' ? 'قیمت / اجاره' : 'Pris / hyra'}
                  </label>
                  <input
                    type="number"
                    placeholder="12000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'fa' ? 'واحد قیمت' : 'Pristyp'}
                  </label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="kr">kr (fast pris)</option>
                    <option value="kr/mån">kr/mån (hyra)</option>
                    <option value="kr/tim">kr/timme</option>
                    <option value="Gratis">Gratis / رایگان</option>
                    <option value="Offereras">Offereras / توافقی</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fa' ? 'توضیحات کامل آگهی *' : 'Beskrivning *'}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={lang === 'fa' ? 'اطلاعات کامل، مشخصات، شرایط تحویل یا بازدید را ذکر کنید...' : 'Beskriv varan, bostaden, tjänsten eller jobbet utförligt...'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs font-medium text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 leading-relaxed"
                />
              </div>

              {/* Photos URL list */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fa' ? 'لینک عکس (اختیاری)' : 'Bild-URL (valfritt)'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 focus:border-emerald-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 active:scale-95 transition-all"
                  >
                    + Lägg till
                  </button>
                </div>

                {/* Added images chips */}
                {imagesList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imagesList.map((url, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-stone-100 rounded-lg pl-2 pr-1 py-1 text-[11px] text-stone-600 border border-stone-200">
                        <span className="truncate max-w-[140px]">{url}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="p-0.5 hover:text-rose-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 space-y-3">
                <span className="block text-xs font-bold text-stone-900">
                  {lang === 'fa' ? 'اطلاعات تماس آگهی‌دهنده' : 'Kontaktuppgifter'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-500 mb-1">
                      {lang === 'fa' ? 'نام و نام خانوادگی *' : 'Ditt namn *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="T.ex. Reza eller Sara"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-500 mb-1">
                      Telefon / موبایل
                    </label>
                    <input
                      type="tel"
                      placeholder="+46701234567"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-500 mb-1">
                      WhatsApp / واتساپ
                    </label>
                    <input
                      type="tel"
                      placeholder="+46701234567"
                      value={contactWhatsapp}
                      onChange={(e) => setContactWhatsapp(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-500 mb-1">
                      Telegram / تلگرام (användarnamn)
                    </label>
                    <input
                      type="text"
                      placeholder="@mittkonto"
                      value={contactTelegram}
                      onChange={(e) => setContactTelegram(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-500 mb-1">
                    E-postadress
                  </label>
                  <input
                    type="email"
                    placeholder="namn@exempel.se"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Secret 4-digit PIN setting */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound size={16} className="text-amber-700" />
                    <span className="text-xs font-bold text-amber-950">
                      {lang === 'fa' ? 'رمز ۴ رقمی برای حذف یا ویرایش آگهی' : 'Välj 4-siffrig PIN-kod för hantering/borttagning'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    maxLength={4}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-28 rounded-xl border border-amber-300 bg-white px-3 py-2 text-center font-mono text-base font-extrabold tracking-widest text-amber-950 focus:border-amber-600 focus:outline-none"
                  />
                  <span className="text-[11px] text-amber-800 leading-tight">
                    {lang === 'fa' 
                      ? 'این رمز پیش‌فرض تولید شده است یا می‌توانید عدد دلخواه ۴ رقمی بگذارید.'
                      : 'Automatgenererad kod som du kan ändra. Spara koden för att kunna ta bort annonsen senare.'}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm py-3.5 shadow-md shadow-emerald-700/20 active:scale-98 transition-all"
                >
                  <Sparkles size={16} />
                  <span>
                    {loading ? (lang === 'fa' ? 'در حال ثبت...' : 'Publicerar...') : currentT.postAdBtn}
                  </span>
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
