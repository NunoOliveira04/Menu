import Link from 'next/link';
import { BookOpen, QrCode, Smartphone, Sparkles } from 'lucide-react';
import { getAuthenticatedUser } from '@/lib/auth/session';

export default async function HomePage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#1F1A17]">
      <header className="border-b border-[#E6DDD0] bg-[#FAF6F0]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8C3B2B] text-white">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-serif text-xl font-semibold tracking-tight text-[#1C1613]">
              Ementa Digital
            </span>
          </Link>

          <nav aria-label="Navegação principal" className="flex items-center gap-3">
            {user ? (
              <Link
                href="/admin"
                className="rounded-xl bg-[#8C3B2B] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#763123]"
              >
                Abrir painel
              </Link>
            ) : (
              <>
                <Link
                  href="/admin/login"
                  className="rounded-xl px-3.5 py-2 text-sm font-medium text-[#4A3F37] transition hover:bg-[#EFE7DC]"
                >
                  Iniciar sessão
                </Link>
                <Link
                  href="/admin/registar"
                  className="rounded-xl bg-[#8C3B2B] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#763123]"
                >
                  Criar menu
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DFD3C3] bg-[#F3ECE1] px-3.5 py-1 text-xs font-medium text-[#6C4A3B]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Menus digitais pensados para a mesa
          </span>

          <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-[#1C1613] sm:text-6xl">
            A carta do teu restaurante sempre atualizada, num simples código QR.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#5C5149] sm:text-lg">
            Organiza categorias e pratos com fotografias apelativas, marca um prato esgotado em
            segundos no telemóvel e partilha um menu editorial leve e legível com os teus clientes.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={user ? '/admin' : '/admin/registar'}
              className="w-full rounded-xl bg-[#8C3B2B] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#763123] sm:w-auto"
            >
              {user ? 'Ir para o meu painel' : 'Criar o meu restaurante'}
            </Link>
            <Link
              href="/r/tasca-do-castelo"
              className="w-full rounded-xl border border-[#D8CBB8] bg-white px-6 py-3.5 text-sm font-semibold text-[#3C322B] transition hover:border-[#8C3B2B] hover:text-[#8C3B2B] sm:w-auto"
            >
              Ver exemplo · Tasca do Castelo
            </Link>
          </div>
        </div>

        <section
          aria-label="Funcionalidades principais"
          className="mt-20 grid gap-6 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-[#EAE0D3] bg-white/80 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3ECE1] text-[#8C3B2B]">
              <Smartphone className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-serif text-xl font-semibold text-[#1C1613]">
              Leitura imediata no telemóvel
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#655950]">
              Sem PDFs pesados nem zoom. Navegação rápida por categorias, fotografias otimizadas e
              tipografia cuidada.
            </p>
          </div>

          <div className="rounded-2xl border border-[#EAE0D3] bg-white/80 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3ECE1] text-[#8C3B2B]">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-serif text-xl font-semibold text-[#1C1613]">
              Gestão simples em português
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#655950]">
              Adiciona pratos, altera preços, reordena secções e liga apenas os módulos que fazem
              sentido para a tua casa.
            </p>
          </div>

          <div className="rounded-2xl border border-[#EAE0D3] bg-white/80 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3ECE1] text-[#8C3B2B]">
              <QrCode className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-serif text-xl font-semibold text-[#1C1613]">
              Código QR pronto a imprimir
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#655950]">
              Descarrega o código QR em SVG ou PNG diretamente no painel e mantém sempre o mesmo
              endereço quando mudares a ementa.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
