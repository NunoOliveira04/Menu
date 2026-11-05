import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import {
  buildDishPhotoStoragePath,
  canCreateFirstRestaurant,
  canMemberApplyRestaurantUpdate,
  canUserWriteRestaurant,
  canViewRestaurantMenu,
  extractRestaurantIdFromStoragePath,
  isRestaurantOwner,
  parseRestaurantSettings,
  type MembershipRecord,
} from '@/lib/auth/access';
import {
  DISH_PHOTO_SIGNED_URL_TTL_SECONDS,
  attachSignedDishPhotoUrls,
  resolveDishPhotoObjectPath,
} from '@/lib/storage/dish-photos';
import type { Database, DishRow } from '@/types/database';

describe('Lógica de Acesso, Membros, Storage Privado e Definições Modulares', () => {
  const restaurantId = '11111111-1111-4111-8111-111111111111';
  const otherRestaurantId = '99999999-9999-4999-8999-999999999999';
  const ownerId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const editorId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const strangerId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

  const memberships: MembershipRecord[] = [
    { restaurant_id: restaurantId, user_id: ownerId, role: 'owner' },
    { restaurant_id: restaurantId, user_id: editorId, role: 'editor' },
  ];

  it('permite leitura pública apenas quando o restaurante está publicado', () => {
    expect(canViewRestaurantMenu({ id: restaurantId, published: true }, null, [])).toBe(true);
    expect(canViewRestaurantMenu({ id: restaurantId, published: false }, null, [])).toBe(false);
    expect(
      canViewRestaurantMenu({ id: restaurantId, published: false }, strangerId, memberships),
    ).toBe(false);
  });

  it('permite pré-visualização de restaurante não publicado apenas a membros', () => {
    expect(
      canViewRestaurantMenu({ id: restaurantId, published: false }, ownerId, memberships),
    ).toBe(true);
    expect(
      canViewRestaurantMenu({ id: restaurantId, published: false }, editorId, memberships),
    ).toBe(true);
  });

  it('autoriza escrita apenas a membros do próprio restaurante e distingue owner', () => {
    expect(canUserWriteRestaurant(ownerId, restaurantId, memberships)).toBe(true);
    expect(canUserWriteRestaurant(editorId, restaurantId, memberships)).toBe(true);
    expect(canUserWriteRestaurant(strangerId, restaurantId, memberships)).toBe(false);
    expect(canUserWriteRestaurant(ownerId, otherRestaurantId, memberships)).toBe(false);

    expect(isRestaurantOwner(ownerId, restaurantId, memberships)).toBe(true);
    expect(isRestaurantOwner(editorId, restaurantId, memberships)).toBe(false);
  });

  it('restringe alterações de slug e published exclusivamente ao role owner', () => {
    // Editor pode guardar nome/tema/módulos mantendo slug e published inalterados
    expect(
      canMemberApplyRestaurantUpdate({
        role: 'editor',
        currentSlug: 'tasca-do-castelo',
        nextSlug: 'tasca-do-castelo',
        currentPublished: false,
        nextPublished: false,
      }),
    ).toBe(true);

    // Editor não pode publicar nem mudar slug
    expect(
      canMemberApplyRestaurantUpdate({
        role: 'editor',
        currentSlug: 'tasca-do-castelo',
        nextSlug: 'tasca-do-castelo',
        currentPublished: false,
        nextPublished: true,
      }),
    ).toBe(false);

    expect(
      canMemberApplyRestaurantUpdate({
        role: 'manager',
        currentSlug: 'tasca-do-castelo',
        nextSlug: 'novo-slug',
        currentPublished: true,
        nextPublished: true,
      }),
    ).toBe(false);

    // Owner pode publicar e mudar slug
    expect(
      canMemberApplyRestaurantUpdate({
        role: 'owner',
        currentSlug: 'tasca-do-castelo',
        nextSlug: 'novo-slug',
        currentPublished: false,
        nextPublished: true,
      }),
    ).toBe(true);
  });

  it('recusa criação de 1.º restaurante se o utilizador já tiver alguma membership', () => {
    expect(canCreateFirstRestaurant(strangerId, memberships)).toBe(true);
    expect(canCreateFirstRestaurant(ownerId, memberships)).toBe(false);
    expect(canCreateFirstRestaurant(editorId, memberships)).toBe(false);
    expect(canCreateFirstRestaurant(null, memberships)).toBe(false);
  });

  it('isola os caminhos do bucket privado dish-photos e resolve signed URLs em lote', async () => {
    const path = buildDishPhotoStoragePath(restaurantId, 'Bacalhau à Casa.WEBP');
    expect(path).toBe(`${restaurantId}/bacalhau-a-casa.webp`);
    expect(extractRestaurantIdFromStoragePath(path)).toBe(restaurantId);
    expect(extractRestaurantIdFromStoragePath('pasta-invalida/foto.jpg')).toBeNull();

    // Extrai caminho de referência interna ou URL Supabase antigo, mas ignora URLs externos da seed
    expect(resolveDishPhotoObjectPath(path)).toBe(path);
    expect(
      resolveDishPhotoObjectPath(
        `https://xyz.supabase.co/storage/v1/object/sign/dish-photos/${path}?token=abc`,
      ),
    ).toBe(path);
    expect(resolveDishPhotoObjectPath('https://picsum.photos/seed/pataniscas/800/600')).toBeNull();

    const createSignedUrlsMock = vi.fn().mockResolvedValue({
      data: [
        {
          error: null,
          path,
          signedURL: `/object/sign/dish-photos/${path}?token=tok123`,
          signedUrl: `https://xyz.supabase.co/storage/v1/object/sign/dish-photos/${path}?token=tok123`,
        },
      ],
      error: null,
    });

    const fakeSupabase = {
      storage: {
        from: vi.fn().mockReturnValue({
          createSignedUrls: createSignedUrlsMock,
        }),
      },
    } as unknown as SupabaseClient<Database>;

    const sampleDishes: DishRow[] = [
      {
        id: 'd1',
        restaurant_id: restaurantId,
        category_id: 'c1',
        name: 'Prato Privado',
        description: null,
        price_cents: 1200,
        photo_url: path,
        available: true,
        position: 0,
        translations: {},
        allergens: [],
        highlight: null,
        created_at: '2026-11-05T00:00:00Z',
        updated_at: '2026-11-05T00:00:00Z',
      },
      {
        id: 'd2',
        restaurant_id: restaurantId,
        category_id: 'c1',
        name: 'Prato Seed Externo',
        description: null,
        price_cents: 800,
        photo_url: 'https://picsum.photos/seed/pataniscas/800/600',
        available: true,
        position: 1,
        translations: {},
        allergens: [],
        highlight: null,
        created_at: '2026-11-05T00:00:00Z',
        updated_at: '2026-11-05T00:00:00Z',
      },
    ];

    const resolved = await attachSignedDishPhotoUrls(fakeSupabase, sampleDishes);
    expect(createSignedUrlsMock).toHaveBeenCalledWith([path], DISH_PHOTO_SIGNED_URL_TTL_SECONDS);
    expect(resolved[0]?.photo_url).toBe(
      `https://xyz.supabase.co/storage/v1/object/sign/dish-photos/${path}?token=tok123`,
    );
    expect(resolved[1]?.photo_url).toBe('https://picsum.photos/seed/pataniscas/800/600');
  });

  it('mantém todos os módulos opcionais desligados por defeito quando settings está vazio', () => {
    expect(parseRestaurantSettings(null)).toEqual({
      modules: {
        languages: false,
        allergens: false,
        highlights: false,
        hours: false,
      },
    });

    expect(
      parseRestaurantSettings({
        modules: { languages: true, allergens: false, highlights: 'invalido', hours: true },
      }),
    ).toEqual({
      modules: {
        languages: true,
        allergens: false,
        highlights: false,
        hours: true,
      },
    });
  });
});
