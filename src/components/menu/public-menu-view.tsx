import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AllergenSheetButton } from '@/components/menu/allergen-sheet';
import { CategoryNav } from '@/components/menu/category-nav';
import { CategorySeparator } from '@/components/menu/category-separator';
import { getAllergenDefinition } from '@/lib/modules/allergens';
import {
  formatDaySlots,
  WEEKDAY_LABELS,
  evaluateLisbonOpenStatus,
  type DaySchedule,
} from '@/lib/modules/hours';
import { MENU_UI_STRINGS, localeToHtmlLang, resolveLocalizedField } from '@/lib/modules/i18n';
import { showsHouseBadge } from '@/lib/menu/hero';
import { resolveMenuTheme } from '@/lib/themes/registry';
import { formatPriceCents } from '@/lib/utils/price';
import type {
  CategoryRow,
  DishRow,
  MenuLocale,
  RestaurantModules,
  RestaurantRow,
} from '@/types/database';

interface PublicMenuViewProps {
  restaurant: RestaurantRow;
  categories: CategoryRow[];
  dishes: DishRow[];
  /** URL público da foto de capa escolhida pelo dono; null = cabeçalho tipográfico. */
  coverPhotoUrl?: string | null;
  modules: RestaurantModules;
  locale: MenuLocale;
  weeklySchedule: DaySchedule[];
  isDraftPreview?: boolean;
  now?: Date;
}

