-- -----------------------------------------------------------------------------
-- Bucket 'dish-photos' passa a ser público para leitura.
--
-- As fotografias são servidas por URL público e estável:
--   <SUPABASE_URL>/storage/v1/object/public/dish-photos/<restaurant_id>/<ficheiro>
-- Isto elimina os signed URLs (que expiravam e obrigavam a refrescar a página).
--
-- Mantêm-se sem alterações as políticas de escrita por restaurante:
--   dish_photos_insert_member, dish_photos_update_member, dish_photos_delete_member
-- (só membros do restaurante <restaurant_id> podem criar, substituir ou apagar objetos).
--
-- A política dish_photos_select_published_or_member também se mantém: continua a limitar
-- a listagem e o download pela API autenticada. A leitura pública por URL não passa por RLS.
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('dish-photos', 'dish-photos', true)
on conflict (id) do update
set public = true;
