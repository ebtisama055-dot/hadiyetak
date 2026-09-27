'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '').replace(/\s+/g, '-');
}

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setRows(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function updateField(id: string, field: string, value: any) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    await supabase.from('categories').update({ [field]: value }).eq('id', id);
  }

  async function addRow(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await supabase.from('categories').insert({ name: newName, slug: `${slugify(newName)}-${Date.now().toString().slice(-4)}`, display_order: rows.length + 1 });
    setNewName('');
    load();
  }

  async function remove(id: string) {
    await supabase.from('categories').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">الفئات</h1>
      <form onSubmit={addRow} className="flex gap-2 mb-6">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="اسم فئة جديدة" className="px-3 py-2 rounded-lg border border-blush flex-1 max-w-xs" />
        <button type="submit" className="bg-rose text-white font-bold px-4 py-2 rounded-full text-sm">+ إضافة فئة</button>
      </form>

      {loading ? <p className="text-ink/50">جاري التحميل...</p> : (
        <div className="bg-white border border-blush rounded-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blush text-ink/60 text-right">
                <th className="p-3">الاسم</th>
                <th className="p-3">الترتيب</th>
                <th className="p-3">نشط</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-blush last:border-0">
                  <td className="p-3">
                    <input defaultValue={r.name} onBlur={(e) => updateField(r.id, 'name', e.target.value)} className="font-bold px-2 py-1 rounded-lg border border-blush" />
                  </td>
                  <td className="p-3">
                    <input type="number" defaultValue={r.display_order} onBlur={(e) => updateField(r.id, 'display_order', Number(e.target.value))} className="w-16 px-2 py-1 rounded-lg border border-blush" />
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
