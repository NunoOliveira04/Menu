import type { Metadata } from 'next';
import { RestaurantSettingsForm } from '@/components/dashboard/restaurant-settings-form';
import { getPrimaryUserRestaurant, requireAuthenticatedUser } from '@/lib/auth/session';
import { normalizeWeeklySchedule } from '@/lib/modules/hours';
import { resolvePhotoDisplayUrl } from '@/lib/storage/dish-photos';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Definições do Restaurante',
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

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-stone-900">
          Definições do Restaurante
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Personaliza o nome, o endereço público, o tema visual e os módulos ativos da tua ementa.
        </p>
      </div>

      <RestaurantSettingsForm
        restaurant={context.restaurant}
        role={context.role}
        initialSchedule={initialSchedule}
        coverPhotoUrl={resolvePhotoDisplayUrl(
          context.restaurant.cover_photo_path,
          getSupabaseEnv().url,
        )}
      />
    </div>
  );
}
