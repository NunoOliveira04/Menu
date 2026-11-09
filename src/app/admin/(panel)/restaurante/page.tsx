import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { RestaurantSettingsForm } from '@/components/dashboard/restaurant-settings-form';
import { getPrimaryUserRestaurant, requireAuthenticatedUser } from '@/lib/auth/session';
import { normalizeWeeklySchedule } from '@/lib/modules/hours';
import { resolvePhotoDisplayUrl } from '@/lib/storage/dish-photos';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/server';
import { buildPublicMenuUrl } from '@/lib/utils/url';

export const metadata: Metadata = {
  title: 'Definições',
};

export default async function AdminRestaurantSettingsPage() {
  const user = await requireAuthenticatedUser();
  const context = await getPrimaryUserRestaurant(user.userId);

  if (!context) {
    return null;
  }

  const supabase = await createClient();
  const { data: hoursRows } = await supabase
    .from('restaurant_hours')
    .select('day_of_week, closed, slots')
    .eq('restaurant_id', context.restaurant.id)
    .order('day_of_week', { ascending: true });

  const initialSchedule = normalizeWeeklySchedule(hoursRows ?? []);

  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000';
  const proto =
    headerList.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const publicMenuUrl = buildPublicMenuUrl(context.restaurant.slug, `${proto}://${host}`);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-stone-900">Definições</h1>
        <p className="mt-1 text-sm text-stone-600">
          Nome, logotipo e o que aparece na carta. Carrega em «Guardar» no fim.
        </p>
      </div>

      <RestaurantSettingsForm
        restaurant={context.restaurant}
        role={context.role}
        initialSchedule={initialSchedule}
        logoUrl={resolvePhotoDisplayUrl(context.restaurant.logo_path, getSupabaseEnv().url)}
        publicMenuUrl={publicMenuUrl}
      />
    </div>
  );
}
