-- =============================================================================
-- Seed Demo — Restaurante fictício 'Tasca do Castelo' (Guimarães)
-- Grupo 2: módulos opcionais ligados (languages PT/EN, allergens UE, highlights e hours).
-- Idempotente: pode ser executado mais do que uma vez.
-- =============================================================================

begin;

insert into public.restaurants (
  id,
  slug,
  name,
  description,
  location,
  style,
  published,
  settings,
  translations
)
values (
  '11111111-1111-4111-8111-111111111111',
  'tasca-do-castelo',
  'Tasca do Castelo',
  'Cozinha minhota de raiz junto ao Centro Histórico de Guimarães, confecionada em lume brando com produtos da região.',
  'Largo da Oliveira, Guimarães',
  'classico',
  true,
  '{"modules":{"languages":true,"allergens":true,"highlights":true,"hours":true}}'::jsonb,
  '{"en":{"description":"Traditional Minho cuisine right by the Historic Centre of Guimarães, slow-cooked over wood fire with local seasonal produce."}}'::jsonb
)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  location = excluded.location,
  style = excluded.style,
  published = excluded.published,
  settings = excluded.settings,
  translations = excluded.translations;

-- Limpar categorias/pratos/horários anteriores do restaurante demo para garantir estado consistente
delete from public.categories
where restaurant_id = '11111111-1111-4111-8111-111111111111';

delete from public.restaurant_hours
where restaurant_id = '11111111-1111-4111-8111-111111111111';

-- Horário semanal realista (Europe/Lisbon): encerrado à segunda; almoço e jantar terça a sábado; almoço prolongado ao domingo
insert into public.restaurant_hours (restaurant_id, day_of_week, closed, slots)
values
  ('11111111-1111-4111-8111-111111111111', 0, true,  '[]'::jsonb),
  ('11111111-1111-4111-8111-111111111111', 1, false, '[{"open":"12:00","close":"15:00"},{"open":"19:00","close":"22:30"}]'::jsonb),
  ('11111111-1111-4111-8111-111111111111', 2, false, '[{"open":"12:00","close":"15:00"},{"open":"19:00","close":"22:30"}]'::jsonb),
  ('11111111-1111-4111-8111-111111111111', 3, false, '[{"open":"12:00","close":"15:00"},{"open":"19:00","close":"22:30"}]'::jsonb),
  ('11111111-1111-4111-8111-111111111111', 4, false, '[{"open":"12:00","close":"15:00"},{"open":"19:00","close":"23:30"}]'::jsonb),
  ('11111111-1111-4111-8111-111111111111', 5, false, '[{"open":"12:00","close":"15:30"},{"open":"19:00","close":"23:30"}]'::jsonb),
  ('11111111-1111-4111-8111-111111111111', 6, false, '[{"open":"12:00","close":"16:00"}]'::jsonb);

-- 5 Categorias tradicionais com traduções em Inglês (EN)
insert into public.categories (id, restaurant_id, name, description, position, translations)
values
  (
    '22222222-2222-4222-8222-222222222201',
    '11111111-1111-4111-8111-111111111111',
    'Petiscos & Entradas',
    'Para partilhar à chegada com broa de milho caseira e azeite transmontano.',
    0,
    '{"en":{"name":"Starters & Portuguese Petiscos","description":"Made to share at the table with homemade cornbread and extra-virgin olive oil."}}'::jsonb
  ),
  (
    '22222222-2222-4222-8222-222222222202',
    '11111111-1111-4111-8111-111111111111',
    'Sopas & Tachos Quentes',
    'Conforto minhoto servido bem quente em tigela de barro.',
    1,
    '{"en":{"name":"Traditional Soups & Hot Pots","description":"Hearty Minho comfort served piping hot in clay bowls."}}'::jsonb
  ),
  (
    '22222222-2222-4222-8222-222222222203',
    '11111111-1111-4111-8111-111111111111',
    'Peixe & Bacalhau',
    'Receitas clássicas de bacalhau de cura tradicional e peixe fresco da costa.',
    2,
    '{"en":{"name":"Fish & Salt Cod","description":"Classic cured Atlantic cod recipes and fresh coastal fish."}}'::jsonb
  ),
  (
    '22222222-2222-4222-8222-222222222204',
    '11111111-1111-4111-8111-111111111111',
    'Carnes do Minho',
    'Assados no forno de lenha e carnes maturadas de produtores locais.',
    3,
    '{"en":{"name":"Minho Meats","description":"Wood-fired roasts and meats sourced from small local farms."}}'::jsonb
  ),
  (
    '22222222-2222-4222-8222-222222222205',
    '11111111-1111-4111-8111-111111111111',
    'Doçaria Conventual',
    'Doces históricos de Guimarães e sobremesas caseiras.',
    4,
    '{"en":{"name":"Conventual Desserts","description":"Historic monastic sweets from Guimarães and house-made desserts."}}'::jsonb
  );

