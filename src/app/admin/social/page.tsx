'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminSocialPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('social_links').select('*').order('display_order');
    setLinks(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function updateField(id: string, field: string, value: any) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
    await supabase.from('social_links').update({ [field]: value }).eq('id', id);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!platform.trim() || !url.trim()) return;
    await supabase.from('social_links').insert({ platform, url, display_order: links.length + 1 });
    setPlatform(''); setUrl('');
    load();
  }

  async function remove(id: string) {
    await supabase.from('social_links').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">روابط التواصل الاجتماعي</h1>
      <form onSubmit={add} className="flex flex-wrap gap-2 mb-6 items-end">
        <div>
          <label className="block text-xs font-bold mb-1">المنصة</label>
          <input value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="facebook / instagram / tiktok" className="px-3 py-2 rounded-lg border border-blush" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">الرابط</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="px-3 py-2 rounded-lg border border-blush min-w-[240px]" />
        </div>
        <button type="submit" className="bg-rose text-white font-bold px-4 py-2 rounded-full text-sm">+ إضافة</button>
      </form>

      {loading ? <p className="text-ink/50">جاري التحميل...</p> : (
        <div className="bg-white border border-blush rounded-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-blush text-ink/60 text-right"><th className="p-3">المنصة</th><th className="p-3">الرابط</th><th className="p-3">نشط</th><th className="p-3"></th></tr></thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} className="border-b border-blush last:border-0">
                  <td className="p-3 font-bold">{l.platform}</td>
                  <td className="p-3">
                    <input defaultValue={l.url} onBlur={(e) => updateField(l.id, 'url', e.target.value)} className="w-full px-2 py-1 rounded-lg border border-blush" />
                  </td>
                  <td className="p-3"><input type="checkbox" checked={l.active} onChange={(e) => updateField(l.id, 'active', e.target.checked)} /></td>
                  <td className="p-3"><button onClick={() => remove(l.id)} className="text-red-600 text-xs font-bold">حذف</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
