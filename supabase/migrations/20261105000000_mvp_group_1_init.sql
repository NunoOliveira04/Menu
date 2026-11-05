-- =============================================================================
-- Menu Digital SaaS — Grupo 1 MVP Schema, RLS & Storage
-- =============================================================================

create extension if not exists pgcrypto;

-- Private schema for SECURITY DEFINER helpers (never exposed via PostgREST)
create schema if not exists app_private;
revoke all on schema app_private from public;
grant usage on schema app_private to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Utility trigger function for updated_at
-- -----------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 1. Restaurants
-- -----------------------------------------------------------------------------
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  description text,
  location text,
  style text not null default 'classico',
  published boolean not null default false,
  settings jsonb not null default '{"modules":{"languages":false,"allergens":false,"highlights":false,"hours":false}}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint restaurants_slug_unique unique (slug),
  constraint restaurants_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and char_length(slug) between 2 and 63
  ),
  constraint restaurants_name_length check (char_length(btrim(name)) between 1 and 120),
  constraint restaurants_style_allowed check (style in ('classico', 'moderno', 'escuro')),
  constraint restaurants_settings_is_object check (jsonb_typeof(settings) = 'object')
);

create index restaurants_published_slug_idx
  on public.restaurants (slug)
  where published = true;

create trigger set_restaurants_updated_at
  before update on public.restaurants
  for each row
  execute function public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 2. Restaurant Members
-- -----------------------------------------------------------------------------
create table public.restaurant_members (
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default timezone('utc', now()),
  primary key (restaurant_id, user_id),
  constraint restaurant_members_role_allowed check (role in ('owner', 'manager', 'editor'))
);

create index restaurant_members_user_id_idx on public.restaurant_members (user_id);

-- -----------------------------------------------------------------------------
-- 3. Categories
-- -----------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  description text,
  position integer not null default 0,
  translations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_name_length check (char_length(btrim(name)) between 1 and 80),
  constraint categories_position_non_negative check (position >= 0),
  constraint categories_translations_is_object check (jsonb_typeof(translations) = 'object')
);

create index categories_restaurant_position_idx
  on public.categories (restaurant_id, position, created_at);

create trigger set_categories_updated_at
  before update on public.categories
  for each row
  execute function public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 4. Dishes
-- -----------------------------------------------------------------------------
create table public.dishes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  description text,
  price_cents integer not null,
  photo_url text,
  available boolean not null default true,
  position integer not null default 0,
  translations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint dishes_name_length check (char_length(btrim(name)) between 1 and 120),
  constraint dishes_price_cents_non_negative check (price_cents >= 0),
  constraint dishes_position_non_negative check (position >= 0),
  constraint dishes_translations_is_object check (jsonb_typeof(translations) = 'object')
);

create index dishes_restaurant_category_position_idx
  on public.dishes (restaurant_id, category_id, position, created_at);

create trigger set_dishes_updated_at
  before update on public.dishes
  for each row
  execute function public.handle_updated_at();

-- Ensure dish.category_id always belongs to the same restaurant_id
create or replace function public.ensure_dish_category_restaurant_match()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_category_restaurant_id uuid;
begin
  select c.restaurant_id
    into v_category_restaurant_id
    from public.categories c
   where c.id = new.category_id;

  if v_category_restaurant_id is null or v_category_restaurant_id <> new.restaurant_id then
    raise exception 'A categoria selecionada não pertence ao restaurante indicado.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger check_dish_category_restaurant
  before insert or update on public.dishes
  for each row
  execute function public.ensure_dish_category_restaurant_match();

-- -----------------------------------------------------------------------------
-- Helper functions for RLS (in unexposed app_private schema)
-- -----------------------------------------------------------------------------
create or replace function app_private.is_restaurant_member(p_restaurant_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
      from public.restaurant_members rm
     where rm.restaurant_id = p_restaurant_id
       and rm.user_id = (select auth.uid())
  );
$$;

create or replace function app_private.is_restaurant_owner(p_restaurant_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
      from public.restaurant_members rm
     where rm.restaurant_id = p_restaurant_id
       and rm.user_id = (select auth.uid())
       and rm.role = 'owner'
  );
$$;

create or replace function app_private.is_restaurant_published(p_restaurant_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
      from public.restaurants r
     where r.id = p_restaurant_id
       and r.published = true
  );
$$;

revoke all on function app_private.is_restaurant_member(uuid) from public;
grant execute on function app_private.is_restaurant_member(uuid) to anon, authenticated, service_role;

revoke all on function app_private.is_restaurant_owner(uuid) from public;
grant execute on function app_private.is_restaurant_owner(uuid) to anon, authenticated, service_role;

revoke all on function app_private.is_restaurant_published(uuid) from public;
grant execute on function app_private.is_restaurant_published(uuid) to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Atomic RPC to create the owner's restaurant + membership in one transaction
-- -----------------------------------------------------------------------------
create or replace function public.create_owner_restaurant(
  p_name text,
  p_slug text,
  p_style text default 'classico',
  p_description text default null,
  p_location text default null
)
returns public.restaurants
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_restaurant public.restaurants;
begin
  if v_user_id is null then
    raise exception 'Autenticação obrigatória para criar um restaurante.'
      using errcode = '42501';
  end if;

  insert into public.restaurants (name, slug, style, description, location, published, settings)
  values (
    btrim(p_name),
    lower(btrim(p_slug)),
    coalesce(nullif(btrim(p_style), ''), 'classico'),
    nullif(btrim(p_description), ''),
    nullif(btrim(p_location), ''),
    false,
    '{"modules":{"languages":false,"allergens":false,"highlights":false,"hours":false}}'::jsonb
  )
  returning * into v_restaurant;

  insert into public.restaurant_members (restaurant_id, user_id, role)
  values (v_restaurant.id, v_user_id, 'owner');

  return v_restaurant;
