'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatArabicDate } from '@/lib/format';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [oName, setOName] = useState('');
  const [oCategory, setOCategory] = useState('');
  const [oType, setOType] = useState<'percentage' | 'fixed'>('percentage');
  const [oValue, setOValue] = useState('');
  const [oDays, setODays] = useState('14');

  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState<'percentage' | 'fixed'>('percentage');
  const [cValue, setCValue] = useState('');
  const [cMin, setCMin] = useState('0');

  async function load() {
    setLoading(true);
    const [{ data: o }, { data: c }, { data: cats }] = await Promise.all([
      supabase.from('offers').select('*, offer_categories(categories(name))').order('start_date', { ascending: false }),
      supabase.from('coupons').select('*').order('start_date', { ascending: false }),
      supabase.from('categories').select('id, name').eq('active', true),
    ]);
    setOffers(o ?? []);
    setCoupons(c ?? []);
    setCategories(cats ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function addOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!oName.trim() || !oValue || !oCategory) return;
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + Number(oDays || 14));
    const { data: offer } = await supabase.from('offers').insert({
      name: oName, target: 'category', discount_type: oType, discount_value: Number(oValue),
      start_date: start.toISOString(), end_date: end.toISOString(),
    }).select().single();
    if (offer) await supabase.from('offer_categories').insert({ offer_id: offer.id, category_id: oCategory });
    setOName(''); setOValue(''); setOCategory('');
    load();
  }

  async function toggleOffer(id: string, active: boolean) {
    await supabase.from('offers').update({ active }).eq('id', id);
    load();
  }

  async function removeOffer(id: string) {
    await supabase.from('offers').delete().eq('id', id);
    load();
  }

  async function addCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!cCode.trim() || !cValue) return;
    await supabase.from('coupons').insert({
      code: cCode.toUpperCase(), discount_type: cType, discount_value: Number(cValue), minimum_order: Number(cMin || 0),
    });
    setCCode(''); setCValue(''); setCMin('0');
    load();
  }

  async function toggleCoupon(id: string, active: boolean) {
    await supabase.from('coupons').update({ active }).eq('id', id);
    load();
  }

  async function removeCoupon(id: string) {
    await supabase.from('coupons').delete().eq('id', id);
    load();
  }

  if (loading) return <p className="text-ink/50">جاري التحميل...</p>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold mb-4">العروض</h1>
        <form onSubmit={addOffer} className="bg-white border border-blush rounded-card p-4 mb-4 grid sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold mb-1">اسم العرض</label>
            <input value={oName} onChange={(e) => setOName(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-blush" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">الفئة</label>
            <select value={oCategory} onChange={(e) => setOCategory(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-blush">
              <option value="">اختر فئة</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">نوع الخصم</label>
            <select value={oType} onChange={(e) => setOType(e.target.value as any)} className="w-full px-2 py-1.5 rounded-lg border border-blush">
              <option value="percentage">نسبة %</option>
              <option value="fixed">مبلغ ثابت</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">القيمة</label>
            <input type="number" value={oValue} onChange={(e) => setOValue(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-blush" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">مدة العرض (أيام)</label>
            <input type="number" value={oDays} onChange={(e) => setODays(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-blush" />
          </div>
          <button type="submit" className="sm:col-span-5 bg-rose text-white font-bold py-2 rounded-full">+ إضافة عرض</button>
        </form>

        <div className="bg-white border border-blush rounded-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-blush text-ink/60 text-right">
              <th className="p-3">العرض</th><th className="p-3">الفئة</th><th className="p-3">الخصم</th><th className="p-3">ينتهي</th><th className="p-3">نشط</th><th className="p-3"></th>
            </tr></thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id} className="border-b border-blush last:border-0">
                  <td className="p-3 font-bold">{o.name}</td>
                  <td className="p-3">{o.offer_categories?.map((oc: any) => oc.categories?.name).join(', ')}</td>
                  <td className="p-3">{o.discount_type === 'percentage' ? `${o.discount_value}%` : `${o.discount_value} جنيه`}</td>
                  <td className="p-3 text-ink/60">{formatArabicDate(o.end_date)}</td>
                  <td className="p-3"><input type="checkbox" checked={o.active} onChange={(e) => toggleOffer(o.id, e.target.checked)} /></td>
                  <td className="p-3"><button onClick={() => removeOffer(o.id)} className="text-red-600 text-xs font-bold">حذف</button></td>
                </tr>
              ))}
              {offers.length === 0 && <tr><td colSpan={6} className="p-3 text-ink/50">لا توجد عروض بعد.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold mb-4">أكواد الخصم</h1>
        <form onSubmit={addCoupon} className="bg-white border border-blush rounded-card p-4 mb-4 grid sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold mb-1">الكود</label>
            <input value={cCode} onChange={(e) => setCCode(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-blush" placeholder="مثال: HADIYA10" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">نوع الخصم</label>
            <select value={cType} onChange={(e) => setCType(e.target.value as any)} className="w-full px-2 py-1.5 rounded-lg border border-blush">
              <option value="percentage">نسبة %</option>
              <option value="fixed">مبلغ ثابت</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">القيمة</label>
            <input type="number" value={cValue} onChange={(e) => setCValue(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-blush" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">الحد الأدنى للطلب</label>
            <input type="number" value={cMin} onChange={(e) => setCMin(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-blush" />
          </div>
          <button type="submit" className="sm:col-span-4 bg-rose text-white font-bold py-2 rounded-full">+ إضافة كود</button>
        </form>

        <div className="bg-white border border-blush rounded-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-blush text-ink/60 text-right">
              <th className="p-3">الكود</th><th className="p-3">الخصم</th><th className="p-3">أدنى طلب</th><th className="p-3">مرات الاستخدام</th><th className="p-3">نشط</th><th className="p-3"></th>
            </tr></thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-blush last:border-0">
                  <td className="p-3 font-bold">{c.code}</td>
                  <td className="p-3">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `${c.discount_value} جنيه`}</td>
                  <td className="p-3">{c.minimum_order}</td>
                  <td className="p-3">{c.usage_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                  <td className="p-3"><input type="checkbox" checked={c.active} onChange={(e) => toggleCoupon(c.id, e.target.checked)} /></td>
                  <td className="p-3"><button onClick={() => removeCoupon(c.id)} className="text-red-600 text-xs font-bold">حذف</button></td>
                </tr>
              ))}
              {coupons.length === 0 && <tr><td colSpan={6} className="p-3 text-ink/50">لا توجد أكواد خصم بعد.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
