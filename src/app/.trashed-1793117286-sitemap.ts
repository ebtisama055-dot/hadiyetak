import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

// NOTE: SITE_URL must be set once the store has a real domain (or the
// vercel.app URL) so search engines resolve absolute links correctly.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hadiyetak-mu.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: products }, { data: categories }, { data: occasions }] = await Promise.all([
    supabase.from('products').select('slug, updated_at').eq('visibility', 'published'),
    supabase.from('categories').select('slug').eq('active', true),
    supabase.from('occasions').select('slug').eq('active', true),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/categories`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/occasions`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/budget`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/track-order`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${SITE_URL}/categories/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const occasionRoutes: MetadataRoute.Sitemap = (occasions ?? []).map((o) => ({
    url: `${SITE_URL}/occasions/${o.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...occasionRoutes];
}
