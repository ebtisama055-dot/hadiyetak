'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('banners').select('*').order('display_order');
    setBanners(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!image.trim()) return;
    await supabase.from('banners').insert({ title, image_url: image, link_url: link || null, display_order: banners.length + 1 });
    setTitle(''); setImage(''); setLink('');
    load();
  }

  async function toggle(id: string, active: boolean) {
    await supabase.from('banners').update({ active }).eq('id', id);
    load();
  }

  async function remove(id: string) {
    await supabase.from('banners').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">البانرات الترويجية</h1>
      <form onSubmit={add} className="bg-white border border-blush rounded-card p-4 mb-6 grid sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs font-bold mb-1">العنوان (اختياري)</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-blush" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold mb-1">رابط الصورة</label>
          <input value={image} onChange={(e) => setImage(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-blush" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">رابط عند الضغط (اختياري)</label>
          <input value={link} onChange={(e) => setLink(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-blush" />
        </div>
        <button type="submit" className="sm:col-span-4 bg-rose text-white font-bold py-2 rounded-full">+ إضافة بانر</button>
      </form>

      {loading ? <p className="text-ink/50">جاري التحميل...</p> : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="bg-white border border-blush rounded-card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image_url} alt={b.title || ''} className="w-full h-32 object-cover" />
              <div className="p-3 flex items-center justify-between">
                <span className="text-sm font-bold">{b.title || 'بدون عنوان'}</span>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={b.active} onChange={(e) => toggle(b.id, e.target.checked)} />
                  <button onClick={() => remove(b.id)} className="text-red-600 text-xs font-bold">حذف</button>
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && <p className="text-ink/50">لا توجد بانرات بعد.</p>}
        </div>
      )}
    </div>
  );
}
