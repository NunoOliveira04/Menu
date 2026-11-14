import {
  ArrowRight,
  Camera,
  Check,
  ClipboardList,
  Info,
  Languages,
  Mail,
  MessageCircle,
  Palette,
  QrCode,
  RefreshCw,
  Smartphone,
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
 * Cores: papel #F5EFE6, texto #2B2B2B, azul #1F3A5F, tijolo #B5452B (todas com contraste AA).
 */

export const LANDING_TAGLINE =
  'A carta do seu restaurante no telemóvel dos clientes, em português e inglês, que muda em segundos sem reimprimir nada.';

const HERO_POINTS = ['Sem instalar nada', 'Português e inglês', 'Muda em segundos'];

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ClipboardList,
    title: 'Nós passamos a sua carta',
    text: 'Envie-nos a carta em papel, em PDF ou numa fotografia. Nós passamos os pratos, os preços, as fotos e os alergénios.',
  },
  {
    icon: QrCode,
    title: 'Pomos os QR codes nas mesas',
    text: 'Os clientes apontam a câmara do telemóvel e a carta abre logo.',
  },
  {
    icon: Smartphone,
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
  'focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1F3A5F]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5EFE6]';
const BUTTON_BASE = `inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 text-base font-semibold transition ${FOCUS_RING}`;
const BUTTON_PRIMARY = `${BUTTON_BASE} bg-[#B5452B] text-white shadow-[0_10px_24px_-10px_rgba(181,69,43,0.7)] hover:bg-[#9C3A23]`;
const BUTTON_SECONDARY = `${BUTTON_BASE} border-2 border-[#1F3A5F] text-[#1F3A5F] hover:bg-[#1F3A5F] hover:text-white`;
const CARD = 'rounded-3xl border border-[#E6DCCD] bg-[#FFFDF9]';

function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className={`text-sm font-semibold uppercase tracking-[0.14em] ${
        light ? 'text-[#F5EFE6]' : 'text-[#B5452B]'
      }`}
    >
      {children}
    </p>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-3 font-serif text-[2rem] font-semibold leading-[1.1] text-[#1F3A5F] sm:text-[2.6rem]"
    >
      {children}
    </h2>
  );
}

/** Moldura de telemóvel (só CSS). */
function PhoneFrame({ children, height }: { children: React.ReactNode; height: number }) {
  return (
    <div className="relative mx-auto w-[280px] shrink-0 rounded-[46px] bg-[#1C1C1C] p-[10px] shadow-[0_40px_80px_-30px_rgba(31,58,95,0.55)] ring-1 ring-black/5">
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
    <PhoneFrame height={562}>
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
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          className={`${BUTTON_BASE} bg-white text-[#1F3A5F] hover:bg-[#F5EFE6]`}
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
          className={`${BUTTON_BASE} border-2 border-white text-white hover:bg-white hover:text-[#1F3A5F]`}
        >
          <Mail className="h-5 w-5" aria-hidden="true" />
          Enviar e-mail
        </a>
      )}
    </div>
  );
}

