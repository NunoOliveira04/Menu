-- Público = só a carta. Contas/restaurantes são provisionados (service_role).
-- Revoga EXECUTE de create_owner_restaurant a authenticated e anon.

revoke execute on function public.create_owner_restaurant(text, text, text, text, text)
  from authenticated, anon;

grant execute on function public.create_owner_restaurant(text, text, text, text, text)
  to service_role;

-- Renomeia a demo antiga (se existir) para o identificador neutro.
update public.restaurants
set
  slug = 'menu-restaurante',
  name = 'Menu Restaurante',
  description = 'Cozinha portuguesa de temporada, confecionada com produtos locais e receitas de casa.',
  location = 'Portugal',
  translations = '{"en":{"description":"Seasonal Portuguese cooking made with local produce and house recipes."}}'::jsonb
where id = '11111111-1111-4111-8111-111111111111'
   or slug = 'tasca-do-castelo';

update public.dishes
set name = case name
  when 'Bola de Carne Vimaranense' then 'Bola de Carne Caseira'
  when 'Caldo Verde à Moda do Minho' then 'Caldo Verde Tradicional'
  when 'Bacalhau Assado à Tasca do Castelo' then 'Bacalhau Assado da Casa'
  when 'Rojões à Minhota com Castanhas' then 'Rojões com Castanhas'
  when 'Torta de Guimarães' then 'Torta Conventual'
  when 'Toucinho do Céu Vimaranense' then 'Toucinho do Céu'
  else name
end
where restaurant_id = '11111111-1111-4111-8111-111111111111';

update public.categories
set
  name = case name
    when 'Carnes do Minho' then 'Carnes'
    else name
  end,
  description = case name
    when 'Carnes do Minho' then 'Assados no forno de lenha e carnes maturadas de produtores locais.'
    when 'Doçaria Conventual' then 'Doces conventuais e sobremesas caseiras.'
    when 'Sopas & Tachos Quentes' then 'Pratos de conforto servidos bem quentes em tigela de barro.'
    when 'Petiscos & Entradas' then 'Para partilhar à chegada com broa de milho caseira e azeite virgem.'
    else description
  end
where restaurant_id = '11111111-1111-4111-8111-111111111111';
