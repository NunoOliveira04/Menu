import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { RestaurantMemberRole, RestaurantRow } from '@/types/database';

export interface AuthenticatedContext {
  userId: string;
  email: string | undefined;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedContext | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return {
    userId: data.user.id,
    email: data.user.email,
  };
}

export async function requireAuthenticatedUser(): Promise<AuthenticatedContext> {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export interface UserRestaurantContext {
  restaurant: RestaurantRow;
  role: RestaurantMemberRole;
}

export async function getPrimaryUserRestaurant(
  userId: string,
): Promise<UserRestaurantContext | null> {
  const supabase = await createClient();

  const { data: memberships, error: memberError } = await supabase
    .from('restaurant_members')
    .select('restaurant_id, role, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1);

  if (memberError || !memberships || memberships.length === 0) {
    return null;
  }

  const primaryMembership = memberships[0];
  if (!primaryMembership) {
    return null;
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', primaryMembership.restaurant_id)
    .single();

  if (restaurantError || !restaurant) {
    return null;
  }

  return {
    restaurant,
    role: primaryMembership.role,
  };
}

export async function verifyUserRestaurantAccess(
  userId: string,
  restaurantId: string,
): Promise<RestaurantMemberRole | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('restaurant_members')
    .select('role')
    .eq('restaurant_id', restaurantId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.role;
}
