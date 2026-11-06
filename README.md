# Ementa Digital — Menus Digitais Multi-Restaurante

Plataforma SaaS leve de menus digitais para restaurantes (Grupos 1, 2 e 3 do MVP), construída com **Next.js App Router**, **TypeScript (`strict`)**, **Tailwind CSS** e **Supabase (`@supabase/ssr`)**, preparada para alojamento gratuito em **Vercel** + **Supabase Free Tier**.

> **Escopo atual (Grupos 1 + 2 + 3):** apenas consulta e gestão de ementas digitais (categorias, pratos, fotografias, temas visuais, código QR e módulos opcionais). Sem encomendas, reservas, pagamentos ou planos comerciais. Sem GitHub Actions.
>
> **Regra de produto:** o lado público é **só a carta** (`/r/[slug]`). O dono gere em **`/admin`**. Não há registo self-serve nem links públicos para o painel — contas e restaurantes são **provisionados** por nós.

---

## Funcionalidades incluídas

- **Autenticação de Proprietários (`email` + `password`)** via Supabase Auth em **`/admin/login`** (sem registo público). O painel (CRUD de categorias e pratos, fotos, preços, módulos, tema e publicar) vive em **`/admin`** e **`/admin/restaurante`**.
  - Rotas antigas `/dashboard`, `/dashboard/*` e `/login` respondem **308** para o equivalente em `/admin`.
  - `/admin/registar` e `/admin/onboarding` foram removidas (404, sem redirect para o login).
  - O middleware protege `/admin/*` excepto login.
  - O redirect de confirmação de email aponta para `/admin`. No Supabase, o allow-list tem de cobrir **`/admin/**`**.
  - A RPC `create_owner_restaurant` só pode ser executada com **`service_role`** (não por `authenticated` nem `anon`).
- **Módulos Opcionais por Restaurante** (desligados por defeito; quando desligados, não aparecem nem no painel nem no menu público):
  - **`languages` (PT / EN):** edição de traduções em inglês para categorias, pratos e descrição do restaurante (`translations` JSONB), seletor acessível no menu público (`/r/[slug]?lang=en`), `hreflang` alternates (`pt-PT`, `en`, `x-default`), atributo `lang` no `<html>` e fallback automático para português.
  - **`allergens` (14 Alergénios da UE):** seleção dos 14 alergénios oficiais do Regulamento (UE) 1169/2011 por prato; no menu abrem numa ficha (bottom sheet).
  - **`highlights` (Destaques):** marcação interna de pratos. No menu público **não existe secção «Em Destaque»**. Só o selo pontual **«Da casa»** aparece quando o prato está marcado como destaque da casa.
  - **`hours` (Horário Semanal):** editor dos 7 dias da semana (até 2 turnos por dia ou encerrado) via RPC transacional `upsert_restaurant_hours`, exibido no menu com cálculo automático de **Aberto agora / Encerrado de momento** no fuso `Europe/Lisbon` (incluindo horário de verão e turnos após a meia-noite).
- **Três Temas Visuais (contraste AA + mobile-first)**, com tokens CSS (`--color-*`, `--font-*`, `--radius-*`):
  - **Clássico** (`classico`, default da demo): Fraunces 600 + Inter 16px, fundo `#F5EFE6`, texto `#2B2B2B`, azulejo `#1F3A5F`, tijolo `#B5452B`. Hero ~35vh com foto de prato, categorias sticky com scroll-spy, lista tipo carta (nome, linha pontilhada, preço `12,50 €`, miniatura 72px) e ornamento de azulejo só no separador de categoria.
  - **Minimal Café** (`moderno`) e **Noir Gastronómico** (`escuro`).
  - Pré-visualização em `/admin/restaurante`. Alergénios da UE abrem num bottom sheet. Toggle PT/EN no topo do hero.
- **Armazenamento de Fotografias (`dish-photos`)**:
  - Bucket público para leitura (`public = true`); escrita, substituição e remoção continuam restritas por RLS aos membros de cada restaurante (`<restaurant_id>/...`).
  - Na BD guarda-se só o caminho do objeto; o servidor gera o URL público estável (`/storage/v1/object/public/dish-photos/...`). `photo_url` antigos (signed URLs) continuam a funcionar.
  - As fotografias são redimensionadas e comprimidas no browser antes do envio (lado maior ~1200 px, WebP/JPEG ~0,8, 200–400 KB), para caberem no limite de 1 MB das Server Actions.
  - Validação no servidor antes do upload: tamanho máximo (5 MB), tipo MIME declarado e inspeção binária de **magic bytes** (JPEG, PNG, WebP e AVIF).
- **Seed de Demonstração (`supabase/seed.sql`)**:
  - Restaurante fictício **Menu Restaurante**, tema `classico`, com os 4 módulos de exemplo ligados, traduções PT/EN, alergénios da UE, destaques, horário semanal e 15 pratos. As fotos são pratos reais (Unsplash/Pexels), não paisagens.

---

## Pré-requisitos

- **Node.js** 20+ (recomendado Node.js 22 LTS)
- **npm** 10+
- Um projeto **Supabase** (cloud gratuito ou instância local via Supabase CLI)

---

## Setup Local

1. **Clonar o repositório e instalar dependências:**

```bash
git clone https://github.com/NunoOliveira04/Menu.git
cd Menu
npm install
```

