'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ImageUploader } from '@/components/image-uploader';

const LOGO_FIELDS: { key: 'logo_url' | 'logo_compact_url' | 'app_icon_url' | 'favicon_url'; label: string; hint: string }[] = [
  { key: 'logo_url', label: 'اللوجو الأساسي (Primary Logo)', hint: 'يستخدم في Header الموقع — PNG / WebP / SVG' },
  { key: 'logo_compact_url', label: 'اللوجو المختصر (Compact Logo)', hint: 'يستخدم في المساحات الصغيرة والـHeader عند الحاجة' },
  { key: 'app_icon_url', label: 'أيقونة التطبيق (App Icon)', hint: 'تستخدم كأيقونة التطبيق / PWA' },
  { key: 'favicon_url', label: 'Favicon', hint: 'تستخدم لأيقونة المتصفح' },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).single().then(({ data }) => setSettings(data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { id, updated_at, ...rest } = settings;
    await supabase.from('site_settings').update(rest).eq('id', 1);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (!settings) return <p className="text-ink/50">جاري التحميل...</p>;

  const field = (key: string, label: string, type = 'text') => (
    <div>
      <label className="block text-sm font-bold mb-1">{label}</label>
      <input
        type={type}
        value={settings[key] ?? ''}
        onChange={(e) => setSettings({ ...settings, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
        className="w-full px-3 py-2 rounded-lg border border-blush"
      />
    </div>
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">إعدادات المتجر</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* هوية المتجر */}
        <div className="bg-white border border-blush rounded-card p-5">
          <h2 className="font-display text-lg font-bold mb-1">هوية المتجر</h2>
          <p className="text-xs text-ink/60 mb-5">
            هذه الملفات هي المصدر الوحيد للوجو في الموقع بالكامل — أي تعديل هنا ينعكس فورًا على الـHeader، الـFooter، وأيقونة المتصفح.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {LOGO_FIELDS.map(({ key, label, hint }) => (
              <div key={key} className="border border-blush rounded-lg p-3">
                <label className="block text-sm font-bold mb-1">{label}</label>
                <p className="text-[11px] text-ink/50 mb-3">{hint}</p>

                {settings[key] ? (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-blush bg-cream shrink-0">
                      <Image src={settings[key]} alt={label} fill sizes="64px" className="object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, [key]: null })}
                      className="text-xs font-bold text-rose hover:underline"
                    >
                      حذف
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-ink/40 mb-3">لم يتم الرفع بعد</p>
                )}

                <ImageUploader
                  label={settings[key] ? 'استبدال' : 'رفع'}
                  multiple={false}
                  onUploaded={(url) => setSettings({ ...settings, [key]: url })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* بيانات المتجر العامة */}
        <div className="bg-white border border-blush rounded-card p-5 grid sm:grid-cols-2 gap-4">
          {field('store_name', 'اسم المتجر')}
          {field('tagline', 'الشعار (Tagline)')}
          {field('phone', 'رقم الهاتف')}
          {field('whatsapp_number', 'رقم واتساب')}
          {field('email', 'البريد الإلكتروني')}
          {field('working_hours', 'ساعات العمل')}
          {field('minimum_order', 'الحد الأدنى للطلب', 'number')}
          <div>
            <label className="block text-sm font-bold mb-1">حالة المتجر</label>
            <select
              value={settings.store_active ? '1' : '0'}
              onChange={(e) => setSettings({ ...settings, store_active: e.target.value === '1' })}
              className="w-full px-3 py-2 rounded-lg border border-blush"
            >
              <option value="1">نشط</option>
              <option value="0">مغلق مؤقتًا</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold mb-1">رسالة الإغلاق (تظهر إذا كان المتجر مغلقًا)</label>
            <input
              value={settings.closed_store_message ?? ''}
              onChange={(e) => setSettings({ ...settings, closed_store_message: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-blush"
            />
          </div>
        </div>

        <button type="submit" className="w-full bg-rose text-white font-bold py-3 rounded-full">
          {saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
        </button>
      </form>
    </div>
  );
}
