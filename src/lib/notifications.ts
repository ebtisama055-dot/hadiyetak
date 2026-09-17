import { supabase } from './supabase';

export type NotificationType = 'order' | 'payment' | 'delivery' | 'product' | 'offer' | 'seasonal' | 'general' | 'system';
export type NotificationPriority = 'normal' | 'important';

export type AppNotification = {
  id: string;
  type: NotificationType;
  icon: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  action_url: string | null;
  action_label: string | null;
  audience_type: 'customer' | 'all' | 'segment';
  order_id: string | null;
  created_at: string;
  expires_at: string | null;
  // joined read-state for the current reader
  read_at: string | null;
  archived_at: string | null;
};

const MOBILE_KEY = 'hadiyetak_customer_mobile';
const VISITOR_KEY = 'hadiyetak_visitor_id';

/** Mirrors the DB's normalize_mobile() so client-side matching agrees with it. */
export function normalizeMobile(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  return digits.startsWith('0') ? `2${digits}` : digits;
}

/** Call this right after a successful checkout so the bell can find "my" order notifications. */
export function rememberCustomerMobile(mobile: string) {
  const normalized = normalizeMobile(mobile);
  if (normalized && typeof window !== 'undefined') {
    localStorage.setItem(MOBILE_KEY, normalized);
  }
}

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

/**
 * The identity notifications are read/written against. If the visitor has
 * ordered before (mobile remembered locally), that mobile IS their
 * reader_key so their order notifications show up. Otherwise an anonymous
 * per-browser id is used only to track which broadcast notifications
 * they've already read/dismissed.
 */
export function getReaderKey(): { key: string; isCustomer: boolean } {
  if (typeof window === 'undefined') return { key: '', isCustomer: false };
  const mobile = localStorage.getItem(MOBILE_KEY);
  if (mobile) return { key: mobile, isCustomer: true };
  return { key: getOrCreateVisitorId(), isCustomer: false };
}

/** Fetches everything currently visible to this reader: their own order/payment/
 * delivery notifications plus live broadcast notifications, newest first.
 * Run as two separate queries (broadcast + mine) and merged client-side —
 * chaining multiple .or() filters in one query is ambiguous, two simple
 * queries are easier to reason about and verify correct. */
export async function fetchNotifications(readerKey: string, opts: { limit?: number; offset?: number } = {}): Promise<AppNotification[]> {
  const limit = opts.limit ?? 20;
  const nowIso = new Date().toISOString();
  const select = 'id, type, icon, title, body, priority, action_url, action_label, audience_type, order_id, created_at, expires_at, notification_reads(read_at, archived_at, reader_key)';

  const base = () =>
    supabase
      .from('notifications')
      .select(select)
      .eq('status', 'published')
      .lte('starts_at', nowIso)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .order('created_at', { ascending: false })
      .limit(limit);

  const [{ data: broadcast }, { data: mine }] = await Promise.all([
    base().eq('audience_type', 'all'),
    readerKey ? base().eq('audience_type', 'customer').eq('customer_mobile', readerKey) : Promise.resolve({ data: [] as any[] }),
  ]);

  const rows = [...(broadcast ?? []), ...(mine ?? [])];
  rows.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return rows
    .slice(0, limit)
    .map((row: any) => {
      const myRead = (row.notification_reads ?? []).find((r: any) => r.reader_key === readerKey);
      return {
        id: row.id,
        type: row.type,
        icon: row.icon,
        title: row.title,
        body: row.body,
        priority: row.priority,
        action_url: row.action_url,
        action_label: row.action_label,
        audience_type: row.audience_type,
        order_id: row.order_id,
        created_at: row.created_at,
        expires_at: row.expires_at,
        read_at: myRead?.read_at ?? null,
        archived_at: myRead?.archived_at ?? null,
      } as AppNotification;
    })
    .filter((n) => !n.archived_at);
}

export async function getUnreadCount(readerKey: string): Promise<number> {
  const list = await fetchNotifications(readerKey, { limit: 50 });
  return list.filter((n) => !n.read_at).length;
}