-- 15 Pratos com traduções EN, alergénios da UE, destaques e imagens placeholder livres
insert into public.dishes (
  restaurant_id,
  category_id,
  name,
  description,
  price_cents,
  photo_url,
  available,
  position,
  translations,
  allergens,
  highlight
)
values
  -- Petiscos & Entradas (4)
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222201',
    'Pataniscas de Bacalhau',
    'Fritas na hora em azeite virgem, servidas com maionese de alho assado e salsa fresca.',
    650,
    'https://picsum.photos/seed/pataniscas-vimaranes/800/600',
    true,
    0,
    '{"en":{"name":"Salt Cod Fritters (Pataniscas)","description":"Crisp cod fritters fried to order in olive oil, served with roasted garlic mayo and fresh parsley."}}'::jsonb,
    array['gluten', 'eggs', 'fish']::text[],
    'recommended'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222201',
    'Chouriça Assada na Brasa em Barro',
    'Chouriça de fumeiro minhoto flamejada à mesa com aguardente velha e broa de milho.',
    890,
    'https://picsum.photos/seed/chourica-barro/800/600',
    true,
    1,
    '{"en":{"name":"Flame-Roasted Smoked Chorizo","description":"Artisanal Minho pork sausage flambéed tableside in clay dish, served with cornbread."}}'::jsonb,
    array['gluten', 'sulphites']::text[],
    null
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222201',
    'Bola de Carne Vimaranense',
    'Fatia generosa de bola caseira recheada com carnes fumadas e toucinho.',
    550,
    'https://picsum.photos/seed/bola-vimaranense/800/600',
    true,
    2,
    '{"en":{"name":"Guimarães Savoury Meat Bread","description":"Generous slice of soft house-baked bread stuffed with smoked meats andcured bacon."}}'::jsonb,
    array['gluten', 'eggs', 'milk']::text[],
    null
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222201',
    'Queijo da Serra Curado com Compota de Abóbora',
    'Acompanhado de nozes tostadas e tostinhas de pão centeio.',
    980,
    'https://picsum.photos/seed/queijo-compota/800/600',
    true,
    3,
    '{"en":{"name":"Aged Serra Sheep Cheese & Pumpkin Jam","description":"Served with toasted walnuts and crisp rye bread toasts."}}'::jsonb,
    array['gluten', 'milk', 'nuts']::text[],
    'new'
  ),

  -- Sopas & Tachos Quentes (2)
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222202',
    'Caldo Verde à Moda do Minho',
    'Couve galega cortada finíssima, batata cremosa, fio de azeite novo e rodela de chouriço.',
    420,
    'https://picsum.photos/seed/caldo-verde-minho/800/600',
    true,
    0,
    '{"en":{"name":"Minho-Style Caldo Verde","description":"Finely shredded Galician kale, velvety potato broth, extra-virgin olive oil and smoked chorizo."}}'::jsonb,
    array['sulphites']::text[],
    null
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222202',
    'Papas de Sarrabulho Tradicionais',
    'Receita antiga com carnes selecionadas, cominhos e fatias de pão de milho.',
    780,
    'https://picsum.photos/seed/papas-sarrabulho/800/600',
    true,
    1,
    '{"en":{"name":"Traditional Sarrabulho Porridge","description":"Heritage Minho savoury dish slow-simmered with selected meats, cumin and cornbread."}}'::jsonb,
    array['gluten', 'sulphites']::text[],
    null
  ),

  -- Peixe & Bacalhau (3)
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222203',
    'Bacalhau Assado à Tasca do Castelo',
    'Lombo alto de bacalhau assado com crosta de broa de milho, grelos salteados e batata a murro.',
    1850,
    'https://picsum.photos/seed/bacalhau-castelo/800/600',
    true,
    0,
    '{"en":{"name":"Tasca do Castelo Roasted Salt Cod","description":"Thick Atlantic cod loin baked with cornbread crust, sautéed turnip greens and punched potatoes."}}'::jsonb,
    array['gluten', 'fish']::text[],
    'featured'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222203',
    'Polvo à Lagareiro no Forno',
    'Tentáculos tenros confitados em azeite, alho laminado, coentros e batatinha assada.',
    2100,
    'https://picsum.photos/seed/polvo-lagareiro/800/600',
    true,
    1,
    '{"en":{"name":"Oven-Roasted Lagareiro Octopus","description":"Tender octopus tentacles confit in olive oil, sliced garlic, fresh coriander and baby roast potatoes."}}'::jsonb,
    array['molluscs']::text[],
    'recommended'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222203',
    'Filetes de Pescada com Arroz de Tomate Malandrinho',
    'Filetes dourados em polme leve acompanhados de arroz de tomate fresco e manjericão.',
    1490,
    'https://picsum.photos/seed/filetes-pescada/800/600',
    true,
    2,
    '{"en":{"name":"Golden Hake Fillets with Saucy Tomato Rice","description":"Lightly battered hake fillets served alongside brothy ripe-tomato rice with sweet basil."}}'::jsonb,
    array['gluten', 'eggs', 'fish']::text[],
    null
  ),

  -- Carnes do Minho (3)
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222204',
    'Rojões à Minhota com Castanhas',
    'Carne de porco marinada em vinho verde branco e alho, servida com tripas enfarinhadas e batata dourada.',
    1590,
    'https://picsum.photos/seed/rojoes-minhota/800/600',
    true,
    0,
    '{"en":{"name":"Minho-Style Pork Rojões with Chestnuts","description":"Pork chunks marinated in Vinho Verde and garlic, served with chestnuts and golden potatoes."}}'::jsonb,
    array['gluten', 'nuts', 'sulphites']::text[],
    'featured'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222204',
    'Vitela Assada em Forno de Lenha',
    'Vitela barrosã lentamente assada no seu molho, servida com arroz de forno e batata assada.',
    1790,
    'https://picsum.photos/seed/vitela-forno-lenha/800/600',
    true,
    1,
    '{"en":{"name":"Wood-Oven Roasted Barrosã Veal","description":"Slow-roasted local veal in its natural jus, served with oven-baked rice and roast potatoes."}}'::jsonb,
    array['celery', 'sulphites']::text[],
    null
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222204',
    'Arroz de Pato à Antiga',
    'Pato desfiado cozinhado em caldo aromático, tostado no forno com chouriço de vinhais.',
    1450,
    'https://picsum.photos/seed/arroz-pato-antiga/800/600',
    false,
    2,
    '{"en":{"name":"Old-Fashioned Baked Duck Rice","description":"Shredded duck cooked in aromatic stock and oven-crisped with Vinhais smoked sausage."}}'::jsonb,
    array['celery', 'sulphites']::text[],
    null
  ),

  -- Doçaria Conventual (3)
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222205',
    'Torta de Guimarães',
    'Especialidade conventual estaladiça recheada com doce de chila, amêndoa torrada e canela.',
    480,
    'https://picsum.photos/seed/torta-guimaraes/800/600',
    true,
    0,
    '{"en":{"name":"Torta de Guimarães Pastry","description":"Crisp conventual pastry filled with squash preserve, toasted almonds and cinnamon."}}'::jsonb,
    array['gluten', 'eggs', 'nuts']::text[],
    'featured'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222205',
    'Toucinho do Céu Vimaranense',
    'Fatia húmida de gemas, amêndoa moída e chila, polvilhada com açúcar em pó.',
    520,
    'https://picsum.photos/seed/toucinho-ceu/800/600',
    true,
    1,
    '{"en":{"name":"Guimarães Toucinho do Céu","description":"Rich conventual almond and egg-yolk cake dusted with icing sugar."}}'::jsonb,
    array['gluten', 'eggs', 'nuts']::text[],
    null
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222205',
    'Leite-Creme Queimado na Hora',
    'Aromatizado com casca de limão e pau de canela, queimado com ferro em brasa.',
    450,
    'https://picsum.photos/seed/leite-creme-ferro/800/600',
    true,
    2,
    '{"en":{"name":"Caramelised Portuguese Custard","description":"Infused with lemon peel and cinnamon stick, burnt to order with a hot iron."}}'::jsonb,
    array['eggs', 'milk']::text[],
    'new'
  );

commit;
