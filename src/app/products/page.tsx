import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';
import type { Metadata } from 'next';

export const revalidate = 30;

export const metadata: Metadata = {
  title: 'كل الهدايا | هديّتك',
  description: 'تصفح كل الهدايا المتاحة في هديّتك — فلاتر حسب الفئة، المناسبة، والسعر.',
};

type SearchParams = {
  q?: string;
  category?: string;
  occasion?: string;
  sort?: string;
};

async function getFilters() {
  const [{ data: categories }, { data: occasions }] = await Promise.all([
    supabase.from('categories').select('id, name, slug').eq('active', true).order('display_order'),
    supabase.from('occasions').select('id, name, slug').eq('active', true).order('display_order'),
  ]);
  return { categories: categories ?? [], occasions: occasions ?? [] };
}

async function getProducts(params: SearchParams) {
  let query = supabase
    .from('products')
    .select('*, product_images(image_url, is_primary, display_order), product_categories!inner(category_id, categories(slug)), product_occasions(occasion_id, occasions(slug))')
    .eq('visibility', 'published');

  if (params.q) query = query.ilike('name', `%${params.q}%`);

  switch (params.sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'price_asc':
      query = query.order('selling_price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('selling_price', { ascending: false });
      break;
    default:
      query = query.order('bestseller', { ascending: false }).order('display_order', { ascending: true });
  }

  const { data } = await query.limit(60);
  let products = (data as any[]) ?? [];

  if (params.category) {
    products = products.filter((p) => p.product_categories?.some((pc: any) => pc.categories?.slug === params.category));
  }
  if (params.occasion) {
    products = products.filter((p) => p.product_occasions?.some((po: any) => po.occasions?.slug === params.occasion));
  }

  return products as Product[];
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const [{ categories, occasions }, products] = await Promise.all([getFilters(), getProducts(searchParams)]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">كل الهدايا</h1>

      <form className="flex flex-wrap gap-3 mb-6 items-center" method="get">
        <input
          type="search"
          name="q"
          defaultValue={searchParams.q}
          placeholder="ابحث عن هدية..."
          className="flex-1 min-w-[200px] px-4 py-2 rounded-full border border-blush bg-white text-sm"
        />
        <select name="category" defaultValue={searchParams.category ?? ''} className="px-3 py-2 rounded-full border border-blush bg-white text-sm">
          <option value="">كل الفئات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select name="occasion" defaultValue={searchParams.occasion ?? ''} className="px-3 py-2 rounded-full border border-blush bg-white text-sm">
          <option value="">كل المناسبات</option>
          {occasions.map((o) => (
            <option key={o.id} value={o.slug}>{o.name}</option>
          ))}
        </select>
        <select name="sort" defaultValue={searchParams.sort ?? ''} className="px-3 py-2 rounded-full border border-blush bg-white text-sm">
          <option value="">الأكثر مبيعًا</option>
          <option value="newest">الأحدث</option>
          <option value="price_asc">السعر من الأقل للأعلى</option>
          <option value="price_desc">السعر من الأعلى للأقل</option>
        </select>
        <button type="submit" className="px-5 py-2 rounded-full bg-rose text-white text-sm font-bold">تطبيق</button>
      </form>

      {products.length === 0 ? (
        <p className="text-center text-ink/60 py-16">
          مفيش نتائج مطابقة للبحث، جرّب كلمات مختلفة أو شوف كل الهدايا.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
