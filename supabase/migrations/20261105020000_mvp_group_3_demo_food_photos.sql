-- Grupo 3: fotografias da Tasca do Castelo passam a ser pratos reais
-- (Unsplash / Pexels). Idempotente. Não altera pratos de outros restaurantes.

update public.dishes
set photo_url = case name
  when 'Pataniscas de Bacalhau' then 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1400&q=75'
  when 'Chouriça Assada na Brasa em Barro' then 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1400&q=75'
  when 'Bola de Carne Vimaranense' then 'https://images.pexels.com/photos/139746/pexels-photo-139746.jpeg?auto=compress&cs=tinysrgb&w=1400'
  when 'Queijo da Serra Curado com Compota de Abóbora' then 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=1400&q=75'
  when 'Caldo Verde à Moda do Minho' then 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=1400'
  when 'Papas de Sarrabulho Tradicionais' then 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1400&q=75'
  when 'Bacalhau Assado à Tasca do Castelo' then 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1600&h=1000&q=75'
  when 'Polvo à Lagareiro no Forno' then 'https://images.pexels.com/photos/566345/pexels-photo-566345.jpeg?auto=compress&cs=tinysrgb&w=1400'
  when 'Filetes de Pescada com Arroz de Tomate Malandrinho' then 'https://images.unsplash.com/photo-1599921841143-819065a55cc6?auto=format&fit=crop&w=1400&q=75'
  when 'Rojões à Minhota com Castanhas' then 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=1400&q=75'
  when 'Vitela Assada em Forno de Lenha' then 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1400&q=75'
  when 'Arroz de Pato à Antiga' then 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1400&q=75'
  when 'Torta de Guimarães' then 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1400&q=75'
  when 'Toucinho do Céu Vimaranense' then 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1400&q=75'
  when 'Leite-Creme Queimado na Hora' then 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1400&q=75'
  else photo_url
end
where restaurant_id = '11111111-1111-4111-8111-111111111111'
  and name in (
    'Pataniscas de Bacalhau',
    'Chouriça Assada na Brasa em Barro',
    'Bola de Carne Vimaranense',
    'Queijo da Serra Curado com Compota de Abóbora',
    'Caldo Verde à Moda do Minho',
    'Papas de Sarrabulho Tradicionais',
    'Bacalhau Assado à Tasca do Castelo',
    'Polvo à Lagareiro no Forno',
    'Filetes de Pescada com Arroz de Tomate Malandrinho',
    'Rojões à Minhota com Castanhas',
    'Vitela Assada em Forno de Lenha',
    'Arroz de Pato à Antiga',
    'Torta de Guimarães',
    'Toucinho do Céu Vimaranense',
    'Leite-Creme Queimado na Hora'
  );
