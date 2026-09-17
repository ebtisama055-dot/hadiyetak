'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useNotifications } from './notifications-provider';
import { NotificationPanelContent } from './notification-panel-content';

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  function close() {
    setOpen(false);
    // Focus must return to the bell, never disappear behind the sticky header.
    buttonRef.current?.focus();
  }

  // ESC closes; click outside the panel (and outside the bell) closes.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  // Focus moves into the panel on open (first focusable element: the close button).
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => panelRef.current?.querySelector<HTMLElement>('button')?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Mobile: lock background scroll while the full-screen/sheet panel is open,
  // without causing a layout shift (compensate for the scrollbar width).
  useEffect(() => {
    if (!open) return;
    const isMobile = window.matchMedia('(max-width: 639px)').matches;
    if (!isMobile) return;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={unreadCount > 0 ? `الإشعارات، لديك ${unreadCount} إشعارات غير مقروءة` : 'الإشعارات'}
        aria-expanded={open}
        aria-controls={titleId}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-11 h-11 rounded-full text-ink hover:bg-blush/60 transition-colors focus-visible:bg-blush/60"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -left-0.5 min-w-[20px] h-5 px-1 rounded-full bg-rose text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-cream"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Desktop popover — anchored to the header, not the page content, so
              it never scrolls away or slides under the hero/sections. */}
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="hidden sm:flex flex-col fixed sm:absolute top-[var(--site-header-h)] sm:top-auto sm:mt-2 left-0 sm:left-auto sm:right-0 w-full sm:w-[400px] sm:max-h-[70vh] bg-white sm:rounded-card sm:border sm:border-blush shadow-soft z-50 overflow-hidden"
          >
            <NotificationPanelContent onClose={close} titleId={titleId} />
          </div>

          {/* Mobile — full-screen sheet, always readable, no cramped popover. */}
          <div className="sm:hidden fixed inset-0 z-50 flex flex-col">
            <div className="flex-1 bg-ink/30" onClick={() => setOpen(false)} aria-hidden="true" />
          </div>
          <div
            className="sm:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-soft flex flex-col"
            style={{
              top: 'var(--site-header-h)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <NotificationPanelContent onClose={close} titleId={titleId} />
          </div>
        </>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
