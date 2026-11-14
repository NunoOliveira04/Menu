import {
  Camera,
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
import Link from 'next/link';
import {
  MARKETING_CONTACT,
  buildEmailUrl,
  buildWhatsAppUrl,
  type MarketingContact,
} from '@/lib/marketing/contact';

/*
 * Página de apresentação de «O Seu Menu» (oseumenu.pt/).
 * Componente de servidor, sem JavaScript no cliente: a página é gerada no build.
 * Cores: papel #F5EFE6, texto #2B2B2B, azul #1F3A5F, tijolo #B5452B (todas com contraste AA).
 */

export const LANDING_TAGLINE =
  'A carta do seu restaurante no telemóvel dos clientes, em português e inglês, que muda em segundos sem reimprimir nada.';

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

const BUTTON_BASE =
  'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1F3A5F]/30';
const BUTTON_PRIMARY = `${BUTTON_BASE} bg-[#B5452B] text-white hover:bg-[#9C3A23]`;
const BUTTON_SECONDARY = `${BUTTON_BASE} border-2 border-[#1F3A5F] text-[#1F3A5F] hover:bg-[#1F3A5F] hover:text-white`;

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="font-serif text-3xl font-semibold leading-tight text-[#1F3A5F] sm:text-4xl"
    >
      {children}
    </h2>
  );
}

/** Moldura de telemóvel com a carta de exemplo (iframe 390×844 reduzido para caber). */
function PhonePreview() {
  return (
    <div className="mx-auto w-[300px] shrink-0 rounded-[44px] border-[10px] border-[#1C1C1C] bg-[#1C1C1C] shadow-[0_24px_60px_-20px_rgba(31,58,95,0.45)]">
      <div className="relative h-[600px] w-[280px] overflow-hidden rounded-[34px] bg-white">
        <iframe
          src="/demo"
          title="Exemplo de carta no telemóvel"
          loading="lazy"
          className="absolute left-0 top-0 h-[844px] w-[390px] origin-top-left scale-[0.718] border-0"
        />
      </div>
    </div>
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
        <a href={whatsappUrl} className={BUTTON_PRIMARY} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Falar no WhatsApp
        </a>
      )}
      {emailUrl && (
        <a href={emailUrl} className={BUTTON_SECONDARY}>
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
    <div className="min-h-screen bg-[#F5EFE6] font-sans text-[#2B2B2B] antialiased">
      <main>
        {/* 1. Topo */}
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-5 pb-16 pt-12 sm:pt-16 lg:flex-row lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="max-w-xl text-center lg:text-left">
            <h1 className="font-serif text-5xl font-semibold leading-none text-[#1F3A5F] sm:text-6xl">
              O Seu Menu
            </h1>
            <p className="mt-6 text-xl leading-relaxed sm:text-2xl">{LANDING_TAGLINE}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/demo" prefetch={false} className={BUTTON_PRIMARY}>
                Ver exemplo
              </Link>
              <a href="#contacto" className={BUTTON_SECONDARY}>
                Falar connosco
              </a>
            </div>
          </div>
          <PhonePreview />
        </section>

        {/* 2. Como funciona */}
        <section aria-labelledby="como-funciona" className="bg-white/60 py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <SectionTitle id="como-funciona">Como funciona</SectionTitle>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-3xl border border-[#E6DCCD] bg-[#FFFDF9] p-6"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F3A5F] font-serif text-lg font-semibold text-white"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <step.icon className="h-6 w-6 text-[#B5452B]" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold leading-snug text-[#1F3A5F]">
                    <span className="sr-only">Passo {index + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-[#2B2B2B]/80">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 3. Vantagens */}
        <section aria-labelledby="vantagens" className="py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <SectionTitle id="vantagens">Porque é que os restaurantes gostam</SectionTitle>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit.title}
                  className="rounded-3xl border border-[#E6DCCD] bg-[#FFFDF9] p-5"
                >
                  <benefit.icon className="h-6 w-6 text-[#B5452B]" aria-hidden="true" />
                  <h3 className="mt-3 font-semibold text-[#1F3A5F]">{benefit.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-[#2B2B2B]/80">
                    {benefit.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. Domínio */}
        <section aria-labelledby="dominio" className="bg-[#1F3A5F] py-16 text-white lg:py-20">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <h2 id="dominio" className="font-serif text-3xl font-semibold sm:text-4xl">
              O endereço da sua carta
            </h2>
            <p className="mt-6 text-lg leading-relaxed">
              Fica em{' '}
              <span className="whitespace-nowrap rounded-lg bg-white/15 px-2 py-0.5 font-semibold">
                oseumenu.pt/o-seu-restaurante
              </span>
              , ou no domínio do seu restaurante, se já tiver um.
            </p>
          </div>
        </section>

        {/* 5. Perguntas frequentes */}
        <section aria-labelledby="perguntas" className="py-16 lg:py-20">
          <div className="mx-auto max-w-3xl px-5">
            <SectionTitle id="perguntas">Perguntas frequentes</SectionTitle>
            <div className="mt-8 space-y-3">
              {FAQS.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-[#E6DCCD] bg-[#FFFDF9]"
                >
                  <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-3 text-lg font-semibold text-[#1F3A5F] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1F3A5F]/30 [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span
                      className="text-2xl leading-none text-[#B5452B] transition group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-5 leading-relaxed text-[#2B2B2B]/80">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Contacto */}
        <section
          id="contacto"
          aria-labelledby="contacto-titulo"
          className="scroll-mt-4 bg-white/60 py-16 lg:py-20"
        >
          <div className="mx-auto max-w-2xl px-5 text-center">
            <h2
              id="contacto-titulo"
              className="font-serif text-3xl font-semibold leading-tight text-[#1F3A5F] sm:text-4xl"
            >
              Vamos mostrar-lhe a sua carta
            </h2>
            <p className="mt-6 text-lg leading-relaxed">
              Marcamos uma demonstração de 10 minutos no seu restaurante, com a sua própria carta no
              telemóvel. O primeiro mês é grátis e sem compromisso.
            </p>
            <ContactButtons contact={contact} />
          </div>
        </section>
      </main>

      {/* 7. Rodapé */}
      <footer className="border-t border-[#E6DCCD]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-sm sm:flex-row">
          <p>
            <span className="font-serif font-semibold text-[#1F3A5F]">O Seu Menu</span> · {year}
          </p>
          <Link
            href="/admin"
            prefetch={false}
            className="inline-flex min-h-[44px] items-center px-2 text-[#2B2B2B]/80 underline-offset-4 hover:underline"
          >
            Área do restaurante
          </Link>
        </div>
      </footer>
    </div>
  );
}
