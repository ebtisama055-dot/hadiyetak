import Link from 'next/link';
import Image from 'next/image';
import { formatEGP } from '@/lib/format';
import type { Product } from '@/lib/types';

export function ProductCard({ product, seasonBadge }: { product: Product; seasonBadge?: string }) {
  const image = product.product_images?.find((i) => i.is_primary)?.image_url
    || product.product_images?.[0]?.image_url
    || '/placeholder-product.svg';

  const discount = product.old_price
    ? Math.round(((product.old_price - product.selling_price) / product.old_price) * 100)
    : null;

  const unavailable = product.stock_status === 'out_of_stock';

  // At most ONE badge — priority: seasonal > discount > bestseller > new.
  // Stacking badges creates visual noise; the product photo should be the hero.
  let badge: { label: string; tone: 'rose' | 'forest' | 'gold' } | null = null;
  if (seasonBadge) badge = { label: seasonBadge, tone: 'gold' };
  else if (discount && discount > 0) badge = { label: `خصم ${discount}%`, tone: 'rose' };
  else if (product.bestseller) badge = { label: 'الأكثر مبيعًا', tone: 'rose' };
  else if (product.is_new) badge = { label: 'جديد', tone: 'forest' };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block rounded-card overflow-hidden bg-white border border-blush hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-square bg-blush overflow-hidden">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {badge && (
          <div className="absolute top-2 right-2">
            <Badge tone={badge.tone}>{badge.label}</Badge>
          </div>
        )}
        {unavailable && (
          <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm">غير متوفر حاليًا</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm line-clamp-2 mb-1">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-rose font-bold">{formatEGP(product.selling_price)}</span>
          {product.old_price && (
            <span className="text-ink/40 text-xs line-through">{formatEGP(product.old_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function Badge({ children, tone = 'rose' }: { children: React.ReactNode; tone?: 'rose' | 'forest' | 'gold' }) {
  const colors = {
    rose: 'bg-rose text-white',
    forest: 'bg-forest text-white',
    gold: 'bg-gold text-ink',
  } as const;
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colors[tone]}`}>{children}</span>;
}
