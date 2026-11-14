import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Check,
  Info,
  Languages,
  Mail,
  MessageCircle,
  Palette,
  Plus,
  RefreshCw,
  Tag,
  ZoomIn,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MARKETING_CONTACT,
  buildEmailUrl,
  buildWhatsAppUrl,
  type MarketingContact,
} from '@/lib/marketing/contact';

/*
 * Página de apresentação de «O Seu Menu» (oseumenu.pt/).
 * Componente de servidor, sem JavaScript próprio no cliente: a página é gerada no build.
 *
 * Estilo «bistrô editorial»: tinta quente (#151210), creme (#F4ECDF), açafrão (#F0B23E)
 * e verde-azeite (#2E4733). Títulos em Instrument Serif (variável --font-landing-display,
 * carregada só nesta página) e texto em Inter. Combinações usadas, todas AA:
 * creme sobre tinta ≈ 16:1, tinta sobre açafrão ≈ 9,6:1, creme sobre azeite ≈ 9:1,
 * açafrão-escuro (#8A5A08) sobre creme ≈ 4,8:1.
 */

export const LANDING_TAGLINE =
  'A carta do seu restaurante no telemóvel dos clientes, em português e inglês, que muda em segundos sem reimprimir nada.';

const HERO_POINTS = ['Sem instalar nada', 'Português e inglês', 'Muda em segundos'];

const STEPS: { label: string; title: string; text: string }[] = [
  {
    label: 'Entrada',
    title: 'Nós passamos a sua carta',
    text: 'Envie-nos a carta em papel, em PDF ou numa fotografia. Nós passamos os pratos, os preços, as fotos e os alergénios.',
  },
  {
    label: 'Prato principal',
    title: 'Pomos os QR codes nas mesas',
    text: 'Os clientes apontam a câmara do telemóvel e a carta abre logo.',
  },
  {
    label: 'Sobremesa',
    title: 'Muda preços e pratos no seu telemóvel, quando quiser',
    text: 'Um preço novo ou um prato esgotado aparece na carta logo a seguir.',
  },
];

interface Showcase {
  kicker: string;
  title: string;
  text: string;
  points: string[];
  image: { src: string; alt: string; width: number; height: number };
}

const SHOWCASE: Showcase[] = [
  {
    kicker: 'Pratos esgotados',
    title: 'Acabou? Um toque e fica esgotado.',
    text: 'Cada prato tem um interruptor Disponível / Esgotado. Na carta, o prato continua à vista com o preço riscado, e os clientes deixam de o pedir.',
    points: [
      'Volta a ficar disponível com outro toque',
      'Pratos e categorias reordenam-se com as setas',
    ],
    image: {
      src: '/apresentacao/painel-pratos.webp',
      alt: 'Painel do restaurante no telemóvel: lista de pratos com o interruptor Disponível ou Esgotado em cada um',
      width: 560,
      height: 1212,
    },
  },
  {
    kicker: 'Preços e pratos',
    title: 'Mudar um preço demora segundos',
    text: 'Abra o prato, escreva o novo preço e guarde. A carta atualiza logo, sem reimprimir nada.',
    points: [
      'Fotografia tirada no próprio telemóvel, reduzida automaticamente',
      'Tradução para inglês ao lado do português',
      'Alergénios marcados com um toque',
    ],
    image: {
      src: '/apresentacao/painel-editar.webp',
      alt: 'Painel do restaurante no telemóvel: formulário para editar um prato, com nome, preço, categoria e fotografia',
      width: 560,
      height: 1212,
    },
  },
  {
    kicker: 'QR code',
    title: 'O QR code das mesas, pronto a imprimir',
    text: 'O QR code da sua carta está no painel. Descarregue-o em PNG ou em SVG, imprima-o e ponha-o nas mesas.',
    points: [
      'É sempre o mesmo, mesmo quando muda a carta',
      'Copie o link para partilhar nas redes sociais',
    ],
    image: {
      src: '/apresentacao/painel-qr.webp',
      alt: 'Painel do restaurante no telemóvel: QR code da carta com os botões Copiar link, PNG e SVG',
      width: 560,
      height: 670,
    },
  },
];