2. **Configurar variáveis de ambiente:**

```bash
cp .env.example .env.local
```

| Variável                        | Obrigatória | Descrição                                                                                              |
| :------------------------------ | :---------: | :----------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      |     Sim     | URL do projeto Supabase (`https://<project-ref>.supabase.co`)                                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |    Sim*     | Chave pública `anon` do projeto Supabase (*ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)                  |
| `NEXT_PUBLIC_APP_URL`           |     Não     | URL base usado na geração de links públicos, `hreflang` e códigos QR (padrão: `http://localhost:3000`) |
| `ENABLE_SUBDOMAIN_ROUTING`      |     Não     | Quando `true`, ativa reescrita de `<slug>.ROOT_DOMAIN` para `/r/<slug>` (padrão: `false`)              |
| `ROOT_DOMAIN`                   |     Não     | Domínio raiz usado quando `ENABLE_SUBDOMAIN_ROUTING=true` (ex.: `menudigital.pt`)                      |

---

## Autenticação: desligar signup público e provisionar um dono

Não existe self-serve. No **Supabase Dashboard**:

1. Abre **Authentication → Providers → Email** (ou **Authentication → Settings**, conforme a UI).
2. **Desliga** a opção **Allow new users to sign up** (impede `signUp` mesmo via API/anon key).
3. Confirma que o allow-list de redirects cobre `/admin/**` (ver secção Deploy).

### Provisionar um proprietário + restaurante

1. No dashboard: **Authentication → Users → Add user** (email + palavra-passe). Copia o `user_id` (UUID).
2. Com a **service role key** (nunca no frontend nem no repositório), cria o restaurante e a membership via RPC, por exemplo no **SQL Editor**:

```sql
-- Corre com o role service_role (SQL Editor do dashboard já tem privilégios elevados).
select public.create_owner_restaurant(
  'Menu Restaurante',          -- p_name
  'menu-restaurante',          -- p_slug
  'classico',                  -- p_style
  'Cozinha portuguesa de temporada.',  -- p_description (opcional)
  'Portugal'                   -- p_location (opcional)
);
-- Nota: a RPC usa auth.uid(). Para provisionar um user concreto fora de uma
-- sessão Auth, cria o restaurante + membership manualmente:

insert into public.restaurants (slug, name, description, location, style, published, settings)
values (
  'menu-restaurante',
  'Menu Restaurante',
  'Cozinha portuguesa de temporada.',
  'Portugal',
  'classico',
  false,
  '{"modules":{"languages":false,"allergens":false,"highlights":false,"hours":false}}'::jsonb
)
returning id;

-- Depois associa o dono (substitui os UUIDs):
insert into public.restaurant_members (restaurant_id, user_id, role)
values ('<restaurant_id>', '<auth_user_id>', 'owner');
```

O dono inicia sessão em `/admin/login`. Uma conta autenticada **sem** restaurante vê em `/admin`: «Conta sem restaurante associado. Contacte o suporte.»

---

## Aplicar Migrações e Dados de Demonstração (Supabase)

### Opção A — Painel Web do Supabase

1. Abre o **SQL Editor** no dashboard do teu projeto Supabase.
2. Executa por ordem:
   - [`supabase/migrations/20261105000000_mvp_group_1_init.sql`](./supabase/migrations/20261105000000_mvp_group_1_init.sql)
   - [`supabase/migrations/20261105010000_mvp_group_2_modules.sql`](./supabase/migrations/20261105010000_mvp_group_2_modules.sql)
   - [`supabase/migrations/20261105020000_mvp_group_3_demo_food_photos.sql`](./supabase/migrations/20261105020000_mvp_group_3_demo_food_photos.sql)
   - [`supabase/migrations/20261105235900_public_menu_only_revoke_signup_rpc.sql`](./supabase/migrations/20261105235900_public_menu_only_revoke_signup_rpc.sql)
3. _(Opcional)_ Executa [`supabase/seed.sql`](./supabase/seed.sql) para carregar o **Menu Restaurante** (`/r/menu-restaurante` e `/r/menu-restaurante?lang=en`).

### Opção B — Supabase CLI

```bash
npx supabase link --project-ref <o-teu-project-ref>
npx supabase db push
```

---

## Executar e Validar o Projeto

```bash
npm run dev
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

---

## Limitações Atuais

- **Sem registo self-serve:** signup público desligado; restaurantes criados só via provisionamento (`service_role` / SQL).
- **Idiomas suportados no Grupo 2:** Português (`pt-PT` base) e Inglês (`en`).

---

## Deploy na Vercel (Plano Gratuito)

Demo: [https://menu-drab-psi.vercel.app](https://menu-drab-psi.vercel.app) · menu público `/r/menu-restaurante`.

1. Importa o repositório GitHub na **Vercel**.
2. Configura `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_APP_URL` (`https://menu-drab-psi.vercel.app` na demo).
3. No **Supabase Dashboard → Authentication → URL Configuration**:
   - **Site URL:** `https://menu-drab-psi.vercel.app`
   - **Redirect URLs:** `https://menu-drab-psi.vercel.app/admin/**` e `http://localhost:3000/admin/**`
4. Desliga **Allow new users to sign up** (ver secção acima).
5. Faz deploy. Não há workflow de GitHub Actions neste repositório.
