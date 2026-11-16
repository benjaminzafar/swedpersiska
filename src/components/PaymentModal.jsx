import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Crown, 
  AlertCircle
} from 'lucide-react';
import { supabase, PUBLIC_AD_COLUMNS } from '../lib/supabase';

export default function PaymentModal({ 
  ad, 
  price = 99, 
  currency = 'SEK', 
  stripeSettings = null,
  onClose, 
  onSuccess 
}) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      setExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setExpiry(val);
    }
  };

  // Quick fill test card
  const handleFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setExpiry('12/28');
    setCvc('123');
    setCardName('کاربر تست اسکاندیناوی');
  };

  // Process Stripe Payment
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMsg('شماره کارت ۱۶ رقمی معتبر وارد فرمایید.');
      return;
    }
    if (expiry.length < 5) {
      setErrorMsg('تاریخ انقضا (MM/YY) معتبر وارد فرمایید.');
      return;
    }
    if (cvc.length < 3) {
      setErrorMsg('کد CVC معتبر وارد فرمایید.');
      return;
    }

    setLoading(true);

    try {
      // Simulate Stripe Charge / Gateway Processing
      await new Promise(resolve => setTimeout(resolve, 1400));

      // Update Supabase Ad to is_featured = true
      if (ad && ad.id) {
        const { data, error } = await supabase
          .from('swedpersiska_ads')
          .update({ is_featured: true })
          .eq('id', ad.id)
          .select(PUBLIC_AD_COLUMNS)
          .single();

        if (error) throw error;
        
        setIsPaid(true);
        if (onSuccess) {
          onSuccess(data || { ...ad, is_featured: true });
        }
      } else {
        setIsPaid(true);
      }
    } catch (err) {
      console.error('Payment Error:', err);
      setErrorMsg(err.message || 'پرداخت با خطا مواجه شد. لطفاً دوباره تلاش فرمایید.');
    } finally {
      setLoading(false);
    }
  };

  const isTestMode = stripeSettings?.mode !== 'live';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-vazir" dir="rtl">
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Crown size={20} />
            </div>
            <div>
              <h2 className="text-base font-black">درگاه پرداخت امن Stripe</h2>
              <p className="text-xs text-slate-300">ارتقای آگهی به بسته ویژه (VIP)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Success Screen */}
          {isPaid ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-950">پرداخت با موفقیت انجام شد!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  آگهی شما با موفقیت به رتبه <span className="font-bold text-blue-600">ویژه (VIP)</span> ارتقا یافت و هم‌اکنون در صدر تمام آگهی‌ها و سایدبار اختصاصی قرار گرفت.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl max-w-xs mx-auto text-xs space-y-1.5 text-right font-medium">
                <div className="flex justify-between text-slate-500">
                  <span>مبلغ پرداختی:</span>
                  <span className="font-bold text-slate-900">{price} {currency}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>وضعیت:</span>
                  <span className="font-bold text-emerald-600">فعال (VIP)</span>
                </div>
                {ad?.reference_number && (
                  <div className="flex justify-between text-slate-500">
                    <span>کد مرجع:</span>
                    <span className="font-mono font-bold text-slate-900">{ad.reference_number}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                مشاهده آگهی ویژه
              </button>
            </div>
          ) : (
            <>
              {/* Order Summary Box */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-blue-700 block">سفارش ارتقای آگهی:</span>
                  <h4 className="text-xs font-black text-slate-900 line-clamp-1 max-w-[220px]">
                    {ad?.title || 'آگهی جدید'}
                  </h4>
                  <span className="text-[10px] text-slate-500 block">مدت اعتبار: ۳۰ روز در صدر آگهی‌ها</span>
                </div>

                <div className="text-left shrink-0">
                  <span className="text-2xl font-black text-blue-700 tabular-nums">
                    {price}
                  </span>
                  <span className="text-xs font-bold text-slate-600 ms-1">{currency}</span>
                </div>
              </div>

              {/* Stripe Test Mode Banner */}
              {isTestMode && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-amber-600 shrink-0" />
                    <span>حالت آزمایشی Stripe فعال است.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    تکمیل خودکار کارت تست
                  </button>
                </div>
              )}

              {/* Error Notice */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Credit Card Form */}
              <form onSubmit={handleSubmitPayment} className="space-y-3.5">
                
                {/* Cardholder Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نام دارنده کارت
                  </label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="مثال: Ali Rezaei"
                    className="w-full h-11 rounded-xl bg-slate-50 border border-slate-200 px-3.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شماره کارت اعتباری (Credit / Debit Card)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4242 •••• •••• 4242"
                      className="w-full h-11 rounded-xl bg-slate-50 border border-slate-200 ps-10 pe-3.5 text-xs font-mono text-slate-900 tracking-wider focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-left"
                      dir="ltr"
                    />
                    <CreditCard size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Expiry & CVC */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      انقضا (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={handleExpiryChange}
                      placeholder="12/28"
                      className="w-full h-11 rounded-xl bg-slate-50 border border-slate-200 px-3.5 text-xs font-mono text-slate-900 text-center focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      کد امنیتی (CVC)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      className="w-full h-11 rounded-xl bg-slate-50 border border-slate-200 px-3.5 text-xs font-mono text-slate-900 text-center focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Submit Payment Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Lock size={15} />
                  <span>
                    {loading ? 'در حال اتصال به Stripe...' : `پرداخت امن ${price} ${currency} با Stripe`}
                  </span>
                </button>

              </form>

              {/* Trust Badges */}
              <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>رمزنگاری ۲۵۶ بیتی SSL</span>
                </div>
                <span>•</span>
                <span>پشتیبانی از Visa, Mastercard, Amex</span>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
