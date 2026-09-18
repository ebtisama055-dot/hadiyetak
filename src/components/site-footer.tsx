import Link from 'next/link';
import Image from 'next/image';
import type { SiteBrand, SocialLink } from '@/lib/site-settings';
import { SocialIcon } from '@/components/social-icon';
import { whatsappHref } from '@/lib/format';

type FooterColumn = {
  title: string;
  links: { href: string; label: string }[];
};

function buildColumns(brand: SiteBrand): FooterColumn[] {
  return [
    {
      title: 'تسوّق',
      links: [
        { href: '/products', label: 'جميع الهدايا' },
        { href: '/occasions', label: 'المناسبات' },
        { href: '/categories', label: 'الفئات' },
        { href: '/budget', label: 'حسب الميزانية' },
      ],
    },
    {
      title: 'خدمة العملاء',
      links: [
        { href: '/track-order', label: 'تتبع الطلب' },
        { href: '/content/delivery_policy', label: 'سياسة التوصيل' },
        { href: '/content/return_policy', label: 'الاستبدال والاسترجاع' },
        { href: '/content/privacy_policy', label: 'الخصوصية' },
      ],
    },
    {
      title: 'تواصل معنا',
      links: [
        { href: '/content/about', label: 'من نحن' },
        { href: '/content/contact', label: 'تواصل معنا' },
        ...(whatsappHref(brand.whatsapp_number)
          ? [{ href: whatsappHref(brand.whatsapp_number)!, label: 'واتساب' }]
          : [{ href: '#', label: 'واتساب: متاح من أيقونة المحادثة' }]),
      ],
    },
  ];
}

function ColumnLinks({ links }: { links: FooterColumn['links'] }) {
  return (
    <ul className="space-y-2.5 text-sm text-ink/65">
      {links.map((l) => (
        <li key={l.label}>
          <Link href={l.href} className="transition-colors hover:text-rose-dark">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ColumnHeading({ title }: { title: string }) {
  return (
    <h3 className="font-display font-bold text-ink mb-4 inline-flex flex-col">
      {title}
      <span className="mt-1.5 h-px w-6 bg-gold" />
    </h3>
  );
}

export function SiteFooter({ brand, socialLinks = [] }: { brand: SiteBrand; socialLinks?: SocialLink[] }) {
  const columns = buildColumns(brand);

  return (
    <footer className="mt-20 bg-gradient-to-b from-cream to-blush/35 border-t border-blush">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-14 pb-8">
        {/* Brand — centered, with breathing room */}
        <div className="flex flex-col items-center text-center mb-10">
          {brand.logo_url ? (
            <Image
              src={brand.logo_url}
              alt={brand.store_name ?? 'هديّتك'}
              width={168}
              height={48}
              className="h-12 w-auto object-contain mb-4"
            />
          ) : (
            <div className="font-display text-2xl font-bold text-rose-dark mb-3">{brand.store_name ?? 'هديّتك'}</div>
          )}
          <p className="text-sm text-ink/60 max-w-xs leading-relaxed">
            {brand.tagline || 'كل هدية .. حكاية — نوصّل أجمل الهدايا لكل لحظة مميزة.'}
          </p>
        </div>

        <div className="border-t border-rose/15 mb-10" />

        {/* Desktop: balanced 3-column layout */}
        <div className="hidden md:grid grid-cols-3 gap-10 max-w-3xl mx-auto text-center">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col items-center">
              <ColumnHeading title={col.title} />
              <ColumnLinks links={col.links} />
              {col.title === 'تواصل معنا' && socialLinks.length > 0 && (
                <div className="flex items-center gap-3 mt-4">
                  {socialLinks.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-blush text-ink/60 hover:text-rose-dark hover:border-rose/40 transition-colors"
                    >
                      <SocialIcon platform={s.platform} className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: compact accordion so the footer doesn't run long */}
        <div className="md:hidden max-w-sm mx-auto divide-y divide-rose/10 border-t border-b border-rose/10">
          {columns.map((col) => (
            <details key={col.title} className="group py-3">
              <summary className="flex items-center justify-between cursor-pointer list-none font-display font-bold text-ink text-sm">
                {col.title}
                <ChevronIcon className="w-4 h-4 text-ink/50 transition-transform group-open:rotate-180" />
              </summary>
              <div className="pt-3 pr-1">
                <ColumnLinks links={col.links} />
                {col.title === 'تواصل معنا' && socialLinks.length > 0 && (
                  <div className="flex items-center gap-3 mt-4">
                    {socialLinks.map((s) => (
                      <a
                        key={s.id}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.platform}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-blush text-ink/60"
                      >
                        <SocialIcon platform={s.platform} className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>

        <div className="border-t border-rose/10 mt-8 pt-5 text-center text-xs text-ink/45">
          © {new Date().getFullYear()} {brand.store_name ?? 'هديّتك'}. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
