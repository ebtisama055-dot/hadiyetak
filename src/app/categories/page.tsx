import Link from 'next/link';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'الفئات | هديّتك',
  description: 'تصفح فئات الهدايا في هديّتك — ورد، شوكولاتة، هدايا مخصصة وأكتر.',
};

export default async function CategoriesPage() {
  const { data } = await supabase.from('categories').select('*').eq('active', true).order('display_order');
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">الفئات</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {(data ?? []).map((c: any) => (
          <Link key={c.id} href={`/categories/${c.slug}`} className="p-6 rounded-card bg-white border border-blush text-center font-bold hover:border-rose transition-colors">
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
