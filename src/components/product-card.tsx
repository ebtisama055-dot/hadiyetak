import Link from 'next/link';
import Image from 'next/image';
import { formatEGP } from '@/lib/format';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  const image = product.product_images?.find((i) => i.is_primary)?.image_url
    || product.product_images?.[0]?.image_url
    || '/placeholder-product.svg';

  const discount = product.old_price
    ? Math.round(((product.old_price - product.selling_price) / product.old_price) * 100)
    : null;

  const unavailable = product.stock_status === 'out_of_stock';

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
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {product.bestseller && <Badge>الأكثر مبيعًا</Badge>}
          {product.is_new && <Badge tone="forest">جديد</Badge>}
          {discount && discount > 0 && <Badge tone="gold">خصم {discount}%</Badge>}
        </div>
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
