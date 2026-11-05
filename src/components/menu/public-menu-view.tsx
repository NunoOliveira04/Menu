import Image from 'next/image';
import Link from 'next/link';
import { Clock, Globe, MapPin, ShieldAlert, Sparkles, Utensils } from 'lucide-react';
import { SignedUrlRefresher } from '@/components/menu/signed-url-refresher';
import { EU_ALLERGENS, getAllergenDefinition } from '@/lib/modules/allergens';
import { getHighlightLabel } from '@/lib/modules/highlights';
import {
  WEEKDAY_LABELS,
  evaluateLisbonOpenStatus,
  formatDaySlots,
  type DaySchedule,
} from '@/lib/modules/hours';
import { MENU_UI_STRINGS, localeToHtmlLang, resolveLocalizedField } from '@/lib/modules/i18n';
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

  const highlightedDishes = modules.highlights
    ? dishes.filter((dish) => dish.available && Boolean(dish.highlight))
    : [];

  const presentAllergenCodes = modules.allergens
    ? new Set(dishes.flatMap((dish) => dish.allergens ?? []))
    : new Set<string>();

  const legendAllergens = modules.allergens
    ? EU_ALLERGENS.filter((def) => presentAllergenCodes.has(def.code))
    : [];

  const openStatus = modules.hours ? evaluateLisbonOpenStatus(weeklySchedule, now) : null;

  const hasPrivateStorageSignedPhotos = dishes.some((d) =>
    Boolean(d.photo_url?.includes('/storage/v1/object/sign/dish-photos/')),
  );

  let firstPhotoAssigned = false;

  return (
    <div lang={localeToHtmlLang(effectiveLocale)} className={theme.classes.pageWrapper}>
      <SignedUrlRefresher hasSignedPhotos={hasPrivateStorageSignedPhotos} />

      <a href="#ementa-conteudo" className={theme.classes.skipLink}>
        {ui.skipToMenu}
      </a>

      {isDraftPreview && (
        <div
          role="status"
          className="border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-950"
        >
          {ui.draftBanner}
        </div>
      )}

      <header className={theme.classes.headerSurface}>
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
          {modules.languages && (
            <div className="mb-6 flex justify-end">
              <nav
                aria-label={ui.languageSelectorLabel}
                className={theme.classes.langSwitcherContainer}
              >
                <Link
                  href={`/r/${restaurant.slug}`}
                  hrefLang="pt-PT"
                  lang="pt-PT"
                  aria-current={effectiveLocale === 'pt' ? 'page' : undefined}
                  className={`${theme.classes.langOption} ${
                    effectiveLocale === 'pt' ? theme.classes.langOptionActive : ''
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <Globe className="h-3 w-3" aria-hidden="true" />
                    PT
                  </span>
                </Link>
                <Link
                  href={`/r/${restaurant.slug}?lang=en`}
                  hrefLang="en"
                  lang="en"
                  aria-current={effectiveLocale === 'en' ? 'page' : undefined}
                  className={`${theme.classes.langOption} ${
                    effectiveLocale === 'en' ? theme.classes.langOptionActive : ''
                  }`}
                >
                  EN
                </Link>
              </nav>
            </div>
          )}

          <div className="text-center">
            <div className="mx-auto mb-3 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-current opacity-25" aria-hidden="true" />
              <Utensils className={`h-4 w-4 ${theme.classes.headerOrnament}`} aria-hidden="true" />
              <span className="h-px w-8 bg-current opacity-25" aria-hidden="true" />
            </div>

            <h1 className={theme.classes.restaurantTitle}>{restaurant.name}</h1>

            {localizedRestaurantDescription && (
              <p className={`mx-auto mt-3 max-w-xl ${theme.classes.restaurantSubtitle}`}>
                {localizedRestaurantDescription}
              </p>
            )}

            {(restaurant.location || openStatus) && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {restaurant.location && (
                  <span className={theme.classes.locationBadge}>
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {restaurant.location}
                  </span>
                )}

                {openStatus && (
                  <a
                    href="#horario-funcionamento"
                    className={
                      openStatus.isOpen
                        ? theme.classes.statusOpenBadge
                        : theme.classes.statusClosedBadge
                    }
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 rounded-full ${
                        openStatus.isOpen ? 'bg-emerald-500' : 'bg-current opacity-50'
                      }`}
                    />
                    {openStatus.isOpen ? ui.openNowBadge : ui.closedNowBadge}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {categoriesWithDishes.length > 1 && (
        <nav aria-label={ui.categoriesNavLabel} className={theme.classes.navStickyBar}>
          <div className="no-scrollbar mx-auto flex max-w-2xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6">
            {highlightedDishes.length > 0 && (
              <a href="#sec-destaques" className={theme.classes.navPill}>
                ★ {ui.highlightsSectionTitle}
              </a>
            )}
            {categoriesWithDishes.map(({ category, localizedName }) => (
              <a key={category.id} href={`#cat-${category.id}`} className={theme.classes.navPill}>
                {localizedName}
              </a>
            ))}
          </div>
        </nav>
      )}

      <main
        id="ementa-conteudo"
        className="mx-auto max-w-2xl space-y-12 px-4 py-8 sm:px-6 sm:py-12"
      >
        {highlightedDishes.length > 0 && (
          <section
            id="sec-destaques"
            aria-labelledby="heading-destaques"
            className={`scroll-mt-20 ${theme.classes.highlightsBox}`}
          >
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Sparkles
                  className={`h-5 w-5 ${theme.classes.headerOrnament}`}
                  aria-hidden="true"
                />
                <h2 id="heading-destaques" className={theme.classes.sectionHeading}>
                  {ui.highlightsSectionTitle}
                </h2>
              </div>
              <p className={theme.classes.sectionDescription}>{ui.highlightsSectionSubtitle}</p>
            </div>

            <ul className="space-y-3" role="list">
              {highlightedDishes.map((dish) => {
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
                const badgeText = dish.highlight
                  ? getHighlightLabel(dish.highlight, effectiveLocale)
                  : null;
                const badgeClass = dish.highlight
                  ? theme.classes.highlightBadges[dish.highlight]
                  : '';

                return (
                  <li key={`hl-${dish.id}`}>
                    <article className={theme.classes.dishCard}>
                      <div className="min-w-0 flex-1">
                        {badgeText && (
                          <div className="mb-1.5">
                            <span className={badgeClass}>{badgeText}</span>
                          </div>
                        )}
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className={theme.classes.dishTitle}>{dishName}</h3>
                          <span
                            className={`shrink-0 ${theme.classes.dishPrice}`}
                            aria-label={`${ui.priceAriaPrefix}: ${formatPriceCents(dish.price_cents)}`}
                          >
                            {formatPriceCents(dish.price_cents)}
                          </span>
                        </div>
                        {dishDescription && (
                          <p className={theme.classes.dishDescription}>{dishDescription}</p>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {categoriesWithDishes.length === 0 ? (
          <div className="rounded-2xl border border-current/10 p-10 text-center opacity-75">
            <p className="font-serif text-xl">{ui.emptyMenuTitle}</p>
            <p className="mt-1 text-sm">{ui.emptyMenuSubtitle}</p>
          </div>
        ) : (
          categoriesWithDishes.map(({ category, localizedName, localizedDescription, items }) => (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              aria-labelledby={`heading-${category.id}`}
              className="scroll-mt-20"
            >
              <div className="mb-5">
                <h2 id={`heading-${category.id}`} className={theme.classes.sectionHeading}>
                  {localizedName}
                </h2>
                {localizedDescription && (
                  <p className={theme.classes.sectionDescription}>{localizedDescription}</p>
                )}
                <div className={theme.classes.sectionDivider} aria-hidden="true" />
              </div>

              <ul className="space-y-3.5" role="list">
                {items.map((dish) => {
                  const isLcpCandidate = Boolean(dish.photo_url) && !firstPhotoAssigned;
                  if (isLcpCandidate) {
                    firstPhotoAssigned = true;
                  }

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

                  const highlightText =
                    modules.highlights && dish.highlight
                      ? getHighlightLabel(dish.highlight, effectiveLocale)
                      : null;

                  const dishAllergens = modules.allergens
                    ? (dish.allergens ?? [])
                        .map((code) => getAllergenDefinition(code))
                        .filter((def): def is NonNullable<typeof def> => def !== null)
                    : [];

                  return (
                    <li key={dish.id}>
                      <article
                        className={`${theme.classes.dishCard} ${
                          !dish.available ? theme.classes.dishCardUnavailable : ''
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          {highlightText && dish.highlight && (
                            <div className="mb-1.5">
                              <span className={theme.classes.highlightBadges[dish.highlight]}>
                                {highlightText}
                              </span>
                            </div>
                          )}

                          <div className="flex items-baseline justify-between gap-3">
                            <h3 className={theme.classes.dishTitle}>{dishName}</h3>
                            <span
                              className={`shrink-0 ${theme.classes.dishPrice}`}
                              aria-label={`${ui.priceAriaPrefix}: ${formatPriceCents(dish.price_cents)}`}
                            >
                              {formatPriceCents(dish.price_cents)}
                            </span>
                          </div>

                          {dishDescription && (
                            <p className={theme.classes.dishDescription}>{dishDescription}</p>
                          )}

                          {dishAllergens.length > 0 && (
                            <ul
                              aria-label={ui.allergensLabel}
                              className="mt-2.5 flex flex-wrap gap-1.5"
                            >
                              {dishAllergens.map((allergen) => (
                                <li key={allergen.code}>
                                  <span className={theme.classes.allergenBadge}>
                                    <span
                                      className={theme.classes.allergenNumber}
                                      aria-hidden="true"
                                    >
                                      {allergen.number}
                                    </span>
                                    <span>{allergen.label[effectiveLocale]}</span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {!dish.available && (
                            <div className="mt-2">
                              <span className={theme.classes.unavailableBadge}>
                                {ui.unavailableBadge}
                              </span>
                            </div>
                          )}
                        </div>

                        {dish.photo_url && (
                          <div className={theme.classes.photoFrame}>
                            <Image
                              src={dish.photo_url}
                              alt={`${ui.photoAltPrefix} ${dishName}`}
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

        {modules.allergens && legendAllergens.length > 0 && (
          <section
            aria-labelledby="heading-alergenios-legenda"
            className={theme.classes.infoSectionCard}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert
                className={`h-4 w-4 ${theme.classes.headerOrnament}`}
                aria-hidden="true"
              />
              <h2 id="heading-alergenios-legenda" className={theme.classes.infoSectionTitle}>
                {ui.allergensLegendTitle}
              </h2>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {legendAllergens.map((allergen) => (
                <div key={allergen.code} className="flex items-baseline gap-2 text-xs">
                  <dt className={`shrink-0 ${theme.classes.allergenBadge}`}>
                    <span className={theme.classes.allergenNumber}>{allergen.number}</span>
                    <span className="font-mono text-[10px]">{allergen.shortCode}</span>
                  </dt>
                  <dd className={theme.classes.infoSectionMuted}>
                    {allergen.label[effectiveLocale]}
                  </dd>
                </div>
              ))}
            </dl>

            <p className={`mt-4 ${theme.classes.infoSectionMuted}`}>{ui.allergensLegendNote}</p>
          </section>
        )}

        {modules.hours && openStatus && (
          <section
            id="horario-funcionamento"
            aria-labelledby="heading-horario"
            className={`scroll-mt-20 ${theme.classes.infoSectionCard}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${theme.classes.headerOrnament}`} aria-hidden="true" />
                <h2 id="heading-horario" className={theme.classes.infoSectionTitle}>
                  {ui.hoursTitle}
                </h2>
              </div>

              <span
                className={
                  openStatus.isOpen
                    ? theme.classes.statusOpenBadge
                    : theme.classes.statusClosedBadge
                }
              >
                {openStatus.isOpen ? ui.openNowBadge : ui.closedNowBadge}
              </span>
            </div>

            <dl className="mt-4 space-y-1.5 text-xs sm:text-sm">
              {weeklySchedule.map((day) => {
                const isToday = day.dayOfWeek === openStatus.currentDayOfWeek;
                const dayLabel = WEEKDAY_LABELS[effectiveLocale][day.dayOfWeek] ?? '';
                const hoursText = formatDaySlots(day, ui.closedDayLabel);

                return (
                  <div
                    key={day.dayOfWeek}
                    className={`flex items-center justify-between gap-4 ${
                      isToday ? theme.classes.hoursCurrentRow : 'px-2.5 py-1'
                    }`}
                  >
                    <dt>{dayLabel}</dt>
                    <dd className="tabular-nums">{hoursText}</dd>
                  </div>
                );
              })}
            </dl>

            <p className={`mt-4 ${theme.classes.infoSectionMuted}`}>{ui.timezoneNote}</p>
          </section>
        )}
      </main>

      <footer className={theme.classes.footer}>
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-2 px-4 py-6 text-center sm:flex-row sm:px-6">
          <p>{ui.vatIncluded}</p>
          <p className="font-medium opacity-85">{restaurant.name}</p>
        </div>
      </footer>
    </div>
  );
}
