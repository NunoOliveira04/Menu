import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicMenuView } from '@/components/menu/public-menu-view';
import { attachSignedDishPhotoUrls } from '@/lib/storage/dish-photos';
import { createClient } from '@/lib/supabase/server';

interface PublicMenuPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicMenuPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name, description, published')
    .eq('slug', slug.toLowerCase())
    .maybeSingle();

  if (!restaurant) {
    return {
      title: 'Menu não encontrado',
    };
  }

  return {
    title: `${restaurant.name} — Ementa`,
    description:
      restaurant.description ?? `Consulta a ementa digital atualizada de ${restaurant.name}.`,
    robots: restaurant.published ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function PublicMenuPage({ params }: PublicMenuPageProps) {
  const { slug } = await params;
  const normalizedSlug = slug.trim().toLowerCase();
  const supabase = await createClient();

  // RLS garante que anónimos só leem restaurantes com published = true;
  // membros autenticados conseguem ler mesmo em modo rascunho.
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', normalizedSlug)
    .maybeSingle();

  if (error || !restaurant) {
    notFound();
  }

  const [{ data: categories }, { data: rawDishes }] = await Promise.all([
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
  ]);

  const dishes = await attachSignedDishPhotoUrls(supabase, rawDishes ?? []);

  return (
    <PublicMenuView
      restaurant={restaurant}
      categories={categories ?? []}
      dishes={dishes}
      isDraftPreview={!restaurant.published}
    />
  );
}
