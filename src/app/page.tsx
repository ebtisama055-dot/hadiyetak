import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getActiveSeason, getPreviewSeason, computeLifecycleState } from '@/lib/season';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';

export const revalidate = 60;

// ---------------------------------------------------------------------------
// PERMANENT CORE BRAND CONTENT. This is what every visitor sees when no
// season is active. It must stand alone as a complete, beautiful gift brand —
// nothing here is Ramadan/Eid/Valentine specific.
// ---------------------------------------------------------------------------
const CORE_HERO = {
  title: 'هديّة تفرّح من قلبك ❤️',
  subtitle: 'هدايا جاهزة تختارها في دقائق، وإحنا نوصلها لحد باب البيت.',
  cta_label: 'شوفي الهدايا',
};

const EMOTIONAL_SHORTCUTS = [
  { label: 'لشخص بتحبه', href: '/occasions/romantic' },
  { label: 'عيد ميلاد', href: '/occasions/birthdays' },
  { label: 'خطوبة وزواج', href: '/occasions/engagement' },
  { label: 'للأم', href: '/occasions/mothers-day' },
  { label: 'لصديق', href: '/occasions/friends' },
  { label: 'مناسبة خاصة', href: '/occasions/special-occasions' },
];

async function getHomeData(previewSlug?: string) {
  const [activeSeason, { data: featured }, { data: bestsellers }, { data: categories }, { data: offers }] = await Promise.all([
    previewSlug ? getPreviewSeason(previewSlug) : getActiveSeason(),
    supabase.from('products').select('*, product_images(image_url, is_primary, display_order)').eq('visibility', 'published').eq('featured', true).limit(8),
    supabase.from('products').select('*, product_images(image_url, is_primary, display_order)').eq('visibility', 'published').eq('bestseller', true).limit(8),
    supabase.from('categories').select('*').eq('active', true).order('display_order').limit(7),
    supabase.from('offers').select('*, offer_categories(categories(name, slug))').eq('active', true).limit(3),
  ]);

  let seasonProducts: Product[] = [];
  if (activeSeason) {
    const { data: links } = await supabase.from('season_products').select('product_id').eq('season_id', activeSeason.id);
    const ids = (links ?? []).map((l: any) => l.product_id);
    if (ids.length) {
      const { data } = await supabase.from('products').select('*, product_images(image_url, is_primary, display_order)').in('id', ids).eq('visibility', 'published');
      seasonProducts = (data as Product[]) ?? [];
    }
  }

  return {
    activeSeason,
    featured: (featured as Product[]) ?? [],
    bestsellers: (bestsellers as Product[]) ?? [],
    categories: categories ?? [],
    offers: offers ?? [],
    seasonProducts,
  };
}

export default async function HomePage({ searchParams }: { searchParams: { preview_season?: string } }) {
  const isPreview = !!searchParams.preview_season;
  const { activeSeason, featured, bestsellers, categories, offers, seasonProducts } = await getHomeData(searchParams.preview_season);

  // The seasonal layer may only ever override these specific, optional fields.
  // Anything not provided falls back to the Core Brand automatically.
  const theme = (activeSeason?.theme_config ?? {}) as any;
  const heroTitle = theme?.hero?.title || CORE_HERO.title;
  const heroSubtitle = theme?.hero?.subtitle || CORE_HERO.subtitle;
  const heroCta = theme?.hero?.cta_label || CORE_HERO.cta_label;
  const heroBg = activeSeason ? (theme?.colors?.primary || '#5C2A3A') : '#5C2A3A';
  const seasonBadgeLabel = activeSeason ? activeSeason.name : undefined;

  return (
    <div>
      {isPreview && (
        <div className="bg-ink text-cream text-center text-xs font-bold py-2 px-4">
          وضع المعاينة — هذا العرض غير مرئي للعملاء حتى ينشر الموسم فعليًا
        </div>
      )}

      {/* Seasonal announcement bar — optional overlay, never shown without an active season */}
      {activeSeason && theme?.announcement && (
        <div className="bg-forest text-white text-center text-sm py-2 px-4">{theme.announcement}</div>
      )}

      {/* PERMANENT HERO — represents gifting itself, not any single occasion.
          A season may only recolor the background and swap the headline/CTA copy. */}
      <section className="relative overflow-hidden" style={{ backgroundColor: heroBg }}>
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 text-center text-cream">
          {activeSeason && (
            <span className="inline-block bg-gold text-ink text-xs font-bold px-3 py-1 rounded-full mb-4">
              {activeSeason.name}
            </span>
          )}
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">{heroTitle}</h1>
          <p className="text-lg md:text-xl text-cream/90 mb-8 max-w-xl mx-auto">{heroSubtitle}</p>
          <Link href="/products" className="inline-block bg-gold text-ink font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
            {heroCta}
          </Link>
        </div>
      </section>

      {/* CORE — emotional discovery shortcuts (not a questionnaire, just navigation) */}
      <Section title="اختار الهدية اللي تعبّر عنك">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {EMOTIONAL_SHORTCUTS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-center justify-center text-center p-4 rounded-card bg-white border border-blush hover:border-rose transition-colors font-bold text-sm"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </Section>

      {/* Seasonal collection — ONLY rendered when the active season actually has products assigned. No products → section simply doesn't exist. */}
      {activeSeason && seasonProducts.length > 0 && (
        <Section title={`مجموعة ${activeSeason.name}`}>
          <ProductGrid products={seasonProducts} seasonBadge={seasonBadgeLabel} />
        </Section>
      )}

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

      <Section title="هتلاقي حاجة حلوة على قد ميزانيتك">
        <BudgetLinks />
      </Section>

      {featured.length > 0 && (
        <Section title="هدايا ممكن تعجبك">
          <ProductGrid products={featured} />
        </Section>
      )}

      {bestsellers.length > 0 && (
        <Section title="الأكثر طلبًا">
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

      <Section title="هدية جاهزة، من غير وجع دماغ">
        <div className="grid sm:grid-cols-3 gap-6">
          <WhyCard title="تشوف اللي هتطلبه" text="صور حقيقية وواضحة لكل منتج، تعرف بالظبط شكل اللي هيوصل قبل ما تطلب." />
          <WhyCard title="تطلب في دقائق" text="بدون تسجيل حساب، وبدون خطوات زيادة — تختار وتدفع وخلاص." />
          <WhyCard title="نوصلها لحد باب البيت" text="اختار منطقتك وميعاد التوصيل المناسب، وهنبعتلك تأكيد فورًا." />
        </div>
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

function ProductGrid({ products, seasonBadge }: { products: Product[]; seasonBadge?: string }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} seasonBadge={seasonBadge} />
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