end;
$$;

revoke all on function public.create_owner_restaurant(text, text, text, text, text) from public;
grant execute on function public.create_owner_restaurant(text, text, text, text, text) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Row Level Security (RLS) on all public tables
-- -----------------------------------------------------------------------------
alter table public.restaurants enable row level security;
alter table public.restaurant_members enable row level security;
alter table public.categories enable row level security;
alter table public.dishes enable row level security;

-- Restaurants: public read ONLY when published; members can read & update; owners can delete
create policy "restaurants_select_public_or_member"
  on public.restaurants
  for select
  to anon, authenticated
  using (
    published = true
    or app_private.is_restaurant_member(id)
  );

create policy "restaurants_update_member"
  on public.restaurants
  for update
  to authenticated
  using (app_private.is_restaurant_member(id))
  with check (app_private.is_restaurant_member(id));

create policy "restaurants_delete_owner"
  on public.restaurants
  for delete
  to authenticated
  using (app_private.is_restaurant_owner(id));

-- Restaurant members: members can read roster; owners manage memberships
create policy "restaurant_members_select_member"
  on public.restaurant_members
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or app_private.is_restaurant_member(restaurant_id)
  );

create policy "restaurant_members_insert_owner"
  on public.restaurant_members
  for insert
  to authenticated
  with check (app_private.is_restaurant_owner(restaurant_id));

create policy "restaurant_members_update_owner"
  on public.restaurant_members
  for update
  to authenticated
  using (app_private.is_restaurant_owner(restaurant_id))
  with check (app_private.is_restaurant_owner(restaurant_id));

create policy "restaurant_members_delete_owner"
  on public.restaurant_members
  for delete
  to authenticated
  using (app_private.is_restaurant_owner(restaurant_id));

-- Categories: public read ONLY when parent restaurant is published; members write
create policy "categories_select_published_or_member"
  on public.categories
  for select
  to anon, authenticated
  using (
    app_private.is_restaurant_published(restaurant_id)
    or app_private.is_restaurant_member(restaurant_id)
  );

create policy "categories_insert_member"
  on public.categories
  for insert
  to authenticated
  with check (app_private.is_restaurant_member(restaurant_id));

create policy "categories_update_member"
  on public.categories
  for update
  to authenticated
  using (app_private.is_restaurant_member(restaurant_id))
  with check (app_private.is_restaurant_member(restaurant_id));

create policy "categories_delete_member"
  on public.categories
  for delete
  to authenticated
  using (app_private.is_restaurant_member(restaurant_id));

-- Dishes: public read ONLY when parent restaurant is published; members write
create policy "dishes_select_published_or_member"
  on public.dishes
  for select
  to anon, authenticated
  using (
    app_private.is_restaurant_published(restaurant_id)
    or app_private.is_restaurant_member(restaurant_id)
  );

create policy "dishes_insert_member"
  on public.dishes
  for insert
  to authenticated
  with check (app_private.is_restaurant_member(restaurant_id));

create policy "dishes_update_member"
  on public.dishes
  for update
  to authenticated
  using (app_private.is_restaurant_member(restaurant_id))
  with check (app_private.is_restaurant_member(restaurant_id));

create policy "dishes_delete_member"
  on public.dishes
  for delete
  to authenticated
  using (app_private.is_restaurant_member(restaurant_id));

-- -----------------------------------------------------------------------------
-- Storage bucket 'dish-photos' & per-restaurant policies
-- Object path convention: <restaurant_id>/<dish_or_random_filename>
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dish-photos',
  'dish-photos',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function app_private.storage_restaurant_id(p_object_name text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_first_segment text;
begin
  v_first_segment := split_part(p_object_name, '/', 1);
  if v_first_segment ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return v_first_segment::uuid;
  end if;
  return null;
end;
$$;

revoke all on function app_private.storage_restaurant_id(text) from public;
grant execute on function app_private.storage_restaurant_id(text) to anon, authenticated, service_role;

create policy "dish_photos_select_published_or_member"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'dish-photos'
    and (
      app_private.is_restaurant_published(app_private.storage_restaurant_id(name))
      or app_private.is_restaurant_member(app_private.storage_restaurant_id(name))
    )
  );

create policy "dish_photos_insert_member"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'dish-photos'
    and app_private.is_restaurant_member(app_private.storage_restaurant_id(name))
  );

create policy "dish_photos_update_member"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'dish-photos'
    and app_private.is_restaurant_member(app_private.storage_restaurant_id(name))
  )
  with check (
    bucket_id = 'dish-photos'
    and app_private.is_restaurant_member(app_private.storage_restaurant_id(name))
  );

create policy "dish_photos_delete_member"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'dish-photos'
    and app_private.is_restaurant_member(app_private.storage_restaurant_id(name))
  );
