import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontSerif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Ementa Digital — Menus para Restaurantes',
    template: '%s · Ementa Digital',
  },
  description:
    'Plataforma de menus digitais para restaurantes. Rápida no telemóvel, simples de atualizar em segundos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className={`${fontSans.variable} ${fontSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
