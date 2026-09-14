import Link from 'next/link';

export default function OrderSuccessPage({ params }: { params: { orderNumber: string } }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="text-5xl mb-4">🎁</div>
      <h1 className="font-display text-3xl font-bold mb-2">تم استلام طلبك بنجاح!</h1>
      <p className="text-ink/70 mb-1">رقم الطلب</p>
      <p className="text-2xl font-bold text-rose mb-6">{params.orderNumber}</p>
      <p className="text-ink/70 mb-8">هنتواصل معاك لتأكيد الطلب قريبًا. تقدر تتابع حالة طلبك في أي وقت من صفحة تتبع الطلب.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/track-order" className="bg-rose text-white font-bold px-6 py-3 rounded-full">تتبع الطلب</Link>
        <Link href="/products" className="bg-blush text-ink font-bold px-6 py-3 rounded-full">متابعة التسوق</Link>
      </div>
    </div>
  );
}
