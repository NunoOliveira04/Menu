import type { DaySchedule } from '@/lib/modules/hours';
import type { CategoryRow, DishRow, RestaurantRow } from '@/types/database';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo/site';

/*
 * Dados estruturados (schema.org em JSON-LD). Dizem ao Google e às IAs o que cada página é:
 * a página principal é um serviço de cartas digitais; cada carta é um restaurante com o seu menu.
 */

type JsonLd = Record<string, unknown>;

/** Página principal: organização, site, serviço e perguntas frequentes. */
export function landingJsonLd(
  origin: string,
  faqs: readonly { question: string; answer: string }[],
): JsonLd {
  const orgId = `${origin}/#organizacao`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: SITE_NAME,
        url: `${origin}/`,
        logo: `${origin}/apple-icon.png`,
        description: SITE_DESCRIPTION,
        areaServed: { '@type': 'Country', name: 'Portugal' },
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#site`,
        name: SITE_NAME,
        url: `${origin}/`,
        inLanguage: 'pt-PT',
        publisher: { '@id': orgId },
      },
      {
        '@type': 'Service',
        name: 'Carta digital com QR code para restaurantes',
        serviceType: 'Carta digital (menu QR code) para restaurantes',
        description: SITE_DESCRIPTION,
        provider: { '@id': orgId },
        areaServed: { '@type': 'Country', name: 'Portugal' },
        availableLanguage: ['pt-PT', 'en'],
        audience: { '@type': 'BusinessAudience', name: 'Restaurantes, tascas e cafés' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  };
}

const SCHEMA_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

/** Carta de um restaurante: Restaurant + Menu (secções, pratos e preços em euros). */
export function restaurantMenuJsonLd(input: {
  restaurant: Pick<RestaurantRow, 'name' | 'description'>;
  url: string;
  logoUrl: string | null;
  categories: readonly Pick<CategoryRow, 'id' | 'name' | 'description'>[];
  dishes: readonly Pick<
    DishRow,
    'category_id' | 'name' | 'description' | 'price_cents' | 'available' | 'photo_url'
  >[];
  weeklySchedule: readonly DaySchedule[];
}): JsonLd {
  const { restaurant, url, logoUrl, categories, dishes, weeklySchedule } = input;
  const sections = categories
    .map((category) => {
      const items = dishes.filter((dish) => dish.category_id === category.id);
      if (items.length === 0) return null;
      return {
        '@type': 'MenuSection',
        name: category.name,
        ...(category.description ? { description: category.description } : {}),
        hasMenuItem: items.map((dish) => ({
          '@type': 'MenuItem',
          name: dish.name,
          ...(dish.description ? { description: dish.description } : {}),
          ...(dish.photo_url && /^https?:\/\//.test(dish.photo_url)
            ? { image: dish.photo_url }
            : {}),
          offers: {
            '@type': 'Offer',
            price: (dish.price_cents / 100).toFixed(2),
            priceCurrency: 'EUR',
            availability: dish.available
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          },
        })),
      };
    })
    .filter((section) => section !== null);

  const openingHours = weeklySchedule.flatMap((day) =>
    day.closed
      ? []
      : day.slots.map((slot) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: `https://schema.org/${SCHEMA_DAYS[day.dayOfWeek]}`,
          opens: slot.open,
          closes: slot.close,
        })),
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    url,
    ...(restaurant.description ? { description: restaurant.description } : {}),
    ...(logoUrl ? { logo: logoUrl, image: logoUrl } : {}),
    ...(openingHours.length > 0 ? { openingHoursSpecification: openingHours } : {}),
    hasMenu: {
      '@type': 'Menu',
      name: `Carta de ${restaurant.name}`,
      url,
      inLanguage: 'pt-PT',
      hasMenuSection: sections,
    },
  };
}

/** Serializa JSON-LD para um <script>, sem permitir fechar a tag a partir dos dados. */
export function jsonLdScript(data: JsonLd): string {
  // Cada «<» passa à sua sequência de escape unicode (barra + u003c): o JSON lê-se igual,
  // mas o HTML deixa de ver «</script>».
  return JSON.stringify(data).replace(/</g, String.fromCharCode(92) + 'u003c');
}
