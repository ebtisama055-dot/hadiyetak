'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatEGP, formatArabicDate } from '@/lib/format';
import { rememberCustomerMobile } from '@/lib/notifications';

const STATUS_LABELS: Record<string, string> = {
  new: 'تم استلام الطلب',
  confirmed: 'تم تأكيد الطلب',
  preparing: 'جاري تجهيز الطلب',
  out_for_delivery: 'خرج للتوصيل',
  delivered: 'تم التسليم',
  cancelled: 'تم إلغاء الطلب',
};

const STEPS = ['new', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [mobile, setMobile] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notFoundMsg, setNotFoundMsg] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotFoundMsg(false);
    setResult(null);
    const { data } = await supabase.rpc('track_order', { p_order_number: orderNumber.trim(), p_mobile: mobile.trim() });
    setLoading(false);
    if (!data?.found) {
      setNotFoundMsg(true);
      return;
    }
    setResult(data);
    rememberCustomerMobile(mobile.trim());
  }

  const currentStepIndex = result ? STEPS.indexOf(result.status) : -1;

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-6">متابعة الطلب</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-blush rounded-card p-5 space-y-4 mb-8">
        <div>
          <label className="block text-sm font-bold mb-1">رقم الطلب</label>
          <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-blush" placeholder="مثال: HD10254" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">رقم الموبايل</label>
          <input value={mobile} onChange={(e) => setMobile(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-blush" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-rose text-white font-bold py-3 rounded-full disabled:opacity-50">
          {loading ? 'جاري البحث...' : 'تتبع الطلب'}
        </button>
      </form>

      {notFoundMsg && <p className="text-center text-red-600 font-bold">لم نتمكن من العثور على الطلب.</p>}

      {result && (
        <div className="bg-white border border-blush rounded-card p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold">طلب رقم {result.order_number}</span>
            {result.delivery_date && <span className="text-sm text-ink/60">{formatArabicDate(result.delivery_date)}</span>}
          </div>

          <ol className="space-y-3 mb-6">
            {STEPS.map((step, idx) => (
              <li key={step} className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx <= currentStepIndex ? 'bg-forest text-white' : 'bg-blush text-ink/40'
                  }`}
                >
                  {idx <= currentStepIndex ? '✓' : idx + 1}
                </span>
                <span className={idx <= currentStepIndex ? 'font-bold' : 'text-ink/40'}>{STATUS_LABELS[step]}</span>
              </li>
            ))}
          </ol>

          {result.total !== null && (
            <div className="border-t border-blush pt-3 text-sm">
              <div className="flex justify-between"><span>الإجمالي</span><span className="font-bold">{formatEGP(result.total)}</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
