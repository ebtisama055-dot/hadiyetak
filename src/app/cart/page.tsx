'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-store';
import { formatEGP } from '@/lib/format';

export default function CartPage() {
  const { lines, setQuantity, removeItem, subtotal } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-2xl mb-2">السلة لسه فاضية ❤️</p>
        <p className="text-ink/60 mb-6">شوف الهدايا واختار اللي يعجبك.</p>
        <Link href="/products" className="inline-block bg-rose text-white font-bold px-6 py-3 rounded-full">
          تصفّح الهدايا
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">السلة</h1>

      <div className="space-y-4">
        {lines.map((line) => (
          <div key={line.product_id} className="flex gap-4 items-center bg-white border border-blush rounded-card p-3">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-blush shrink-0">
              <Image src={line.image_url || '/placeholder-product.svg'} alt={line.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/product/${line.slug}`} className="font-bold text-sm line-clamp-2 hover:text-rose">
                {line.name}
              </Link>
              <p className="text-rose font-bold text-sm mt-1">{formatEGP(line.unit_price)}</p>
            </div>
            <div className="flex items-center border border-blush rounded-full overflow-hidden">
              <button onClick={() => setQuantity(line.product_id, line.quantity - 1)} className="w-8 h-8 hover:bg-blush">−</button>
              <span className="w-8 text-center text-sm font-bold">{line.quantity}</span>
              <button onClick={() => setQuantity(line.product_id, line.quantity + 1)} className="w-8 h-8 hover:bg-blush">+</button>
            </div>
            <button onClick={() => removeItem(line.product_id)} aria-label="إزالة" className="text-ink/40 hover:text-red-600 text-sm shrink-0">
              إزالة
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white border border-blush rounded-card p-5">
        <div className="flex justify-between mb-2">
          <span className="text-ink/70">الإجمالي الفرعي</span>
          <span className="font-bold">{formatEGP(subtotal())}</span>
        </div>
        <p className="text-xs text-ink/50 mb-4">سيتم احتساب رسوم التوصيل عند اختيار المنطقة في صفحة إتمام الطلب.</p>
        <Link href="/checkout" className="block text-center bg-rose text-white font-bold py-3 rounded-full hover:opacity-90 transition-opacity">
          إتمام الطلب
        </Link>
      </div>
    </div>
  );
}
