# Ementa Digital — Menus Digitais Multi-Restaurante

Plataforma SaaS leve de menus digitais para restaurantes (Grupo 1 do MVP), construída com **Next.js App Router**, **TypeScript (`strict`)**, **Tailwind CSS** e **Supabase (`@supabase/ssr`)**, preparada para alojamento gratuito em **Vercel** + **Supabase Free Tier**.

> **Escopo atual (Grupo 1):** apenas consulta e gestão de ementas digitais (categorias, pratos, fotografias, temas visuais e código QR). Sem encomendas, reservas, pagamentos ou planos comerciais.

---

## Funcionalidades incluídas

- **Autenticação de Proprietários (`email` + `password`)** via Supabase Auth (`/login`, `/registar`) e fluxo de criação do 1.º restaurante (`/onboarding`).
- **Base de Dados Multi-Restaurante com Row Level Security (RLS)** em todas as tabelas:
  - `restaurants`: `slug` único, `name`, `description`, `location`, `style` (`classico` | `moderno` | `escuro`), `published` e `settings` (`jsonb` com módulos opcionais `languages`, `allergens`, `highlights`, `hours` **desligados por defeito**).
  - `restaurant_members`: controlo de acesso por restaurante (`owner`, `manager`, `editor`).
  - `categories`: ordenação explícita por `position`.
  - `dishes`: `name`, `description`, `price_cents`, `photo_url`, `available`, `position`, `translations` (`jsonb`).
  - Bucket `dish-photos` no Supabase Storage com políticas isoladas por pasta `<restaurant_id>/...` e validação de tipo MIME (`jpeg`, `png`, `webp`, `avif`) e tamanho máximo (5 MB).
- **Painel de Gestão em PT-PT (`/dashboard`)**:
  - CRUD completo de categorias e pratos com Server Actions validadas por **Zod**.
  - Reordenação de categorias e pratos (`position`), ativação/indisponibilidade rápida e upload/remoção de fotografias.
  - Edição das definições do restaurante, publicação, escolha de tema e interruptores dos módulos opcionais (`/dashboard/restaurante`).
  - Cartão com **Código QR** gerado no servidor (download em **PNG** e **SVG vetorial**) + cópia rápida do link público.
- **Menu Público Mobile-First (`/r/[slug]`)**:
  - Tema **Clássico Editorial** polido (tipografia serifada + sans-serif, `next/image`, prioridade LCP na primeira fotografia visível, navegação horizontal sticky por categorias, skip-link e semântica acessível).
  - Arquitetura de temas pronta também para **Moderno** e **Escuro**.
  - Roteamento opcional por subdomínio (`<slug>.dominio.pt` → `/r/<slug>`) no middleware, controlado por variável de ambiente.
- **Seed de Demonstração (`supabase/seed.sql`)**:
  - Restaurante fictício **Tasca do Castelo** (Guimarães), 5 categorias e 15 pratos tradicionais com imagens placeholder livres.

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

Copia o ficheiro `.env.example` para `.env.local` e preenche os valores do teu projeto Supabase:

```bash
cp .env.example .env.local
```

| Variável                        | Obrigatória | Descrição                                                                                  |
| :------------------------------ | :---------: | :----------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      |     Sim     | URL do projeto Supabase (`https://<project-ref>.supabase.co`)                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |    Sim*     | Chave pública `anon` do projeto Supabase (*ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)      |
| `NEXT_PUBLIC_APP_URL`           |     Não     | URL base usado na geração de links públicos e códigos QR (padrão: `http://localhost:3000`) |
| `ENABLE_SUBDOMAIN_ROUTING`      |     Não     | Quando `true`, ativa reescrita de `<slug>.ROOT_DOMAIN` para `/r/<slug>` (padrão: `false`)  |
| `ROOT_DOMAIN`                   |     Não     | Domínio raiz usado quando `ENABLE_SUBDOMAIN_ROUTING=true` (ex.: `menudigital.pt`)          |

> Nunca coloques a chave `service_role` em variáveis `NEXT_PUBLIC_*` nem no repositório.

---

## Aplicar Migrações e Dados de Demonstração (Supabase)

### Opção A — Painel Web do Supabase (mais rápido)

1. Abre o **SQL Editor** no dashboard do teu projeto Supabase.
2. Cola e executa o conteúdo de [`supabase/migrations/20261105000000_mvp_group_1_init.sql`](./supabase/migrations/20261105000000_mvp_group_1_init.sql).
3. _(Opcional)_ Para carregar o restaurante fictício **Tasca do Castelo**, cola e executa [`supabase/seed.sql`](./supabase/seed.sql). O menu ficará imediatamente visível em `/r/tasca-do-castelo`.

### Opção B — Supabase CLI

```bash
npx supabase link --project-ref <o-teu-project-ref>
npx supabase db push
# Para aplicar a seed localmente ou via psql:
# npx supabase db reset (em ambiente local Docker)
```

---

## Executar e Validar o Projeto

```bash
# Servidor de desenvolvimento (http://localhost:3000)
npm run dev

# Verificação estrita de tipos TypeScript
npm run typecheck

# Linter (ESLint) e formatação (Prettier)
npm run lint
npm run format:check

# Testes unitários (Vitest)
npm test

# Build de produção
npm run build
```

---

## Deploy na Vercel (Plano Gratuito)

1. Importa o repositório GitHub na **Vercel**.
2. Em **Settings → Environment Variables**, define:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (ex.: `https://o-teu-dominio.vercel.app`)
   - _(Opcional, se configurares wildcard DNS)_ `ENABLE_SUBDOMAIN_ROUTING=true` e `ROOT_DOMAIN=teudominio.pt`
3. No **Supabase Dashboard → Authentication → URL Configuration**, adiciona o domínio da Vercel em **Site URL** e **Redirect URLs**.
4. Faz deploy — não são necessárias configurações extra de servidor nem planos pagos.
