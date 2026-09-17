'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from './notifications-provider';

// Reading time-based duration so long messages don't vanish before they can
// be read, short ones don't linger — plus a manual close, always.
function durationFor(body: string): number {
  const MIN = 4500;
  const MAX = 12000;
  const estimate = 1500 + body.length * 90;
  return Math.min(MAX, Math.max(MIN, estimate));
}

export function NotificationToastHost() {
  const { toasts, dismissToast, markRead, registerClick } = useNotifications();

  return (
    <div
      aria-live="polite"
      className="fixed inset-x-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none"
      style={{ top: 'calc(var(--site-header-h) + 10px)' }}
    >
      {toasts.map((t) => (
        <Toast
          key={t.id}
          title={t.notification.title}
          body={t.notification.body}
          icon={t.notification.icon}
          actionUrl={t.notification.action_url}
          actionLabel={t.notification.action_label}
          onDismiss={() => dismissToast(t.id)}
          onOpen={() => {
            registerClick(t.id);
            markRead(t.id);
            dismissToast(t.id);
          }}
        />
      ))}
    </div>
  );
}

function Toast({
  title,
  body,
  icon,
  actionUrl,
  actionLabel,
  onDismiss,
  onOpen,
}: {
  title: string;
  body: string;
  icon: string;
  actionUrl: string | null;
  actionLabel: string | null;
  onDismiss: () => void;
  onOpen: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, durationFor(body));
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="status"
      className="pointer-events-auto w-full max-w-sm bg-white border border-blush rounded-card shadow-soft p-3.5 flex gap-3"
    >
      <div aria-hidden="true" className="shrink-0 w-9 h-9 rounded-full bg-blush/60 flex items-center justify-center text-lg">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold text-ink leading-snug">{title}</p>
        <p className="text-sm text-ink/65 leading-snug mt-0.5 line-clamp-2">{body}</p>
        {actionUrl && actionLabel && (
          <Link href={actionUrl} onClick={onOpen} className="text-xs font-bold text-rose-dark underline underline-offset-2 mt-1 inline-block">
            {actionLabel}
          </Link>
        )}
      </div>
      <button
        onClick={onDismiss}
        aria-label="إغلاق"
        className="shrink-0 w-8 h-8 flex items-center justify-center text-ink/40 hover:text-ink/70 -m-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
