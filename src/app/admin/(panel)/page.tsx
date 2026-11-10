import type { Metadata } from 'next';
import { headers } from 'next/headers';
import QRCode from 'qrcode';
import { MenuManager } from '@/components/dashboard/menu-manager';
import { QrCodeCard } from '@/components/dashboard/qr-code-card';
import { parseRestaurantSettings } from '@/lib/auth/access';
import { getPrimaryUserRestaurant, requireAuthenticatedUser } from '@/lib/auth/session';
import { withPublicDishPhotoUrls } from '@/lib/storage/dish-photos';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/server';
import { buildPublicMenuUrl } from '@/lib/utils/url';

export const metadata: Metadata = {
  title: 'Gerir Ementa',
};

export default async function AdminMenuPage() {
  const user = await requireAuthenticatedUser();
  const context = await getPrimaryUserRestaurant(user.userId);

  if (!context) {
    return null;
  }

  const { restaurant } = context;
  const settings = parseRestaurantSettings(restaurant.settings);
  const supabase = await createClient();

  const [{ data: categories }, { data: rawDishes }, headerList] = await Promise.all([
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
    headers(),
  ]);

  const dishes = withPublicDishPhotoUrls(rawDishes ?? [], getSupabaseEnv().url);

  const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000';
  const proto =
    headerList.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const fallbackOrigin = `${proto}://${host}`;
  const publicUrl = buildPublicMenuUrl(restaurant.slug, fallbackOrigin);

  const [qrSvgMarkup, qrPngDataUrl] = await Promise.all([
    QRCode.toString(publicUrl, {
      type: 'svg',
      margin: 1,
      width: 180,
      color: {
        dark: '#1C1613',
        light: '#FAF6F0',
      },
    }),
    QRCode.toDataURL(publicUrl, {
      margin: 2,
      width: 600,
      color: {
        dark: '#1C1613',
        light: '#FAF6F0',
      },
    }),
  ]);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <MenuManager
        restaurantId={restaurant.id}
        categories={categories ?? []}
        dishes={dishes}
        modules={settings.modules}
      />

      <div className="lg:sticky lg:top-8">
        <QrCodeCard
          restaurantName={restaurant.name}
          slug={restaurant.slug}
          publicUrl={publicUrl}
          qrSvgMarkup={qrSvgMarkup}
          qrPngDataUrl={qrPngDataUrl}
          published={restaurant.published}
        />
      </div>
    </div>
  );
}
