import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/product-card';

export const revalidate = 30;

export default async function OccasionPage({ params }: { params: { slug: string } }) {
  const { data: occasion } = await supabase.from('occasions').select('*').eq('slug', params.slug).eq('active', true).maybeSingle();
  if (!occasion) return notFound();

  const { data: links } = await supabase.from('product_occasions').select('product_id').eq('occasion_id', occasion.id);
  const ids = (links ?? []).map((l: any) => l.product_id);

  const { data: products } = ids.length
    ? await supabase.from('products').select('*, product_images(image_url, is_primary, display_order)').in('id', ids).eq('visibility', 'published')
    : { data: [] as any[] };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">{occasion.name}</h1>
      {(!products || products.length === 0) ? (
        <p className="text-ink/60">لسه مفيش منتجات مضافة للمناسبة دي.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
