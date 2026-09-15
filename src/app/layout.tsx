import type { Metadata } from 'next';
import { El_Messiri, Almarai } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { getSiteBrand, getSocialLinks } from '@/lib/site-settings';

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
  return {
    title: `${brand.store_name ?? 'هديّتك'} | كل هدية .. حكاية`,
    description: 'هديّتك هي المكان اللي تلاقي فيه أجمل الهدايا لكل لحظة مميزة — تصفح، اختار، اطلب، وإحنا نوصّل.',
    icons: brand.favicon_url
      ? { icon: brand.favicon_url, apple: brand.app_icon_url || brand.favicon_url }
      : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [brand, socialLinks] = await Promise.all([getSiteBrand(), getSocialLinks()]);
  return (
    <html lang="ar" dir="rtl" className={`${display.variable} ${body.variable}`}>
      <body className="font-body min-h-screen flex flex-col antialiased overflow-x-hidden">
        <SiteHeader brand={brand} />
        <main className="flex-1">{children}</main>
        <SiteFooter brand={brand} socialLinks={socialLinks} />
        <WhatsAppButton />
      </body>
    </html>
  );
}
