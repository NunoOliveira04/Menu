-- =============================================================================
-- Seed Demo — Restaurante fictício 'Tasca do Castelo' (Guimarães)
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
  settings
)
values (
  '11111111-1111-4111-8111-111111111111',
  'tasca-do-castelo',
  'Tasca do Castelo',
  'Cozinha minhota de raiz junto ao Centro Histórico de Guimarães, confecionada em lume brando com produtos da região.',
  'Largo da Oliveira, Guimarães',
  'classico',
  true,
  '{"modules":{"languages":false,"allergens":false,"highlights":false,"hours":false}}'::jsonb
)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  location = excluded.location,
  style = excluded.style,
  published = excluded.published,
  settings = excluded.settings;

-- Limpar categorias/pratos anteriores do restaurante demo para garantir estado consistente
delete from public.categories
where restaurant_id = '11111111-1111-4111-8111-111111111111';

-- 5 Categorias tradicionais
insert into public.categories (id, restaurant_id, name, description, position)
values
  (
    '22222222-2222-4222-8222-222222222201',
    '11111111-1111-4111-8111-111111111111',
    'Petiscos & Entradas',
    'Para partilhar à chegada com broa de milho caseira e azeite transmontano.',
    0
  ),
  (
    '22222222-2222-4222-8222-222222222202',
    '11111111-1111-4111-8111-111111111111',
    'Sopas & Tachos Quentes',
    'Conforto minhoto servido bem quente em tigela de barro.',
    1
  ),
  (
    '22222222-2222-4222-8222-222222222203',
    '11111111-1111-4111-8111-111111111111',
    'Peixe & Bacalhau',
    'Receitas clássicas de bacalhau de cura tradicional e peixe fresco da costa.',
    2
  ),
  (
    '22222222-2222-4222-8222-222222222204',
    '11111111-1111-4111-8111-111111111111',
    'Carnes do Minho',
    'Assados no forno de lenha e carnes maturadas de produtores locais.',
    3
  ),
  (
    '22222222-2222-4222-8222-222222222205',
    '11111111-1111-4111-8111-111111111111',
    'Doçaria Conventual',
    'Doces históricos de Guimarães e sobremesas caseiras.',
    4
  );

-- 15 Pratos com imagens placeholder livres (picsum.photos com seed determinística)
insert into public.dishes (
  restaurant_id,
  category_id,
  name,
  description,
  price_cents,
  photo_url,
  available,
  position,
  translations
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
    '{}'::jsonb
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
    '{}'::jsonb
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
    '{}'::jsonb
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
    '{}'::jsonb
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
    '{}'::jsonb
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
    '{}'::jsonb
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
    '{}'::jsonb
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
    '{}'::jsonb
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
    '{}'::jsonb
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
    '{}'::jsonb
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
    '{}'::jsonb
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
    '{}'::jsonb
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
    '{}'::jsonb
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
    '{}'::jsonb
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
    '{}'::jsonb
  );

commit;
