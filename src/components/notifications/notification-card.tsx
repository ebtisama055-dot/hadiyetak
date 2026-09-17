'use client';

import Link from 'next/link';
import { formatRelativeArabic } from '@/lib/format';
import type { AppNotification } from '@/lib/notifications';

const TYPE_LABELS: Record<AppNotification['type'], string> = {
  order: 'طلب',
  payment: 'دفع',
  delivery: 'توصيل',
  product: 'منتج',
  offer: 'عرض',
  seasonal: 'موسمي',
  general: 'عام',
  system: 'النظام',
};

export function NotificationCard({
  notification,
  onOpen,
  onArchive,
}: {
  notification: AppNotification;
  onOpen: (n: AppNotification) => void;
  onArchive: (id: string) => void;
}) {
  const isUnread = !notification.read_at;

  return (
    <div
      className={`relative flex gap-3 px-4 py-4 border-b border-blush/70 last:border-0 ${
        isUnread ? 'bg-blush/25' : 'bg-white'
      }`}
    >
      <div
        aria-hidden="true"
        className="shrink-0 w-11 h-11 rounded-full bg-blush/60 flex items-center justify-center text-xl"
      >
        {notification.icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[16px] leading-[1.6] ${isUnread ? 'font-bold text-ink' : 'font-semibold text-ink/80'}`}>
            {notification.title}
          </p>
          {isUnread && (
            <span
              className="mt-1.5 w-2.5 h-2.5 rounded-full bg-rose shrink-0"
              aria-hidden="true"
            />
          )}
        </div>

        <p className="mt-1 text-[16px] leading-[1.6] text-ink/70 break-words">{notification.body}</p>

        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-ink/45">{formatRelativeArabic(notification.created_at)}</span>
          <span className="text-xs text-ink/40">· {TYPE_LABELS[notification.type]}</span>
          {notification.priority === 'important' && (
            <span className="text-xs font-bold text-rose-dark bg-rose/10 px-2 py-0.5 rounded-full">مهم</span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-4">
          {notification.action_url && notification.action_label && (
            <Link
              href={notification.action_url}
              onClick={() => onOpen(notification)}
              className="text-sm font-bold text-rose-dark hover:text-rose underline underline-offset-2"
            >
              {notification.action_label}
            </Link>
          )}
          <button
            onClick={() => onArchive(notification.id)}
            className="text-xs text-ink/40 hover:text-ink/70 min-h-[44px] sm:min-h-0 px-1"
            aria-label={`إخفاء إشعار: ${notification.title}`}
          >
            إخفاء
          </button>
        </div>
      </div>
    </div>
  );
}
