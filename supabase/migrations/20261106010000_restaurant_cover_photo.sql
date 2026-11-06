-- -----------------------------------------------------------------------------
-- Foto de capa da carta, escolhida pelo dono nas definições do restaurante.
--
-- Guarda só o caminho do objeto no bucket 'dish-photos' (<restaurant_id>/cover-<...>.webp).
-- Reutiliza as políticas de escrita por restaurante desse bucket e o URL público estável.
-- Sem capa (null), a carta mostra um cabeçalho só tipográfico sobre azul #1F3A5F.
-- -----------------------------------------------------------------------------

alter table public.restaurants
  add column if not exists cover_photo_path text;

-- O ficheiro tem de estar na pasta do próprio restaurante.
alter table public.restaurants
  drop constraint if exists restaurants_cover_photo_path_own_folder;

alter table public.restaurants
  add constraint restaurants_cover_photo_path_own_folder
  check (
    cover_photo_path is null
    or (
      split_part(cover_photo_path, '/', 1) = id::text
      and length(cover_photo_path) <= 300
    )
  );

comment on column public.restaurants.cover_photo_path is
  'Caminho do objeto da foto de capa no bucket dish-photos (<restaurant_id>/<ficheiro>). Null = cabeçalho tipográfico.';
