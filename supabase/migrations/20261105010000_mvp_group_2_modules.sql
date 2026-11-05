-- =============================================================================
-- Menu Digital SaaS — Grupo 2: Módulos Opcionais (Traduções, Alergénios UE, Destaques e Horários)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Traduções da descrição/localização do restaurante
-- -----------------------------------------------------------------------------
alter table public.restaurants
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.restaurants
  drop constraint if exists restaurants_translations_is_object;

alter table public.restaurants
  add constraint restaurants_translations_is_object
  check (jsonb_typeof(translations) = 'object');

-- -----------------------------------------------------------------------------
-- 2. Alergénios (14 alergénios oficiais da UE) e Destaques por prato
-- -----------------------------------------------------------------------------
create or replace function public.are_valid_eu_allergens(p_allergens text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    p_allergens <@ array[
      'gluten',
      'crustaceans',
      'eggs',
      'fish',
      'peanuts',
      'soybeans',
      'milk',
      'nuts',
      'celery',
      'mustard',
      'sesame',
      'sulphites',
      'lupin',
      'molluscs'
    ]::text[],
    false
  )
  and cardinality(p_allergens) <= 14;
$$;

alter table public.dishes
  add column if not exists allergens text[] not null default '{}'::text[],
  add column if not exists highlight text;

alter table public.dishes
  drop constraint if exists dishes_allergens_allowed;

alter table public.dishes
  add constraint dishes_allergens_allowed
  check (public.are_valid_eu_allergens(allergens));

alter table public.dishes
  drop constraint if exists dishes_highlight_allowed;

alter table public.dishes
  add constraint dishes_highlight_allowed
  check (highlight is null or highlight in ('featured', 'recommended', 'new'));

create index if not exists dishes_restaurant_highlight_idx
  on public.dishes (restaurant_id, highlight)
  where highlight is not null;

-- -----------------------------------------------------------------------------
-- 3. Horário semanal do restaurante (0 = Segunda-feira .. 6 = Domingo)
-- -----------------------------------------------------------------------------
create table if not exists public.restaurant_hours (
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  day_of_week smallint not null,
  closed boolean not null default false,
  slots jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (restaurant_id, day_of_week),
  constraint restaurant_hours_day_range check (day_of_week between 0 and 6),
  constraint restaurant_hours_slots_array check (jsonb_typeof(slots) = 'array'),
  constraint restaurant_hours_closed_slots_consistent check (
    not closed or jsonb_array_length(slots) = 0
  )
);

drop trigger if exists set_restaurant_hours_updated_at on public.restaurant_hours;
create trigger set_restaurant_hours_updated_at
  before update on public.restaurant_hours
  for each row
  execute function public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 4. RLS para restaurant_hours (leitura pública só publicados; escrita só membros)
-- -----------------------------------------------------------------------------
alter table public.restaurant_hours enable row level security;

create policy "restaurant_hours_select_published_or_member"
  on public.restaurant_hours
  for select
  to anon, authenticated
  using (
    app_private.is_restaurant_published(restaurant_id)
    or app_private.is_restaurant_member(restaurant_id)
  );

create policy "restaurant_hours_insert_member"
  on public.restaurant_hours
  for insert
  to authenticated
  with check (app_private.is_restaurant_member(restaurant_id));

create policy "restaurant_hours_update_member"
  on public.restaurant_hours
  for update
  to authenticated
  using (app_private.is_restaurant_member(restaurant_id))
  with check (app_private.is_restaurant_member(restaurant_id));

create policy "restaurant_hours_delete_member"
  on public.restaurant_hours
  for delete
  to authenticated
  using (app_private.is_restaurant_member(restaurant_id));

-- -----------------------------------------------------------------------------
-- 5. RPC transacional para guardar os 7 dias do horário semanal de uma só vez
-- -----------------------------------------------------------------------------
create or replace function public.upsert_restaurant_hours(
  p_restaurant_id uuid,
  p_days jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_entry jsonb;
  v_day integer;
  v_closed boolean;
  v_slots jsonb;
begin
  if not app_private.is_restaurant_member(p_restaurant_id) then
    raise exception 'Sem permissão para atualizar o horário deste restaurante.'
      using errcode = '42501';
  end if;

  if jsonb_typeof(p_days) <> 'array' or jsonb_array_length(p_days) <> 7 then
    raise exception 'O horário semanal deve conter exatamente os 7 dias da semana.'
      using errcode = '22023';
  end if;

  for v_entry in select * from jsonb_array_elements(p_days)
  loop
    v_day := (v_entry ->> 'day_of_week')::integer;
    v_closed := coalesce((v_entry ->> 'closed')::boolean, false);
    v_slots := coalesce(v_entry -> 'slots', '[]'::jsonb);

    if v_day is null or v_day < 0 or v_day > 6 then
      raise exception 'Dia da semana inválido no horário.'
        using errcode = '22023';
    end if;

    if v_closed then
      v_slots := '[]'::jsonb;
    end if;

    insert into public.restaurant_hours (restaurant_id, day_of_week, closed, slots)
    values (p_restaurant_id, v_day::smallint, v_closed, v_slots)
    on conflict (restaurant_id, day_of_week) do update
      set closed = excluded.closed,
          slots = excluded.slots;
  end loop;
end;
$$;

revoke all on function public.upsert_restaurant_hours(uuid, jsonb) from public;
grant execute on function public.upsert_restaurant_hours(uuid, jsonb) to authenticated, service_role;
