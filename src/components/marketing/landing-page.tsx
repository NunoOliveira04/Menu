import {
  ArrowRight,
  Camera,
  Check,
  Image as ImageIcon,
  Info,
  Languages,
  LayoutGrid,
  List,
  Mail,
  MessageCircle,
  Plus,
  QrCode,
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
import {
  MENU_ACCENTS,
  MENU_ACCENT_IDS,
  MENU_BACKGROUNDS,
  MENU_BACKGROUND_IDS,
  MENU_LAYOUTS,
  MENU_LAYOUT_IDS,
  menuCssVars,
  type MenuLayoutId,
} from '@/lib/themes/backgrounds';

/*
 * Página de apresentação de «O Seu Menu» (oseumenu.pt/).
 * Componente de servidor, sem JavaScript próprio no cliente: a página é gerada no build.
 *
 * Letras: Young Serif (títulos) e Atkinson Hyperlegible Next (texto), carregadas só aqui.
 * Paleta (contraste WCAG):
 *   Papel #FBF6EC · Areia #F2E6D0 · Tinta #2B1D16 · Tinta suave #5F4B40
 *   Terracota #B4412A · Pinhal #1F3D2E · Gema #F2B441
 *   Tinta/Papel 15,1 · Tinta/Areia 13,2 · Tinta suave/Papel 7,6 · Tinta suave/Areia 6,6
 *   Papel/Terracota 5,2 · Terracota/Papel 5,2 · Papel/Pinhal 11,0 · Gema/Pinhal 6,5 · Tinta/Gema 8,8
 */

export const LANDING_TAGLINE =
  'A carta do seu restaurante no telemóvel dos clientes, em português e inglês, que muda em segundos sem reimprimir nada.';

const HERO_POINTS = ['Sem instalar nada', 'Português e inglês', 'Atualize em segundos'];

const STEPS: { title: string; text: string }[] = [
  {
    title: 'Nós passamos a sua carta',
    text: 'Envie-nos a carta em papel, em PDF ou numa fotografia. Nós passamos os pratos, os preços, as fotos e os alergénios.',
  },
  {
    title: 'Pomos os QR codes nas mesas',
    text: 'Os clientes apontam a câmara do telemóvel e a carta abre logo.',
  },
  {
    title: 'Mude preços e pratos no seu telemóvel, quando quiser',
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
      'Com outro toque, o prato volta a ficar disponível',
      'Reordene pratos e categorias com as setas',
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
      'Tire a fotografia no seu telemóvel: é reduzida automaticamente',
      'Escreva a tradução para inglês ao lado do português',
      'Marque os alergénios com um toque',
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
      'É sempre o mesmo, mesmo quando mudar a carta',
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

/** A mesma carta de exemplo com estilos diferentes (aplicados só para a captura). */
const STYLE_EXAMPLES: { src: string; caption: string }[] = [
  {
    src: '/apresentacao/estilo-claro-terracota-foto.webp',
    caption: 'Claro · Terracota · Foto grande',
  },
  { src: '/apresentacao/estilo-linho-verde-lista.webp', caption: 'Linho · Verde · Lista' },
  {
    src: '/apresentacao/estilo-madeira-dourado-grelha.webp',
    caption: 'Madeira escura · Dourado · Grelha',
  },
  { src: '/apresentacao/estilo-pedra-azul-grelha.webp', caption: 'Pedra · Azul · Grelha' },
];

const LAYOUT_ICONS: Record<MenuLayoutId, LucideIcon> = {
  lista: List,
  grelha: LayoutGrid,
  foto: ImageIcon,
};

const BENEFITS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: RefreshCw,
    title: 'Atualize em segundos',
    text: 'Altere um preço ou um prato no seu telemóvel, sem reimprimir nada.',
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
      'Oferecemos um período experimental gratuito e sem compromisso. Depois, o preço combina-se connosco, à medida do seu restaurante.',
  },
  {
    question: 'Dá para fazer encomendas ou pagamentos?',
    answer:
      'Não. O Seu Menu é só a carta: os clientes consultam os pratos e fazem o pedido como sempre.',
  },
];

const FOCUS_RING =
  'focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B4412A]/35 focus-visible:ring-offset-2';
const BUTTON_BASE = `inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 text-[17px] font-semibold transition ${FOCUS_RING}`;
const BUTTON_PRIMARY = `${BUTTON_BASE} bg-[#B4412A] text-[#FBF6EC] shadow-[0_12px_28px_-14px_rgba(180,65,42,0.8)] hover:bg-[#9A3722]`;
const BUTTON_OUTLINE = `${BUTTON_BASE} border-2 border-[#1F3D2E] text-[#1F3D2E] hover:bg-[#1F3D2E] hover:text-[#FBF6EC]`;
const SHADOW = 'shadow-[0_12px_32px_rgba(43,29,22,0.12)]';

function Eyebrow({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) {
  return (
    <p
      className={`text-[13px] font-semibold uppercase tracking-[0.08em] sm:text-sm ${
        onDark ? 'text-[#F2B441]' : 'text-[#B4412A]'
      }`}
    >
      {children}
    </p>
  );
}

function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  center = false,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className="osm-display mt-3 text-[30px] leading-[1.15] tracking-[-0.005em] sm:text-[44px]"
      >
        {title}
      </h2>
      {intro && <p className="mt-4 text-[17px] leading-[1.6] text-[#5F4B40] sm:text-lg">{intro}</p>}
    </div>
  );
}

