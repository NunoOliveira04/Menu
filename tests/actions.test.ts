import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRedirect = vi.fn((url: string): never => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

const mockRevalidatePath = vi.fn();

const mockSignInWithPassword = vi.fn();
const mockRpc = vi.fn();
const mockStorageUpload = vi.fn();
const mockStorageRemove = vi.fn();
const mockGetUser = vi.fn();
const mockGetClaims = vi.fn();
const mockFrom = vi.fn();

vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}));

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
      signInWithPassword: mockSignInWithPassword,
    },
    rpc: mockRpc,
    from: mockFrom,
    storage: {
      from: vi.fn(() => ({
        upload: mockStorageUpload,
        remove: mockStorageRemove,
      })),
    },
  })),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getClaims: mockGetClaims,
    },
    from: mockFrom,
  })),
}));

import { loginAction } from '@/app/actions/auth';
import {
  createCategoryAction,
  reorderCategoryAction,
  updateCategoryAction,
} from '@/app/actions/categories';
import { createDishAction, reorderDishAction, updateDishAction } from '@/app/actions/dishes';
import { updateRestaurantAction } from '@/app/actions/restaurant';
import { INITIAL_ACTION_STATE } from '@/app/actions/types';
import { updateSession } from '@/lib/supabase/middleware';

