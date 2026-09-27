'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('homepage_sections').select('*').order('display_order');
    setSections(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggleVisible(id: string, visible: boolean) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible } : s)));
    await supabase.from('homepage_sections').update({ visible }).eq('id', id);
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const a = sections[index];
    const b = sections[target];
    const newSections = [...sections];
    newSections[index] = { ...a, display_order: b.display_order };
    newSections[target] = { ...b, display_order: a.display_order };
    newSections.sort((x, y) => x.display_order - y.display_order);
    setSections(newSections);
    await supabase.from('homepage_sections').update({ display_order: b.display_order }).eq('id', a.id);
    await supabase.from('homepage_sections').update({ display_order: a.display_order }).eq('id', b.id);
  }

  if (loading) return <p className="text-ink/50">جاري التحميل...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-2">إدارة الصفحة الرئيسية</h1>
      <p className="text-ink/60 text-sm mb-6">تحكم في ترتيب وظهور أقسام الصفحة الرئيسية.</p>

      <div className="space-y-2">
        {sections.map((s, i) => (
          <div key={s.id} className="bg-white border border-blush rounded-card p-3 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm">{s.title || s.section_key}</div>
              <div className="text-xs text-ink/50">{s.section_key}</div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-sm disabled:opacity-30">▲</button>
              <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="text-sm disabled:opacity-30">▼</button>
              <label className="flex items-center gap-1 text-xs font-bold">
                <input type="checkbox" checked={s.visible} onChange={(e) => toggleVisible(s.id, e.target.checked)} /> ظاهر
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
