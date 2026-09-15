import Link from 'next/link';
import Image from 'next/image';
import type { SiteBrand } from '@/lib/site-settings';

export function SiteFooter({ brand }: { brand: SiteBrand }) {
  return (
    <footer className="bg-rose-dark text-cream mt-16">
      <div className="mx-auto max-w-6xl px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 text-center sm:text-right justify-items-center sm:justify-items-start">
        <div className="max-w-[240px] sm:max-w-none flex flex-col items-center sm:items-start">
          {brand.logo_url ? (
            <Image
              src={brand.logo_url}
              alt={brand.store_name ?? 'هديّتك'}
              width={140}
              height={40}
              className="h-9 w-auto object-contain mb-3 brightness-0 invert opacity-90"
            />
          ) : (
            <div className="font-display text-2xl font-bold mb-2">{brand.store_name ?? 'هديّتك'}</div>
          )}
          <p className="text-sm text-cream/80">{brand.tagline || 'كل هدية .. حكاية — نوصّل أجمل الهدايا لكل لحظة مميزة.'}</p>
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="font-bold mb-3">تسوّق</h3>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/products">كل الهدايا</Link></li>
            <li><Link href="/occasions">المناسبات</Link></li>
            <li><Link href="/categories">الفئات</Link></li>
            <li><Link href="/budget">حسب الميزانية</Link></li>
          </ul>
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="font-bold mb-3">خدمة العملاء</h3>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/track-order">تتبع الطلب</Link></li>
            <li><Link href="/content/delivery_policy">سياسة التوصيل</Link></li>
            <li><Link href="/content/return_policy">الاستبدال والاسترجاع</Link></li>
            <li><Link href="/content/privacy_policy">الخصوصية</Link></li>
          </ul>
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="font-bold mb-3">تواصل معنا</h3>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/content/about">من نحن</Link></li>
            <li><Link href="/content/contact">تواصل معنا</Link></li>
            {brand.phone && <li>هاتف: {brand.phone}</li>}
            <li>واتساب: متاح من أيقونة المحادثة</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/20 text-center text-xs text-cream/60 py-4">
        © {new Date().getFullYear()} {brand.store_name ?? 'هديّتك'}. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
