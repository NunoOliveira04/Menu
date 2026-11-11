import type { CSSProperties } from 'react';
import Image from 'next/image';
import { Sparkles, Star, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { AllergenSheetButton } from '@/components/menu/allergen-sheet';
import { CategoryNav } from '@/components/menu/category-nav';
import { CategorySeparator } from '@/components/menu/category-separator';
import { DishPhoto } from '@/components/menu/dish-photo';
import { getAllergenDefinition } from '@/lib/modules/allergens';
import {
  formatDaySlots,
  WEEKDAY_LABELS,
  evaluateLisbonOpenStatus,
  type DaySchedule,
} from '@/lib/modules/hours';
import { MENU_UI_STRINGS, localeToHtmlLang, resolveLocalizedField } from '@/lib/modules/i18n';
import { buildCategoryAnchors } from '@/lib/menu/anchors';
import { dishBadge, restaurantInitials, type DishBadgeCode } from '@/lib/menu/hero';
import { MENU_BACKGROUNDS, menuCssVars, parseMenuAppearance } from '@/lib/themes/backgrounds';
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
  /** URL público do logotipo; null = iniciais do nome. */
  logoUrl?: string | null;
  modules: RestaurantModules;
  locale: MenuLocale;
  weeklySchedule: DaySchedule[];
  isDraftPreview?: boolean;
  now?: Date;
}

/** Ícone de cada selo. */
function DishBadgeIcon({ code }: { code: DishBadgeCode }) {
  const Icon = code === 'featured' ? Star : code === 'recommended' ? ThumbsUp : Sparkles;
  return <Icon className="menu-badge-icon" aria-hidden="true" />;
}

export function PublicMenuView({
  restaurant,
  categories,
  dishes,
  logoUrl = null,
  modules,
  locale,
  weeklySchedule,
  isDraftPreview = false,
  now,
}: PublicMenuViewProps) {
  const effectiveLocale: MenuLocale = modules.languages ? locale : 'pt';
  const ui = MENU_UI_STRINGS[effectiveLocale];
  const appearance = parseMenuAppearance(restaurant.settings, restaurant.style);
  const background = MENU_BACKGROUNDS[appearance.background];
  const themeStyle = menuCssVars(appearance.background, appearance.accent) as CSSProperties;

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

  const categoryAnchors = buildCategoryAnchors(
    categoriesWithDishes.map(({ category, localizedName }) => ({
      id: category.id,
      name: localizedName,
    })),
  );

  const openStatus = modules.hours ? evaluateLisbonOpenStatus(weeklySchedule, now) : null;

  return (
    <div
      lang={localeToHtmlLang(effectiveLocale)}
      className="menu-theme"
      style={themeStyle}
      data-background={background.id}
      data-accent={appearance.accent}
      data-layout={appearance.layout}
      data-page={background.pageDark ? 'dark' : 'light'}
      data-cards={background.cardDark ? 'dark' : 'light'}
    >
      <a href="#ementa-conteudo" className="menu-skip">
        {ui.skipToMenu}
      </a>

      {isDraftPreview && (
        <div role="status" className="menu-draft">
          {ui.draftBanner}
        </div>
      )}

      <header className="menu-header">
        {modules.languages && (
          <nav aria-label={ui.languageSelectorLabel} className="menu-lang">
            <Link
              href={`/${restaurant.slug}`}
              hrefLang="pt-PT"
              lang="pt-PT"
              aria-current={effectiveLocale === 'pt' ? 'page' : undefined}
            >
              PT
            </Link>
            <Link
              href={`/${restaurant.slug}?lang=en`}
              hrefLang="en"
              lang="en"
              aria-current={effectiveLocale === 'en' ? 'page' : undefined}
            >
              EN
            </Link>
          </nav>
        )}

        <div className="menu-header-inner">
          <div className="menu-logo">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${restaurant.name} — ${ui.logoAltSuffix}`}
                width={96}
                height={96}
                sizes="96px"
                priority
                className="menu-logo-img"
              />
            ) : (
              <span className="menu-logo-initials" aria-hidden="true">
                {restaurantInitials(restaurant.name)}
              </span>
            )}
          </div>
          <h1 className="menu-header-title">{restaurant.name}</h1>
          {localizedRestaurantDescription && (
            <p className="menu-header-description">{localizedRestaurantDescription}</p>
          )}
        </div>
      </header>

      <CategoryNav
        label={ui.categoriesNavLabel}
        items={categoriesWithDishes.map(({ category, localizedName }) => ({
          anchor: categoryAnchors.get(category.id) ?? category.id,
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
              id={categoryAnchors.get(category.id) ?? category.id}
              aria-labelledby={`heading-${category.id}`}
              className="menu-section"
            >
              <h2 id={`heading-${category.id}`} className="menu-section-title">
                {localizedName}
              </h2>
              {localizedDescription && <p className="menu-section-desc">{localizedDescription}</p>}
              <CategorySeparator ornament="none" />

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
                    const badge = dishBadge(dish.highlight, modules.highlights);
                    const badgeLabel =
                      badge === 'featured'
                        ? ui.houseBadge
                        : badge === 'recommended'
                          ? ui.recommendedBadge
                          : badge === 'new'
                            ? ui.newBadge
                            : null;
                    const badgeNode = badge && badgeLabel && (
                      <span className={`menu-badge menu-badge-${badge}`}>
                        <DishBadgeIcon code={badge} />
                        {badgeLabel}
                      </span>
                    );
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
                            <div className="menu-media">
                              <DishPhoto
                                src={dish.photo_url}
                                alt={`${ui.photoAltPrefix} ${dishName}`}
                                dishName={dishName}
                                openLabel={ui.photoOpenLabel}
                                closeLabel={ui.allergensClose}
                              />
                              {badgeNode}
                            </div>
                          )}

                          <div className="menu-dish-copy">
                            {badgeNode && (
                              <span
                                className={
                                  dish.photo_url
                                    ? 'menu-badge-row menu-badge-row-photo'
                                    : 'menu-badge-row'
                                }
                              >
                                {badgeNode}
                              </span>
                            )}
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
