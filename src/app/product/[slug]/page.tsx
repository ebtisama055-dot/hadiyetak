import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { formatEGP } from '@/lib/format';
import { AddToCart } from '@/components/add-to-cart';

export const revalidate = 30;

async function getProduct(slug: string) {
  const { data } = await supabase
    .from('products')
    .select('*, product_images(image_url, is_primary, display_order)')
    .eq('slug', slug)
    .eq('visibility', 'published')
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};
  const images = (product.product_images ?? []).sort((a: any, b: any) => a.display_order - b.display_order);
  const mainImage = images.find((i: any) => i.is_primary)?.image_url ?? images[0]?.image_url;
  const description = product.short_description || product.description || `${product.name} — اطلبها الآن من هديّتك وإحنا نوصّلها ليك.`;
  return {
    title: `${product.name} | هديّتك`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: mainImage ? [{ url: mainImage }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: mainImage ? [mainImage] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) return notFound();

  const images = (product.product_images ?? []).sort((a: any, b: any) => a.display_order - b.display_order);
  const mainImage = images.find((i: any) => i.is_primary)?.image_url ?? images[0]?.image_url ?? '/placeholder-product.svg';
  const unavailable = product.stock_status === 'out_of_stock';
  const discount = product.old_price
    ? Math.round(((product.old_price - product.selling_price) / product.old_price) * 100)
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 grid md:grid-cols-2 gap-10">
      <div>
        <div className="relative aspect-square rounded-card overflow-hidden bg-blush">
          <Image src={mainImage} alt={product.name} fill className="object-cover" priority />
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {images.slice(0, 4).map((img: any, idx: number) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-blush">
                <Image src={img.image_url} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold mb-2">{product.name}</h1>
        {product.short_description && <p className="text-ink/70 mb-4">{product.short_description}</p>}

        <div className="flex items-center gap-3 mb-2">
          <span className="text-rose text-2xl font-bold">{formatEGP(product.selling_price)}</span>
          {product.old_price && (
            <span className="text-ink/40 line-through">{formatEGP(product.old_price)}</span>
          )}
          {discount && discount > 0 && (
            <span className="bg-gold text-ink text-xs font-bold px-2 py-1 rounded-full">خصم {discount}%</span>
          )}
        </div>

        <p className={`text-sm font-bold mb-6 ${unavailable ? 'text-red-600' : 'text-forest'}`}>
          {unavailable ? 'غير متوفر' : 'متوفر'}
        </p>

        <AddToCart
          productId={product.id}
          name={product.name}
          slug={product.slug}
          imageUrl={mainImage}
          price={product.selling_price}
          disabled={unavailable}
        />

        {product.description && (
          <div className="mt-8 pt-6 border-t border-blush">
            <h2 className="font-bold mb-2">تفاصيل المنتج</h2>
            <p className="text-ink/70 text-sm whitespace-pre-line">{product.description}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-blush text-sm text-ink/70">
          <p>معلومات التوصيل: اختار منطقتك وميعاد التوصيل المناسب عند إتمام الطلب.</p>
        </div>
      </div>
    </div>
  );
}
