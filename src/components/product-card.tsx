'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatEGP } from '@/lib/format';
import { useCart } from '@/lib/cart-store';
import { useFavorites } from '@/lib/favorites-store';
import type { Product } from '@/lib/types';

export function ProductCard({ product, seasonBadge }: { product: Product; seasonBadge?: string }) {
  const image = product.product_images?.find((i) => i.is_primary)?.image_url
    || product.product_images?.[0]?.image_url
    || '/placeholder-product.svg';

  const discount = product.old_price
    ? Math.round(((product.old_price - product.selling_price) / product.old_price) * 100)
    : null;

  const unavailable = product.stock_status === 'out_of_stock';
  const addItem = useCart((s) => s.addItem);
  const isFavorite = useFavorites((s) => s.isFavorite(product.id));
  const toggleFavorite = useFavorites((s) => s.toggle);

  // At most ONE badge — priority: seasonal > discount > bestseller > new.
  // Stacking badges creates visual noise; the product photo should be the hero.
  let badge: { label: string; tone: 'rose' | 'sage' | 'gold' } | null = null;
  if (seasonBadge) badge = { label: seasonBadge, tone: 'gold' };
  else if (discount && discount > 0) badge = { label: `خصم ${discount}%`, tone: 'rose' };
  else if (product.bestseller) badge = { label: 'الأكثر مبيعًا', tone: 'rose' };
  else if (product.is_new) badge = { label: 'جديد', tone: 'sage' };

  return (
    <div className="group relative rounded-card overflow-hidden bg-white border border-blush hover:border-rose-light shadow-softer hover:shadow-soft transition-all duration-300">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square bg-blush/50 overflow-hidden">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {badge && (
            <div className="absolute top-3 right-3">
              <Badge tone={badge.tone}>{badge.label}</Badge>
            </div>
          )}
          {unavailable && (
            <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
              <span className="text-white font-bold text-sm">غير متوفر حاليًا</span>
            </div>
          )}
        </div>
        <div className="p-3.5">
          <h3 className="font-bold text-sm line-clamp-2 mb-1.5 leading-snug">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-rose font-bold">{formatEGP(product.selling_price)}</span>
            {product.old_price && (
              <span className="text-muted text-xs line-through">{formatEGP(product.old_price)}</span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label={isFavorite ? 'إزالة من المفضلة' : 'أضف إلى المفضلة'}
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(product.id);
        }}
        className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-softer hover:scale-105 transition-transform"
      >
        <HeartIcon filled={isFavorite} />
      </button>

      {!unavailable && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            addItem({
              product_id: product.id,
              name: product.name,
              slug: product.slug,
              image_url: image,
              unit_price: product.selling_price,
              quantity: 1,
            });
          }}
          className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 md:transition-opacity bg-rose text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-softer hover:bg-rose-dark"
        >
          أضف للسلة
        </button>
      )}
    </div>
  );
}

function Badge({ children, tone = 'rose' }: { children: React.ReactNode; tone?: 'rose' | 'sage' | 'gold' }) {
  const colors = {
    rose: 'bg-rose text-white',
    sage: 'bg-sage text-ink',
    gold: 'bg-gold text-ink',
  } as const;
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colors[tone]}`}>{children}</span>;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#D98FA1' : 'none'} stroke={filled ? '#D98FA1' : '#4A3B38'} strokeWidth="1.8">
      <path d="M12 20.5s-7.5-4.6-9.8-9.3C.7 7.7 2.3 4.3 5.6 3.5c2-.5 4 .3 5.2 2 .3.4.8 1 1.2 1.6.4-.6.9-1.2 1.2-1.6 1.2-1.7 3.2-2.5 5.2-2 3.3.8 4.9 4.2 3.4 7.7-2.3 4.7-9.8 9.3-9.8 9.3z" />
    </svg>
  );
}
