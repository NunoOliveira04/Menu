import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRedirect = vi.fn((url: string): never => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

const mockRevalidatePath = vi.fn();

const mockSignUp = vi.fn();
const mockRpc = vi.fn();
const mockStorageUpload = vi.fn();
const mockStorageRemove = vi.fn();
const mockGetUser = vi.fn();
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
      signUp: mockSignUp,
      getUser: mockGetUser,
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

import { registerOwnerAction } from '@/app/actions/auth';
import { reorderCategoryAction } from '@/app/actions/categories';
import { createDishAction, reorderDishAction } from '@/app/actions/dishes';
import { updateRestaurantAction } from '@/app/actions/restaurant';
import { INITIAL_ACTION_STATE } from '@/app/actions/types';

const RESTAURANT_ID = '11111111-1111-4111-8111-111111111111';
const CATEGORY_A = '22222222-2222-4222-8222-222222222201';
const CATEGORY_B = '22222222-2222-4222-8222-222222222202';
const DISH_1 = '33333333-3333-4333-8333-333333333301';
const DISH_2 = '33333333-3333-4333-8333-333333333302';
const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('Server Actions — Registo, Permissões Owner, Magic Bytes e Reordenação Transacional', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registerOwnerAction devolve erro sem redirect quando create_owner_restaurant falha após retry 23505', async () => {
    mockSignUp.mockResolvedValue({
      data: { session: { access_token: 'tok' }, user: { id: USER_ID } },
      error: null,
    });
    mockRpc
      .mockResolvedValueOnce({ data: null, error: { code: '23505', message: 'duplicate slug' } })
      .mockResolvedValueOnce({ data: null, error: { code: '23505', message: 'duplicate slug 2' } });

    const fd = new FormData();
    fd.set('email', 'dono@tasca.pt');
    fd.set('password', 'segredo1234');
    fd.set('restaurantName', 'Tasca do Castelo');

    const result = await registerOwnerAction(INITIAL_ACTION_STATE, fd);

    expect(mockRpc).toHaveBeenCalledTimes(2);
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result.status).toBe('error');
  });

  it('registerOwnerAction faz redirect para /dashboard apenas quando create_owner_restaurant sucede', async () => {
    mockSignUp.mockResolvedValue({
      data: { session: { access_token: 'tok' }, user: { id: USER_ID } },
      error: null,
    });
    mockRpc
      .mockResolvedValueOnce({ data: null, error: { code: '23505', message: 'duplicate slug' } })
      .mockResolvedValueOnce({ data: { id: RESTAURANT_ID }, error: null });

    const fd = new FormData();
    fd.set('email', 'dono@tasca.pt');
    fd.set('password', 'segredo1234');
    fd.set('restaurantName', 'Tasca do Castelo');

    await expect(registerOwnerAction(INITIAL_ACTION_STATE, fd)).rejects.toThrow(
      'NEXT_REDIRECT:/dashboard',
    );
    expect(mockRpc).toHaveBeenCalledTimes(2);
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
                data: { id: RESTAURANT_ID, slug: 'tasca-do-castelo', published: false },
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
    fd.set('name', 'Tasca do Castelo');
    fd.set('slug', 'novo-slug-proibido');
    fd.set('published', 'on');
    fd.set('style', 'classico');

    const result = await updateRestaurantAction(INITIAL_ACTION_STATE, fd);

    expect(result.status).toBe('error');
    expect(result.message).toContain('proprietário');
    expect(mockUpdate).not.toHaveBeenCalled();
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
              maybeSingle: async () => ({ data: { slug: 'tasca-do-castelo' }, error: null }),
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
});