const RESTAURANT_ID = '11111111-1111-4111-8111-111111111111';
const CATEGORY_A = '22222222-2222-4222-8222-222222222201';
const CATEGORY_B = '22222222-2222-4222-8222-222222222202';
const DISH_1 = '33333333-3333-4333-8333-333333333301';
const DISH_2 = '33333333-3333-4333-8333-333333333302';
const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('Server Actions — Permissões Owner, Magic Bytes, Módulos Off e Reordenação Transacional', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://dummy-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-anon-key';
  });

  it('loginAction redireciona para ?next= seguro (/admin/restaurante)', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });
    const fd = new FormData();
    fd.set('email', 'dono@tasca.pt');
    fd.set('password', 'segredo1234');
    fd.set('next', '/admin/restaurante');
    await expect(loginAction(INITIAL_ACTION_STATE, fd)).rejects.toThrow(
      'NEXT_REDIRECT:/admin/restaurante',
    );
  });

  it('loginAction rejeita next open-redirect e cai em /admin', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });
    for (const evil of ['https://evil.com', '//evil.com', '/\\evil.com', '/r/x']) {
      const fd = new FormData();
      fd.set('email', 'dono@tasca.pt');
      fd.set('password', 'segredo1234');
      fd.set('next', evil);
      await expect(loginAction(INITIAL_ACTION_STATE, fd)).rejects.toThrow('NEXT_REDIRECT:/admin');
    }
  });

  it('createDishAction bloqueia upload antes de chamar Storage se os magic bytes forem inválidos', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: USER_ID, email: 'dono@tasca.pt' } },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'restaurant_members') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: { role: 'owner' }, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'restaurants') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  settings: {
                    modules: {
                      languages: false,
                      allergens: false,
                      highlights: false,
                      hours: false,
                    },
                  },
                },
                error: null,
              }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const fakeFile = new File(['isto nao e um jpeg real'], 'falso.jpg', {
      type: 'image/jpeg',
    });

    const fd = new FormData();
    fd.set('restaurantId', RESTAURANT_ID);
    fd.set('categoryId', CATEGORY_A);
    fd.set('name', 'Pataniscas');
    fd.set('price', '6,50');
    fd.set('available', 'on');
    fd.set('photo', fakeFile);

    const state = await createDishAction(INITIAL_ACTION_STATE, fd);

    expect(state.status).toBe('error');
    expect(mockStorageUpload).not.toHaveBeenCalled();
  });

  it('createDishAction grava {}, [] e null quando languages, allergens e highlights estão off na BD (mesmo com FormData forjado)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: USER_ID, email: 'dono@tasca.pt' } },
      error: null,
    });

    const mockInsertDish = vi.fn(async () => ({ error: null }));

    mockFrom.mockImplementation((table: string) => {
      if (table === 'restaurant_members') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: { role: 'owner' }, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'restaurants') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  slug: 'menu-restaurante',
                  settings: {
                    modules: {
                      languages: false,
                      allergens: false,
                      highlights: false,
                      hours: false,
                    },
                  },
                },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'dishes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  limit: async () => ({ data: [{ position: 2 }], error: null }),
                }),
              }),
            }),
          }),
          insert: mockInsertDish,
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const fd = new FormData();
    fd.set('restaurantId', RESTAURANT_ID);
    fd.set('categoryId', CATEGORY_A);
    fd.set('name', 'Bacalhau Assado');
    fd.set('description', 'Com broa');
    fd.set('price', '18,50');
    fd.set('available', 'on');
    // Campos maliciosos/forjados enviados pelo cliente quando os módulos estão off na BD:
    fd.set('nameEn', 'Forged English Name');
    fd.set('descriptionEn', 'Forged English Description');
    fd.append('allergens', 'gluten');
    fd.append('allergens', 'fish');
    fd.set('highlight', 'featured');
    fd.set('allergens_module_active', 'true');
    fd.set('highlights_module_active', 'true');

    const result = await createDishAction(INITIAL_ACTION_STATE, fd);

    expect(result.status).toBe('success');
    expect(mockInsertDish).toHaveBeenCalledTimes(1);
    expect(mockInsertDish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Bacalhau Assado',
        translations: {},
        allergens: [],
        highlight: null,
      }),
    );
  });

  it('updateDishAction preserva translations, allergens e highlight existentes da linha quando os módulos estão off na BD', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: USER_ID, email: 'dono@tasca.pt' } },
      error: null,
    });

    const existingTranslations = { en: { name: 'Saved Cod', description: 'Saved EN desc' } };
    const existingAllergens = ['fish', 'gluten'];
    const existingHighlight = 'recommended';

    const mockUpdateEqRestaurant = vi.fn(async () => ({ error: null }));
    const mockUpdateEqId = vi.fn(() => ({ eq: mockUpdateEqRestaurant }));
    const mockUpdateDish = vi.fn(() => ({ eq: mockUpdateEqId }));

    mockFrom.mockImplementation((table: string) => {
      if (table === 'restaurant_members') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: { role: 'owner' }, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'restaurants') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  slug: 'menu-restaurante',
                  settings: {
                    modules: {
                      languages: false,
                      allergens: false,
                      highlights: false,
                      hours: false,
                    },
                  },
                },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'dishes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: {
                    photo_url: null,
                    translations: existingTranslations,
                    allergens: existingAllergens,
                    highlight: existingHighlight,
                  },
                  error: null,
                }),
              }),
            }),
          }),
          update: mockUpdateDish,
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const fd = new FormData();
    fd.set('restaurantId', RESTAURANT_ID);
    fd.set('dishId', DISH_1);
    fd.set('categoryId', CATEGORY_A);
    fd.set('name', 'Bacalhau Assado Atualizado');
    fd.set('price', '19,00');
    fd.set('available', 'on');
    // Tentativa de sobrescrever/limpar com módulos off:
    fd.set('nameEn', 'Overwritten EN');
    fd.append('allergens', 'milk');
    fd.set('highlight', 'new');
    fd.set('allergens_module_active', 'true');
    fd.set('highlights_module_active', 'true');

    const result = await updateDishAction(INITIAL_ACTION_STATE, fd);

    expect(result.status).toBe('success');
    expect(mockUpdateDish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Bacalhau Assado Atualizado',
        translations: existingTranslations,
        allergens: existingAllergens,
        highlight: existingHighlight,
      }),
    );
  });

  it('createCategoryAction grava {} e updateCategoryAction preserva currentCategory.translations quando modules.languages está off na BD', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: USER_ID, email: 'dono@tasca.pt' } },
      error: null,
    });

    const savedCatTranslations = { en: { name: 'Saved Starters', description: 'Saved note' } };
    const mockInsertCategory = vi.fn(async () => ({ error: null }));
    const mockUpdateCatEqRestaurant = vi.fn(async () => ({ error: null }));
    const mockUpdateCatEqId = vi.fn(() => ({ eq: mockUpdateCatEqRestaurant }));
    const mockUpdateCategory = vi.fn(() => ({ eq: mockUpdateCatEqId }));

    mockFrom.mockImplementation((table: string) => {
      if (table === 'restaurant_members') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: { role: 'owner' }, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'restaurants') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  slug: 'menu-restaurante',
                  settings: {
                    modules: {
                      languages: false,
                      allergens: true,
                      highlights: true,
                      hours: true,
                    },
                  },
                },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'categories') {
        return {
          select: (cols: string) => {
            if (cols === 'position') {
              return {
                eq: () => ({
                  order: () => ({
                    limit: async () => ({ data: [{ position: 0 }], error: null }),
                  }),
                }),
              };
            }
            return {
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: { translations: savedCatTranslations },
                    error: null,
                  }),
                }),
              }),
            };
          },
          insert: mockInsertCategory,
          update: mockUpdateCategory,
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const createFd = new FormData();
    createFd.set('restaurantId', RESTAURANT_ID);
    createFd.set('name', 'Entradas');
    createFd.set('nameEn', 'Forged Starters');
    createFd.set('descriptionEn', 'Forged Desc');

    const createRes = await createCategoryAction(INITIAL_ACTION_STATE, createFd);
    expect(createRes.status).toBe('success');
    expect(mockInsertCategory).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Entradas',
        translations: {},
      }),
    );

    const updateFd = new FormData();
    updateFd.set('restaurantId', RESTAURANT_ID);
    updateFd.set('categoryId', CATEGORY_A);
    updateFd.set('name', 'Entradas Quentes');
    updateFd.set('nameEn', 'Overwritten Starters');

    const updateRes = await updateCategoryAction(INITIAL_ACTION_STATE, updateFd);
    expect(updateRes.status).toBe('success');
    expect(mockUpdateCategory).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Entradas Quentes',
        translations: savedCatTranslations,
      }),
    );
  });

  it('middleware define x-menu-html-lang=pt-PT em ?lang=en quando modules.languages está off e en quando está on', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: null } });

    // Caso 1: languages = false -> ?lang=en deve manter pt-PT
    mockFrom.mockImplementationOnce(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { settings: { modules: { languages: false } } },
            error: null,
          }),
        }),
      }),
    }));

    const reqOff = new NextRequest('http://localhost:3000/r/menu-restaurante?lang=en');
    const resOff = await updateSession(reqOff);
    expect(resOff.headers.get('x-middleware-override-headers')).toContain('x-menu-html-lang');
    expect(resOff.headers.get('x-middleware-request-x-menu-html-lang')).toBe('pt-PT');

    // Caso 2: languages = true -> ?lang=en define en
    mockFrom.mockImplementationOnce(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { settings: { modules: { languages: true } } },
            error: null,
          }),
        }),
      }),
    }));

    const reqOn = new NextRequest('http://localhost:3000/r/menu-restaurante?lang=en');
    const resOn = await updateSession(reqOn);
    expect(resOn.headers.get('x-middleware-request-x-menu-html-lang')).toBe('en');
  });

  it('updateRestaurantAction recusa alteração de slug ou published quando o membro não é owner', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: USER_ID, email: 'editor@tasca.pt' } },
      error: null,
    });

    const mockUpdate = vi.fn();
    mockFrom.mockImplementation((table: string) => {
      if (table === 'restaurant_members') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: { role: 'editor' }, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'restaurants') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: RESTAURANT_ID,
                  slug: 'menu-restaurante',
                  published: false,
                  translations: {},
                },
                error: null,
              }),
            }),
          }),
          update: mockUpdate,
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const fd = new FormData();
    fd.set('restaurantId', RESTAURANT_ID);
    fd.set('name', 'Menu Restaurante');
    fd.set('slug', 'novo-slug-proibido');
    fd.set('published', 'on');
    fd.set('style', 'classico');

    const result = await updateRestaurantAction(INITIAL_ACTION_STATE, fd);

    expect(result.status).toBe('error');
    expect(result.message).toContain('proprietário');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  describe('updateRestaurantAction — foto de capa (ponto 6)', () => {
    const OLD_COVER = `${RESTAURANT_ID}/cover-1700000000000-antiga.webp`;

    function mockOwnerRestaurant(update: ReturnType<typeof vi.fn>) {
      mockGetUser.mockResolvedValue({
        data: { user: { id: USER_ID, email: 'dono@tasca.pt' } },
        error: null,
      });
      mockFrom.mockImplementation((table: string) => {
        if (table === 'restaurant_members') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: { role: 'owner' }, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'restaurants') {
          return {
            select: (cols: string) => ({
              eq: () => ({
                maybeSingle: async () =>
                  cols === 'cover_photo_path'
                    ? { data: { cover_photo_path: OLD_COVER }, error: null }
                    : {
                        data: {
                          id: RESTAURANT_ID,
                          slug: 'menu-restaurante',
                          published: true,
                          translations: {},
                        },
                        error: null,
                      },
              }),
            }),
            update: (payload: Record<string, unknown>) => {
              update(payload);
              return { eq: async () => ({ error: null }) };
            },
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      });
    }

    function baseRestaurantForm() {
      const fd = new FormData();
      fd.set('restaurantId', RESTAURANT_ID);
      fd.set('name', 'Menu Restaurante');
      fd.set('slug', 'menu-restaurante');
      fd.set('published', 'on');
      fd.set('style', 'classico');
      return fd;
    }

    it('não toca em cover_photo_path quando a capa não muda', async () => {
      const update = vi.fn();
      mockOwnerRestaurant(update);

      const fd = baseRestaurantForm();
      fd.set('coverPhoto', new File([], ''));
      const result = await updateRestaurantAction(INITIAL_ACTION_STATE, fd);

      expect(result.status).toBe('success');
      expect(update).toHaveBeenCalledTimes(1);
      expect(update.mock.calls[0]?.[0]).not.toHaveProperty('cover_photo_path');
      expect(mockStorageUpload).not.toHaveBeenCalled();
      expect(mockStorageRemove).not.toHaveBeenCalled();
    });

    it('carrega a nova capa na pasta do restaurante e apaga a antiga', async () => {
      const update = vi.fn();
      mockOwnerRestaurant(update);
      mockStorageUpload.mockResolvedValue({ data: {}, error: null });
      mockStorageRemove.mockResolvedValue({ data: [], error: null });

      const webpBytes = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38,
        0x20,
      ]);
      const fd = baseRestaurantForm();
      fd.set('coverPhoto', new File([webpBytes], 'capa.webp', { type: 'image/webp' }));
      const result = await updateRestaurantAction(INITIAL_ACTION_STATE, fd);

      expect(result.status).toBe('success');
      const uploadedPath = mockStorageUpload.mock.calls[0]?.[0] as string;
      expect(uploadedPath).toMatch(new RegExp(`^${RESTAURANT_ID}/cover-\\d+-[0-9a-f-]+\\.webp$`));
      expect(update.mock.calls[0]?.[0]).toMatchObject({ cover_photo_path: uploadedPath });
      expect(mockStorageRemove).toHaveBeenCalledWith([OLD_COVER]);
    });

    it('remove a capa quando o dono o pede', async () => {
      const update = vi.fn();
      mockOwnerRestaurant(update);
      mockStorageRemove.mockResolvedValue({ data: [], error: null });

      const fd = baseRestaurantForm();
      fd.set('removeCoverPhoto', 'on');
      const result = await updateRestaurantAction(INITIAL_ACTION_STATE, fd);

      expect(result.status).toBe('success');
      expect(update.mock.calls[0]?.[0]).toMatchObject({ cover_photo_path: null });
      expect(mockStorageUpload).not.toHaveBeenCalled();
      expect(mockStorageRemove).toHaveBeenCalledWith([OLD_COVER]);
    });

    it('rejeita uma capa cujo conteúdo não é imagem, sem chamar o Storage', async () => {
      const update = vi.fn();
      mockOwnerRestaurant(update);

      const fd = baseRestaurantForm();
      fd.set('coverPhoto', new File(['nao sou imagem'], 'capa.jpg', { type: 'image/jpeg' }));
      const result = await updateRestaurantAction(INITIAL_ACTION_STATE, fd);

      expect(result.status).toBe('error');
      expect(result.fieldErrors?.coverPhoto?.[0]).toBeTruthy();
      expect(mockStorageUpload).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    });
  });

  it('reorderCategoryAction e reorderDishAction executam reordenação atómica via RPC SQL', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: USER_ID, email: 'dono@tasca.pt' } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'restaurant_members') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: { role: 'owner' }, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'categories') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                order: async () => ({
                  data: [
                    { id: CATEGORY_A, position: 0 },
                    { id: CATEGORY_B, position: 1 },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'dishes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  order: async () => ({
                    data: [
                      { id: DISH_1, position: 0 },
                      { id: DISH_2, position: 1 },
                    ],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'restaurants') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { slug: 'menu-restaurante' }, error: null }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    mockRpc.mockResolvedValue({ data: null, error: null });

    const catFd = new FormData();
    catFd.set('restaurantId', RESTAURANT_ID);
    catFd.set('categoryId', CATEGORY_B);
    catFd.set('direction', 'up');

    const catRes = await reorderCategoryAction(catFd);
    expect(catRes.status).toBe('success');
    expect(mockRpc).toHaveBeenCalledWith('reorder_categories', {
      p_restaurant_id: RESTAURANT_ID,
      p_ordered_ids: [CATEGORY_B, CATEGORY_A],
    });

    const dishFd = new FormData();
    dishFd.set('restaurantId', RESTAURANT_ID);
    dishFd.set('categoryId', CATEGORY_A);
    dishFd.set('dishId', DISH_2);
    dishFd.set('direction', 'up');

    const dishRes = await reorderDishAction(dishFd);
    expect(dishRes.status).toBe('success');
    expect(mockRpc).toHaveBeenCalledWith('reorder_dishes', {
      p_restaurant_id: RESTAURANT_ID,
      p_category_id: CATEGORY_A,
      p_ordered_ids: [DISH_2, DISH_1],
    });
  });

  it('redireciona /dashboard/* para /admin/* com 308 e protege /admin excepto login', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: null } });

    const legacy = await updateSession(
      new NextRequest('http://localhost:3000/dashboard/restaurante?tab=tema'),
    );
    expect(legacy.status).toBe(308);
    expect(legacy.headers.get('location')).toBe('http://localhost:3000/admin/restaurante?tab=tema');

    const loginLegacy = await updateSession(new NextRequest('http://localhost:3000/login'));
    expect(loginLegacy.status).toBe(308);
    expect(loginLegacy.headers.get('location')).toBe('http://localhost:3000/admin/login');

    // Rotas retiradas (registo/onboarding) não redirecionam para login — ficam 404 na app.
    const retiredOnboarding = await updateSession(
      new NextRequest('http://localhost:3000/admin/onboarding'),
    );
    expect(retiredOnboarding.status).toBe(200);

    const retiredRegister = await updateSession(
      new NextRequest('http://localhost:3000/admin/registar'),
    );
    expect(retiredRegister.status).toBe(200);

    const protectedAdmin = await updateSession(
      new NextRequest('http://localhost:3000/admin/restaurante'),
    );
    expect(protectedAdmin.status).toBe(307);
    const loginLocation = protectedAdmin.headers.get('location') ?? '';
    expect(loginLocation).toContain('/admin/login');
    expect(loginLocation).toContain('next=%2Fadmin%2Frestaurante');

    const publicLogin = await updateSession(new NextRequest('http://localhost:3000/admin/login'));
    expect(publicLogin.status).toBe(200);

    mockGetClaims.mockResolvedValue({ data: { claims: { sub: USER_ID } } });
    const authedLogin = await updateSession(new NextRequest('http://localhost:3000/admin/login'));
    expect(authedLogin.status).toBe(307);
    expect(authedLogin.headers.get('location')).toBe('http://localhost:3000/admin');
  });
});
