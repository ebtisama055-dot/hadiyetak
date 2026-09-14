'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatEGP } from '@/lib/format';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    supabase.rpc('admin_dashboard_stats').then(({ data }) => setStats(data));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">لوحة التحكم</h1>

      {!stats ? (
        <p className="text-ink/50">جاري التحميل...</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="مبيعات اليوم" value={formatEGP(stats.today_sales)} />
            <StatCard label="طلبات اليوم" value={stats.today_orders} />
            <StatCard label="طلبات جديدة" value={stats.new_orders} tone={stats.new_orders > 0 ? 'rose' : undefined} />
            <StatCard label="جاري تجهيزها" value={stats.preparing_orders} />
            <StatCard label="خارجة للتوصيل" value={stats.out_for_delivery_orders} />
            <StatCard label="منتجات قاربت على النفاد" value={stats.low_stock_products} tone={stats.low_stock_products > 0 ? 'gold' : undefined} />
            <StatCard label="منتجات غير متوفرة" value={stats.out_of_stock_products} tone={stats.out_of_stock_products > 0 ? 'rose' : undefined} />
            <StatCard label="عروض نشطة" value={stats.active_offers} />
          </div>

          {stats.current_season && (
            <div className="bg-forest text-white rounded-card p-4 mb-8">
              الموسم النشط حاليًا: <span className="font-bold">{stats.current_season}</span>
            </div>
          )}
        </>
      )}

      <h2 className="font-bold mb-3">إجراءات سريعة</h2>
      <div className="flex flex-wrap gap-3">
        <QuickAction href="/admin/products" label="إضافة منتج" />
        <QuickAction href="/admin/orders" label="عرض الطلبات الجديدة" />
        <QuickAction href="/admin/shipping" label="إدارة الشحن" />
        <QuickAction href="/admin/seasons" label="إدارة المواسم" />
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: any; tone?: 'rose' | 'gold' }) {
  const toneClass = tone === 'rose' ? 'border-rose text-rose' : tone === 'gold' ? 'border-gold text-gold' : 'border-blush text-ink';
  return (
    <div className={`bg-white border-2 rounded-card p-4 ${toneClass}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-ink/60 mt-1">{label}</div>
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="px-4 py-2 rounded-full bg-white border border-blush text-sm font-bold hover:border-rose">
      {label}
    </Link>
  );
}