export function PublicMenuView({
  restaurant,
  categories,
  dishes,
  coverPhotoUrl = null,
  modules,
  locale,
  weeklySchedule,
  isDraftPreview = false,
  now,
}: PublicMenuViewProps) {
  const effectiveLocale: MenuLocale = modules.languages ? locale : 'pt';
  const ui = MENU_UI_STRINGS[effectiveLocale];
  const theme = resolveMenuTheme(restaurant.style);

  const localizedRestaurantDescription = resolveLocalizedField(
    restaurant.description,
    modules.languages ? restaurant.translations : null,
    'description',
    effectiveLocale,
  );

  const categoriesWithDishes = categories
    .map((category) => ({
      category,
      localizedName:
        resolveLocalizedField(
          category.name,
          modules.languages ? category.translations : null,
          'name',
          effectiveLocale,
        ) ?? category.name,
      localizedDescription: resolveLocalizedField(
        category.description,
        modules.languages ? category.translations : null,
        'description',
        effectiveLocale,
      ),
      items: dishes.filter((dish) => dish.category_id === category.id),
    }))
    .filter((group) => group.items.length > 0);

  const openStatus = modules.hours ? evaluateLisbonOpenStatus(weeklySchedule, now) : null;
  const todaySchedule = openStatus
    ? weeklySchedule.find((day) => day.dayOfWeek === openStatus.currentDayOfWeek)
    : undefined;
  const todayHours = todaySchedule ? formatDaySlots(todaySchedule, ui.closedDayLabel) : null;

  return (
    <div
      lang={localeToHtmlLang(effectiveLocale)}
      className="menu-theme"
      style={theme.cssVars as CSSProperties}
      data-theme={theme.id}
    >
      <a href="#ementa-conteudo" className="menu-skip">
        {ui.skipToMenu}
      </a>

      {isDraftPreview && (
        <div role="status" className="menu-draft">
          {ui.draftBanner}
        </div>
      )}

      <header
        className={[
          'menu-hero',
          coverPhotoUrl ? 'menu-hero-photo' : 'menu-hero-plain',
          modules.languages ? 'menu-hero-with-lang' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {coverPhotoUrl && (
          <>
            <Image
              src={coverPhotoUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="menu-hero-img"
            />
            <div className="menu-hero-scrim" aria-hidden="true" />
          </>
        )}

        {modules.languages && (
          <nav aria-label={ui.languageSelectorLabel} className="menu-lang">
            <Link
              href={`/r/${restaurant.slug}`}
              hrefLang="pt-PT"
              lang="pt-PT"
              aria-current={effectiveLocale === 'pt' ? 'page' : undefined}
            >
              PT
            </Link>
            <Link
              href={`/r/${restaurant.slug}?lang=en`}
              hrefLang="en"
              lang="en"
              aria-current={effectiveLocale === 'en' ? 'page' : undefined}
            >
              EN
            </Link>
          </nav>
        )}

        <div className="menu-hero-content">
          <h1 className="menu-hero-title">{restaurant.name}</h1>
          {localizedRestaurantDescription && (
            <p className="menu-hero-description">{localizedRestaurantDescription}</p>
          )}
          {(restaurant.location || openStatus) && (
            <p className="menu-hero-meta">
              {restaurant.location && <span>{restaurant.location}</span>}
              {restaurant.location && openStatus && (
                <span className="menu-hero-dot" aria-hidden="true">
                  ·
                </span>
              )}
              {openStatus && (
                <a href="#horario-funcionamento" className="menu-hero-meta-link">
                  {openStatus.isOpen ? ui.openNowBadge : ui.closedNowBadge}
                </a>
              )}
              {todayHours && (
                <>
                  <span className="menu-hero-dot" aria-hidden="true">
                    ·
                  </span>
                  <span>{todayHours}</span>
                </>
              )}
            </p>
          )}
        </div>
      </header>

      <CategoryNav
        label={ui.categoriesNavLabel}
        items={categoriesWithDishes.map(({ category, localizedName }) => ({
          id: category.id,
          name: localizedName,
        }))}
      />

      <main id="ementa-conteudo" className="menu-main">
        {categoriesWithDishes.length === 0 ? (
          <div className="menu-empty">
            <p className="menu-empty-title">{ui.emptyMenuTitle}</p>
            <p>{ui.emptyMenuSubtitle}</p>
          </div>
        ) : (
          categoriesWithDishes.map(({ category, localizedName, localizedDescription, items }) => (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              aria-labelledby={`heading-${category.id}`}
              className="menu-section"
            >
              <h2 id={`heading-${category.id}`} className="menu-section-title">
                {localizedName}
              </h2>
              {localizedDescription && <p className="menu-section-desc">{localizedDescription}</p>}
              <CategorySeparator ornament={theme.ornament} />

              <div className="menu-sheet">
                <ul className="menu-dish-list">
                  {items.map((dish) => {
                    const dishName =
                      resolveLocalizedField(
                        dish.name,
                        modules.languages ? dish.translations : null,
                        'name',
                        effectiveLocale,
                      ) ?? dish.name;
                    const dishDescription = resolveLocalizedField(
                      dish.description,
                      modules.languages ? dish.translations : null,
                      'description',
                      effectiveLocale,
                    );
                    const houseBadge = showsHouseBadge(dish.highlight, modules.highlights);
                    const dishAllergens = modules.allergens
                      ? (dish.allergens ?? [])
                          .map((code) => getAllergenDefinition(code))
                          .filter(
                            (definition): definition is NonNullable<typeof definition> =>
                              definition !== null,
                          )
                          .map((definition) => ({
                            code: definition.code,
                            number: definition.number,
                            shortCode: definition.shortCode,
                            label: definition.label[effectiveLocale],
                          }))
                      : [];

                    return (
                      <li key={dish.id}>
                        <article
                          className={`menu-dish${dish.available ? '' : ' menu-dish-unavailable'}`}
                        >
                          {dish.photo_url && (
                            <div className="menu-thumb">
                              <Image
                                src={dish.photo_url}
                                alt={`${ui.photoAltPrefix} ${dishName}`}
                                width={72}
                                height={72}
                                sizes="72px"
                                className="menu-thumb-img"
                              />
                            </div>
                          )}

                          <div className="menu-dish-copy">
                            {houseBadge && <span className="menu-house">{ui.houseBadge}</span>}
                            <div className="menu-dish-line">
                              <h3 className="menu-dish-name">{dishName}</h3>
                              <p
                                className="menu-price"
                                aria-label={`${ui.priceAriaPrefix}: ${formatPriceCents(dish.price_cents)}`}
                              >
                                {formatPriceCents(dish.price_cents)}
                              </p>
                            </div>
                            {dishDescription && <p className="menu-desc">{dishDescription}</p>}
                            {(dishAllergens.length > 0 || !dish.available) && (
                              <div className="menu-dish-actions">
                                {dishAllergens.length > 0 && (
                                  <AllergenSheetButton
                                    dishName={dishName}
                                    allergens={dishAllergens}
                                    buttonLabel={ui.allergensButton}
                                    sheetTitle={ui.allergensLegendTitle}
                                    note={ui.allergensLegendNote}
                                    closeLabel={ui.allergensClose}
                                  />
                                )}
                                {!dish.available && (
                                  <span className="menu-unavailable">{ui.unavailableBadge}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          ))
        )}

        {modules.hours && openStatus && (
          <section
            id="horario-funcionamento"
            aria-labelledby="heading-horario"
            className="menu-info"
          >
            <div className="menu-info-head">
              <h2 id="heading-horario" className="menu-info-title">
                {ui.hoursTitle}
              </h2>
              <span className={openStatus.isOpen ? 'menu-status-open' : 'menu-status-closed'}>
                {openStatus.isOpen ? ui.openNowBadge : ui.closedNowBadge}
              </span>
            </div>
            <dl className="menu-hours">
              {weeklySchedule.map((day) => {
                const isToday = day.dayOfWeek === openStatus.currentDayOfWeek;
                const dayLabel = WEEKDAY_LABELS[effectiveLocale][day.dayOfWeek] ?? '';
                return (
                  <div
                    key={day.dayOfWeek}
                    className={isToday ? 'menu-hours-row menu-hours-today' : 'menu-hours-row'}
                  >
                    <dt>{dayLabel}</dt>
                    <dd>{formatDaySlots(day, ui.closedDayLabel)}</dd>
                  </div>
                );
              })}
            </dl>
            <p className="menu-note">{ui.timezoneNote}</p>
          </section>
        )}
      </main>

      <footer className="menu-footer">
        <p>{ui.vatIncluded}</p>
        <p>{restaurant.name}</p>
      </footer>
    </div>
  );
}
