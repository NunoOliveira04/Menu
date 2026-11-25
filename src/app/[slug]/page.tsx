import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { PublicMenuView } from '@/components/menu/public-menu-view';
import { parseRestaurantSettings } from '@/lib/auth/access';
import { normalizeWeeklySchedule } from '@/lib/modules/hours';
import { resolveLocalizedField, resolveMenuLocale } from '@/lib/modules/i18n';
import { resolvePhotoDisplayUrl, withPublicDishPhotoUrls } from '@/lib/storage/dish-photos';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { jsonLdScript, restaurantMenuJsonLd } from '@/lib/seo/json-ld';
import { DEMO_SLUG } from '@/lib/seo/site';
import { createClient } from '@/lib/supabase/server';
import { buildPublicMenuUrl } from '@/lib/utils/url';

/**
 * Uma só consulta ao restaurante por pedido (partilhada por generateMetadata e pela página).
 * RLS garante que anónimos só leem restaurantes com published = true;
 * membros autenticados conseguem ler mesmo em modo rascunho.
 */
const getRestaurantBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  return supabase.from('restaurants').select('*').eq('slug', slug).maybeSingle();
});

interface PublicMenuPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string | string[]; embed?: string | string[] }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PublicMenuPageProps): Promise<Metadata> {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const normalizedSlug = slug.trim().toLowerCase();
  const { data: restaurant } = await getRestaurantBySlug(normalizedSlug);

  if (!restaurant) {
    return {
      title: 'Menu não encontrado',
    };
  }

  const settings = parseRestaurantSettings(restaurant.settings);
  const locale = resolveMenuLocale(resolvedSearchParams.lang, settings.modules.languages);
  const localizedDescription = resolveLocalizedField(
    restaurant.description,
    settings.modules.languages ? restaurant.translations : null,
    'description',
    locale,
  );

  const ptUrl = buildPublicMenuUrl(restaurant.slug);
  const enUrl = `${ptUrl}?lang=en`;
  const logoUrl = resolvePhotoDisplayUrl(restaurant.logo_path, getSupabaseEnv().url);

  return {
    // `absolute` ignora o template do layout raiz ("%s · O Seu Menu").
    title: {
      absolute: locale === 'en' ? `${restaurant.name} — Menu` : `${restaurant.name} — Ementa`,
    },
    description:
      localizedDescription ??
      (locale === 'en'
        ? `Explore the digital menu of ${restaurant.name}.`
        : `Consulte a carta digital atualizada de ${restaurant.name}.`),
    alternates: settings.modules.languages
      ? {
          canonical: locale === 'en' ? enUrl : ptUrl,
          languages: {
            'pt-PT': ptUrl,
            en: enUrl,
            'x-default': ptUrl,
          },
        }
      : {
          canonical: ptUrl,
        },
    openGraph: {
      type: 'website',
      url: locale === 'en' ? enUrl : ptUrl,
      siteName: restaurant.name,
      title: locale === 'en' ? `${restaurant.name} — Menu` : `${restaurant.name} — Ementa`,
      locale: locale === 'en' ? 'en_GB' : 'pt_PT',
      ...(logoUrl ? { images: [{ url: logoUrl, alt: restaurant.name }] } : {}),
    },
    // A demo não é um restaurante real: fica fora do Google (continua acessível pelo link).
    robots:
      restaurant.published && restaurant.slug !== DEMO_SLUG
        ? { index: true, follow: true, 'max-image-preview': 'large' }
        : { index: false, follow: true },
  };
}

export default async function PublicMenuPage({ params, searchParams }: PublicMenuPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const normalizedSlug = slug.trim().toLowerCase();
  const [supabase, { data: restaurant, error }] = await Promise.all([
    createClient(),
    getRestaurantBySlug(normalizedSlug),
  ]);

  if (error || !restaurant) {
    notFound();
  }

  const settings = parseRestaurantSettings(restaurant.settings);
  const locale = resolveMenuLocale(resolvedSearchParams.lang, settings.modules.languages);

  const [{ data: categories }, { data: rawDishes }, { data: hoursRows }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('dishes')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true }),
    settings.modules.hours
      ? supabase
          .from('restaurant_hours')
          .select('day_of_week, closed, slots')
          .eq('restaurant_id', restaurant.id)
          .order('day_of_week', { ascending: true })
      : Promise.resolve({ data: [] }),
  ]);

  const { url: supabaseUrl } = getSupabaseEnv();
  const dishes = withPublicDishPhotoUrls(rawDishes ?? [], supabaseUrl);
  const weeklySchedule = settings.modules.hours ? normalizeWeeklySchedule(hoursRows ?? []) : [];

  const logoUrl = resolvePhotoDisplayUrl(restaurant.logo_path, supabaseUrl);
  // Dados estruturados (restaurante + menu com pratos e preços) para o Google e as IAs.
  const structuredData =
    restaurant.published && restaurant.slug !== DEMO_SLUG
      ? restaurantMenuJsonLd({
          restaurant,
          url: buildPublicMenuUrl(restaurant.slug),
          logoUrl,
          categories: categories ?? [],
          dishes,
          weeklySchedule,
        })
      : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(structuredData) }}
        />
      )}
      <PublicMenuView
        restaurant={restaurant}
        categories={categories ?? []}
        dishes={dishes}
        logoUrl={logoUrl}
        modules={settings.modules}
        locale={locale}
        weeklySchedule={weeklySchedule}
        isDraftPreview={!restaurant.published}
        embedded={resolvedSearchParams.embed === '1'}
      />
    </>
  );
}
