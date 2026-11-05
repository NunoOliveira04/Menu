'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Globe,
  ImagePlus,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  createCategoryAction,
  deleteCategoryAction,
  reorderCategoryAction,
  updateCategoryAction,
} from '@/app/actions/categories';
import {
  createDishAction,
  deleteDishAction,
  reorderDishAction,
  toggleDishAvailabilityAction,
  updateDishAction,
} from '@/app/actions/dishes';
import { INITIAL_ACTION_STATE } from '@/app/actions/types';
import { EU_ALLERGENS, getAllergenDefinition } from '@/lib/modules/allergens';
import { DISH_HIGHLIGHTS, getHighlightLabel } from '@/lib/modules/highlights';
import { parseTranslationsJson } from '@/lib/modules/i18n';
import { DISH_PHOTO_REFRESH_INTERVAL_MS } from '@/lib/storage/dish-photos';
import { formatCentsToEuroInput, formatPriceCents } from '@/lib/utils/price';
import type { CategoryRow, DishRow, RestaurantModules } from '@/types/database';

interface MenuManagerProps {
  restaurantId: string;
  categories: CategoryRow[];
  dishes: DishRow[];
  modules: RestaurantModules;
}

export function MenuManager({ restaurantId, categories, dishes, modules }: MenuManagerProps) {
  const router = useRouter();
  const [showNewCategory, setShowNewCategory] = useState(categories.length === 0);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [addingDishCategoryId, setAddingDishCategoryId] = useState<string | null>(null);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isMutating, startTransition] = useTransition();

  const hasSignedPhotos = dishes.some((dish) =>
    Boolean(dish.photo_url?.includes('/storage/v1/object/sign/dish-photos/')),
  );

  useEffect(() => {
    if (!hasSignedPhotos) {
      return;
    }
    const timer = window.setInterval(() => {
      router.refresh();
    }, DISH_PHOTO_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [hasSignedPhotos, router]);

  function runQuickFormAction(
    action: (fd: FormData) => Promise<{ status: string; message?: string }>,
    fd: FormData,
  ) {
    setFeedbackError(null);
    startTransition(async () => {
      const result = await action(fd);
      if (result.status === 'error' && result.message) {
        setFeedbackError(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-stone-900">Categorias e Pratos</h2>
          <p className="text-sm text-stone-600">
            Organiza as secções do menu, adiciona fotografias e controla os pratos disponíveis.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewCategory((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#8C3B2B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#763123]"
        >
          {showNewCategory ? (
            <>
              <X className="h-4 w-4" aria-hidden="true" />
              Fechar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nova categoria
            </>
          )}
        </button>
      </div>

      {feedbackError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {feedbackError}
        </div>
      )}

      {showNewCategory && (
        <CreateCategoryPanel
          restaurantId={restaurantId}
          languagesEnabled={modules.languages}
          onSuccess={() => setShowNewCategory(false)}
        />
      )}

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <p className="font-serif text-xl font-medium text-stone-800">
            Ainda não tens categorias na ementa
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Começa por criar secções como &ldquo;Entradas&rdquo;, &ldquo;Pratos Principais&rdquo; ou
            &ldquo;Sobremesas&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category, categoryIdx) => {
            const categoryDishes = dishes.filter((d) => d.category_id === category.id);
            const isEditingCategory = editingCategoryId === category.id;
            const isAddingDish = addingDishCategoryId === category.id;
            const catTranslations = parseTranslationsJson(category.translations);

            return (
              <section
                key={category.id}
                aria-label={`Categoria ${category.name}`}
                className="rounded-2xl border border-stone-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 p-5">
                  {isEditingCategory ? (
                    <EditCategoryInlineForm
                      restaurantId={restaurantId}
                      category={category}
                      languagesEnabled={modules.languages}
                      onClose={() => setEditingCategoryId(null)}
                    />
                  ) : (
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-xl font-semibold text-stone-900">
                          {category.name}
                        </h3>
                        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                          {categoryDishes.length} {categoryDishes.length === 1 ? 'prato' : 'pratos'}
                        </span>
                        {modules.languages && catTranslations.en?.name && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] font-medium text-stone-600">
                            <Globe className="h-3 w-3 text-[#8C3B2B]" aria-hidden="true" />
                            EN: {catTranslations.en.name}
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="mt-1 text-sm text-stone-600">{category.description}</p>
                      )}
                    </div>
                  )}

                  {!isEditingCategory && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        disabled={categoryIdx === 0 || isMutating}
                        onClick={() => {
                          const fd = new FormData();
                          fd.set('restaurantId', restaurantId);
                          fd.set('categoryId', category.id);
                          fd.set('direction', 'up');
                          runQuickFormAction(reorderCategoryAction, fd);
                        }}
                        title="Subir categoria"
                        aria-label={`Mover categoria ${category.name} para cima`}
                        className="rounded-lg border border-stone-200 p-1.5 text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        disabled={categoryIdx === categories.length - 1 || isMutating}
                        onClick={() => {
                          const fd = new FormData();
                          fd.set('restaurantId', restaurantId);
                          fd.set('categoryId', category.id);
                          fd.set('direction', 'down');
                          runQuickFormAction(reorderCategoryAction, fd);
                        }}
                        title="Descer categoria"
                        aria-label={`Mover categoria ${category.name} para baixo`}
                        className="rounded-lg border border-stone-200 p-1.5 text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingCategoryId(category.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Editar
                      </button>

                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Eliminar a categoria "${category.name}" e todos os seus pratos?`,
                            )
                          ) {
                            return;
                          }
                          const fd = new FormData();
                          fd.set('restaurantId', restaurantId);
                          fd.set('categoryId', category.id);
                          runQuickFormAction(deleteCategoryAction, fd);
                        }}
                        aria-label={`Eliminar categoria ${category.name}`}
                        className="rounded-lg border border-stone-200 p-1.5 text-red-600 transition hover:border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setAddingDishCategoryId(isAddingDish ? null : category.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#FAF6F0] px-3 py-1.5 text-xs font-semibold text-[#8C3B2B] ring-1 ring-inset ring-[#8C3B2B]/30 transition hover:bg-[#F3ECE1]"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        Adicionar prato
                      </button>
                    </div>
                  )}
                </div>

                {isAddingDish && (
                  <div className="border-b border-stone-100 bg-stone-50/70 p-5">
                    <DishForm
                      mode="create"
                      restaurantId={restaurantId}
                      categories={categories}
                      defaultCategoryId={category.id}
                      modules={modules}
                      onClose={() => setAddingDishCategoryId(null)}
                    />
                  </div>
                )}

                <div className="divide-y divide-stone-100">
                  {categoryDishes.length === 0 ? (
                    <p className="p-5 text-sm text-stone-500">
                      Nenhum prato nesta categoria. Clica em <strong>Adicionar prato</strong> para
                      começar.
                    </p>
                  ) : (
                    categoryDishes.map((dish, dishIdx) => {
                      const isEditingThisDish = editingDishId === dish.id;

                      if (isEditingThisDish) {
                        return (
                          <div key={dish.id} className="bg-stone-50/70 p-5">
                            <DishForm
                              mode="edit"
                              restaurantId={restaurantId}
                              categories={categories}
                              defaultCategoryId={dish.category_id}
                              dish={dish}
                              modules={modules}
                              onClose={() => setEditingDishId(null)}
                            />
                          </div>
                        );
                      }

                      const dishTranslations = parseTranslationsJson(dish.translations);
                      const highlightText = modules.highlights
                        ? getHighlightLabel(dish.highlight, 'pt')
                        : null;

                      return (
                        <div
                          key={dish.id}
                          className={`flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:px-5 ${
                            !dish.available ? 'bg-stone-50/60 opacity-75' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            {dish.photo_url ? (
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                                <Image
                                  src={dish.photo_url}
                                  alt={dish.name}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div
                                aria-hidden="true"
                                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-stone-200 bg-stone-50 text-stone-400"
                              >
                                <ImagePlus className="h-5 w-5" />
                              </div>
                            )}

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-medium text-stone-900">{dish.name}</h4>
                                <span className="text-sm font-semibold tabular-nums text-[#8C3B2B]">
                                  {formatPriceCents(dish.price_cents)}
                                </span>
                                {highlightText && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-950">
                                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                                    {highlightText}
                                  </span>
                                )}
                                {!dish.available && (
                                  <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-medium text-stone-700">
                                    Indisponível
                                  </span>
                                )}
                              </div>

                              {dish.description && (
                                <p className="mt-1 line-clamp-2 max-w-xl text-xs leading-relaxed text-stone-600">
                                  {dish.description}
                                </p>
                              )}

                              {(modules.languages || modules.allergens) && (
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                  {modules.languages && dishTranslations.en?.name && (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] text-stone-600">
                                      <Globe
                                        className="h-3 w-3 text-[#8C3B2B]"
                                        aria-hidden="true"
                                      />
                                      EN: {dishTranslations.en.name}
                                    </span>
                                  )}

                                  {modules.allergens &&
                                    dish.allergens?.map((code) => {
                                      const def = getAllergenDefinition(code);
                                      if (!def) return null;
                                      return (
                                        <span
                                          key={def.code}
                                          className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-[#FAF6F0] px-1.5 py-0.5 text-[10px] font-medium text-stone-700"
                                        >
                                          <strong className="font-mono text-[#8C3B2B]">
                                            {def.number}
                                          </strong>
                                          {def.label.pt}
                                        </span>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                            <button
                              type="button"
                              disabled={dishIdx === 0 || isMutating}
                              onClick={() => {
                                const fd = new FormData();
                                fd.set('restaurantId', restaurantId);
                                fd.set('categoryId', category.id);
                                fd.set('dishId', dish.id);
                                fd.set('direction', 'up');
                                runQuickFormAction(reorderDishAction, fd);
                              }}
                              title="Subir prato"
                              aria-label={`Mover prato ${dish.name} para cima`}
                              className="rounded-lg border border-stone-200 p-1.5 text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>

                            <button
                              type="button"
                              disabled={dishIdx === categoryDishes.length - 1 || isMutating}
                              onClick={() => {
                                const fd = new FormData();
                                fd.set('restaurantId', restaurantId);
                                fd.set('categoryId', category.id);
                                fd.set('dishId', dish.id);
                                fd.set('direction', 'down');
                                runQuickFormAction(reorderDishAction, fd);
                              }}
                              title="Descer prato"
                              aria-label={`Mover prato ${dish.name} para baixo`}
                              className="rounded-lg border border-stone-200 p-1.5 text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>

                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={() => {
                                const fd = new FormData();
                                fd.set('restaurantId', restaurantId);
                                fd.set('dishId', dish.id);
                                fd.set('available', String(!dish.available));
                                runQuickFormAction(toggleDishAvailabilityAction, fd);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                            >
                              {dish.available ? (
                                <>
                                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                                  Esgotar
                                </>
                              ) : (
                                <>
                                  <Eye
                                    className="h-3.5 w-3.5 text-emerald-600"
                                    aria-hidden="true"
                                  />
                                  Ativar
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingDishId(dish.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                              Editar
                            </button>

                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={() => {
                                if (!window.confirm(`Eliminar o prato "${dish.name}"?`)) {
                                  return;
                                }
                                const fd = new FormData();
                                fd.set('restaurantId', restaurantId);
                                fd.set('dishId', dish.id);
                                runQuickFormAction(deleteDishAction, fd);
                              }}
                              aria-label={`Eliminar prato ${dish.name}`}
                              className="rounded-lg border border-stone-200 p-1.5 text-red-600 transition hover:border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreateCategoryPanel({
  restaurantId,
  languagesEnabled,
  onSuccess,
}: {
  restaurantId: string;
  languagesEnabled: boolean;
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState(createCategoryAction, INITIAL_ACTION_STATE);

  useEffect(() => {
    if (state.status === 'success') {
      onSuccess();
    }
  }, [state.status, onSuccess]);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-[#DFD3C3] bg-[#FAF6F0] p-5 shadow-sm"
    >
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <h3 className="font-serif text-lg font-semibold text-stone-900">Nova Categoria</h3>

      {state.status === 'error' && state.message && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {state.message}
        </p>
      )}

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="new-cat-name" className="block text-xs font-medium text-stone-700">
            Nome da categoria (PT) *
          </label>
          <input
            id="new-cat-name"
            name="name"
            type="text"
            required
            placeholder="Ex.: Entradas, Peixe, Sobremesas"
            className="mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none"
          />
          {state.fieldErrors?.name?.[0] && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="new-cat-desc" className="block text-xs font-medium text-stone-700">
            Nota opcional (PT)
          </label>
          <input
            id="new-cat-desc"
            name="description"
            type="text"
            placeholder="Ex.: Servidas com pão regional"
            className="mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none"
          />
        </div>

        {languagesEnabled && (
          <>
            <div>
              <label htmlFor="new-cat-name-en" className="block text-xs font-medium text-stone-700">
                Nome em Inglês (EN)
              </label>
              <input
                id="new-cat-name-en"
                name="nameEn"
                type="text"
                placeholder="Ex.: Starters & Tapas"
                className="mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="new-cat-desc-en" className="block text-xs font-medium text-stone-700">
                Nota opcional em Inglês (EN)
              </label>
              <input
                id="new-cat-desc-en"
                name="descriptionEn"
                type="text"
                placeholder="Ex.: Served with homemade cornbread"
                className="mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none"
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[#8C3B2B] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#763123] disabled:opacity-60"
        >
          {isPending ? 'A guardar...' : 'Guardar categoria'}
        </button>
      </div>
    </form>
  );
}

function EditCategoryInlineForm({
  restaurantId,
  category,
  languagesEnabled,
  onClose,
}: {
  restaurantId: string;
  category: CategoryRow;
  languagesEnabled: boolean;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(updateCategoryAction, INITIAL_ACTION_STATE);
  const existingTranslations = parseTranslationsJson(category.translations);

  useEffect(() => {
    if (state.status === 'success') {
      onClose();
    }
  }, [state.status, onClose]);

  return (
    <form action={formAction} className="w-full space-y-3">
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <input type="hidden" name="categoryId" value={category.id} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-stone-700">Nome da categoria (PT)</label>
          <input
            name="name"
            type="text"
            required
            defaultValue={category.name}
            className="mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
          />
          {state.fieldErrors?.name?.[0] && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-700">
            Descrição opcional (PT)
          </label>
          <input
            name="description"
            type="text"
            defaultValue={category.description ?? ''}
            className="mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
          />
        </div>

        {languagesEnabled && (
          <>
            <div>
              <label className="block text-xs font-medium text-stone-700">
                Nome em Inglês (EN)
              </label>
              <input
                name="nameEn"
                type="text"
                defaultValue={existingTranslations.en?.name ?? ''}
                placeholder="Ex.: Starters"
                className="mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700">
                Descrição opcional em Inglês (EN)
              </label>
              <input
                name="descriptionEn"
                type="text"
                defaultValue={existingTranslations.en?.description ?? ''}
                placeholder="Ex.: To share at the table"
                className="mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#8C3B2B] px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
        >
          {isPending ? 'A guardar...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

function DishForm({
  mode,
  restaurantId,
  categories,
  defaultCategoryId,
  dish,
  modules,
  onClose,
}: {
  mode: 'create' | 'edit';
  restaurantId: string;
  categories: CategoryRow[];
  defaultCategoryId: string;
  dish?: DishRow;
  modules: RestaurantModules;
  onClose: () => void;
}) {
  const actionFn = mode === 'create' ? createDishAction : updateDishAction;
  const [state, formAction, isPending] = useActionState(actionFn, INITIAL_ACTION_STATE);
  const existingTranslations = parseTranslationsJson(dish?.translations);
  const selectedAllergens = new Set(dish?.allergens ?? []);

  useEffect(() => {
    if (state.status === 'success') {
      onClose();
    }
  }, [state.status, onClose]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="restaurantId" value={restaurantId} />
      {dish && <input type="hidden" name="dishId" value={dish.id} />}

      <div className="flex items-center justify-between">
        <h4 className="font-serif text-lg font-semibold text-stone-900">
          {mode === 'create' ? 'Novo prato' : `Editar "${dish?.name}"`}
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-stone-500 hover:text-stone-900"
        >
          Cancelar
        </button>
      </div>

      {state.status === 'error' && state.message && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800"
        >
          {state.message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-stone-700">Nome do prato (PT) *</label>
          <input
            name="name"
            type="text"
            required
            defaultValue={dish?.name ?? ''}
            placeholder="Ex.: Bacalhau Assado com Broa"
            className="mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none"
          />
          {state.fieldErrors?.name?.[0] && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700">Preço (€) *</label>
          <input
            name="price"
            type="text"
            inputMode="decimal"
            required
            defaultValue={dish ? formatCentsToEuroInput(dish.price_cents) : ''}
            placeholder="14,50"
            className="mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none"
          />
          {state.fieldErrors?.priceCents?.[0] && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.priceCents[0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-stone-700">Categoria</label>
          <select
            name="categoryId"
            defaultValue={defaultCategoryId}
            className="mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700">
            Fotografia (JPEG, PNG, WebP ou AVIF · máx. 5 MB)
          </label>
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="mt-1 block w-full text-xs text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#F3ECE1] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#8C3B2B] hover:file:bg-[#E7DDD0]"
          />
          {state.fieldErrors?.photo?.[0] && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.photo[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-700">
          Descrição / Ingredientes (PT)
        </label>
        <textarea
          name="description"
          rows={2}
          defaultValue={dish?.description ?? ''}
          placeholder="Ex.: Lombo de bacalhau com crosta de broa de milho, grelos e batata a murro."
          className="mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none"
        />
        {state.fieldErrors?.description?.[0] && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.description[0]}</p>
        )}
      </div>

      {modules.languages && (
        <div className="rounded-xl border border-[#DFD3C3] bg-[#FAF6F0]/80 p-4 space-y-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[#8C3B2B]">
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
            Tradução em Inglês (EN)
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-stone-700">Nome do prato (EN)</label>
              <input
                name="nameEn"
                type="text"
                defaultValue={existingTranslations.en?.name ?? ''}
                placeholder="Ex.: Roasted Cod with Cornbread Crust"
                className="mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700">
                Descrição / Ingredientes (EN)
              </label>
              <input
                name="descriptionEn"
                type="text"
                defaultValue={existingTranslations.en?.description ?? ''}
                placeholder="Ex.: Thick cod loin baked with cornbread, turnip greens and punched potatoes."
                className="mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {modules.highlights && (
        <div>
          <label className="block text-xs font-medium text-stone-700">
            Selo de Destaque (opcional)
          </label>
          <select
            name="highlight"
            defaultValue={dish?.highlight ?? ''}
            className="mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none sm:max-w-xs"
          >
            <option value="">Sem selo especial</option>
            {DISH_HIGHLIGHTS.map((h) => (
              <option key={h.code} value={h.code}>
                {h.label.pt}
              </option>
            ))}
          </select>
        </div>
      )}

      {modules.allergens && (
        <fieldset className="rounded-xl border border-stone-200 bg-white p-4">
          <legend className="px-1 text-xs font-semibold text-stone-800">
            Alergénios presentes neste prato (14 da UE)
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {EU_ALLERGENS.map((allergen) => (
              <label
                key={allergen.code}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-50 has-[:checked]:border-[#8C3B2B]/50 has-[:checked]:bg-[#FAF6F0]"
              >
                <input
                  type="checkbox"
                  name="allergens"
                  value={allergen.code}
                  defaultChecked={selectedAllergens.has(allergen.code)}
                  className="h-3.5 w-3.5 rounded border-stone-300 text-[#8C3B2B] focus:ring-[#8C3B2B]"
                />
                <span>
                  <strong className="font-mono text-[#8C3B2B]">{allergen.number}.</strong>{' '}
                  {allergen.label.pt}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-stone-800">
            <input
              type="checkbox"
              name="available"
              defaultChecked={dish ? dish.available : true}
              className="h-4 w-4 rounded border-stone-300 text-[#8C3B2B] focus:ring-[#8C3B2B]"
            />
            Disponível para servir
          </label>

          {mode === 'edit' && dish?.photo_url && (
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-red-700">
              <input
                type="checkbox"
                name="removePhoto"
                className="h-4 w-4 rounded border-stone-300 text-red-600 focus:ring-red-600"
              />
              Remover fotografia atual
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[#8C3B2B] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#763123] disabled:opacity-60"
        >
          {isPending
            ? 'A guardar...'
            : mode === 'create'
              ? 'Adicionar prato'
              : 'Guardar alterações'}
        </button>
      </div>
    </form>
  );
}
