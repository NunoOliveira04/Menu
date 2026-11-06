-- Público = só a carta. Contas/restaurantes são provisionados (service_role).
-- Revoga EXECUTE de create_owner_restaurant; renomeia a demo antiga para Menu Restaurante.

revoke execute on function public.create_owner_restaurant(text, text, text, text, text)
  from public, anon, authenticated;

grant execute on function public.create_owner_restaurant(text, text, text, text, text)
  to service_role;

-- Slug neutro pelo id demo, sem colidir com outro restaurante.
update public.restaurants
set
  slug = 'menu-restaurante',
  name = 'Menu Restaurante',
  description = 'Cozinha portuguesa de temporada, confecionada com produtos locais e receitas de casa.',
  location = 'Portugal',
  translations = '{"en":{"description":"Seasonal Portuguese cooking made with local produce and house recipes."}}'::jsonb
where id = '11111111-1111-4111-8111-111111111111'
  and not exists (
    select 1
      from public.restaurants r2
     where r2.slug = 'menu-restaurante'
       and r2.id <> '11111111-1111-4111-8111-111111111111'
  );

-- Categorias: nomes, descrições e translations alinhados com seed.sql
update public.categories
set
  name = 'Petiscos & Entradas',
  description = 'Para partilhar à chegada com broa de milho caseira e azeite virgem.',
  translations = '{"en":{"name":"Starters & Portuguese Petiscos","description":"Made to share at the table with homemade cornbread and extra-virgin olive oil."}}'::jsonb
where id = '22222222-2222-4222-8222-222222222201'
  and restaurant_id = '11111111-1111-4111-8111-111111111111';

update public.categories
set
  name = 'Sopas & Tachos Quentes',
  description = 'Pratos de conforto servidos bem quentes em tigela de barro.',
  translations = '{"en":{"name":"Traditional Soups & Hot Pots","description":"Hearty comfort dishes served piping hot in clay bowls."}}'::jsonb
where id = '22222222-2222-4222-8222-222222222202'
  and restaurant_id = '11111111-1111-4111-8111-111111111111';

update public.categories
set
  name = 'Peixe & Bacalhau',
  description = 'Receitas clássicas de bacalhau de cura tradicional e peixe fresco da costa.',
  translations = '{"en":{"name":"Fish & Salt Cod","description":"Classic cured Atlantic cod recipes and fresh coastal fish."}}'::jsonb
where id = '22222222-2222-4222-8222-222222222203'
  and restaurant_id = '11111111-1111-4111-8111-111111111111';

update public.categories
set
  name = 'Carnes',
  description = 'Assados no forno de lenha e carnes maturadas de produtores locais.',
  translations = '{"en":{"name":"Meats","description":"Wood-fired roasts and meats sourced from small local farms."}}'::jsonb
where id = '22222222-2222-4222-8222-222222222204'
  and restaurant_id = '11111111-1111-4111-8111-111111111111';

update public.categories
set
  name = 'Doçaria Conventual',
  description = 'Doces conventuais e sobremesas caseiras.',
  translations = '{"en":{"name":"Conventual Desserts","description":"Historic monastic sweets and house-made desserts."}}'::jsonb
where id = '22222222-2222-4222-8222-222222222205'
  and restaurant_id = '11111111-1111-4111-8111-111111111111';

-- Pratos: renomeações (WHERE antigo) + descriptions/translations do seed
update public.dishes
set
  name = 'Bola de Carne Caseira',
  description = 'Fatia generosa de bola caseira recheada com carnes fumadas e toucinho.',
  translations = '{"en":{"name":"House Savoury Meat Bread","description":"Generous slice of soft house-baked bread stuffed with smoked meats and cured bacon."}}'::jsonb
where restaurant_id = '11111111-1111-4111-8111-111111111111'
  and name in ('Bola de Carne Vimaranense', 'Bola de Carne Caseira');

update public.dishes
set
  name = 'Caldo Verde Tradicional',
  description = 'Couve galega cortada finíssima, batata cremosa, fio de azeite novo e rodela de chouriço.',
  translations = '{"en":{"name":"Traditional Caldo Verde","description":"Finely shredded Galician kale, velvety potato broth, extra-virgin olive oil and smoked chorizo."}}'::jsonb
where restaurant_id = '11111111-1111-4111-8111-111111111111'
  and name in ('Caldo Verde à Moda do Minho', 'Caldo Verde Tradicional');

