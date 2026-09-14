'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-store';

export function AddToCart({
  productId,
  name,
  slug,
  imageUrl,
  price,
  disabled,
}: {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number;
  disabled?: boolean;
}) {
  const [qty, setQty] = useState(1);
  const addItem = useCart((s) => s.addItem);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="font-bold text-sm">الكمية</span>
        <div className="flex items-center border border-blush rounded-full overflow-hidden">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center hover:bg-blush"
            aria-label="إنقاص الكمية"
          >
            −
          </button>
          <span className="w-10 text-center font-bold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="w-9 h-9 flex items-center justify-center hover:bg-blush"
            aria-label="زيادة الكمية"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            addItem({ product_id: productId, name, slug, image_url: imageUrl, unit_price: price, quantity: qty });
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
          className="flex-1 bg-rose text-white font-bold py-3 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {disabled ? 'غير متوفر' : added ? 'تمت الإضافة ✓' : 'أضف إلى السلة'}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            addItem({ product_id: productId, name, slug, image_url: imageUrl, unit_price: price, quantity: qty });
            router.push('/cart');
          }}
          className="flex-1 bg-ink text-white font-bold py-3 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          اطلب الآن
        </button>
      </div>
    </div>
  );
}
