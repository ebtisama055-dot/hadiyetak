'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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
      <form onSubmit={handleSubmit} className="bg-white border border-blush rounded-card p-5 grid sm:grid-cols-2 gap-4 max-w-3xl">
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
        <button type="submit" className="sm:col-span-2 bg-rose text-white font-bold py-3 rounded-full">
          {saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
        </button>
      </form>
    </div>
  );
}
