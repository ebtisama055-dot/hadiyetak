import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="bg-rose-dark text-cream mt-16">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl font-bold mb-2">هديّتك</div>
          <p className="text-sm text-cream/80">هدية تفرّح — نوصّل الورد والهدايا الجاهزة لكل محافظة الوادي الجديد.</p>
        </div>
        <div>
          <h3 className="font-bold mb-3">تسوّق</h3>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/products">كل الهدايا</Link></li>
            <li><Link href="/occasions">المناسبات</Link></li>
            <li><Link href="/categories">الفئات</Link></li>
            <li><Link href="/budget">حسب الميزانية</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3">خدمة العملاء</h3>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/track-order">تتبع الطلب</Link></li>
            <li><Link href="/content/delivery_policy">سياسة التوصيل</Link></li>
            <li><Link href="/content/return_policy">الاستبدال والاسترجاع</Link></li>
            <li><Link href="/content/privacy_policy">الخصوصية</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3">تواصل معنا</h3>
          <p className="text-sm text-cream/80">واتساب: متاح من أيقونة المحادثة</p>
        </div>
      </div>
      <div className="border-t border-cream/20 text-center text-xs text-cream/60 py-4">
        © {new Date().getFullYear()} هديّتك. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