/** Moldura de telemóvel (só CSS). */
function PhoneFrame({
  children,
  width = 280,
  height,
  className = '',
}: {
  children: React.ReactNode;
  width?: number;
  height: number;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto shrink-0 rounded-[44px] bg-[#2B1D16] p-[9px] shadow-[0_30px_60px_-28px_rgba(43,29,22,0.55)] ${className}`}
      style={{ width }}
    >
      <div
        className="relative overflow-hidden rounded-[35px] bg-white"
        style={{ width: width - 18, height }}
      >
        {children}
      </div>
    </div>
  );
}

/** A carta de exemplo (/demo), num iframe 390×844 reduzido para caber na moldura. */
function MenuPreview() {
  return (
    <PhoneFrame height={562} className="-rotate-3">
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
    <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          className={`${BUTTON_BASE} bg-[#F2B441] text-[#2B1D16] hover:bg-[#F5C463]`}
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
          className={`${BUTTON_BASE} border-2 border-[#FBF6EC] text-[#FBF6EC] hover:bg-[#FBF6EC] hover:text-[#1F3D2E]`}
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
  fontClassName = '',
}: {
  contact?: MarketingContact;
  year?: number;
  fontClassName?: string;
}) {
  return (
    <div
      className={`${fontClassName} osm-page min-h-screen overflow-x-hidden bg-[#FBF6EC] text-[17px] leading-[1.6] text-[#2B1D16] antialiased sm:text-lg`}
    >
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-5">
        <span className="osm-display text-2xl">
          O Seu <span className="text-[#B4412A]">Menu</span>
        </span>
        <a
          href="#contacto"
          className={`inline-flex min-h-[44px] items-center rounded-full px-4 text-base font-semibold text-[#1F3D2E] hover:bg-[#1F3D2E]/5 ${FOCUS_RING}`}
        >
          Contacto
        </a>
      </header>

      <main>
        {/* 1. Topo */}
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-14 px-5 pb-20 pt-10 sm:pt-14 lg:flex-row lg:gap-10 lg:pb-24 lg:pt-16">
          <div className="max-w-xl text-center lg:flex-1 lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#F2B441] px-4 py-1.5 text-[15px] font-semibold text-[#2B1D16]">
              Período experimental gratuito e sem compromisso
            </p>
            <h1 className="osm-display mt-6 text-[52px] leading-[1.05] tracking-[-0.01em] sm:text-[68px]">
              O Seu <span className="text-[#B4412A]">Menu</span>
            </h1>
            <p className="mt-5 max-w-[34ch] text-xl leading-[1.55] text-[#2B1D16] max-lg:mx-auto sm:text-[22px]">
              {LANDING_TAGLINE}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/demo" prefetch={false} className={BUTTON_PRIMARY}>
                Ver exemplo
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <a href="#contacto" className={BUTTON_OUTLINE}>
                Falar connosco
              </a>
            </div>
            <ul className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-base text-[#5F4B40] lg:justify-start">
              {HERO_POINTS.map((point) => (
                <li key={point} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#1F3D2E]" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative lg:flex-1">
            <div
              className="absolute inset-x-[-12%] bottom-[-6%] top-[12%] rounded-[3rem] bg-[#F2E6D0]"
              aria-hidden="true"
            />
            <MenuPreview />
            <div
              className={`absolute -right-3 bottom-16 hidden items-center gap-3 rounded-2xl bg-[#FBF6EC] px-4 py-3 sm:flex ${SHADOW}`}
              aria-hidden="true"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F3D2E] text-[#FBF6EC]">
                <QrCode className="h-5 w-5" />
              </span>
              <span className="text-[15px] font-semibold leading-tight">
                Aponte a câmara
                <span className="block font-normal text-[#5F4B40]">e a carta abre</span>
              </span>
            </div>
          </div>
        </section>

        {/* 2. Como funciona */}
        <section aria-labelledby="como-funciona" className="bg-[#F2E6D0] py-20 lg:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <SectionHeading
              id="como-funciona"
              eyebrow="Nós tratamos de tudo"
              title="Como funciona"
              center
            />
            <ol className="relative mx-auto mt-12 grid max-w-md gap-10 md:max-w-none md:grid-cols-3 md:gap-8">
              <span
                className="absolute bottom-6 left-[31px] top-6 w-0 border-l-2 border-dashed border-[#B4412A]/40 md:hidden"
                aria-hidden="true"
              />
              <span
                className="absolute left-[17%] right-[17%] top-8 hidden border-t-2 border-dashed border-[#B4412A]/40 md:block"
                aria-hidden="true"
              />
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="relative grid grid-cols-[64px_1fr] gap-4 md:grid-cols-1 md:text-center"
                >
                  <span
                    className="osm-display relative flex h-16 w-16 items-center justify-center rounded-full bg-[#FBF6EC] text-[40px] leading-none text-[#B4412A] ring-2 ring-[#B4412A]/20 md:mx-auto"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold leading-[1.3] sm:text-[22px] md:mt-4">
                      <span className="sr-only">Passo {index + 1}: </span>
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[#5F4B40]">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 3. Fácil de gerir */}
        <section aria-labelledby="painel" className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <SectionHeading
              id="painel"
              eyebrow="Fácil de gerir"
              title="Gerir a carta é tão fácil como enviar uma mensagem"
              intro="Faça tudo no seu telemóvel, no painel do restaurante. Sem chamar ninguém e sem esperar."
              center
            />

            <div className="mt-16 space-y-20 lg:space-y-24">
              {SHOWCASE.map((item, index) => (
                <article
                  key={item.title}
                  className={`flex flex-col items-center gap-10 lg:gap-20 ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
                  }`}
                >
                  <div className="relative lg:flex-1">
                    <div
                      className="absolute inset-x-6 inset-y-12 rounded-[2rem] bg-[#F2E6D0] sm:inset-x-0"
                      aria-hidden="true"
                    />
                    <PhoneFrame
                      height={Math.min(
                        520,
                        Math.round((262 * item.image.height) / item.image.width),
                      )}
                    >
                      <Image
                        src={item.image.src}
                        alt={item.image.alt}
                        width={item.image.width}
                        height={item.image.height}
                        sizes="262px"
                        loading="lazy"
                        className="h-full w-full object-cover object-top"
                      />
                    </PhoneFrame>
                  </div>
                  <div className="max-w-lg lg:flex-1">
                    <p className="inline-flex rounded-full bg-[#B4412A] px-3 py-1 text-sm font-semibold text-[#FBF6EC]">
                      {item.kicker}
                    </p>
                    <h3 className="osm-display mt-4 text-[28px] leading-[1.15] sm:text-[36px]">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-[#5F4B40]">{item.text}</p>
                    <ul className="mt-6 space-y-3">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1F3D2E] text-[#FBF6EC]">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Com a cara do seu restaurante: estilos personalizados + endereço */}
        <section aria-labelledby="personalizar" className="bg-[#F2E6D0] py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <SectionHeading
              id="personalizar"
              eyebrow="Estilos personalizados"
              title="Com a cara do seu restaurante"
              intro="Escolha o aspeto da sua carta: o logotipo, o fundo, a cor e a forma de mostrar os pratos. Mude tudo no painel, quando quiser, sem precisar de designer."
              center
            />

            <ul className="-mx-5 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
              {STYLE_EXAMPLES.map((example) => (
                <li key={example.src} className="w-[220px] shrink-0 snap-center lg:w-auto">
                  <PhoneFrame width={220} height={360}>
                    <Image
                      src={example.src}
                      alt={`A mesma carta com o estilo ${example.caption}`}
                      width={520}
                      height={933}
                      sizes="202px"
                      loading="lazy"
                      className="h-full w-full object-cover object-top"
                    />
                  </PhoneFrame>
                  <p className="mt-4 text-center text-[15px] font-semibold">{example.caption}</p>
                </li>
              ))}
            </ul>

            <div
              className={`mt-12 grid gap-8 rounded-[1.75rem] bg-[#FBF6EC] p-6 sm:p-10 lg:grid-cols-3 ${SHADOW}`}
            >
              <div>
                <h3 className="text-xl font-semibold">{MENU_BACKGROUND_IDS.length} fundos</h3>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {MENU_BACKGROUND_IDS.map((id) => (
                    <li
                      key={id}
                      className="flex w-[76px] flex-col items-center gap-1.5 text-center"
                    >
                      <span
                        className="h-12 w-12 rounded-full ring-1 ring-[#2B1D16]/15"
                        style={{ background: menuCssVars(id, 'terracota')['--page-bg'] }}
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-tight text-[#5F4B40]">
                        {MENU_BACKGROUNDS[id].label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{MENU_ACCENT_IDS.length} cores</h3>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {MENU_ACCENT_IDS.map((id) => (
                    <li
                      key={id}
                      className="flex w-[76px] flex-col items-center gap-1.5 text-center"
                    >
                      <span
                        className="h-12 w-12 rounded-full"
                        style={{ background: menuCssVars('claro', id)['--color-accent'] }}
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-tight text-[#5F4B40]">
                        {MENU_ACCENTS[id].label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {MENU_LAYOUT_IDS.length} disposições e o seu logotipo
                </h3>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {MENU_LAYOUT_IDS.map((id) => {
                    const Icon = LAYOUT_ICONS[id];
                    return (
                      <li
                        key={id}
                        className="flex w-[88px] flex-col items-center gap-1.5 text-center"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1F3D2E] text-[#FBF6EC]">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="text-sm leading-tight text-[#5F4B40]">
                          {MENU_LAYOUTS[id].label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Endereço */}
            <div className="mx-auto mt-16 max-w-3xl text-center">
              <Eyebrow>E com o seu endereço</Eyebrow>
              <h3
                id="dominio"
                className="osm-display mt-3 text-[28px] leading-[1.15] sm:text-[36px]"
              >
                O endereço da sua carta
              </h3>
              <p
                className={`mx-auto mt-6 inline-flex max-w-full items-center gap-2 rounded-full bg-[#FBF6EC] px-5 py-3 text-lg font-semibold ${SHADOW}`}
                aria-hidden="true"
              >
                <span className="truncate">
                  oseumenu.pt/<span className="text-[#B4412A]">o-seu-restaurante</span>
                </span>
              </p>
              <p className="mt-6 text-[#5F4B40]">
                Fica em oseumenu.pt/o-seu-restaurante, ou no domínio do seu restaurante, se já tiver
                um.
              </p>
            </div>
          </div>
        </section>

        {/* 5. O que os seus clientes veem */}
        <section aria-labelledby="vantagens" className="py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-5">
            <SectionHeading
              id="vantagens"
              eyebrow="Para os seus clientes"
              title="O que os seus clientes veem"
              center
            />
            <ul className="mt-12 grid gap-x-12 gap-y-8 md:grid-cols-2">
              {BENEFITS.map((benefit) => (
                <li key={benefit.title}>
                  <div className="flex items-end gap-3">
                    <h3 className="osm-display text-[22px] leading-tight sm:text-2xl">
                      {benefit.title}
                    </h3>
                    <span className="osm-leader text-[#2B1D16]" aria-hidden="true" />
                    <benefit.icon className="h-5 w-5 shrink-0 text-[#B4412A]" aria-hidden="true" />
                  </div>
                  <p className="mt-1.5 text-[#5F4B40]">{benefit.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 6. Perguntas frequentes */}
        <section aria-labelledby="perguntas" className="bg-[#F2E6D0] py-20 lg:py-24">
          <div className="mx-auto max-w-3xl px-5">
            <SectionHeading id="perguntas" eyebrow="Dúvidas" title="Perguntas frequentes" center />
            <div className="mt-10 space-y-3">
              {FAQS.map((faq) => (
                <details key={faq.question} className="group rounded-[20px] bg-[#FBF6EC]">
                  <summary
                    className={`flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 rounded-[20px] px-6 py-4 text-lg font-semibold sm:text-xl [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
                  >
                    {faq.question}
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#B4412A] text-[#FBF6EC] transition group-open:rotate-45"
                      aria-hidden="true"
                    >
                      <Plus className="h-5 w-5" />
                    </span>
                  </summary>
                  <p className="px-6 pb-6 text-[#5F4B40]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Contacto */}
        <section
          id="contacto"
          aria-labelledby="contacto-titulo"
          className="scroll-mt-4 bg-[#1F3D2E] py-20 text-[#FBF6EC] lg:py-24"
        >
          <div className="mx-auto max-w-2xl px-5 text-center">
            <Eyebrow onDark>Vamos falar?</Eyebrow>
            <h2
              id="contacto-titulo"
              className="osm-display mt-3 text-[30px] leading-[1.15] sm:text-[44px]"
            >
              Vamos mostrar-lhe a sua carta
            </h2>
            <p className="mt-5 text-lg">
              Marcamos uma demonstração de 10 minutos no seu restaurante, com a sua própria carta no
              telemóvel. Pode experimentar gratuitamente e sem compromisso.
            </p>
            <ContactButtons contact={contact} />
          </div>
        </section>
      </main>

      {/* 8. Rodapé */}
      <footer className="bg-[#2B1D16] text-[#FBF6EC]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-base sm:flex-row">
          <p className="flex items-center gap-2">
            <span className="osm-display text-xl">
              O Seu <span className="text-[#F2B441]">Menu</span>
            </span>
            <span>· {year}</span>
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
