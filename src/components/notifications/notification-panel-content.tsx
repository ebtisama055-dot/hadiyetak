'use client';

import Link from 'next/link';
import { useNotifications } from './notifications-provider';
import { NotificationCard } from './notification-card';
import type { AppNotification } from '@/lib/notifications';

export function NotificationPanelContent({
  onClose,
  titleId,
}: {
  onClose: () => void;
  titleId: string;
}) {
  const { notifications, unreadCount, loading, error, refresh, markRead, markAllRead, archive, registerClick } = useNotifications();

  function handleOpen(n: AppNotification) {
    registerClick(n.id);
    markRead(n.id);
    onClose();
  }

  return (
    <div className="flex flex-col max-h-full">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-blush shrink-0">
        <h2 id={titleId} className="font-display text-lg font-bold text-ink">
          الإشعارات
        </h2>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-bold text-rose-dark hover:text-rose px-2 py-2 min-h-[44px] sm:min-h-0"
            >
              تحديد الكل كمقروء
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="إغلاق الإشعارات"
            className="w-11 h-11 flex items-center justify-center rounded-full text-ink/60 hover:bg-blush/50 shrink-0"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1" role="log" aria-live="polite">
        {loading && (
          <div className="px-4 py-10 text-center text-ink/50 text-sm">جاري تحميل الإشعارات...</div>
        )}

        {!loading && error && (
          <div className="px-4 py-10 text-center">
            <p className="text-ink/70 text-[16px] mb-3">حصلت مشكلة في تحميل الإشعارات.</p>
            <button onClick={refresh} className="text-sm font-bold text-rose-dark underline underline-offset-2">
              حاول مرة تانية
            </button>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-2xl mb-2">❤️</p>
            <p className="text-ink/60 text-[16px]">مفيش إشعارات جديدة دلوقتي</p>
          </div>
        )}

        {!loading &&
          !error &&
          notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} onOpen={handleOpen} onArchive={archive} />
          ))}
      </div>

      <div className="border-t border-blush px-4 py-2.5 text-center shrink-0">
        <Link href="/account/notifications" onClick={onClose} className="text-xs font-bold text-ink/50 hover:text-rose-dark">
          إعدادات الإشعارات
        </Link>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
