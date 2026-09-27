import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/product-card';

export const revalidate = 30;

export default async function BudgetPage({ searchParams }: { searchParams: { range?: string } }) {
  const { data: ranges } = await supabase.from('budget_ranges').select('*').eq('active', true).order('display_order');
  const activeRangeId = searchParams.range ?? ranges?.[0]?.id;

  let products: any[] = [];
  if (activeRangeId) {
    const { data: links } = await supabase.from('product_budget_ranges').select('product_id').eq('budget_range_id', activeRangeId);
    const ids = (links ?? []).map((l: any) => l.product_id);
    if (ids.length) {
      const { data } = await supabase.from('products').select('*, product_images(image_url, is_primary, display_order)').in('id', ids).eq('visibility', 'published');
      products = data ?? [];
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">حسب الميزانية</h1>
      <div className="flex flex-wrap gap-3 mb-8">
        {(ranges ?? []).map((r: any) => (
          <a
            key={r.id}
            href={`/budget?range=${r.id}`}
            className={`px-5 py-2 rounded-full font-bold text-sm ${r.id === activeRangeId ? 'bg-rose text-white' : 'bg-blush text-ink'}`}
          >
            {r.label}
          </a>
        ))}
      </div>
      {products.length === 0 ? (
        <p className="text-ink/60">لسه مفيش منتجات مضافة للميزانية دي.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