export function LandingPage({
  contact = MARKETING_CONTACT,
  year = new Date().getFullYear(),
}: {
  contact?: MarketingContact;
  year?: number;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F5EFE6] font-sans text-[#2B2B2B] antialiased">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-5">
        <span className="font-serif text-xl font-semibold text-[#1F3A5F]">O Seu Menu</span>
        <a
          href="#contacto"
          className={`inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-semibold text-[#1F3A5F] hover:bg-[#1F3A5F]/5 ${FOCUS_RING}`}
        >
          Contacto
        </a>
      </header>

      <main>
        {/* 1. Topo */}
        <section className="relative">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_85%_30%,rgba(181,69,43,0.14),transparent_70%),radial-gradient(50%_40%_at_10%_80%,rgba(31,58,95,0.10),transparent_70%)]"
            aria-hidden="true"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-14 px-5 pb-20 pt-10 sm:pt-14 lg:flex-row lg:gap-10 lg:pb-28 lg:pt-16">
            <div className="max-w-xl text-center lg:flex-1 lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full bg-[#B5452B]/10 px-4 py-1.5 text-sm font-semibold text-[#8E3520]">
                <span className="h-2 w-2 rounded-full bg-[#B5452B]" aria-hidden="true" />
                Primeiro mês grátis e sem compromisso
              </p>
              <h1 className="mt-6 font-serif text-[3.4rem] font-semibold leading-[0.95] text-[#1F3A5F] sm:text-7xl">
                O Seu Menu
              </h1>
              <p className="mt-6 text-xl leading-relaxed sm:text-[1.4rem]">{LANDING_TAGLINE}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/demo" prefetch={false} className={BUTTON_PRIMARY}>
                  Ver exemplo
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <a href="#contacto" className={BUTTON_SECONDARY}>
                  Falar connosco
                </a>
              </div>
              <ul className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[15px] font-medium lg:justify-start">
                {HERO_POINTS.map((point) => (
                  <li key={point} className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-[#B5452B]" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative lg:flex-1">
              <div
                className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1F3A5F]/[0.07]"
                aria-hidden="true"
              />
              <MenuPreview />
              <div
                className="absolute -left-10 top-24 hidden rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#1F3A5F] shadow-[0_16px_40px_-16px_rgba(31,58,95,0.45)] sm:block"
                aria-hidden="true"
              >
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-600" />
                Preço atualizado
              </div>
              <div
                className="absolute -right-8 bottom-28 hidden rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#1F3A5F] shadow-[0_16px_40px_-16px_rgba(31,58,95,0.45)] sm:block"
                aria-hidden="true"
              >
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#B5452B]" />
                Marcado como esgotado
              </div>
            </div>
          </div>
        </section>

        {/* 2. Como funciona */}
        <section aria-labelledby="como-funciona" className="bg-[#FFFDF9] py-20 lg:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>Em três passos</Kicker>
              <SectionTitle id="como-funciona">Como funciona</SectionTitle>
            </div>
            <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
              <span
                className="absolute left-[17%] right-[17%] top-7 hidden h-px bg-[repeating-linear-gradient(90deg,#B5452B_0_6px,transparent_6px_12px)] md:block"
                aria-hidden="true"
              />
              {STEPS.map((step, index) => (
                <li key={step.title} className="relative text-center md:px-4">
                  <span
                    className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1F3A5F] text-white shadow-[0_12px_24px_-12px_rgba(31,58,95,0.8)]"
                    aria-hidden="true"
                  >
                    <step.icon className="h-6 w-6" />
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#B5452B] font-serif text-sm font-semibold">
                      {index + 1}
                    </span>
                  </span>
                  <h3 className="mt-5 text-lg font-semibold leading-snug text-[#1F3A5F]">
                    <span className="sr-only">Passo {index + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="mx-auto mt-2 max-w-xs leading-relaxed text-[#2B2B2B]/85">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 3. O painel: como é fácil gerir a carta */}
        <section aria-labelledby="painel" className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>O painel do restaurante</Kicker>
              <SectionTitle id="painel">
                Gerir a carta é tão fácil como enviar uma mensagem
              </SectionTitle>
              <p className="mt-5 text-lg leading-relaxed text-[#2B2B2B]/85">
                Tudo se faz no telemóvel, no painel do seu restaurante. Sem chamar ninguém e sem
                esperar.
              </p>
            </div>

            <div className="mt-16 space-y-20 lg:space-y-28">
              {SHOWCASE.map((item, index) => (
                <article
                  key={item.title}
                  className={`flex flex-col items-center gap-10 lg:gap-20 ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
                  }`}
                >
                  <div className="relative lg:flex-1">
                    <div
                      className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B5452B]/[0.08]"
                      aria-hidden="true"
                    />
                    <PhoneFrame
                      height={Math.min(
                        520,
                        Math.round((260 * item.image.height) / item.image.width),
                      )}
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
                    <Kicker>{item.kicker}</Kicker>
                    <h3 className="mt-3 font-serif text-[1.75rem] font-semibold leading-tight text-[#1F3A5F] sm:text-[2.1rem]">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-lg leading-relaxed text-[#2B2B2B]/85">{item.text}</p>
                    <ul className="mt-6 space-y-3">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1F3A5F] text-white">
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

        {/* 4. Vantagens */}
        <section aria-labelledby="vantagens" className="bg-[#FFFDF9] py-20 lg:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>Para os seus clientes</Kicker>
              <SectionTitle id="vantagens">Uma carta que dá gosto usar</SectionTitle>
            </div>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map((benefit) => (
                <li key={benefit.title} className={`${CARD} p-6`}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#B5452B]/10">
                    <benefit.icon className="h-5 w-5 text-[#B5452B]" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-[1.05rem] font-semibold text-[#1F3A5F]">
                    {benefit.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[#2B2B2B]/85">
                    {benefit.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 5. Domínio */}
        <section aria-labelledby="dominio" className="bg-[#1F3A5F] py-20 text-white lg:py-24">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <Kicker light>O seu endereço</Kicker>
            <h2
              id="dominio"
              className="mt-3 font-serif text-[2rem] font-semibold leading-tight sm:text-[2.6rem]"
            >
              O endereço da sua carta
            </h2>
            <div
              className="mx-auto mt-8 flex max-w-md items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left text-[#2B2B2B] shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)]"
              aria-hidden="true"
            >
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#B5452B]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#E0B44C]" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              </span>
              <span className="truncate font-semibold">oseumenu.pt/o-seu-restaurante</span>
            </div>
            <p className="mt-8 text-lg leading-relaxed text-white">
              Fica em oseumenu.pt/o-seu-restaurante, ou no domínio do seu restaurante, se já tiver
              um.
            </p>
          </div>
        </section>

        {/* 6. Perguntas frequentes */}
        <section aria-labelledby="perguntas" className="py-20 lg:py-24">
          <div className="mx-auto max-w-3xl px-5">
            <div className="text-center">
              <Kicker>Dúvidas</Kicker>
              <SectionTitle id="perguntas">Perguntas frequentes</SectionTitle>
            </div>
            <div className="mt-10 space-y-3">
              {FAQS.map((faq) => (
                <details key={faq.question} className={`group ${CARD}`}>
                  <summary
                    className={`flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-6 py-4 text-lg font-semibold text-[#1F3A5F] [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
                  >
                    {faq.question}
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#B5452B]/10 text-xl leading-none text-[#B5452B] transition group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="px-6 pb-6 leading-relaxed text-[#2B2B2B]/85">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Contacto */}
        <section id="contacto" aria-labelledby="contacto-titulo" className="scroll-mt-4 px-5 pb-20">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] bg-[#B5452B] px-6 py-14 text-center text-white sm:px-12 sm:py-16">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-black/10"
              aria-hidden="true"
            />
            <div className="relative">
              <h2
                id="contacto-titulo"
                className="font-serif text-[2rem] font-semibold leading-tight sm:text-[2.6rem]"
              >
                Vamos mostrar-lhe a sua carta
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed">
                Marcamos uma demonstração de 10 minutos no seu restaurante, com a sua própria carta
                no telemóvel. O primeiro mês é grátis e sem compromisso.
              </p>
              <ContactButtons contact={contact} />
            </div>
          </div>
        </section>
      </main>

      {/* 8. Rodapé */}
      <footer className="border-t border-[#E6DCCD]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-sm sm:flex-row">
          <p>
            <span className="font-serif font-semibold text-[#1F3A5F]">O Seu Menu</span> · {year}
          </p>
          <Link
            href="/admin"
            prefetch={false}
            className={`inline-flex min-h-[44px] items-center rounded-full px-3 underline-offset-4 hover:underline ${FOCUS_RING}`}
          >
            Área do restaurante
          </Link>
        </div>
      </footer>
    </div>
  );
}
