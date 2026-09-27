'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const NAV = [
  { href: '/admin', label: 'الرئيسية' },
  { href: '/admin/orders', label: 'الطلبات' },
  { href: '/admin/products', label: 'المنتجات' },
  { href: '/admin/categories', label: 'الفئات' },
  { href: '/admin/occasions', label: 'المناسبات' },
  { href: '/admin/budget-ranges', label: 'نطاقات الميزانية' },
  { href: '/admin/offers', label: 'العروض والأكواد' },
  { href: '/admin/shipping', label: 'الشحن والتوصيل' },
  { href: '/admin/seasons', label: 'المواسم' },
  { href: '/admin/homepage', label: 'الصفحة الرئيسية' },
  { href: '/admin/banners', label: 'البانرات' },
  { href: '/admin/content', label: 'المحتوى والصفحات' },
  { href: '/admin/social', label: 'روابط التواصل' },
  { href: '/admin/notifications', label: 'الإشعارات' },
  { href: '/admin/settings', label: 'الإعدادات' },
];

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<'loading' | 'ok' | 'denied'>('loading');
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (active) setStatus('denied');
        return;
      }
      const { data: admin } = await supabase.from('admin_users').select('full_name, active').eq('id', sessionData.session.user.id).maybeSingle();
      if (!admin || !admin.active) {
        if (active) setStatus('denied');
        return;
      }
      if (active) {
        setAdminName(admin.full_name);
        setStatus('ok');
      }
    })();
    return () => { active = false; };
  }, [pathname]);

  useEffect(() => {
    if (status === 'denied') router.replace('/admin/login');
  }, [status, router]);

  if (status !== 'ok') {
    return <div className="min-h-screen flex items-center justify-center text-ink/50">جاري التحقق...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-56 bg-ink text-cream p-4 shrink-0">
        <div className="font-display text-xl font-bold mb-6">هديّتك — الإدارة</div>
        <nav className="flex md:flex-col gap-1 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${pathname === item.href ? 'bg-rose font-bold' : 'hover:bg-white/10'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 pt-4 border-t border-white/10 text-xs text-cream/60">
          <p className="mb-2">{adminName}</p>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} className="underline">
            تسجيل الخروج
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 bg-cream">{children}</main>
    </div>
  );
}
