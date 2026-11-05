import Image from 'next/image';
import { MapPin, Utensils } from 'lucide-react';
import { resolveMenuTheme } from '@/lib/themes/registry';
import { formatPriceCents } from '@/lib/utils/price';
import type { CategoryRow, DishRow, RestaurantRow } from '@/types/database';

interface PublicMenuViewProps {
  restaurant: RestaurantRow;
  categories: CategoryRow[];
  dishes: DishRow[];
  isDraftPreview?: boolean;
}

export function PublicMenuView({
  restaurant,
  categories,
  dishes,
  isDraftPreview = false,
}: PublicMenuViewProps) {
  const theme = resolveMenuTheme(restaurant.style);
  const categoriesWithDishes = categories
    .map((category) => ({
      category,
      items: dishes.filter((dish) => dish.category_id === category.id),
    }))
    .filter((group) => group.items.length > 0);

  let firstPhotoAssigned = false;

  return (
    <div className={theme.classes.pageWrapper}>
      <a
        href="#ementa-conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-[#8C3B2B] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Saltar para a ementa
      </a>

      {isDraftPreview && (
        <div
          role="status"
          className="border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-950"
        >
          Pré-visualização de rascunho — apenas visível para membros do restaurante. Ativa a
          publicação no painel para abrir ao público.
        </div>
      )}

      <header className={theme.classes.headerSurface}>
        <div className="mx-auto max-w-2xl px-4 py-10 text-center sm:px-6 sm:py-14">
          <div className="mx-auto mb-3 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-current opacity-25" aria-hidden="true" />
            <Utensils className={`h-4 w-4 ${theme.classes.headerOrnament}`} aria-hidden="true" />
            <span className="h-px w-8 bg-current opacity-25" aria-hidden="true" />
          </div>

          <h1 className={theme.classes.restaurantTitle}>{restaurant.name}</h1>

          {restaurant.description && (
            <p className={`mx-auto mt-3 max-w-xl ${theme.classes.restaurantSubtitle}`}>
              {restaurant.description}
            </p>
          )}

          {restaurant.location && (
            <div className="mt-4">
              <span className={theme.classes.locationBadge}>
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {restaurant.location}
              </span>
            </div>
          )}
        </div>
      </header>

      {categoriesWithDishes.length > 1 && (
        <nav aria-label="Categorias da ementa" className={theme.classes.navStickyBar}>
          <div className="no-scrollbar mx-auto flex max-w-2xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6">
            {categoriesWithDishes.map(({ category }) => (
              <a key={category.id} href={`#cat-${category.id}`} className={theme.classes.navPill}>
                {category.name}
              </a>
            ))}
          </div>
        </nav>
      )}

      <main
        id="ementa-conteudo"
        className="mx-auto max-w-2xl space-y-12 px-4 py-8 sm:px-6 sm:py-12"
      >
        {categoriesWithDishes.length === 0 ? (
          <div className="rounded-2xl border border-current/10 p-10 text-center opacity-75">
            <p className="font-serif text-xl">A nossa ementa está a ser preparada.</p>
            <p className="mt-1 text-sm">Volta a consultar dentro de momentos.</p>
          </div>
        ) : (
          categoriesWithDishes.map(({ category, items }) => (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              aria-labelledby={`heading-${category.id}`}
              className="scroll-mt-20"
            >
              <div className="mb-5">
                <h2 id={`heading-${category.id}`} className={theme.classes.sectionHeading}>
                  {category.name}
                </h2>
                {category.description && (
                  <p className={theme.classes.sectionDescription}>{category.description}</p>
                )}
                <div className={theme.classes.sectionDivider} aria-hidden="true" />
              </div>

              <ul className="space-y-3.5" role="list">
                {items.map((dish) => {
                  const isLcpCandidate = Boolean(dish.photo_url) && !firstPhotoAssigned;
                  if (isLcpCandidate) {
                    firstPhotoAssigned = true;
                  }

                  return (
                    <li key={dish.id}>
                      <article
                        className={`${theme.classes.dishCard} ${
                          !dish.available ? theme.classes.dishCardUnavailable : ''
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <h3 className={theme.classes.dishTitle}>{dish.name}</h3>
                            <span
                              className={`shrink-0 ${theme.classes.dishPrice}`}
                              aria-label={`Preço: ${formatPriceCents(dish.price_cents)}`}
                            >
                              {formatPriceCents(dish.price_cents)}
                            </span>
                          </div>

                          {dish.description && (
                            <p className={theme.classes.dishDescription}>{dish.description}</p>
                          )}

                          {!dish.available && (
                            <div className="mt-2">
                              <span className={theme.classes.unavailableBadge}>
                                Temporariamente indisponível
                              </span>
                            </div>
                          )}
                        </div>

                        {dish.photo_url && (
                          <div className={theme.classes.photoFrame}>
                            <Image
                              src={dish.photo_url}
                              alt={`Fotografia de ${dish.name}`}
                              fill
                              priority={isLcpCandidate}
                              sizes="(max-width: 640px) 96px, 112px"
                              className="object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          </div>
                        )}
                      </article>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </main>

      <footer className={theme.classes.footer}>
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-2 px-4 py-6 text-center sm:flex-row sm:px-6">
          <p>IVA incluído à taxa legal em vigor.</p>
          <p className="font-medium opacity-80">{restaurant.name}</p>
        </div>
      </footer>
    </div>
  );
}
