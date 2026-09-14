'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatArabicDate } from '@/lib/format';

export default function AdminSeasonsPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('seasons').select('*').order('priority', { ascending: false });
    setSeasons(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: string) {
    await supabase.from('seasons').update({ status }).eq('id', id);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-2">المواسم</h1>
      <p className="text-ink/60 text-sm mb-6">جهّز شكل الموسم كمسودة، عاين شكله، ثم انشره ليصبح فعّالًا تلقائيًا حسب تواريخه.</p>

      {loading ? (
        <p className="text-ink/50">جاري التحميل...</p>
      ) : (
        <div className="space-y-3">
          {seasons.map((s) => (
            <div key={s.id} className="bg-white border border-blush rounded-card p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-bold">{s.name}</div>
                <div className="text-xs text-ink/60">
                  {formatArabicDate(s.full_start_date)} — {formatArabicDate(s.end_date)} · أولوية {s.priority}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={s.status} />
                <select value={s.status} onChange={(e) => setStatus(s.id, e.target.value)} className="px-2 py-1 rounded-lg border border-blush text-sm">
                  <option value="draft">مسودة</option>
                  <option value="preview">معاينة</option>
                  <option value="published">منشور</option>
                </select>
              </div>
            </div>
          ))}
          {seasons.length === 0 && <p className="text-ink/50">لا توجد مواسم بعد.</p>}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: 'bg-blush text-ink',
    preview: 'bg-gold text-ink',
    published: 'bg-forest text-white',
  };
  const labels: Record<string, string> = { draft: 'مسودة', preview: 'معاينة', published: 'منشور' };
  return <span className={`text-xs font-bold px-2 py-1 rounded-full ${map[status]}`}>{labels[status]}</span>;
}