const BENEFITS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: RefreshCw,
    title: 'Muda em segundos',
    text: 'Altera um preço ou um prato no telemóvel, sem reimprimir nada.',
  },
  {
    icon: Tag,
    title: 'Esgotados à vista',
    text: 'O prato fica na carta com o preço riscado. Acabam-se os «isso já não há».',
  },
  {
    icon: Languages,
    title: 'Inglês com um toque',
    text: 'A carta inteira muda para inglês com um botão. Ideal para turistas.',
  },
  {
    icon: Info,
    title: 'Alergénios claros',
    text: 'Prato a prato, com os 14 alergénios previstos na lei.',
  },
  {
    icon: ZoomIn,
    title: 'Fotos que se ampliam',
    text: 'As fotos dos pratos abrem em grande com um toque.',
  },
  {
    icon: Palette,
    title: 'Com a cara do restaurante',
    text: 'O seu logotipo, e o fundo e a cor à sua escolha.',
  },
  {
    icon: Camera,
    title: 'Abre com a câmara',
    text: 'Os clientes não precisam de instalar nada.',
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: 'E se os clientes preferirem papel?',
    answer:
      'Pode continuar com a carta de papel. A carta digital complementa: cada cliente usa a que preferir, e a digital tem sempre os preços certos.',
  },
  {
    question: 'Preciso de perceber de informática?',
    answer:
      'Não. Se usa o WhatsApp, consegue usar isto. Nós passamos a sua carta e mostramos-lhe como mudar um preço ou marcar um prato como esgotado.',
  },
  {
    question: 'E se a internet do restaurante falhar?',
    answer:
      'A carta abre no telemóvel do cliente, com os dados móveis dele. Não depende da internet do restaurante.',
  },
  {
    question: 'Quanto custa?',
    answer:
      'O primeiro mês é grátis e sem compromisso. O resto combina-se connosco, à medida do seu restaurante.',
  },
  {
    question: 'Dá para fazer encomendas ou pagamentos?',
    answer:
      'Não. O Seu Menu é só a carta: os clientes consultam os pratos e fazem o pedido como sempre.',
  },
];

const FOCUS_RING =
  'focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F0B23E]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#151210]';
const BUTTON_BASE = `inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full px-7 text-base font-semibold transition ${FOCUS_RING}`;
const BUTTON_SAFFRON = `${BUTTON_BASE} bg-[#F0B23E] text-[#151210] hover:bg-[#F6C25E]`;
const BUTTON_GHOST_LIGHT = `${BUTTON_BASE} border border-[#F4ECDF]/40 text-[#F4ECDF] hover:border-[#F4ECDF] hover:bg-[#F4ECDF]/10`;

function Tag2({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[13px] font-semibold uppercase tracking-[0.16em] ${
        dark
          ? 'border-[#F4ECDF]/25 text-[#F0B23E]'
          : 'border-[#151210]/15 bg-[#F4ECDF] text-[#8A5A08]'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </p>
  );
}

/** Moldura de telemóvel (só CSS). */
function PhoneFrame({
  children,
  height,
  className = '',
}: {
  children: React.ReactNode;
  height: number;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto w-[280px] shrink-0 rounded-[46px] bg-[#0B0908] p-[10px] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.75)] ring-1 ring-white/10 ${className}`}
    >
      <div
        className="relative w-[260px] overflow-hidden rounded-[36px] bg-white"
        style={{ height }}
      >
        {children}
      </div>
    </div>
  );
}

/** A carta de exemplo (/demo), num iframe 390×844 reduzido para caber na moldura. */
function MenuPreview() {
  return (
    <PhoneFrame height={562} className="lg:rotate-[3deg]">
      <iframe
        src="/demo"
        title="Exemplo de carta no telemóvel"
        loading="lazy"
        className="absolute left-0 top-0 h-[844px] w-[390px] origin-top-left scale-[0.6667] border-0"
      />
    </PhoneFrame>
  );
}

export function ContactButtons({ contact }: { contact: MarketingContact }) {
  const whatsappUrl = buildWhatsAppUrl(contact.whatsapp);
  const emailUrl = buildEmailUrl(contact.email);
  if (!whatsappUrl && !emailUrl) {
    return null;
  }
  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          className={`${BUTTON_BASE} bg-[#151210] text-[#F4ECDF] hover:bg-[#2A221D]`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Falar no WhatsApp
        </a>
      )}
      {emailUrl && (
        <a
          href={emailUrl}
          className={`${BUTTON_BASE} border-2 border-[#151210] text-[#151210] hover:bg-[#151210] hover:text-[#F4ECDF]`}
        >
          <Mail className="h-5 w-5" aria-hidden="true" />
          Enviar e-mail
        </a>
      )}
    </div>
  );
}

