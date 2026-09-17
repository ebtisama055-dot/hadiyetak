import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data } = await supabase.from('categories').select('name').eq('slug', params.slug).maybeSingle();
  if (!data) return {};
  return {
    title: `${data.name} | هديّتك`,
    description: `تصفح كل هدايا فئة ${data.name} في هديّتك.`,
  };
}

// Category detail is really just the products listing pre-filtered — this
// route exists so /categories/<slug> links (homepage, categories index)
// work, but the actual filtering + pagination + sorting UI lives at /products.
export default function CategoryRedirect({ params }: { params: { slug: string } }) {
  redirect(`/products?category=${params.slug}`);
}
