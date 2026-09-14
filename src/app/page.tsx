import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';

export const revalidate = 60;

async function getHomeData() {
  const [{ data: season }, { data: featured }, { data: bestsellers }, { data: occasions }, { data: categories }, { data: offers }] =
    await Promise.all([
      supabase.from('seasons').select('*').eq('status', 'published').order('priority', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('products').select('*, product_images(image_url, is_primary, display_order)').eq('visibility', 'published').eq('featured', true).limit(8),
      supabase.from('products').select('*, product_images(image_url, is_primary, display_order)').eq('visibility', 'published').eq('bestseller', true).limit(8),
      supabase.from('occasions').select('*').eq('active', true).order('display_order').limit(8),
      supabase.from('categories').select('*').eq('active', true).order('display_order').limit(7),
      supabase.from('offers').select('*, offer_categories(categories(name, slug))').limit(3),
    ]);

  return {
    season: season ?? null,
    featured: (featured as Product[]) ?? [],
    bestsellers: (bestsellers as Product[]) ?? [],
    occasions: occasions ?? [],
    categories: categories ?? [],
    offers: offers ?? [],
  };
}

export default async function HomePage() {
  const { season, featured, bestsellers, occasions, categories, offers } = await getHomeData();
  const theme = (season?.theme_config ?? {}) as any;

  return (
    <div>
      {theme?.announcement && (
        <div className="bg-forest text-white text-center text-sm py-2 px-4">{theme.announcement}</div>
      )}

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: theme?.colors?.primary ?? '#7A2340' }}
      >
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 text-center text-cream">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
            {theme?.hero?.title ?? 'هدية تفرّح تبدأ من هنا'}
          </h1>
          <p className="text-lg md:text-xl text-cream/90 mb-8 max-w-xl mx-auto">
            {theme?.hero?.subtitle ?? 'ورد وهدايا جاهزة، تختارها في دقايق ونوصّلها لحد باب البيت في كل الوادي الجديد.'}
          </p>
          <Link
            href="/products"
            className="inline-block bg-gold text-ink font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            {theme?.hero?.cta_label ?? 'تصفّح الهدايا'}
          </Link>
        </div>
      </section>

      {/* Browse by occasion */}
      {occasions.length > 0 && (
        <Section title="المناسبات">
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
            {occasions.map((o: any) => (
              <Link
                key={o.id}
                href={`/occasions/${o.slug}`}
                className="shrink-0 px-5 py-2.5 rounded-full bg-blush text-ink font-bold text-sm hover:bg-rose hover:text-white transition-colors"
              >
                {o.name}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Browse by category */}
      {categories.length > 0 && (
        <Section title="حسب النوع">
          <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
            {categories.map((c: any) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-card bg-white border border-blush hover:border-rose transition-colors text-center"
              >
                <span className="font-bold text-sm">{c.name}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="حسب الميزانية">
        <BudgetLinks />
      </Section>

      {featured.length > 0 && (
        <Section title="مختارات هديّتك">
          <ProductGrid products={featured} />
        </Section>
      )}

      {bestsellers.length > 0 && (
        <Section title="الأكثر مبيعًا">
          <ProductGrid products={bestsellers} />
        </Section>
      )}

      {offers.length > 0 && (
        <Section title="العروض">
          <div className="grid md:grid-cols-3 gap-4">
            {offers.map((o: any) => (
              <div key={o.id} className="rounded-card bg-rose text-cream p-6">
                <h3 className="font-display text-xl font-bold mb-1">{o.name}</h3>
                <p className="text-cream/80 text-sm">
                  خصم {o.discount_type === 'percentage' ? `${o.discount_value}%` : `${o.discount_value} جنيه`}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="ليه تختار هديّتك">
        <div className="grid sm:grid-cols-3 gap-6">
          <WhyCard title="توصيل سريع وموثوق" text="بنوصّل هديتك في الميعاد اللي تختاره لأي منطقة في الوادي الجديد." />
          <WhyCard title="منتجات جاهزة ومختارة بعناية" text="كل منتج مصوّر وموصوف بوضوح، تشوف اللي هتاخده بالظبط قبل ما تطلب." />
          <WhyCard title="طلب بسيط بدون تعقيد" text="من غير تسجيل حساب، ومن غير أسئلة كتير — تختار وتطلب في دقايق." />
        </div>
      </Section>

      <Section title="معلومات التوصيل">
        <p className="text-ink/70 max-w-2xl">
          نوصّل لكل مناطق محافظة الوادي الجديد. اختار منطقتك وميعاد التوصيل المناسب لك أثناء إتمام الطلب، وهنبعتلك تأكيد فورًا.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="font-display text-2xl font-bold mb-5">{title}</h2>
      {children}
    </section>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function WhyCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-card bg-white border border-blush p-6">
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-sm text-ink/70">{text}</p>
    </div>
  );
}

async function BudgetLinksData() {
  const { data } = await supabase.from('budget_ranges').select('*').eq('active', true).order('display_order');
  return data ?? [];
}

async function BudgetLinks() {
  const ranges = await BudgetLinksData();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {ranges.map((r: any) => (
        <Link
          key={r.id}
          href={`/budget?range=${r.id}`}
          className="p-5 rounded-card bg-blush text-center font-bold hover:bg-rose hover:text-white transition-colors"
        >
          {r.label}
        </Link>
      ))}
    </div>
  );
}
