import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getActiveSeason, getPreviewSeason } from '@/lib/season';
import { ProductCard } from '@/components/product-card';
import { CategoryIcon, categoryPastel } from '@/components/category-icon';
import { GiftBoxIllustration, FlowersAndRibbonIllustration } from '@/components/brand-art';
import type { Product } from '@/lib/types';

export const revalidate = 60;

// ---------------------------------------------------------------------------
// PERMANENT CORE BRAND CONTENT — approved Soft Feminine Premium concept.
// This is what every visitor sees when no season is active, and it must
// stand alone as a complete, beautiful gift brand — nothing here is
// Ramadan/Eid/Valentine specific.
// ---------------------------------------------------------------------------
const CORE_HERO = {
  title: 'كل هدية .. حكاية',
  subtitle: 'هديّتك هي المكان اللي تلاقي فيه أجمل الهدايا لكل لحظة مميزة',
  cta_label: 'تسوق الآن',
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

  // The seasonal layer may only ever add a badge + a very soft accent tint on
  // top of the permanent hero — it never replaces the Core Brand background,
  // copy, layout, or typography. See src/lib/season.ts for the lifecycle rules.
  const theme = (activeSeason?.theme_config ?? {}) as any;
  const heroTitle = theme?.hero?.title || CORE_HERO.title;
  const heroSubtitle = theme?.hero?.subtitle || CORE_HERO.subtitle;
  const heroCta = theme?.hero?.cta_label || CORE_HERO.cta_label;
  const seasonAccent = activeSeason ? theme?.colors?.primary || '#D98FA1' : null;

  return (
    <div className="overflow-x-hidden">
      {isPreview && (
        <div className="bg-ink text-cream text-center text-xs font-bold py-2 px-4">
          وضع المعاينة — هذا العرض غير مرئي للعملاء حتى ينشر الموسم فعليًا
        </div>
      )}

      {/* Seasonal announcement bar — optional overlay, never shown without an active season */}
      {activeSeason && theme?.announcement && (
        <div className="bg-forest text-white text-center text-sm py-2 px-4">{theme.announcement}</div>
      )}

      {/* PERMANENT HERO — Soft Feminine Premium. Represents gifting itself, not
          any single occasion; a season may only add a badge + a faint accent
          glow behind the illustration. */}
      <section className="mx-auto max-w-6xl px-4 pt-6 md:pt-10">
        <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-blush via-cream to-peach/60 border border-blush">
          {seasonAccent && (
            <div
              className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: seasonAccent }}
              aria-hidden
            />
          )}
          <div className="relative grid md:grid-cols-2 items-center gap-6 px-6 py-12 md:px-14 md:py-16">
            <div className="text-center md:text-right order-2 md:order-1">
              {activeSeason && (
                <span className="inline-block bg-gold text-ink text-xs font-bold px-3 py-1 rounded-full mb-4">
                  {activeSeason.name}
                </span>
              )}
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-ink">{heroTitle}</h1>
              <p className="text-base md:text-lg text-ink/70 mb-8 max-w-md mx-auto md:mx-0">{heroSubtitle}</p>
              <Link
                href="/products"
                className="inline-block bg-rose text-white font-bold px-9 py-3.5 rounded-full hover:bg-rose-dark shadow-soft transition-colors"
              >
                {heroCta}
              </Link>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <GiftBoxIllustration className="w-56 md:w-80 h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES — soft pastel circular icons, horizontal scroll on mobile */}
      <Section title="تسوّقي حسب النوع">
        <div className="scroll-row gap-4 md:grid md:grid-cols-7 md:gap-3 -mx-4 px-4 md:mx-0 md:px-0">
          {categories.map((c: any, i: number) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="flex flex-col items-center gap-2 text-center shrink-0 w-24 md:w-auto"
            >
              <span className={`flex items-center justify-center w-16 h-16 rounded-full border border-blush text-rose ${categoryPastel(i)} group-hover:border-rose transition-colors`}>
                <CategoryIcon slug={c.slug} />
              </span>
              <span className="font-bold text-xs md:text-sm text-ink">{c.name}</span>
            </Link>
          ))}
        </div>
      </Section>

      {bestsellers.length > 0 && (
        <Section title="أكثر الهدايا طلبًا" subtitle="اختاري من بين أجمل وأحدث الهدايا التي نالت إعجاب الجميع">
          <ProductGrid products={bestsellers} />
        </Section>
      )}

      {/* Seasonal collection — ONLY rendered when the active season actually has products assigned. No products → section simply doesn't exist. */}
      {activeSeason && seasonProducts.length > 0 && (
        <Section title={`مجموعة ${activeSeason.name}`}>
          <ProductGrid products={seasonProducts} seasonBadge={activeSeason.name} />
        </Section>
      )}

      {/* PROMOTIONAL BANNER */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-l from-peach/70 via-blush to-sand/60 border border-blush grid md:grid-cols-2 items-center gap-6 px-6 py-10 md:px-14 md:py-14">
          <div className="text-center md:text-right order-2 md:order-1">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 text-ink">الهدايا .. دايمًا فكرة حلوة</h2>
            <p className="text-ink/70 mb-6">لأن كل شخص يستحق أن يشعر بالتميز</p>
            <Link
              href="/products"
              className="inline-block bg-rose text-white font-bold px-8 py-3 rounded-full hover:bg-rose-dark shadow-soft transition-colors"
            >
              تصفح كل الهدايا
            </Link>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
            <FlowersAndRibbonIllustration className="w-56 md:w-72 h-auto" />
          </div>
        </div>
      </section>

      <Section title="اختار الهدية اللي تعبّر عنك">
        <div className="scroll-row gap-3 md:grid md:grid-cols-6 md:gap-3 -mx-4 px-4 md:mx-0 md:px-0">
          {EMOTIONAL_SHORTCUTS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-center justify-center text-center p-4 rounded-card bg-white border border-blush hover:border-rose transition-colors font-bold text-sm shrink-0 w-36 md:w-auto"
            >
              {s.label}
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

      {offers.length > 0 && (
        <Section title="العروض">
          <div className="grid md:grid-cols-3 gap-4">
            {offers.map((o: any) => (
              <div key={o.id} className="rounded-card bg-rose text-cream p-6 shadow-softer">
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

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="font-display text-2xl font-bold mb-1.5 text-ink">{title}</h2>
      {subtitle && <p className="text-sm text-ink/60 mb-5">{subtitle}</p>}
      {!subtitle && <div className="mb-5" />}
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
    <div className="rounded-card bg-white border border-blush p-6 shadow-softer">
      <h3 className="font-bold mb-2 text-ink">{title}</h3>
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
          className="p-5 rounded-card bg-blush text-center font-bold text-ink hover:bg-rose hover:text-white transition-colors"
        >
          {r.label}
        </Link>
      ))}
    </div>
  );
}
