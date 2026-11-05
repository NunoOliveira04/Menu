# Ementa Digital — Menus Digitais Multi-Restaurante

Plataforma SaaS leve de menus digitais para restaurantes (Grupos 1 e 2 do MVP), construída com **Next.js App Router**, **TypeScript (`strict`)**, **Tailwind CSS** e **Supabase (`@supabase/ssr`)**, preparada para alojamento gratuito em **Vercel** + **Supabase Free Tier**.

> **Escopo atual (Grupos 1 + 2):** apenas consulta e gestão de ementas digitais (categorias, pratos, fotografias, temas visuais, código QR e módulos opcionais). Sem encomendas, reservas, pagamentos ou planos comerciais.

---

## Funcionalidades incluídas

- **Autenticação de Proprietários (`email` + `password`)** via Supabase Auth (`/login`, `/registar`) e fluxo de criação do 1.º restaurante (`/onboarding`).
  - **Limite de criação inicial:** a RPC `create_owner_restaurant` recusa chamadas quando o utilizador autenticado já possui qualquer registo em `restaurant_members`.
- **Módulos Opcionais por Restaurante** (desligados por defeito; quando desligados, não aparecem nem no painel nem no menu público):
  - **`languages` (PT / EN):** edição de traduções em inglês para categorias, pratos e descrição do restaurante (`translations` JSONB), seletor acessível no menu público (`/r/[slug]?lang=en`), `hreflang` alternates (`pt-PT`, `en`, `x-default`), atributo `lang` no `<html>` e fallback automático para português.
  - **`allergens` (14 Alergénios da UE):** seleção dos 14 alergénios oficiais do Regulamento (UE) 1169/2011 por prato, com etiquetas acessíveis numeradas nos pratos e legenda completa no fundo do menu.
  - **`highlights` (Destaques):** marcação de pratos como _Destaque da Casa_, _Recomendado pelo Chef_ ou _Novo na Carta_, com selos nos pratos e secção dedicada no topo do menu.
  - **`hours` (Horário Semanal):** editor dos 7 dias da semana (até 2 turnos por dia ou encerrado) via RPC transacional `upsert_restaurant_hours`, exibido no menu com cálculo automático de **Aberto agora / Encerrado de momento** no fuso `Europe/Lisbon` (incluindo horário de verão e turnos após a meia-noite).
- **Três Temas Visuais Completos (contraste AA + Mobile-First)**:
  - **Clássico Editorial** (`classico`), **Moderno Minimal** (`moderno`) e **Noturno Elegante** (`escuro`), com pré-visualização interativa ao vivo em `/dashboard/restaurante`.
- **Armazenamento Privado de Fotografias (`dish-photos`)**:
  - Bucket privado (`public = false`) com políticas RLS `SELECT` / `INSERT` / `UPDATE` / `DELETE` isoladas por `<restaurant_id>/...`.
  - Signed URLs geradas em lote no servidor com **TTL de 24 horas (86 400 s)** e revalidação periódica automática na página (`SignedUrlRefresher`) para evitar expiração em separadores abertos.
  - Validação no servidor antes do upload: tamanho máximo (5 MB), tipo MIME declarado e inspeção binária de **magic bytes** (JPEG, PNG, WebP e AVIF).
- **Seed de Demonstração (`supabase/seed.sql`)**:
  - Restaurante fictício **Tasca do Castelo** (Guimarães) com os 4 módulos de exemplo ligados, traduções completas PT/EN, alergénios da UE, destaques, horário semanal e 15 pratos tradicionais.

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

## Aplicar Migrações e Dados de Demonstração (Supabase)

### Opção A — Painel Web do Supabase

1. Abre o **SQL Editor** no dashboard do teu projeto Supabase.
2. Executa por ordem:
   - [`supabase/migrations/20261105000000_mvp_group_1_init.sql`](./supabase/migrations/20261105000000_mvp_group_1_init.sql)
   - [`supabase/migrations/20261105010000_mvp_group_2_modules.sql`](./supabase/migrations/20261105010000_mvp_group_2_modules.sql)
3. _(Opcional)_ Executa [`supabase/seed.sql`](./supabase/seed.sql) para carregar a **Tasca do Castelo** (`/r/tasca-do-castelo` e `/r/tasca-do-castelo?lang=en`).

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

- **1 restaurante criado por conta via onboarding:** `create_owner_restaurant` recusa criação caso o utilizador já tenha qualquer membership ativa em `restaurant_members`.
- **Idiomas suportados no Grupo 2:** Português (`pt-PT` base) e Inglês (`en`).

---

## Deploy na Vercel (Plano Gratuito)

1. Importa o repositório GitHub na **Vercel**.
2. Configura `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_APP_URL`.
3. No **Supabase Dashboard → Authentication → URL Configuration**, adiciona o domínio da Vercel em **Site URL** e **Redirect URLs**.
4. Faz deploy.
