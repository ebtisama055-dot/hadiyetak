'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cart-store';

const NAV = [
  { href: '/', label: 'الرئيسية' },
  { href: '/products', label: 'كل الهدايا' },
  { href: '/occasions', label: 'المناسبات' },
  { href: '/budget', label: 'حسب الميزانية' },
  { href: '/categories', label: 'حسب النوع' },
  { href: '/track-order', label: 'تتبع الطلب' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-blush">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-bold text-rose">
          هديّتك
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-rose transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            aria-label="السلة"
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-rose text-white"
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute -top-1 -left-1 bg-gold text-ink text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center"
            aria-label="القائمة"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-blush bg-cream px-4 py-3 flex flex-col gap-3 text-sm font-bold">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="py-1">
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
