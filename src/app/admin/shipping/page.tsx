'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminShippingPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('shipping_zones').select('*').order('display_order');
    setZones(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateField(id: string, field: string, value: any) {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, [field]: value } : z)));
    await supabase.from('shipping_zones').update({ [field]: value }).eq('id', id);
  }

  async function addZone(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await supabase.from('shipping_zones').insert({ name: newName, standard_price: 0, display_order: zones.length + 1 });
    setNewName('');
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">مناطق الشحن والتوصيل</h1>

      <form onSubmit={addZone} className="flex gap-2 mb-6">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="اسم منطقة جديدة" className="px-3 py-2 rounded-lg border border-blush flex-1 max-w-xs" />
        <button type="submit" className="bg-rose text-white font-bold px-4 py-2 rounded-full text-sm">+ إضافة منطقة</button>
      </form>

      {loading ? (
        <p className="text-ink/50">جاري التحميل...</p>
      ) : (
        <div className="bg-white border border-blush rounded-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blush text-ink/60 text-right">
                <th className="p-3">المنطقة</th>
                <th className="p-3">سعر التوصيل العادي</th>
                <th className="p-3">سعر التوصيل السريع</th>
                <th className="p-3">رسوم إضافية</th>
                <th className="p-3">نشط</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id} className="border-b border-blush last:border-0">
                  <td className="p-3 font-bold">{z.name}</td>
                  <td className="p-3">
                    <input type="number" defaultValue={z.standard_price} onBlur={(e) => updateField(z.id, 'standard_price', Number(e.target.value))} className="w-24 px-2 py-1 rounded-lg border border-blush" />
                  </td>
                  <td className="p-3">
                    <input type="number" defaultValue={z.express_price ?? ''} onBlur={(e) => updateField(z.id, 'express_price', e.target.value ? Number(e.target.value) : null)} className="w-24 px-2 py-1 rounded-lg border border-blush" placeholder="غير متاح" />
                  </td>
                  <td className="p-3">
                    <input type="number" defaultValue={z.additional_fee} onBlur={(e) => updateField(z.id, 'additional_fee', Number(e.target.value))} className="w-20 px-2 py-1 rounded-lg border border-blush" />
                  </td>
                  <td className="p-3">
                    <input type="checkbox" checked={z.active} onChange={(e) => updateField(z.id, 'active', e.target.checked)} />
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
