import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  KeyRound, 
  Check, 
  Copy, 
  AlertCircle
} from 'lucide-react';
import { supabase, generateReferenceNumber, generatePinCode } from '../lib/supabase';
import { COUNTRIES, CATEGORIES, t } from '../lib/translations';

export default function PostAdModal({ 
  lang = 'fa', 
  initialCategory = 'bostad', 
  selectedCountry = 'se',
  onClose, 
  onCreated 
}) {
  const currentT = t.fa;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [wantVipPromotion, setWantVipPromotion] = useState(false);

  // Form fields
  const [adCountry, setAdCountry] = useState(selectedCountry === 'all' ? 'se' : (selectedCountry || 'se'));
  const [category, setCategory] = useState(initialCategory || 'bostad');
  const [city, setCity] = useState(() => {
    const defaultCountry = COUNTRIES.find(c => c.id === (selectedCountry === 'all' ? 'se' : selectedCountry)) || COUNTRIES[0];
    return defaultCountry.cities.find(c => c.id !== 'all')?.id || 'Stockholm';
  });
  const [area, setArea] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState(() => {
    const defaultCountry = COUNTRIES.find(c => c.id === (selectedCountry === 'all' ? 'se' : selectedCountry)) || COUNTRIES[0];
    return defaultCountry.currency || 'kr';
  });
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [contactTelegram, setContactTelegram] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagesList, setImagesList] = useState([]);
  const [pinCode, setPinCode] = useState(generatePinCode());

  const currentCountryObj = COUNTRIES.find(c => c.id === adCountry) || COUNTRIES[0];

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
      setErrorMsg('لطفاً عنوان، توضیحات و نام تماس‌گیرنده را وارد فرمایید.');
      return;
    }

    if (!contactPhone.trim() && !contactWhatsapp.trim() && !contactEmail.trim() && !contactTelegram.trim()) {
      setErrorMsg('حداقل یک راه تماس (شماره تلفن، واتساپ، تلگرام یا ایمیل) الزامی است.');
      return;
    }

    setLoading(true);

    try {
      const refNum = generateReferenceNumber();
      const finalPin = pinCode.trim() || generatePinCode();

      const allImages = [...imagesList];
      if (imageUrl.trim()) {
        allImages.push(imageUrl.trim());
      }

      const { data, error } = await supabase
        .from('swedpersiska_ads')
        .insert([
          {
            reference_number: refNum,
            pin_code: finalPin,
            title: title.trim(),
            title_fa: titleFa.trim() || title.trim(),
            category,
            country: adCountry,
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
        onCreated(data, wantVipPromotion);
      }
    } catch (err) {
      console.error('Error posting ad:', err);
      setErrorMsg(err.message || 'خطا در ثبت آگهی. لطفاً دوباره تلاش فرمایید.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-vazir" dir="rtl">
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <PlusCircle size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {currentT.postAdBtn}
              </h2>
              <span className="text-[11px] font-medium text-slate-500">
                انتشار رایگان در کشورهای حوزه اسکاندیناوی
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 active:scale-95 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body or Success Screen */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          
          {successData ? (
            /* Success Screen */
            <div className="py-6 text-center space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check size={28} strokeWidth={2.5} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  {currentT.adCreatedSuccess}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {currentT.saveYourCredentials}
                </p>
              </div>

              {/* Secret Credentials Box */}
              <div className="max-w-md mx-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-right">
                
                {/* Reference Number */}
                <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-200">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {currentT.referenceNo}
                    </span>
                    <span className="font-mono text-base font-black text-slate-900 tracking-wider">
                      <bdi>{successData.referenceNumber}</bdi>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(successData.referenceNumber, 'ref')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold active:scale-95 transition-all border border-slate-200 cursor-pointer"
                  >
                    {copiedRef ? <Check size={13} className="text-emerald-700" /> : <Copy size={13} />}
                    <span>{copiedRef ? currentT.copied : currentT.copyRef}</span>
                  </button>
                </div>

                {/* Secret PIN */}
                <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-200">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {currentT.pinCode}
                    </span>
                    <span className="font-mono text-base font-black text-amber-600 tracking-widest">
                      <bdi>{successData.pinCode}</bdi>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(successData.pinCode, 'pin')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold active:scale-95 transition-all border border-slate-200 cursor-pointer"
                  >
                    {copiedPin ? <Check size={13} className="text-emerald-700" /> : <Copy size={13} />}
                    <span>{copiedPin ? currentT.copied : currentT.copyPin}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <KeyRound size={14} className="shrink-0 text-amber-600" />
                  <span>
                    با این دو مشخصه می‌توانید در هر زمان آگهی خود را ویرایش یا حذف نمایید.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-black active:scale-95 transition-all cursor-pointer"
              >
                {currentT.close}
              </button>
            </div>
          ) : (
            /* Post Ad Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 font-semibold">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Country Selection in Scandinavia */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  کشور محل آگهی در حوزه اسکاندیناوی *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COUNTRIES.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setAdCountry(c.id);
                        const firstCity = c.cities.find(city => city.id !== 'all')?.id || '';
                        setCity(firstCity);
                        setPriceType(c.currency);
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        adCountry === c.id
                          ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-2xs font-extrabold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{c.nameFa}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Category & City row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    دسته‌بندی آگهی *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fa}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شهر در {currentCountryObj.nameFa} *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    {currentCountryObj.cities.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fa} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  محله یا منطقه (اختیاری)
                </label>
                <input
                  type="text"
                  placeholder="مثال: کیستا، سنتروم، مایورستوئن، نربرو..."
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان آگهی *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: اجاره آپارتمان ۲ خوابه نوساز مبله..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    قیمت (اختیاری)
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 12000 (خالی = توافقی)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    واحد پول
                  </label>
                  <input
                    type="text"
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value)}
                    placeholder={currentCountryObj.currency}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  توضیحات کامل آگهی *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="مشخصات کامل ملک، خدمات، ساعات کار، شرایط یا توضیحات مربوطه را بنویسید..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  تصویر آگهی (لینک اینترنتی عکس)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://... آدرس اینترنتی تصویر را وارد کنید"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold active:scale-95 transition-all cursor-pointer"
                  >
                    افزودن
                  </button>
                </div>

                {imagesList.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {imagesList.map((url, idx) => (
                      <div key={idx} className="relative h-16 w-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                        <img src={url} alt={`پیش‌نمایش ${idx}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 end-1 rounded-full bg-black/75 p-0.5 text-white hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Info Header */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  اطلاعات تماس آگهی‌دهنده
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      نام و نام خانوادگی *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="نام شما"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      شماره تماس
                    </label>
                    <input
                      type="tel"
                      placeholder="مثال: 0731234567 یا 091234567"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-mono text-left"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      شماره واتساپ
                    </label>
                    <input
                      type="tel"
                      placeholder="مثال: +46731234567"
                      value={contactWhatsapp}
                      onChange={(e) => setContactWhatsapp(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-mono text-left"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      آیدی تلگرام
                    </label>
                    <input
                      type="text"
                      placeholder="username@ یا آیدی تلگرام"
                      value={contactTelegram}
                      onChange={(e) => setContactTelegram(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ایمیل
                  </label>
                  <input
                    type="email"
                    placeholder="namn@exempel.se"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Secret 4-digit PIN setting */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound size={16} className="text-amber-700" />
                    <span className="text-xs font-bold text-amber-950">
                      رمز ۴ رقمی برای حذف یا ویرایش آگهی
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
                    این کد پیش‌فرض تولید شده است یا می‌توانید عدد ۴ رقمی دلخواه بگذارید.
                  </span>
                </div>
              </div>

              {/* VIP Promotion Upgrade Box - Clean & Minimal */}
              <label 
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                  wantVipPromotion 
                    ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500' 
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={wantVipPromotion}
                    onChange={(e) => setWantVipPromotion(e.target.checked)}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">ارتقا به آگهی ویژه (VIP)</span>
                    <span className="text-[11px] text-slate-500">نمایش در بالای لیست و سایدبار اختصاصی</span>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className="text-sm font-extrabold text-blue-700">۹۹ kr</span>
                </div>
              </label>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-50 text-white font-bold text-sm py-3.5 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  <PlusCircle size={16} />
                  <span>
                    {loading 
                      ? 'در حال ثبت...' 
                      : (wantVipPromotion ? 'ثبت و پرداخت (۹۹ kr)' : currentT.postAdBtn)}
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
