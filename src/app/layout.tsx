import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';

const fontSans = Inter({
  // Fonte variável: um só ficheiro cobre todos os pesos (400–700) e o build faz menos pedidos.
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontSerif = Fraunces({
  subsets: ['latin'],
  weight: '600',
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'O Seu Menu — Menus para Restaurantes',
    template: '%s · O Seu Menu',
  },
  description:
    'Plataforma de menus digitais para restaurantes. Rápida no telemóvel, simples de atualizar em segundos.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let htmlLang: 'pt-PT' | 'en' = 'pt-PT';
  try {
    const reqHeaders = await headers();
    if (reqHeaders.get('x-menu-html-lang') === 'en') {
      htmlLang = 'en';
    }
  } catch {
    // Em rotas puramente estáticas durante o build, mantém o padrão pt-PT.
  }

  return (
    <html lang={htmlLang} className={`${fontSans.variable} ${fontSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
