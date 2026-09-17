import type { Metadata } from 'next';
import { El_Messiri, Almarai } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { getSiteBrand, getSocialLinks } from '@/lib/site-settings';
import { NotificationsProvider } from '@/components/notifications/notifications-provider';
import { NotificationToastHost } from '@/components/notifications/notification-toast-host';

// Without this, Next.js treats the layout as fully static and caches the
// Supabase fetch inside getSiteBrand() at build time — so a new logo saved
// from Admin Settings would only appear after a redeploy. Revalidating every
// 60s means logo/name/tagline changes show up on their own shortly after
// saving, without needing a rebuild.
export const revalidate = 60;

const display = El_Messiri({
  subsets: ['arabic', 'latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Almarai({
  subsets: ['arabic'],
  weight: ['300', '400', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getSiteBrand();
  const title = `${brand.store_name ?? 'هديّتك'} | كل هدية .. حكاية`;
  const description = 'هديّتك هي المكان اللي تلاقي فيه أجمل الهدايا لكل لحظة مميزة — تصفح، اختار، اطلب، وإحنا نوصّل.';
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hadiyetak-mu.vercel.app'),
    title,
    description,
    icons: brand.favicon_url
      ? { icon: brand.favicon_url, apple: brand.app_icon_url || brand.favicon_url }
      : undefined,
    openGraph: {
      title,
      description,
      locale: 'ar_EG',
      type: 'website',
      images: brand.logo_url ? [{ url: brand.logo_url }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: brand.logo_url ? [brand.logo_url] : undefined,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [brand, socialLinks] = await Promise.all([getSiteBrand(), getSocialLinks()]);
  return (
    <html lang="ar" dir="rtl" className={`${display.variable} ${body.variable}`}>
      <body className="font-body min-h-screen flex flex-col antialiased overflow-x-hidden">
        <NotificationsProvider>
          <SiteHeader brand={brand} />
          <NotificationToastHost />
          <main className="flex-1">{children}</main>
          <SiteFooter brand={brand} socialLinks={socialLinks} />
          <WhatsAppButton brand={brand} />
        </NotificationsProvider>
      </body>
    </html>
  );
}
