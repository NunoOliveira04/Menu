-- Pedidos de demonstração feitos na página de apresentação (oseumenu.pt/).
--
-- O público (anon) só pode INSERIR, e só as colunas do formulário. Ninguém consegue ler
-- os pedidos pela API pública: consultam-se no painel do Supabase (ou com a service role).
-- Um gatilho limita os envios repetidos e o volume, para travar spam.

create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 80),
  restaurant text not null check (char_length(restaurant) between 2 and 120),
  phone text not null check (phone ~ '^\+?[0-9 ]{9,20}$'),
  email text check (
    email is null
    or (char_length(email) <= 160 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  ),
  consent boolean not null check (consent)
);

comment on table public.demo_requests is
  'Pedidos de demonstração da página de apresentação. Só inserção pública; leitura no painel do Supabase.';

alter table public.demo_requests enable row level security;

revoke all on public.demo_requests from anon, authenticated;
grant insert (name, restaurant, phone, email, consent) on public.demo_requests to anon, authenticated;

drop policy if exists demo_requests_insert_public on public.demo_requests;
create policy demo_requests_insert_public
  on public.demo_requests
  for insert
  to anon, authenticated
  with check (consent);

-- Limites anti-spam: o mesmo telemóvel no máximo 1 vez a cada 10 minutos e, no total,
-- no máximo 30 pedidos por hora.
create or replace function app_private.demo_requests_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.demo_requests
    where phone = new.phone
      and created_at > now() - interval '10 minutes'
  ) then
    raise exception 'demo_request_duplicate' using errcode = 'P0001';
  end if;

  if (
    select count(*)
    from public.demo_requests
    where created_at > now() - interval '1 hour'
  ) >= 30 then
    raise exception 'demo_request_rate_limited' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function app_private.demo_requests_rate_limit() from public;

drop trigger if exists demo_requests_rate_limit on public.demo_requests;
create trigger demo_requests_rate_limit
  before insert on public.demo_requests
  for each row
  execute function app_private.demo_requests_rate_limit();