function Marquee() {
  const items = [...HERO_POINTS, ...HERO_POINTS, ...HERO_POINTS];
  return (
    <div
      className="overflow-hidden border-y border-[#151210] bg-[#F0B23E] py-4 text-[#151210]"
      aria-hidden="true"
    >
      <div className="osm-marquee">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {items.map((point, index) => (
              <span
                key={`${copy}-${index}`}
                className="osm-display flex items-center gap-8 px-4 text-[1.7rem] italic sm:text-3xl"
              >
                {point}
                <span className="text-xl not-italic">✺</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingPage({
  contact = MARKETING_CONTACT,
  year = new Date().getFullYear(),
  fontClassName = '',
}: {
  contact?: MarketingContact;
  year?: number;
  fontClassName?: string;
}) {
  return (
    <div
      className={`${fontClassName} min-h-screen overflow-x-hidden bg-[#F4ECDF] font-sans text-[#151210] antialiased`}
    >
      {/* 1. Topo (escuro) */}
      <div className="osm-grain bg-[#151210] text-[#F4ECDF]">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-5">
          <span className="osm-display text-2xl">
            O Seu <em className="text-[#F0B23E]">Menu</em>
          </span>
          <a
            href="#contacto"
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full px-4 text-sm font-semibold text-[#F4ECDF] hover:bg-[#F4ECDF]/10 ${FOCUS_RING}`}
          >
            Contacto
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </header>

        <main>
          <section className="relative">
            <div
              className="pointer-events-none absolute right-[-10%] top-[10%] h-[520px] w-[520px] rounded-full bg-[#F0B23E]/20 blur-[120px]"
              aria-hidden="true"
            />
            <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-16 px-5 pb-20 pt-12 sm:pt-16 lg:flex-row lg:items-center lg:gap-8 lg:pb-28 lg:pt-20">
              <div className="max-w-2xl text-center lg:flex-[1.15] lg:text-left">
                <Tag2 dark>Primeiro mês grátis e sem compromisso</Tag2>
                <h1 className="osm-display mt-7 text-[4.6rem] leading-[0.88] sm:text-[6.5rem] lg:text-[7.5rem]">
                  O Seu <em className="text-[#F0B23E]">Menu</em>
                </h1>
                <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-[#F4ECDF]/80 sm:text-xl lg:mx-0">
                  {LANDING_TAGLINE}
                </p>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Link href="/demo" prefetch={false} className={BUTTON_SAFFRON}>
                    Ver exemplo
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                  <a href="#contacto" className={BUTTON_GHOST_LIGHT}>
                    Falar connosco
                  </a>
                </div>
              </div>

              <div className="relative lg:flex-1">
                <MenuPreview />
                <div
                  className="absolute -left-8 top-16 hidden h-28 w-28 -rotate-12 flex-col items-center justify-center rounded-full bg-[#F0B23E] text-center text-[#151210] shadow-xl sm:flex"
                  aria-hidden="true"
                >
                  <span className="osm-display text-3xl leading-none">1.º mês</span>
                  <span className="mt-1 text-xs font-bold uppercase tracking-widest">grátis</span>
                </div>
                <div
                  className="absolute -right-6 bottom-24 hidden items-center gap-2 rounded-2xl bg-[#F4ECDF] px-4 py-3 text-sm font-semibold text-[#151210] shadow-xl sm:flex"
                  aria-hidden="true"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2E4733] text-[#F4ECDF]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  Preço atualizado
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Marquee />

      {/* 2. Como funciona */}
      <section aria-labelledby="como-funciona" className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Tag2>Em três passos</Tag2>
              <h2
                id="como-funciona"
                className="osm-display mt-5 text-[3.2rem] leading-[0.95] sm:text-[4.5rem]"
              >
                Como <em>funciona</em>
              </h2>
            </div>
          </div>
          <ol className="mt-14 grid border-t border-[#151210] md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="border-b border-[#151210]/20 py-8 md:border-b-0 md:border-r md:px-8 md:py-10 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="osm-display text-7xl leading-none text-[#151210]/90">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A5A08]">
                    {step.label}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold leading-snug">
                  <span className="sr-only">Passo {index + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-[#151210]/75">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3. O painel: como é fácil gerir a carta */}
      <section aria-labelledby="painel" className="bg-[#EADFCB] py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-5">
          <div className="max-w-3xl">
            <Tag2>O painel do restaurante</Tag2>
            <h2
              id="painel"
              className="osm-display mt-5 text-[2.9rem] leading-[0.98] sm:text-[4.2rem]"
            >
              Gerir a carta é tão fácil como <em className="text-[#2E4733]">enviar uma mensagem</em>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#151210]/75">
              Tudo se faz no telemóvel, no painel do seu restaurante. Sem chamar ninguém e sem
              esperar.
            </p>
          </div>

          <div className="mt-20 space-y-24 lg:space-y-32">
            {SHOWCASE.map((item, index) => (
              <article
                key={item.title}
                className={`flex flex-col items-center gap-12 lg:gap-24 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
                }`}
              >
                <div className="relative lg:flex-1">
                  <div
                    className={`absolute inset-x-4 inset-y-10 rounded-[3rem] sm:inset-x-0 ${
                      index % 2 === 1 ? 'bg-[#2E4733]' : 'bg-[#F0B23E]'
                    } ${index % 2 === 1 ? '-rotate-3' : 'rotate-3'}`}
                    aria-hidden="true"
                  />
                  <PhoneFrame
                    height={Math.min(520, Math.round((260 * item.image.height) / item.image.width))}
                  >
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      width={item.image.width}
                      height={item.image.height}
                      sizes="260px"
                      loading="lazy"
                      className="h-full w-full object-cover object-top"
                    />
                  </PhoneFrame>
                </div>
                <div className="max-w-lg lg:flex-1">
                  <p className="osm-display text-2xl italic text-[#8A5A08]">
                    {String(index + 1).padStart(2, '0')} — {item.kicker}
                  </p>
                  <h3 className="osm-display mt-3 text-[2.4rem] leading-[1.02] sm:text-[3rem]">
                    {item.title}
                  </h3>
                  <p className="mt-5 text-lg leading-relaxed text-[#151210]/75">{item.text}</p>
                  <ul className="mt-7 space-y-3">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#151210] text-[#F0B23E]">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Vantagens, como uma carta de restaurante */}
      <section aria-labelledby="vantagens" className="py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-5">
          <div className="osm-grain overflow-hidden rounded-[2.5rem] bg-[#151210] px-6 py-14 text-[#F4ECDF] sm:px-14 sm:py-16">
            <div className="text-center">
              <Tag2 dark>Para os seus clientes</Tag2>
              <h2
                id="vantagens"
                className="osm-display mt-5 text-[2.8rem] leading-none sm:text-[4rem]"
              >
                Uma carta que <em className="text-[#F0B23E]">dá gosto</em> usar
              </h2>
              <div
                className="mx-auto mt-6 flex items-center justify-center gap-3 text-[#F0B23E]"
                aria-hidden="true"
              >
                <span className="h-px w-16 bg-current opacity-50" />✺
                <span className="h-px w-16 bg-current opacity-50" />
              </div>
            </div>
            <ul className="mt-12 grid gap-x-14 gap-y-8 md:grid-cols-2">
              {BENEFITS.map((benefit) => (
                <li key={benefit.title}>
                  <div className="flex items-end gap-3">
                    <h3 className="osm-display text-[1.65rem] leading-tight">{benefit.title}</h3>
                    <span className="osm-leader" aria-hidden="true" />
                    <benefit.icon className="h-5 w-5 shrink-0 text-[#F0B23E]" aria-hidden="true" />
                  </div>
                  <p className="mt-1.5 leading-relaxed text-[#F4ECDF]/70">{benefit.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Domínio */}
      <section aria-labelledby="dominio" className="osm-grain bg-[#2E4733] py-24 text-[#F4ECDF]">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <Tag2 dark>O seu endereço</Tag2>
          <h2 id="dominio" className="osm-display mt-5 text-[2.8rem] leading-none sm:text-[4rem]">
            O endereço da sua carta
          </h2>
          <p
            className="osm-display mx-auto mt-10 break-words text-[2rem] italic leading-tight text-[#F0B23E] sm:text-[3.2rem]"
            aria-hidden="true"
          >
            oseumenu.pt/
            <span className="underline decoration-2 underline-offset-8">o-seu-restaurante</span>
          </p>
          <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed">
            Fica em oseumenu.pt/o-seu-restaurante, ou no domínio do seu restaurante, se já tiver um.
          </p>
        </div>
      </section>

      {/* 6. Perguntas frequentes */}
      <section aria-labelledby="perguntas" className="py-24 lg:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <Tag2>Dúvidas</Tag2>
            <h2
              id="perguntas"
              className="osm-display mt-5 text-[3.2rem] leading-[0.95] sm:text-[4.5rem]"
            >
              Perguntas <em>frequentes</em>
            </h2>
          </div>
          <div className="border-t border-[#151210]">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group border-b border-[#151210]/20">
                <summary
                  className={`flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden ${FOCUS_RING} focus-visible:ring-offset-[#F4ECDF]`}
                >
                  <span className="osm-display text-[1.6rem] leading-tight sm:text-[1.9rem]">
                    {faq.question}
                  </span>
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#151210] transition group-open:rotate-45 group-open:bg-[#151210] group-open:text-[#F0B23E]"
                    aria-hidden="true"
                  >
                    <Plus className="h-5 w-5" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 text-lg leading-relaxed text-[#151210]/75">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Contacto */}
      <section id="contacto" aria-labelledby="contacto-titulo" className="scroll-mt-4 px-5 pb-24">
        <div className="osm-grain relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-[#F0B23E] px-6 py-16 text-[#151210] sm:px-14 sm:py-20">
          <span
            className="osm-display pointer-events-none absolute -bottom-16 -right-6 select-none text-[16rem] leading-none text-[#151210]/[0.07]"
            aria-hidden="true"
          >
            ✺
          </span>
          <div className="relative max-w-3xl">
            <h2
              id="contacto-titulo"
              className="osm-display text-[3rem] leading-[0.95] sm:text-[4.8rem]"
            >
              Vamos mostrar-lhe <em>a sua carta</em>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed sm:text-xl">
              Marcamos uma demonstração de 10 minutos no seu restaurante, com a sua própria carta no
              telemóvel. O primeiro mês é grátis e sem compromisso.
            </p>
            <ContactButtons contact={contact} />
          </div>
        </div>
      </section>

      {/* 8. Rodapé */}
      <footer className="bg-[#151210] text-[#F4ECDF]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm sm:flex-row">
          <p className="flex items-center gap-2">
            <span className="osm-display text-xl">
              O Seu <em className="text-[#F0B23E]">Menu</em>
            </span>
            <span className="text-[#F4ECDF]/70">· {year}</span>
          </p>
          <Link
            href="/admin"
            prefetch={false}
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full px-3 text-[#F4ECDF]/80 underline-offset-4 hover:text-[#F4ECDF] hover:underline ${FOCUS_RING}`}
          >
            Área do restaurante
          </Link>
        </div>
      </footer>
    </div>
  );
}
