import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const revalidate = 60;

export default async function OccasionsPage() {
  const { data } = await supabase.from('occasions').select('*').eq('active', true).order('display_order');
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">المناسبات</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {(data ?? []).map((o: any) => (
          <Link key={o.id} href={`/occasions/${o.slug}`} className="p-6 rounded-card bg-white border border-blush text-center font-bold hover:border-rose transition-colors">
            {o.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
