'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatEGP } from '@/lib/format';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateField(id: string, field: string, value: any) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    await supabase.from('products').update({ [field]: value }).eq('id', id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">المنتجات</h1>
        <button onClick={() => setShowNew((v) => !v)} className="bg-rose text-white font-bold px-4 py-2 rounded-full text-sm">
          {showNew ? 'إلغاء' : '+ إضافة منتج'}
        </button>
      </div>

      {showNew && <NewProductForm onCreated={() => { setShowNew(false); load(); }} />}

      {loading ? (
        <p className="text-ink/50">جاري التحميل...</p>
      ) : (
        <div className="bg-white border border-blush rounded-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blush text-ink/60 text-right">
                <th className="p-3">المنتج</th>
                <th className="p-3">السعر</th>
                <th className="p-3">السعر قبل الخصم</th>
                <th className="p-3">المخزون</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">مميز</th>
                <th className="p-3">الأكثر مبيعًا</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-blush last:border-0">
                  <td className="p-3 font-bold">{p.name}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      defaultValue={p.selling_price}
                      onBlur={(e) => updateField(p.id, 'selling_price', Number(e.target.value))}
                      className="w-24 px-2 py-1 rounded-lg border border-blush"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      defaultValue={p.old_price ?? ''}
                      onBlur={(e) => updateField(p.id, 'old_price', e.target.value ? Number(e.target.value) : null)}
                      className="w-24 px-2 py-1 rounded-lg border border-blush"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      defaultValue={p.stock_quantity}
                      onBlur={(e) => updateField(p.id, 'stock_quantity', Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded-lg border border-blush"
                      disabled={p.unlimited_stock}
                    />
                  </td>
                  <td className="p-3">
                    <select value={p.visibility} onChange={(e) => updateField(p.id, 'visibility', e.target.value)} className="px-2 py-1 rounded-lg border border-blush">
                      <option value="published">منشور</option>
                      <option value="paused">متوقف مؤقتًا</option>
                      <option value="hidden">مخفي</option>
                    </select>
                  </td>
                  <td className="p-3 text-center">
                    <input type="checkbox" checked={p.featured} onChange={(e) => updateField(p.id, 'featured', e.target.checked)} />
                  </td>
                  <td className="p-3 text-center">
                    <input type="checkbox" checked={p.bestseller} onChange={(e) => updateField(p.id, 'bestseller', e.target.checked)} />
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

function NewProductForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function slugify(s: string) {
    return s.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '').replace(/\s+/g, '-');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const slugBase = slugify(name) || `product-${Date.now()}`;
    const { error: err } = await supabase.from('products').insert({
      name,
      slug: `${slugBase}-${Date.now().toString().slice(-5)}`,
      selling_price: Number(price) || 0,
      stock_quantity: Number(stock) || 0,
      visibility: 'published',
    });
    setSaving(false);
    if (err) { setError('تعذّر إضافة المنتج.'); return; }
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-blush rounded-card p-4 mb-6 grid sm:grid-cols-4 gap-3 items-end">
      <div>
        <label className="block text-xs font-bold mb-1">اسم المنتج</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-2 py-1.5 rounded-lg border border-blush" />
      </div>
      <div>
        <label className="block text-xs font-bold mb-1">السعر</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full px-2 py-1.5 rounded-lg border border-blush" />
      </div>
      <div>
        <label className="block text-xs font-bold mb-1">المخزون</label>
        <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required className="w-full px-2 py-1.5 rounded-lg border border-blush" />
      </div>
      <button type="submit" disabled={saving} className="bg-rose text-white font-bold py-2 rounded-full disabled:opacity-50">
        {saving ? 'جاري الحفظ...' : 'حفظ المنتج'}
      </button>
      {error && <p className="text-red-600 text-sm sm:col-span-4">{error}</p>}
      <p className="text-xs text-ink/50 sm:col-span-4">يمكنك إضافة الصور والوصف والفئات لاحقًا من صفحة تعديل المنتج.</p>
    </form>
  );
}
