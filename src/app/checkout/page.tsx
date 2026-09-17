'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart-store';
import { formatEGP } from '@/lib/format';
import type { ShippingZone, DeliverySlot } from '@/lib/types';
import { rememberCustomerMobile } from '@/lib/notifications';

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const router = useRouter();

  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [zoneId, setZoneId] = useState('');
  const [slotId, setSlotId] = useState('');
  const [speed, setSpeed] = useState<'standard' | 'express'>('standard');

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientMobile, setRecipientMobile] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentWalletNumber, setPaymentWalletNumber] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('shipping_zones').select('*').eq('active', true).order('display_order').then(({ data }) => {
      setZones((data as ShippingZone[]) ?? []);
      if (data && data.length > 0) setZoneId(data[0].id);
    });
    supabase.from('delivery_slots').select('*').eq('active', true).then(({ data }) => setSlots((data as DeliverySlot[]) ?? []));
    supabase.from('site_settings').select('payment_wallet_number').eq('id', 1).maybeSingle().then(({ data }) => {
      setPaymentWalletNumber(data?.payment_wallet_number ?? '');
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDeliveryDate(tomorrow.toISOString().slice(0, 10));
  }, []);

  const zone = zones.find((z) => z.id === zoneId);
  const shippingFee = zone ? (speed === 'express' ? zone.express_price ?? zone.standard_price : zone.standard_price) + zone.additional_fee : 0;
  const total = subtotal() + shippingFee;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-2xl mb-2">السلة لسه فاضية ❤️</p>
        <p className="text-ink/60">ارجع لصفحة الهدايا واختار اللي يعجبك الأول.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !mobile.trim() || !address.trim() || !zoneId) {
      setError('من فضلك املأ كل البيانات المطلوبة.');
      return;
    }

    if (paymentMethod === 'online' && !paymentReference.trim()) {
      setError('من فضلك حوّل المبلغ الأول واكتب رقم العملية أو آخر 3 أرقام من رقمك اللي حولت منه.');
      return;
    }

    setSubmitting(true);
    const { data, error: rpcError } = await supabase.rpc('create_order_with_items', {
      p_customer_name: name,
      p_customer_mobile: mobile,
      p_is_gift: isGift,
      p_recipient_name: isGift ? recipientName : null,
      p_recipient_mobile: isGift ? recipientMobile : null,
      p_order_notes: notes || null,
      p_shipping_zone_id: zoneId,
      p_address_details: address,
      p_delivery_date: deliveryDate,
      p_delivery_slot_id: slotId || null,
      p_delivery_speed: speed,
      p_payment_method: paymentMethod,
      p_coupon_code: null,
      p_items: lines.map((l) => ({ product_id: l.product_id, quantity: l.quantity })),
      p_payment_reference: paymentMethod === 'online' ? paymentReference.trim() : null,
    });

    setSubmitting(false);

    if (rpcError) {
      setError('لم نتمكن من إتمام الطلب. حاول مرة أخرى أو تواصل معنا عبر واتساب.');
      return;
    }

    clear();
    rememberCustomerMobile(mobile);
    router.push(`/order-success/${data.order_number}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">إتمام الطلب</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="بياناتك">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="الاسم" value={name} onChange={setName} required />
            <Field label="رقم الموبايل" value={mobile} onChange={setMobile} required type="tel" />
          </div>
        </Section>

        <Section title="التوصيل">
          <label className="flex items-center gap-2 mb-4 font-bold text-sm">
            <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} />
            هذا الطلب هدية
          </label>
          {isGift && (
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Field label="اسم المستلم" value={recipientName} onChange={setRecipientName} />
              <Field label="رقم موبايل المستلم" value={recipientMobile} onChange={setRecipientMobile} type="tel" />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold mb-1">المنطقة</label>
              <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-blush">
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
            <Field label="العنوان بالتفصيل" value={address} onChange={setAddress} required />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold mb-1">تاريخ التوصيل</label>
              <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-blush" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">الموعد</label>
              <select value={slotId} onChange={(e) => setSlotId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-blush">
                <option value="">أقرب موعد متاح</option>
                {slots.filter((s) => s.speed === speed).map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {zone?.express_price && (
            <div className="flex gap-3 mb-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={speed === 'standard'} onChange={() => setSpeed('standard')} /> توصيل عادي ({zone.standard_eta_text})
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={speed === 'express'} onChange={() => setSpeed('express')} /> توصيل سريع ({zone.express_eta_text})
              </label>
            </div>
          )}

          <Field label="ملاحظات على الطلب (اختياري)" value={notes} onChange={setNotes} textarea />
        </Section>

        <Section title="طريقة الدفع">
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /> الدفع عند الاستلام
            </label>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="radio" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} /> إنستاباي / محفظة إلكترونية
            </label>
          </div>

          {paymentMethod === 'online' && (
            <div className="mt-4 bg-blush/30 border border-blush rounded-xl p-4 space-y-3">
              <p className="text-sm leading-relaxed">
                حوّل مبلغ <strong>{formatEGP(total)}</strong> عن طريق إنستاباي أو أي محفظة إلكترونية (فودافون كاش / اتصالات كاش / أورنج موني) على الرقم:
              </p>
              <div className="flex items-center gap-2">
                <span dir="ltr" className="font-bold text-lg bg-white border border-blush rounded-lg px-3 py-1.5 select-all">{paymentWalletNumber || '—'}</span>
                {paymentWalletNumber && (
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(paymentWalletNumber)}
                    className="text-xs font-bold text-rose underline"
                  >
                    نسخ الرقم
                  </button>
                )}
              </div>
              <Field
                label="رقم العملية أو آخر 3 أرقام من رقمك اللي حوّلت منه"
                value={paymentReference}
                onChange={setPaymentReference}
                required
              />
              <p className="text-xs text-ink/60">
                طلبك هيتسجل فورًا وهيبقى "بانتظار تأكيد الدفع" لحد ما نتأكد من وصول التحويل، وهيوصلك إشعار أول ما يتأكد.
              </p>
            </div>
          )}
        </Section>

        <div className="bg-white border border-blush rounded-card p-5">
          <div className="flex justify-between text-sm mb-1"><span>الإجمالي الفرعي</span><span>{formatEGP(subtotal())}</span></div>
          <div className="flex justify-between text-sm mb-3"><span>التوصيل</span><span>{formatEGP(shippingFee)}</span></div>
          <div className="flex justify-between font-bold text-lg border-t border-blush pt-3">
            <span>الإجمالي</span><span className="text-rose">{formatEGP(total)}</span>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm font-bold">{error}</p>}

        <button type="submit" disabled={submitting} className="w-full bg-rose text-white font-bold py-3 rounded-full disabled:opacity-50">
          {submitting ? 'جاري إرسال الطلب...' : 'تأكيد الطلب'}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-blush rounded-card p-5">
      <h2 className="font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, required, type = 'text', textarea,
}: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string; textarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-bold mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-blush" rows={3} />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-blush"
        />
      )}
    </div>
  );
}
