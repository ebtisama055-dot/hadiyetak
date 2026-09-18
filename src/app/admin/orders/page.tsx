'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
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
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('*, payments(reference_id, provider, status), order_items(id, product_id, product_name, product_image_url, unit_price, quantity, line_total)')
      .order('created_at', { ascending: false })
      .limit(100);
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
                <th className="p-3" />
                <th className="p-3">رقم الطلب</th>
                <th className="p-3">العميل</th>
                <th className="p-3">المنتجات</th>
                <th className="p-3">الإجمالي</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">الدفع</th>
                <th className="p-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const isOpen = openId === o.id;
                const items = o.order_items ?? [];
                return (
                  <React.Fragment key={o.id}>
                    <tr className="border-b border-blush last:border-0 align-top">
                      <td className="p-3">
                        <button
                          onClick={() => setOpenId(isOpen ? null : o.id)}
                          className="w-7 h-7 rounded-full border border-blush text-ink/60 hover:bg-cream shrink-0"
                          aria-label="تفاصيل الطلب"
                        >
                          {isOpen ? '−' : '+'}
                        </button>
                      </td>
                      <td className="p-3 font-bold">{o.order_number}</td>
                      <td className="p-3">{o.customer_name}<br /><span className="text-ink/50 text-xs">{o.customer_mobile}</span></td>
                      <td className="p-3 text-ink/60">
                        {items.length === 0
                          ? <span className="text-red-600">لا توجد أصناف!</span>
                          : `${items.length} صنف`}
                      </td>
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
                    {isOpen && (
                      <tr className="border-b border-blush bg-cream/40">
                        <td />
                        <td colSpan={7} className="p-4">
                          <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-bold text-sm mb-2">المنتجات المطلوبة</h3>
                              {items.length === 0 ? (
                                <p className="text-red-600 text-xs">
                                  الطلب ده اتسجل من غير أي أصناف — راجع الطلب مع العميل مباشرة.
                                </p>
                              ) : (
                                <ul className="space-y-2">
                                  {items.map((it: any) => (
                                    <li key={it.id} className="flex items-center gap-3 bg-white border border-blush rounded-lg p-2">
                                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-blush/30 shrink-0">
                                        {it.product_image_url ? (
                                          <Image src={it.product_image_url} alt={it.product_name} fill sizes="48px" className="object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[10px] text-ink/40 text-center px-1">
                                            بدون صورة
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-bold text-sm">{it.product_name}</p>
                                        <p className="text-xs text-ink/60">{it.quantity} × {formatEGP(it.unit_price)}</p>
                                      </div>
                                      <p className="font-bold text-sm">{formatEGP(it.line_total)}</p>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <div className="space-y-3 text-sm">
                              <div>
                                <h3 className="font-bold mb-1">التوصيل</h3>
                                <p>{o.shipping_zone_name} — {o.address_details}</p>
                                <p className="text-ink/60">
                                  {o.delivery_date ? formatArabicDate(o.delivery_date) : '—'}
                                  {o.delivery_slot_label ? ` · ${o.delivery_slot_label}` : ''}
                                  {' · '}{o.delivery_speed === 'express' ? 'سريع' : 'عادي'}
                                </p>
                              </div>

                              {o.is_gift && (
                                <div>
                                  <h3 className="font-bold mb-1">هدية لِـ</h3>
                                  <p>{o.recipient_name || '—'} — {o.recipient_mobile || '—'}</p>
                                </div>
                              )}

                              {o.order_notes && (
                                <div>
                                  <h3 className="font-bold mb-1">ملاحظات العميل</h3>
                                  <p className="text-ink/80">{o.order_notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