/** Marks "delivered" (first fetch) — upserts a reads row so it counts for analytics. */
async function ensureDelivered(notificationId: string, readerKey: string) {
  await supabase.from('notification_reads').upsert(
    { notification_id: notificationId, reader_key: readerKey },
    { onConflict: 'notification_id,reader_key', ignoreDuplicates: true }
  );
}

export async function markRead(notificationId: string, readerKey: string) {
  await ensureDelivered(notificationId, readerKey);
  await supabase
    .from('notification_reads')
    .update({ read_at: new Date().toISOString() })
    .eq('notification_id', notificationId)
    .eq('reader_key', readerKey);
}

export async function markAllRead(notificationIds: string[], readerKey: string) {
  await Promise.all(notificationIds.map((id) => markRead(id, readerKey)));
}

export async function markClicked(notificationId: string, readerKey: string) {
  await ensureDelivered(notificationId, readerKey);
  await supabase
    .from('notification_reads')
    .update({ clicked_at: new Date().toISOString(), read_at: new Date().toISOString() })
    .eq('notification_id', notificationId)
    .eq('reader_key', readerKey);
}

export async function markArchived(notificationId: string, readerKey: string) {
  await ensureDelivered(notificationId, readerKey);
  await supabase
    .from('notification_reads')
    .update({ archived_at: new Date().toISOString() })
    .eq('notification_id', notificationId)
    .eq('reader_key', readerKey);
}

/** Live updates: fires for new notifications addressed to this reader (their own
 * mobile) or broadcast to everyone. Two subscriptions merged, since Realtime's
 * postgres_changes filter only supports one equality condition at a time. */
export function subscribeToNewNotifications(readerKey: string, onNew: (n: AppNotification) => void) {
  const toAppNotification = (row: any): AppNotification => ({
    id: row.id,
    type: row.type,
    icon: row.icon,
    title: row.title,
    body: row.body,
    priority: row.priority,
    action_url: row.action_url,
    action_label: row.action_label,
    audience_type: row.audience_type,
    order_id: row.order_id,
    created_at: row.created_at,
    expires_at: row.expires_at,
    read_at: null,
    archived_at: null,
  });

  const mineChannel = supabase
    .channel(`notifications-mine-${readerKey}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `customer_mobile=eq.${readerKey}` },
      (payload) => onNew(toAppNotification(payload.new))
    )
    .subscribe();

  const broadcastChannel = supabase
    .channel(`notifications-broadcast-${readerKey}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `audience_type=eq.all` },
      (payload) => onNew(toAppNotification(payload.new))
    )
    .subscribe();

  return () => {
    supabase.removeChannel(mineChannel);
    supabase.removeChannel(broadcastChannel);
  };
}

// ---- Admin: lifecycle state, mirroring the same draft/scheduled/active/expired
// pattern already used for seasons (see lib/season.ts computeLifecycleState) —
// `status` is only ever draft/published; the effective state is derived from
// starts_at/expires_at so nothing needs a cron job to "become" active.
export type NotificationLifecycleState = 'draft' | 'scheduled' | 'active' | 'expired';

export function computeNotificationLifecycleState(n: { status: string; starts_at: string; expires_at: string | null }): NotificationLifecycleState {
  if (n.status === 'draft') return 'draft';
  const now = new Date();
  const start = new Date(n.starts_at);
  if (now < start) return 'scheduled';
  if (n.expires_at && now > new Date(n.expires_at)) return 'expired';
  return 'active';
}

// ---- Preferences (marketing opt-in/out only — order/payment/delivery/system
// notifications are never gated by these) ----

export type NotificationPreferences = {
  marketing_offers: boolean;
  marketing_new_products: boolean;
  marketing_seasonal: boolean;
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  marketing_offers: true,
  marketing_new_products: true,
  marketing_seasonal: true,
};

export async function fetchPreferences(readerKey: string): Promise<NotificationPreferences> {
  const { data } = await supabase
    .from('notification_preferences')
    .select('marketing_offers, marketing_new_products, marketing_seasonal')
    .eq('reader_key', readerKey)
    .maybeSingle();
  return data ?? DEFAULT_PREFERENCES;
}

export async function savePreferences(readerKey: string, prefs: NotificationPreferences): Promise<boolean> {
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({ reader_key: readerKey, ...prefs, updated_at: new Date().toISOString() }, { onConflict: 'reader_key' });
  return !error;
}
