'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  type AppNotification,
  fetchNotifications,
  getReaderKey,
  markArchived,
  markClicked,
  markRead as markReadApi,
  subscribeToNewNotifications,
} from '@/lib/notifications';

type ToastItem = { id: string; notification: AppNotification };

type NotificationsContextValue = {
  readerKey: string;
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: boolean;
  refresh: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  archive: (id: string) => void;
  registerClick: (id: string) => void;
  toasts: ToastItem[];
  dismissToast: (id: string) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

// A new notification only becomes a toast (interrupts the visit) when it's an
// order/payment lifecycle update or explicitly marked "important" — marketing
// and seasonal broadcasts stay quiet and only raise the bell's unread count,
// per the "order updates must never get lost among marketing" requirement.
function shouldToast(n: AppNotification): boolean {
  return n.priority === 'important' || n.type === 'order' || n.type === 'payment' || n.type === 'delivery';
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [readerKey, setReaderKey] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const unsubRef = useRef<(() => void) | null>(null);

  const refresh = useCallback(async () => {
    const { key } = getReaderKey();
    if (!key) return;
    setLoading(true);
    setError(false);
    try {
      const list = await fetchNotifications(key);
      setNotifications(list);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { key } = getReaderKey();
    setReaderKey(key);
  }, []);

  useEffect(() => {
    if (!readerKey) return;
    refresh();

    unsubRef.current?.();
    unsubRef.current = subscribeToNewNotifications(readerKey, (n) => {
      setNotifications((prev) => [n, ...prev.filter((p) => p.id !== n.id)]);
      if (shouldToast(n)) {
        setToasts((prev) => [...prev, { id: n.id, notification: n }]);
      }
    });

    return () => unsubRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readerKey]);

  const markRead = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n)));
      if (readerKey) markReadApi(id, readerKey);
    },
    [readerKey]
  );

  const markAllRead = useCallback(() => {
    const unread = notifications.filter((n) => !n.read_at);
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    unread.forEach((n) => readerKey && markReadApi(n.id, readerKey));
  }, [notifications, readerKey]);

  const archive = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (readerKey) markArchived(id, readerKey);
    },
    [readerKey]
  );

  const registerClick = useCallback(
    (id: string) => {
      if (readerKey) markClicked(id, readerKey);
    },
    [readerKey]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <NotificationsContext.Provider
      value={{ readerKey, notifications, unreadCount, loading, error, refresh, markRead, markAllRead, archive, registerClick, toasts, dismissToast }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
