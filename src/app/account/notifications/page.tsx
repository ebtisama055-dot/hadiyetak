'use client';

import { useEffect, useState } from 'react';
import { getReaderKey, fetchPreferences, savePreferences, type NotificationPreferences } from '@/lib/notifications';

const TOGGLES: { key: keyof NotificationPreferences; label: string }[] = [
  { key: 'marketing_offers', label: 'عروض وخصومات' },
  { key: 'marketing_new_products', label: 'منتجات جديدة' },
  { key: 'marketing_seasonal', label: 'أخبار الموسم' },
];

export default function NotificationPreferencesPage() {
  const [readerKey, setReaderKey] = useState('');
  const [isCustomer, setIsCustomer] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const { key, isCustomer: ic } = getReaderKey();
    setReaderKey(key);
    setIsCustomer(ic);
    if (key) fetchPreferences(key).then(setPrefs);
  }, []);

  async function toggle(field: keyof NotificationPreferences) {
    if (!prefs) return;
    const next = { ...prefs, [field]: !prefs[field] };
    setPrefs(next);
    setSaving(true);
    const ok = await savePreferences(readerKey, next);
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-2">إعدادات الإشعارات</h1>
      <p className="text-ink/60 text-[15px] leading-relaxed mb-8">
        تقدري توقفي إشعارات التسويق في أي وقت. إشعارات طلباتك ودفعاتك وتوصيلك تفضل شغالة دايمًا عشان تعرفي كل تحديث مهم عن طلبك.
      </p>

      {!prefs ? (
        <p className="text-ink/50 text-sm">جاري التحميل...</p>
      ) : (
        <div className="bg-white border border-blush rounded-card divide-y divide-blush">
          {TOGGLES.map((t) => (
            <label key={t.key} className="flex items-center justify-between px-5 py-4 cursor-pointer">
              <span className="text-[16px] font-bold text-ink">{t.label}</span>
              <input
                type="checkbox"
                checked={prefs[t.key]}
                onChange={() => toggle(t.key)}
                className="w-5 h-5 accent-rose"
              />
            </label>
          ))}
        </div>
      )}

      <div className="mt-4 min-h-[20px] text-sm font-bold text-rose-dark">
        {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ ✓' : ''}
      </div>

      <div className="mt-8 pt-6 border-t border-blush">
        <h2 className="font-display text-lg font-bold mb-2">إشعارات أساسية (دائمًا مفعّلة)</h2>
        <ul className="text-[15px] text-ink/60 leading-relaxed list-disc pr-5 space-y-1">
          <li>تحديثات الطلب (تم الاستلام، التجهيز، التوصيل)</li>
          <li>تحديثات الدفع</li>
          <li>إشعارات مهمة من النظام</li>
        </ul>
      </div>

      {!isCustomer && (
        <p className="mt-6 text-xs text-ink/40 leading-relaxed">
          الإعدادات دي متربطة بجهازك الحالي. لو عملتي طلب قبل كده من نفس الجهاز، هتلاقي إشعارات طلباتك في الجرس تلقائيًا.
        </p>
      )}
    </div>
  );
}
