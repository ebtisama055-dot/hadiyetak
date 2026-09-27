'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatArabicDate } from '@/lib/format';
import { computeNotificationLifecycleState, normalizeMobile, type NotificationLifecycleState } from '@/lib/notifications';
import { NotificationCard } from '@/components/notifications/notification-card';
import { useAdminToast, reportIfError } from '@/components/admin-toast';

const TYPE_OPTIONS = [
  { value: 'general', label: 'عام' },
  { value: 'offer', label: 'عرض' },
  { value: 'seasonal', label: 'موسمي' },
  { value: 'product', label: 'منتج' },
  { value: 'system', label: 'النظام' },
  { value: 'order', label: 'طلب (يدوي)' },
  { value: 'payment', label: 'دفع (يدوي)' },
  { value: 'delivery', label: 'توصيل (يدوي)' },
];

const STATE_LABELS: Record<NotificationLifecycleState, string> = {
  draft: 'مسودة',
  scheduled: 'مجدول',
  active: 'نشط الآن',
  expired: 'منتهي',
};

const STATE_COLORS: Record<NotificationLifecycleState, string> = {
  draft: 'bg-blush text-ink',
  scheduled: 'bg-gold text-ink',
  active: 'bg-forest text-white',
  expired: 'bg-ink/20 text-ink',
};

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminNotificationsPage() {
  const { notifyError, notifySuccess } = useAdminToast();
  const [rows, setRows] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, { delivered: number; read: number; clicked: number }>>({});

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('general');
  const [icon, setIcon] = useState('🔔');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important'>('normal');
  const [actionUrl, setActionUrl] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [audience, setAudience] = useState<'all' | 'customer'>('all');
  const [customerMobile, setCustomerMobile] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [startsAt, setStartsAt] = useState(() => toLocalInputValue(new Date()));
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: n }, { data: t }] = await Promise.all([
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('notification_templates').select('*').eq('active', true).order('key'),
    ]);
    setRows(n ?? []);
    setTemplates(t ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function applyTemplate(key: string) {
    const t = templates.find((tp) => tp.key === key);
    if (!t) return;
    setType(t.type);
    setIcon(t.icon);
    setTitle(t.title_template);
    setBody(t.body_template);
    setPriority(t.default_priority);
    setActionLabel(t.default_cta_label ?? '');
  }

  function resetForm() {
    setType('general'); setIcon('🔔'); setTitle(''); setBody('');
    setPriority('normal'); setActionUrl(''); setActionLabel('');
    setAudience('all'); setCustomerMobile('');
    setStatus('draft'); setStartsAt(toLocalInputValue(new Date())); setExpiresAt('');
    setShowForm(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    if (audience === 'customer' && !customerMobile.trim()) {
      notifyError('من فضلك أدخلي رقم موبايل العميل المستهدف.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('notifications').insert({
      type, icon, title, body, priority,
      action_url: actionUrl || null,
      action_label: actionLabel || null,
      audience_type: audience,
      customer_mobile: audience === 'customer' ? normalizeMobile(customerMobile) : null,
      status,
      starts_at: new Date(startsAt).toISOString(),
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    });
    setSaving(false);
    if (!reportIfError(notifyError, error, 'إنشاء الإشعار')) return;
    notifySuccess('تم إنشاء الإشعار');
    resetForm();
    load();
  }

  async function toggleStatus(id: string, current: string) {
    const { error } = await supabase.from('notifications').update({ status: current === 'draft' ? 'published' : 'draft' }).eq('id', id);
    reportIfError(notifyError, error, 'تحديث حالة الإشعار');
    load();
  }

  async function remove(id: string) {
    if (!confirm('متأكدة إنك عايزة تحذفي الإشعار ده؟')) return;
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    reportIfError(notifyError, error, 'حذف الإشعار');
    load();
  }

  async function loadAnalytics(id: string) {
    if (analytics[id]) return;
    const { data } = await supabase.from('notification_reads').select('read_at, clicked_at').eq('notification_id', id);
    const delivered = data?.length ?? 0;
    const read = data?.filter((r) => r.read_at).length ?? 0;
    const clicked = data?.filter((r) => r.clicked_at).length ?? 0;
    setAnalytics((prev) => ({ ...prev, [id]: { delivered, read, clicked } }));
  }

  function toggleExpand(id: string) {
    const next = expandedId === id ? null : id;
    setExpandedId(next);
    if (next) loadAnalytics(next);
  }

  const previewNotification = {
    id: 'preview',
    type: type as any,
    icon,
    title: title || 'عنوان الإشعار',
    body: body || 'نص الإشعار هيظهر هنا.',
    priority,
    action_url: actionUrl || null,
    action_label: actionLabel || null,
    audience_type: audience,
    order_id: null,
    created_at: new Date().toISOString(),
    expires_at: null,
    read_at: null,
    archived_at: null,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">الإشعارات</h1>
        <button onClick={() => setShowForm((v) => !v)} className="bg-rose text-white font-bold px-4 py-2 rounded-full text-sm">
          {showForm ? 'إغلاق' : '+ إشعار جديد'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border border-blush rounded-card p-5 mb-8 space-y-4">
          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-bold mb-1">البدء من قالب جاهز (اختياري)</label>
              <select onChange={(e) => e.target.value && applyTemplate(e.target.value)} defaultValue="" className="w-full px-3 py-2 rounded-lg border border-blush">
                <option value="">— اختاري قالب —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.key}>{t.key}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">النوع</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-blush">
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">الأيقونة (إيموجي)</label>
              <input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-blush" maxLength={4} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">الأولوية</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full px-3 py-2 rounded-lg border border-blush">
                <option value="normal">عادية</option>
                <option value="important">مهمة</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">العنوان</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-blush" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">النص</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={3} className="w-full px-3 py-2 rounded-lg border border-blush" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">رابط CTA (اختياري)</label>
              <input value={actionUrl} onChange={(e) => setActionUrl(e.target.value)} placeholder="/products" className="w-full px-3 py-2 rounded-lg border border-blush" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">نص الزرار (اختياري)</label>
              <input value={actionLabel} onChange={(e) => setActionLabel(e.target.value)} placeholder="تسوّقي الآن" className="w-full px-3 py-2 rounded-lg border border-blush" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">الجمهور</label>
              <select value={audience} onChange={(e) => setAudience(e.target.value as any)} className="w-full px-3 py-2 rounded-lg border border-blush">
                <option value="all">كل العملاء</option>
                <option value="customer">عميل محدد (برقم الموبايل)</option>
              </select>
              <p className="text-xs text-ink/45 mt-1">استهداف مجموعات (عملاء لديهم طلبات، عملاء جدد...) غير مدعوم في هذه النسخة بعد.</p>
            </div>
            {audience === 'customer' && (
              <div>
                <label className="block text-sm font-bold mb-1">رقم موبايل العميل</label>
                <input value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} placeholder="01xxxxxxxxx" className="w-full px-3 py-2 rounded-lg border border-blush" />
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">الحالة</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full px-3 py-2 rounded-lg border border-blush">
                <option value="draft">مسودة</option>
                <option value="published">نشر</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">يبدأ في</label>
              <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-blush" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">ينتهي في (اختياري)</label>
              <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-blush" />
            </div>
          </div>

          <div>
            <p className="text-sm font-bold mb-2">معاينة</p>
            <div className="border border-blush rounded-card overflow-hidden max-w-sm">
              <NotificationCard notification={previewNotification} onOpen={() => {}} onArchive={() => {}} />
            </div>
          </div>

          <button type="submit" disabled={saving} className="bg-rose text-white font-bold px-5 py-2.5 rounded-full text-sm disabled:opacity-60">
            {saving ? 'جاري الحفظ...' : 'حفظ الإشعار'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-ink/50">جاري التحميل...</p>
      ) : rows.length === 0 ? (
        <p className="text-ink/50">لسه مفيش إشعارات.</p>
      ) : (
        <div className="bg-white border border-blush rounded-card divide-y divide-blush">
          {rows.map((n) => {
            const state = computeNotificationLifecycleState(n);
            return (
              <div key={n.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATE_COLORS[state]}`}>{STATE_LABELS[state]}</span>
                      <span className="text-xs text-ink/50">{TYPE_OPTIONS.find((t) => t.value === n.type)?.label ?? n.type}</span>
                      <span className="text-xs text-ink/40">{n.audience_type === 'all' ? 'كل العملاء' : n.customer_mobile}</span>
                      {n.priority === 'important' && <span className="text-xs font-bold text-rose-dark">مهم</span>}
                    </div>
                    <p className="font-bold text-ink">{n.icon} {n.title}</p>
                    <p className="text-sm text-ink/60 mt-0.5">{n.body}</p>
                    <p className="text-xs text-ink/40 mt-1">أُنشئ {formatArabicDate(n.created_at)}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0 items-end">
                    <button onClick={() => toggleStatus(n.id, n.status)} className="text-xs font-bold text-rose-dark underline underline-offset-2">
                      {n.status === 'draft' ? 'نشر' : 'تحويل لمسودة'}
                    </button>
                    <button onClick={() => toggleExpand(n.id)} className="text-xs text-ink/50 underline underline-offset-2">إحصائيات</button>
                    <button onClick={() => remove(n.id)} className="text-xs text-red-600 underline underline-offset-2">حذف</button>
                  </div>
                </div>
                {expandedId === n.id && (
                  <div className="mt-3 pt-3 border-t border-blush/70 flex gap-6 text-sm">
                    <span>تم التوصيل: <b>{analytics[n.id]?.delivered ?? '...'}</b></span>
                    <span>تمت القراءة: <b>{analytics[n.id]?.read ?? '...'}</b></span>
                    <span>تم الضغط عليه: <b>{analytics[n.id]?.clicked ?? '...'}</b></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
