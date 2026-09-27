'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/lib/cart-store';
import type { SiteBrand } from '@/lib/site-settings';
import { NotificationBell } from '@/components/notifications/notification-bell';

const NAV = [
  { href: '/', label: 'الرئيسية' },
  { href: '/products', label: 'جميع الهدايا' },
  { href: '/occasions', label: 'المناسبات' },
  { href: '/content/about', label: 'من نحن' },
  { href: '/content/contact', label: 'تواصل معنا' },
];

export function SiteHeader({ brand }: { brand: SiteBrand }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const router = useRouter();

  function submitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q');
    setSearchOpen(false);
    setOpen(false);
    router.push(`/products${q ? `?q=${encodeURIComponent(String(q))}` : ''}`);
  }

  return (
    <header
      className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-blush"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center -mr-2 text-ink"
            aria-label="القائمة"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon />
          </button>
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={brand.store_name ?? 'هديّتك'}>
            {brand.logo_url ? (
              <Image
                src={brand.logo_url}
                alt={brand.store_name ?? 'هديّتك'}
                width={140}
                height={40}
                className="h-9 w-auto object-contain"
                priority
              />
            ) : (
              <span className="font-display text-2xl font-bold text-rose">{brand.store_name ?? 'هديّتك'}</span>
            )}
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-ink">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-rose transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-xs">
          <div className="relative w-full">
            <input
              type="search"
              name="q"
              placeholder="ابحث عن هدية تناسبه..."
              className="w-full bg-blush/40 border border-blush focus:border-rose rounded-full ps-4 pe-10 py-2 text-sm placeholder:text-muted transition-colors"
            />
            <button type="submit" aria-label="بحث" className="absolute inset-y-0 left-0 flex items-center justify-center w-9 text-ink/60 hover:text-rose">
              <SearchIcon />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center text-ink"
            aria-label="بحث"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <SearchIcon />
          </button>
          <Link
            href="/track-order"
            aria-label="تتبع الطلب"
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-ink hover:bg-blush/60 transition-colors"
          >
            <UserIcon />
          </Link>
          <NotificationBell />
          <Link
            href="/cart"
            aria-label="السلة"
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-rose text-white hover:bg-rose-dark transition-colors"
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute -top-1 -left-1 bg-gold text-ink text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submitSearch} className="md:hidden border-t border-blush bg-cream px-4 py-3">
          <div className="relative">
            <input
              autoFocus
              type="search"
              name="q"
              placeholder="ابحث عن هدية تناسبه..."
              className="w-full bg-blush/40 border border-blush focus:border-rose rounded-full ps-4 pe-10 py-2 text-sm placeholder:text-muted"
            />
            <button type="submit" aria-label="بحث" className="absolute inset-y-0 left-0 flex items-center justify-center w-9 text-ink/60">
              <SearchIcon />
            </button>
          </div>
        </form>
      )}

      {open && (
        <nav className="md:hidden border-t border-blush bg-cream px-4 py-3 flex flex-col gap-3 text-sm font-bold text-ink">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="py-1">
              {item.label}
            </Link>
          ))}
          <Link href="/track-order" onClick={() => setOpen(false)} className="py-1">
            تتبع الطلب
          </Link>
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

function UserIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c1.4-3.6 4.3-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
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