update public.dishes
set
  name = 'Bacalhau Assado da Casa',
  description = 'Lombo alto de bacalhau assado com crosta de broa de milho, grelos salteados e batata a murro.',
  translations = '{"en":{"name":"House Roasted Salt Cod","description":"Thick Atlantic cod loin baked with cornbread crust, sautéed turnip greens and punched potatoes."}}'::jsonb
where restaurant_id = '11111111-1111-4111-8111-111111111111'
  and name in ('Bacalhau Assado à Tasca do Castelo', 'Bacalhau Assado da Casa');

update public.dishes
set
  name = 'Rojões com Castanhas',
  description = 'Carne de porco marinada em vinho verde branco e alho, servida com tripas enfarinhadas e batata dourada.',
  translations = '{"en":{"name":"Pork Rojões with Chestnuts","description":"Pork chunks marinated in white wine and garlic, served with chestnuts and golden potatoes."}}'::jsonb
where restaurant_id = '11111111-1111-4111-8111-111111111111'
  and name in ('Rojões à Minhota com Castanhas', 'Rojões com Castanhas');

update public.dishes
set
  name = 'Torta Conventual',
  description = 'Especialidade conventual estaladiça recheada com doce de chila, amêndoa torrada e canela.',
  translations = '{"en":{"name":"Conventual Pastry Tart","description":"Crisp conventual pastry filled with squash preserve, toasted almonds and cinnamon."}}'::jsonb
where restaurant_id = '11111111-1111-4111-8111-111111111111'
  and name in ('Torta de Guimarães', 'Torta Conventual');

update public.dishes
set
  name = 'Toucinho do Céu',
  description = 'Fatia húmida de gemas, amêndoa moída e chila, polvilhada com açúcar em pó.',
  translations = '{"en":{"name":"Toucinho do Céu","description":"Rich conventual almond and egg-yolk cake dusted with icing sugar."}}'::jsonb
where restaurant_id = '11111111-1111-4111-8111-111111111111'
  and name in ('Toucinho do Céu Vimaranense', 'Toucinho do Céu');

update public.dishes
set
  description = 'Chouriça de fumeiro flamejada à mesa com aguardente velha e broa de milho.',
  translations = '{"en":{"name":"Flame-Roasted Smoked Chorizo","description":"Artisanal smoked pork sausage flambéed tableside in clay dish, served with cornbread."}}'::jsonb
where restaurant_id = '11111111-1111-4111-8111-111111111111'
  and name = 'Chouriça Assada na Brasa em Barro';

update public.dishes
set
  translations = '{"en":{"name":"Traditional Sarrabulho Porridge","description":"Heritage savoury dish slow-simmered with selected meats, cumin and cornbread."}}'::jsonb
where restaurant_id = '11111111-1111-4111-8111-111111111111'
  and name = 'Papas de Sarrabulho Tradicionais';

-- Fotos alinhadas com seed (migração antiga mantém os WHEN com nomes originais).
update public.dishes
set photo_url = case name
  when 'Pataniscas de Bacalhau' then 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1400&q=75'
  when 'Chouriça Assada na Brasa em Barro' then 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1400&q=75'
  when 'Bola de Carne Caseira' then 'https://images.pexels.com/photos/139746/pexels-photo-139746.jpeg?auto=compress&cs=tinysrgb&w=1400'
  when 'Queijo da Serra Curado com Compota de Abóbora' then 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=1400&q=75'
  when 'Caldo Verde Tradicional' then 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=1400'
  when 'Papas de Sarrabulho Tradicionais' then 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1400&q=75'
  when 'Bacalhau Assado da Casa' then 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1600&h=1000&q=75'
  when 'Polvo à Lagareiro no Forno' then 'https://images.pexels.com/photos/566345/pexels-photo-566345.jpeg?auto=compress&cs=tinysrgb&w=1400'
  when 'Filetes de Pescada com Arroz de Tomate Malandrinho' then 'https://images.unsplash.com/photo-1599921841143-819065a55cc6?auto=format&fit=crop&w=1400&q=75'
  when 'Rojões com Castanhas' then 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=1400&q=75'
  when 'Vitela Assada em Forno de Lenha' then 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1400&q=75'
  when 'Arroz de Pato à Antiga' then 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1400&q=75'
  when 'Torta Conventual' then 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1400&q=75'
  when 'Toucinho do Céu' then 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1400&q=75'
  when 'Leite-Creme Queimado na Hora' then 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1400&q=75'
  else photo_url
end
where restaurant_id = '11111111-1111-4111-8111-111111111111';
