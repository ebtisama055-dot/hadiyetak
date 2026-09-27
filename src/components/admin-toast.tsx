'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type ToastKind = 'success' | 'error';

type Toast = {
  id: string;
  kind: ToastKind;
  message: string;
};

type AdminToastContextValue = {
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
};

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

/**
 * Lightweight toast system for the admin dashboard (separate from the
 * customer-facing NotificationsProvider/NotificationToastHost, which is
 * about *stored* notifications rows — this is just transient "تم الحفظ" /
 * "حصل خطأ" feedback for admin actions). Mounted once in admin/layout.tsx
 * so any admin page can call useAdminToast().
 */
export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, kind, message }]);
  }, []);

  const notifySuccess = useCallback((message: string) => push('success', message), [push]);
  const notifyError = useCallback((message: string) => push('error', message), [push]);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <AdminToastContext.Provider value={{ notifySuccess, notifyError }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 inset-x-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isError = toast.kind === 'error';
  return (
    <div
      role="status"
      className={`pointer-events-auto w-full max-w-sm rounded-card shadow-soft p-3.5 flex items-start gap-3 border ${
        isError ? 'bg-red-50 border-red-200' : 'bg-white border-blush'
      }`}
    >
      <span
        aria-hidden="true"
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
          isError ? 'bg-red-100 text-red-600' : 'bg-forest/10 text-forest'
        }`}
      >
        {isError ? '!' : '✓'}
      </span>
      <p className="text-sm text-ink leading-snug flex-1">{toast.message}</p>
      <button onClick={onDismiss} aria-label="إغلاق" className="shrink-0 text-ink/40 hover:text-ink/70 text-xs mt-0.5">
        ✕
      </button>
    </div>
  );
}

export function useAdminToast(): AdminToastContextValue {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    // Fallback so a page never crashes if it's ever rendered outside the
    // provider (e.g. during future refactors) — still visible to the admin.
    return {
      notifySuccess: (m) => console.log(m),
      // eslint-disable-next-line no-alert
      notifyError: (m) => alert(m),
    };
  }
  return ctx;
}

/**
 * Shared helper for admin mutation handlers: if `error` is set, reports it
 * via `notifyError` (prefixed with what the admin was trying to do) and
 * returns false so the caller can bail out; otherwise returns true.
 *
 *   const { error } = await supabase.from('notifications').insert(...);
 *   if (!reportIfError(notifyError, error, 'إنشاء الإشعار')) return;
 */
export function reportIfError(
  notifyError: (message: string) => void,
  error: { message?: string } | null | undefined,
  actionLabel: string,
): boolean {
  if (!error) return true;
  notifyError(`تعذّر ${actionLabel}: ${error.message ?? 'حدث خطأ غير متوقع'}`);
  return false;
}
