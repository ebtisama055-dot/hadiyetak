import { supabase } from './supabase';

/**
 * "هوية المتجر" — Store Identity.
 * Single source of truth for the store's logo assets, read from
 * site_settings and passed down from the root layout to the header/footer.
 * Never hardcode logo paths inside components — everything reads from here.
 */
export type SiteBrand = {
  store_name: string | null;
  tagline: string | null;
  logo_url: string | null;        // Primary logo — main header mark
  logo_compact_url: string | null; // Compact logo — small spaces / mobile
  app_icon_url: string | null;     // PWA / app icon
  favicon_url: string | null;      // Browser favicon
  whatsapp_number: string | null;
  phone: string | null;
};

export async function getSiteBrand(): Promise<SiteBrand> {
  const { data } = await supabase
    .from('site_settings')
    .select('store_name, tagline, logo_url, logo_compact_url, app_icon_url, favicon_url, whatsapp_number, phone')
    .eq('id', 1)
    .maybeSingle();

  return {
    store_name: data?.store_name ?? 'هديّتك',
    tagline: data?.tagline ?? null,
    logo_url: data?.logo_url ?? null,
    logo_compact_url: data?.logo_compact_url ?? null,
    app_icon_url: data?.app_icon_url ?? null,
    favicon_url: data?.favicon_url ?? null,
    whatsapp_number: data?.whatsapp_number ?? null,
    phone: data?.phone ?? null,
  };
}
