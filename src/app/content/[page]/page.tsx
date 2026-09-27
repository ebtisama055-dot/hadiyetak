import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const revalidate = 60;

export default async function ContentPage({ params }: { params: { page: string } }) {
  const { data } = await supabase.from('content_pages').select('*').eq('page_key', params.page).maybeSingle();
  if (!data) return notFound();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-6">{data.title}</h1>
      <p className="text-ink/70 whitespace-pre-line leading-relaxed">{data.body}</p>
    </div>
  );
}
