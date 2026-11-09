-- -----------------------------------------------------------------------------
-- Logotipo do restaurante, escolhido pelo dono nas definições.
--
-- Guarda só o caminho do objeto no bucket 'dish-photos' (<restaurant_id>/logo-<...>.webp),
-- tal como a foto de capa. Null = sem logotipo (a carta mostra as iniciais do nome).
-- -----------------------------------------------------------------------------

alter table public.restaurants
  add column if not exists logo_path text;

alter table public.restaurants
  drop constraint if exists restaurants_logo_path_own_folder;

alter table public.restaurants
  add constraint restaurants_logo_path_own_folder
  check (
    logo_path is null
    or (
      split_part(logo_path, '/', 1) = id::text
      and length(logo_path) <= 300
    )
  );

comment on column public.restaurants.logo_path is
  'Caminho do objeto do logotipo no bucket dish-photos (<restaurant_id>/<ficheiro>). Null = iniciais do nome.';
