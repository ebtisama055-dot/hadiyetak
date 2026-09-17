'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatEGP, formatArabicDate } from '@/lib/format';

const STATUS_LABELS: Record<string, string> = {
  new: 'جديد',
  confirmed: 'تم التأكيد',
  preparing: 'جاري التجهيز',
  out_for_delivery: 'خرج للتوصيل',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'بانتظار التأكيد',
  paid: 'مدفوع',
  failed: 'فشل',
  refunded: 'مسترجع',
  cancelled: 'ملغي',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    let query = supabase.from('orders').select('*, payments(reference_id, provider, status)').order('created_at', { ascending: false }).limit(100);
    if (filter) query = query.eq('status', filter);
    const { data } = await query;
    setOrders(data ?? []);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [filter]);

  async function updateStatus(orderId: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    await supabase.from('order_status_history').insert({ order_id: orderId, status });
    load();
  }

  async function confirmPayment(orderId: string) {
    if (!confirm('اتأكدت إن الفلوس وصلت فعلاً على رقم الإنستاباي/المحفظة؟')) return;
    await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', orderId);
    await supabase.from('payments').update({ status: 'paid' }).eq('order_id', orderId);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">الطلبات</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilter('')} className={`px-4 py-1.5 rounded-full text-sm font-bold ${!filter ? 'bg-rose text-white' : 'bg-white border border-blush'}`}>الكل</button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-4 py-1.5 rounded-full text-sm font-bold ${filter === key ? 'bg-rose text-white' : 'bg-white border border-blush'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-ink/50">جاري التحميل...</p>
      ) : orders.length === 0 ? (
        <p className="text-ink/50">لا توجد طلبات مطابقة.</p>
      ) : (
        <div className="bg-white border border-blush rounded-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blush text-ink/60 text-right">
                <th className="p-3">رقم الطلب</th>
                <th className="p-3">العميل</th>
                <th className="p-3">الإجمالي</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">الدفع</th>
                <th className="p-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-blush last:border-0">
                  <td className="p-3 font-bold">{o.order_number}</td>
                  <td className="p-3">{o.customer_name}<br /><span className="text-ink/50 text-xs">{o.customer_mobile}</span></td>
                  <td className="p-3">{formatEGP(o.total)}</td>
                  <td className="p-3 text-ink/60">{formatArabicDate(o.created_at)}</td>
                  <td className="p-3">
                    {o.payment_method === 'cod' ? 'عند الاستلام' : 'إنستاباي/محفظة'} · {PAYMENT_STATUS_LABELS[o.payment_status] ?? o.payment_status}
                    {o.payment_method === 'online' && o.payments?.[0]?.reference_id && (
                      <div className="text-xs text-ink/50 mt-1">مرجع: {o.payments[0].reference_id}</div>
                    )}
                    {o.payment_method === 'online' && o.payment_status === 'pending' && (
                      <button
                        onClick={() => confirmPayment(o.id)}
                        className="mt-1 block text-xs font-bold text-white bg-green-600 rounded-full px-2 py-0.5"
                      >
                        تأكيد استلام الفلوس
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-blush text-sm"
                    >
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
