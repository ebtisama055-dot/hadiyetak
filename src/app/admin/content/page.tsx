'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminContentPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('content_pages').select('*').order('page_key');
    setPages(data ?? []);
    if (data && data.length > 0) setActiveKey((k) => k ?? data[0].page_key);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const active = pages.find((p) => p.page_key === activeKey);

  function updateLocal(field: string, value: string) {
    setPages((prev) => prev.map((p) => (p.page_key === activeKey ? { ...p, [field]: value } : p)));
  }

  async function save() {
    if (!active) return;
    await supabase.from('content_pages').update({ title: active.title, body: active.body }).eq('page_key', active.page_key);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (loading) return <p className="text-ink/50">جاري التحميل...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">إدارة الصفحات والمحتوى</h1>
      <div className="grid md:grid-cols-4 gap-6">
        <div className="space-y-1">
          {pages.map((p) => (
            <button
              key={p.page_key}
              onClick={() => setActiveKey(p.page_key)}
              className={`block w-full text-right px-3 py-2 rounded-lg text-sm font-bold ${activeKey === p.page_key ? 'bg-rose text-white' : 'bg-white border border-blush'}`}
            >
              {p.title}
            </button>
          ))}
        </div>
        {active && (
          <div className="md:col-span-3 bg-white border border-blush rounded-card p-5 space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">العنوان</label>
              <input value={active.title} onChange={(e) => updateLocal('title', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-blush" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">المحتوى</label>
              <textarea value={active.body} onChange={(e) => updateLocal('body', e.target.value)} rows={10} className="w-full px-3 py-2 rounded-lg border border-blush" />
            </div>
            <button onClick={save} className="bg-rose text-white font-bold px-6 py-2 rounded-full">{saved ? 'تم الحفظ ✓' : 'حفظ'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
