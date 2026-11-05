import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RestaurantSettingsForm } from '@/components/dashboard/restaurant-settings-form';
import { getPrimaryUserRestaurant, requireAuthenticatedUser } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Definições do Restaurante',
};

export default async function DashboardRestaurantSettingsPage() {
  const user = await requireAuthenticatedUser();
  const context = await getPrimaryUserRestaurant(user.userId);

  if (!context) {
    redirect('/onboarding');
  }

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

      <RestaurantSettingsForm restaurant={context.restaurant} role={context.role} />
    </div>
  );
}
