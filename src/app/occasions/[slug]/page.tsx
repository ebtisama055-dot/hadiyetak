import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data } = await supabase.from('occasions').select('name').eq('slug', params.slug).maybeSingle();
  if (!data) return {};
  return {
    title: `${data.name} | هديّتك`,
    description: `اختار هدية مناسبة لـ${data.name} من هديّتك.`,
  };
}

export default function OccasionRedirect({ params }: { params: { slug: string } }) {
  redirect(`/products?occasion=${params.slug}`);
}
