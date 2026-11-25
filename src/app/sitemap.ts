import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { DEMO_SLUG, siteOrigin } from '@/lib/seo/site';
import { getSupabaseEnv } from '@/lib/supabase/env';
import type { Database } from '@/types/database';
import { buildPublicMenuUrl } from '@/lib/utils/url';

// Atualiza de hora a hora (novas cartas publicadas entram sozinhas).
export const revalidate = 3600;

/** sitemap.xml: a página de apresentação e as cartas publicadas dos restaurantes. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const entries: MetadataRoute.Sitemap = [
    { url: `${origin}/`, changeFrequency: 'weekly', priority: 1 },
  ];

  try {
    const { url, anonKey } = getSupabaseEnv();
    // Cliente anónimo sem cookies: RLS só devolve restaurantes publicados.
    const supabase = createClient<Database>(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await supabase
      .from('restaurants')
      .select('slug, updated_at')
      .eq('published', true)
      .neq('slug', DEMO_SLUG);
    for (const restaurant of data ?? []) {
      entries.push({
        url: buildPublicMenuUrl(restaurant.slug, origin),
        lastModified: restaurant.updated_at ?? undefined,
        changeFrequency: 'daily',
        priority: 0.7,
      });
    }
  } catch {
    // Sem base de dados (ex.: build sem variáveis): fica só a página principal.
  }

  return entries;
}
