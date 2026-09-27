'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminBudgetRangesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [newMin, setNewMin] = useState('');
  const [newMax, setNewMax] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('budget_ranges').select('*').order('display_order');
    setRows(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function updateField(id: string, field: string, value: any) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    await supabase.from('budget_ranges').update({ [field]: value }).eq('id', id);
  }

  async function addRow(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    await supabase.from('budget_ranges').insert({
      label: newLabel,
      min_amount: newMin ? Number(newMin) : 0,
      max_amount: newMax ? Number(newMax) : null,
      display_order: rows.length + 1,
    });
    setNewLabel(''); setNewMin(''); setNewMax('');
    load();
  }

  async function remove(id: string) {
    await supabase.from('budget_ranges').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">نطاقات الميزانية</h1>
      <form onSubmit={addRow} className="flex flex-wrap gap-2 mb-6 items-end">
        <div>
          <label className="block text-xs font-bold mb-1">التسمية</label>
          <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="مثال: 500 - 1000 جنيه" className="px-3 py-2 rounded-lg border border-blush" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">من</label>
          <input type="number" value={newMin} onChange={(e) => setNewMin(e.target.value)} className="w-24 px-3 py-2 rounded-lg border border-blush" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">إلى (اتركه فارغًا لعدم وجود حد أقصى)</label>
          <input type="number" value={newMax} onChange={(e) => setNewMax(e.target.value)} className="w-24 px-3 py-2 rounded-lg border border-blush" />
        </div>
        <button type="submit" className="bg-rose text-white font-bold px-4 py-2 rounded-full text-sm">+ إضافة نطاق</button>
      </form>

      {loading ? <p className="text-ink/50">جاري التحميل...</p> : (
        <div className="bg-white border border-blush rounded-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blush text-ink/60 text-right">
                <th className="p-3">التسمية</th>
                <th className="p-3">من</th>
                <th className="p-3">إلى</th>
                <th className="p-3">نشط</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-blush last:border-0">
                  <td className="p-3">
                    <input defaultValue={r.label} onBlur={(e) => updateField(r.id, 'label', e.target.value)} className="font-bold px-2 py-1 rounded-lg border border-blush" />
                  </td>
                  <td className="p-3">
                    <input type="number" defaultValue={r.min_amount ?? ''} onBlur={(e) => updateField(r.id, 'min_amount', Number(e.target.value))} className="w-20 px-2 py-1 rounded-lg border border-blush" />
                  </td>
                  <td className="p-3">
                    <input type="number" defaultValue={r.max_amount ?? ''} onBlur={(e) => updateField(r.id, 'max_amount', e.target.value ? Number(e.target.value) : null)} className="w-20 px-2 py-1 rounded-lg border border-blush" placeholder="بلا حد" />
                  </td>
                  <td className="p-3">
                    <input type="checkbox" checked={r.active} onChange={(e) => updateField(r.id, 'active', e.target.checked)} />
                  </td>
                  <td className="p-3">
                    <button onClick={() => remove(r.id)} className="text-red-600 text-xs font-bold">حذف</button>
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
