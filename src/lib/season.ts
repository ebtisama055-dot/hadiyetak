import { supabase } from './supabase';

/**
 * SEASONAL OVERLAY RESOLUTION
 * ---------------------------
 * "published" is an admin approval state, NOT "currently active". A season is
 * only active on the storefront when it is published AND the current date/time
 * falls inside its [full_start_date, end_date] window. Among multiple active
 * seasons, the highest `priority` wins. If nothing qualifies, activeSeason is
 * null and the storefront renders the permanent Core Brand only — never a
 * seasonal look by default.
 */
export type SeasonLifecycleState = 'draft' | 'preview' | 'scheduled' | 'active' | 'expired';

export function computeLifecycleState(season: {
  status: string;
  teaser_start_date: string | null;
  full_start_date: string;
  end_date: string;
}): SeasonLifecycleState {
  if (season.status === 'draft') return 'draft';
  if (season.status === 'preview') return 'preview';

  const now = new Date();
  const start = new Date(season.full_start_date);
  const end = new Date(season.end_date);
  end.setHours(23, 59, 59, 999);

  if (now < start) return 'scheduled';
  if (now > end) return 'expired';
  return 'active';
}

/** The one season (if any) that should overlay the live public storefront right now. */
export async function getActiveSeason() {
  const { data } = await supabase
    .from('seasons')
    .select('*')
    .eq('status', 'published')
    .order('priority', { ascending: false });

  if (!data) return null;

  const now = new Date();
  const active = data.find((s) => {
    const start = new Date(s.full_start_date);
    const end = new Date(s.end_date);
    end.setHours(23, 59, 59, 999);
    return now >= start && now <= end;
  });

  return active ?? null;
}

/** Admin-only preview: force-render a specific season's overlay regardless of
 * its dates or status, without affecting what real customers see. */
export async function getPreviewSeason(slug: string) {
  const { data } = await supabase.from('seasons').select('*').eq('slug', slug).maybeSingle();
  return data ?? null;
}
