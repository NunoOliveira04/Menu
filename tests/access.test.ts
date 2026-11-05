import { describe, expect, it } from 'vitest';
import {
  buildDishPhotoStoragePath,
  canUserWriteRestaurant,
  canViewRestaurantMenu,
  extractRestaurantIdFromStoragePath,
  isRestaurantOwner,
  parseRestaurantSettings,
  type MembershipRecord,
} from '@/lib/auth/access';

describe('Lógica de Acesso, Membros, Storage e Definições Modulares', () => {
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

  it('isola os caminhos do bucket dish-photos por restaurant_id', () => {
    const path = buildDishPhotoStoragePath(restaurantId, 'Bacalhau à Casa.WEBP');
    expect(path).toBe(`${restaurantId}/bacalhau-a-casa.webp`.replace('à', '-'));
    expect(extractRestaurantIdFromStoragePath(path)).toBe(restaurantId);
    expect(extractRestaurantIdFromStoragePath('pasta-invalida/foto.jpg')).toBeNull();
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
