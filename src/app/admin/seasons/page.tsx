'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatArabicDate } from '@/lib/format';
import { computeLifecycleState, type SeasonLifecycleState } from '@/lib/season';

const STATE_LABELS: Record<SeasonLifecycleState, string> = {
  draft: 'مسودة',
  preview: 'معاينة',
  scheduled: 'مجدول (لسه ماوصلش)',
  active: 'نشط الآن',
  expired: 'منتهي',
};

const STATE_COLORS: Record<SeasonLifecycleState, string> = {
  draft: 'bg-blush text-ink',
  preview: 'bg-gold text-ink',
  scheduled: 'bg-blush text-ink',
  active: 'bg-forest text-white',
  expired: 'bg-ink/20 text-ink',
};

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
      <p className="text-ink/60 text-sm mb-6">
        «منشور» يعني أن الموسم مسموح له بالظهور حسب تواريخه — لكنه لا يظهر فعليًا للعملاء إلا وهو داخل فترة «نشط الآن».
        خارج هذه الفترة، يعود الموقع تلقائيًا للهوية الأساسية.
      </p>

      {loading ? (
        <p className="text-ink/50">جاري التحميل...</p>
      ) : (
        <div className="space-y-3">
          {seasons.map((s) => {
            const state = computeLifecycleState(s);
            return (
              <div key={s.id} className="bg-white border border-blush rounded-card p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold">{s.name}</div>
                  <div className="text-xs text-ink/60">
                    {formatArabicDate(s.full_start_date)} — {formatArabicDate(s.end_date)} · أولوية {s.priority}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATE_COLORS[state]}`}>{STATE_LABELS[state]}</span>
                  <a
                    href={`/?preview_season=${s.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold px-3 py-1.5 rounded-full border border-blush hover:border-rose"
                  >
                    معاينة
                  </a>
                  <select value={s.status} onChange={(e) => setStatus(s.id, e.target.value)} className="px-2 py-1 rounded-lg border border-blush text-sm">
                    <option value="draft">مسودة</option>
                    <option value="preview">معاينة</option>
                    <option value="published">منشور (حسب التواريخ)</option>
                  </select>
                </div>
              </div>
            );
          })}
          {seasons.length === 0 && <p className="text-ink/50">لا توجد مواسم بعد.</p>}
        </div>
      )}
    </div>
  );
}
