'use client';

import { Fragment, useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ImageUploader } from '@/components/image-uploader';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, product_images(id, image_url, is_primary, display_order)')
      .order('created_at', { ascending: false });
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
                <th className="p-3">الصورة</th>
                <th className="p-3">المنتج</th>
                <th className="p-3">السعر</th>
                <th className="p-3">السعر قبل الخصم</th>
                <th className="p-3">المخزون</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">مميز</th>
                <th className="p-3">الأكثر مبيعًا</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const primary = p.product_images?.find((i: any) => i.is_primary) || p.product_images?.[0];
                return (
                  <Fragment key={p.id}>
                    <tr className="border-b border-blush last:border-0">
                      <td className="p-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-blush">
                          {primary && <Image src={primary.image_url} alt="" fill className="object-cover" />}
                        </div>
                      </td>
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
                      <td className="p-3">
                        <button
                          onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-full border border-blush hover:border-rose whitespace-nowrap"
                        >
                          {expandedId === p.id ? 'إغلاق الصور' : 'إدارة الصور'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === p.id && (
                      <tr className="bg-cream/50">
                        <td colSpan={9} className="p-4">
                          <ProductImagesManager product={p} onChange={load} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProductImagesManager({ product, onChange }: { product: any; onChange: () => void }) {
  const images = [...(product.product_images ?? [])].sort((a, b) => a.display_order - b.display_order);

  async function addImage(url: string) {
    const isFirst = images.length === 0;
    await supabase.from('product_images').insert({
      product_id: product.id,
      image_url: url,
      is_primary: isFirst,
      display_order: images.length,
    });
    onChange();
  }

  async function setPrimary(imageId: string) {
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', product.id);
    await supabase.from('product_images').update({ is_primary: true }).eq('id', imageId);
    onChange();
  }

  async function removeImage(imageId: string) {
    await supabase.from('product_images').delete().eq('id', imageId);
    onChange();
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const a = images[index];
    const b = images[target];
    await supabase.from('product_images').update({ display_order: b.display_order }).eq('id', a.id);
    await supabase.from('product_images').update({ display_order: a.display_order }).eq('id', b.id);
    onChange();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">صور "{product.name}"</h3>
        <ImageUploader label="إضافة صور" onUploaded={addImage} />
      </div>

      {images.length === 0 ? (
        <p className="text-ink/50 text-sm">لا توجد صور لهذا المنتج بعد.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={img.id} className="relative w-28 rounded-lg overflow-hidden border border-blush bg-white">
              <div className="relative w-full aspect-square bg-blush">
                <Image src={img.image_url} alt="" fill className="object-cover" />
                {img.is_primary && (
                  <span className="absolute top-1 right-1 bg-rose text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    رئيسية
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between p-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="text-xs disabled:opacity-20">◀</button>
                {!img.is_primary && (
                  <button onClick={() => setPrimary(img.id)} className="text-[10px] font-bold text-forest">تعيين رئيسية</button>
                )}
                <button onClick={() => move(i, 1)} disabled={i === images.length - 1} className="text-xs disabled:opacity-20">▶</button>
              </div>
              <button onClick={() => removeImage(img.id)} className="w-full text-[10px] font-bold text-red-600 border-t border-blush py-1">
                حذف
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewProductForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
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
    const { data: product, error: err } = await supabase.from('products').insert({
      name,
      slug: `${slugBase}-${Date.now().toString().slice(-5)}`,
      selling_price: Number(price) || 0,
      stock_quantity: Number(stock) || 0,
      visibility: 'published',
    }).select().single();

    if (err || !product) { setSaving(false); setError('تعذّر إضافة المنتج.'); return; }

    if (imageUrls.length > 0) {
      await supabase.from('product_images').insert(
        imageUrls.map((url, i) => ({ product_id: product.id, image_url: url, is_primary: i === 0, display_order: i }))
      );
    }

    setSaving(false);
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-blush rounded-card p-4 mb-6 space-y-4">
      <div className="grid sm:grid-cols-4 gap-3 items-end">
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
      </div>

      <div>
        <label className="block text-xs font-bold mb-2">صور المنتج (أول صورة تترفع تبقى الرئيسية)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {imageUrls.map((url, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-blush bg-blush">
              <Image src={url} alt="" fill className="object-cover" />
              {i === 0 && <span className="absolute top-0.5 right-0.5 bg-rose text-white text-[9px] font-bold px-1 rounded-full">رئيسية</span>}
            </div>
          ))}
        </div>
        <ImageUploader label="رفع صور" onUploaded={(url) => setImageUrls((prev) => [...prev, url])} />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      <p className="text-xs text-ink/50">يمكنك إضافة الوصف والفئات والمناسبات لاحقًا (قريبًا في صفحة تعديل مخصصة).</p>
    </form>
  );
}
