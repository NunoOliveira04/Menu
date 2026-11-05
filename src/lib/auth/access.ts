import {
  DEFAULT_RESTAURANT_SETTINGS,
  type Json,
  type RestaurantMemberRole,
  type RestaurantModules,
  type RestaurantSettings,
} from '@/types/database';

export interface MembershipRecord {
  restaurant_id: string;
  user_id: string;
  role: RestaurantMemberRole;
}

export interface RestaurantVisibilityRecord {
  id: string;
  published: boolean;
}

const VALID_ROLES = new Set<RestaurantMemberRole>(['owner', 'manager', 'editor']);

export function canUserWriteRestaurant(
  userId: string | null | undefined,
  restaurantId: string,
  memberships: readonly MembershipRecord[],
): boolean {
  if (!userId || !restaurantId) {
    return false;
  }

  return memberships.some(
    (member) =>
      member.restaurant_id === restaurantId &&
      member.user_id === userId &&
      VALID_ROLES.has(member.role),
  );
}

export function isRestaurantOwner(
  userId: string | null | undefined,
  restaurantId: string,
  memberships: readonly MembershipRecord[],
): boolean {
  if (!userId || !restaurantId) {
    return false;
  }

  return memberships.some(
    (member) =>
      member.restaurant_id === restaurantId && member.user_id === userId && member.role === 'owner',
  );
}

export function canViewRestaurantMenu(
  restaurant: RestaurantVisibilityRecord,
  userId?: string | null,
  memberships: readonly MembershipRecord[] = [],
): boolean {
  if (restaurant.published) {
    return true;
  }
  return canUserWriteRestaurant(userId, restaurant.id, memberships);
}

export function buildDishPhotoStoragePath(restaurantId: string, filename: string): string {
  const cleanName = filename
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const safeName = cleanName || 'prato.jpg';
  return `${restaurantId}/${safeName}`;
}

export function extractRestaurantIdFromStoragePath(objectPath: string): string | null {
  const [firstSegment] = objectPath.split('/');
  if (!firstSegment) {
    return null;
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(firstSegment) ? firstSegment.toLowerCase() : null;
}

export function parseRestaurantSettings(raw: Json | null | undefined): RestaurantSettings {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      modules: { ...DEFAULT_RESTAURANT_SETTINGS.modules },
    };
  }

  const record = raw as Record<string, Json | undefined>;
  const rawModules = record.modules;

  if (!rawModules || typeof rawModules !== 'object' || Array.isArray(rawModules)) {
    return {
      modules: { ...DEFAULT_RESTAURANT_SETTINGS.modules },
    };
  }

  const modulesObj = rawModules as Record<string, Json | undefined>;
  const modules: RestaurantModules = {
    languages: modulesObj.languages === true,
    allergens: modulesObj.allergens === true,
    highlights: modulesObj.highlights === true,
    hours: modulesObj.hours === true,
  };

  return { modules };
}
