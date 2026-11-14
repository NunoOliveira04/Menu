import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

// next/font só funciona no build do Next; nos testes basta devolver a classe.
vi.mock('next/font/google', () => ({
  Young_Serif: () => ({ variable: 'font-landing-display', className: '', style: {} }),
  Atkinson_Hyperlegible_Next: () => ({ variable: 'font-landing-body', className: '', style: {} }),
}));

import * as homePage from '@/app/page';
import { LANDING_TAGLINE, LandingPage } from '@/components/marketing/landing-page';
import { MARKETING_CONTACT, buildEmailUrl, buildWhatsAppUrl } from '@/lib/marketing/contact';

const EMPTY_CONTACT = { whatsapp: '', email: '' };

function render(contact = EMPTY_CONTACT): string {
  return renderToStaticMarkup(createElement(LandingPage, { contact, year: 2026 }));
}

describe('Página de apresentação (/)', () => {
  it('mostra o topo com o nome, a frase e os dois botões', () => {
    const html = render();
    expect(html).toContain('<h1');
    expect(html).toContain('O Seu Menu');
    expect(html).toContain(LANDING_TAGLINE);
    expect(html).toMatch(/<a[^>]*href="\/demo"[^>]*>Ver exemplo/);
    expect(html).toMatch(/<a[^>]*href="#contacto"[^>]*>Falar connosco<\/a>/);
  });

  it('mostra como se gere a carta, com prints reais do painel', () => {
    const html = render();
    const text = html.replace(/<[^>]+>/g, '');
    for (const title of [
      'Gerir a carta é tão fácil como enviar uma mensagem',
      'Acabou? Um toque e fica esgotado.',
      'Mudar um preço demora segundos',
      'O QR code das mesas, pronto a imprimir',
    ]) {
      expect(text).toContain(title);
    }
    for (const image of ['painel-pratos', 'painel-editar', 'painel-qr']) {
      expect(html).toMatch(new RegExp(`<img[^>]*alt="Painel do restaurante[^"]*"[^>]*${image}`));
      expect(
        existsSync(resolve(__dirname, '..', 'public', 'apresentacao', `${image}.webp`)),
        image,
      ).toBe(true);
    }
    expect(html.match(/<img[^>]*loading="lazy"/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it('mostra que o aspeto da carta é personalizado, com os fundos, cores e disposições reais', () => {
    const html = render();
    const text = html.replace(/<[^>]+>/g, '');
    expect(text).toContain('Estilos personalizados');
    expect(text).toContain('Com a cara do seu restaurante');
    for (const label of [
      'Claro',
      'Areia',
      'Escuro',
      'Madeira clara',
      'Madeira escura',
      'Linho',
      'Pedra',
      'Terracota',
      'Dourado',
      'Verde',
      'Azul',
      'Grafite',
      'Lista',
      'Grelha',
      'Foto grande',
    ]) {
      expect(text, label).toContain(label);
    }
    for (const image of [
      'estilo-claro-terracota-foto',
      'estilo-linho-verde-lista',
      'estilo-madeira-dourado-grelha',
      'estilo-pedra-azul-grelha',
    ]) {
      expect(html).toContain(image);
      expect(
        existsSync(resolve(__dirname, '..', 'public', 'apresentacao', `${image}.webp`)),
        image,
      ).toBe(true);
    }
  });

  it('mostra a carta /demo num iframe com loading="lazy"', () => {
    const html = render();
    expect(html).toMatch(/<iframe[^>]*src="\/demo"/);
    expect(html).toMatch(/<iframe[^>]*loading="lazy"/);
  });

  it('tem as secções pela ordem pedida', () => {
    const html = render();
    const order = [
      'Ver exemplo',
      'id="como-funciona"',
      'Nós passamos a sua carta',
      'Pomos os QR codes nas mesas',
      'Muda preços e pratos no seu telemóvel, quando quiser',
      'id="painel"',
      'id="personalizar"',
      'Com a cara do seu restaurante',
      'id="dominio"',
      'oseumenu.pt/o-seu-restaurante',
      'id="vantagens"',
      'Altera um preço ou um prato no telemóvel',
      'Esgotados à vista',
      'Inglês com um toque',
      'Alergénios claros',
      'Fotos que se ampliam',
      'Abre com a câmara',
      'id="perguntas"',
      'id="contacto"',
      'Área do restaurante',
    ];
    const positions = order.map((text) => html.indexOf(text));
    positions.forEach((position, index) => {
      expect(position, order[index]).toBeGreaterThan(-1);
    });
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it('tem as 5 perguntas frequentes em <details>', () => {
    const html = render();
    expect(html.match(/<details/g)).toHaveLength(5);
    for (const question of [
      'E se os clientes preferirem papel?',
      'Preciso de perceber de informática?',
      'E se a internet do restaurante falhar?',
      'Quanto custa?',
      'Dá para fazer encomendas ou pagamentos?',
    ]) {
      expect(html).toContain(question);
    }
  });

  it('não mostra preços', () => {
    const html = render();
    expect(html).not.toMatch(/€|\beuros?\b/i);
  });

  it('o rodapé tem o nome, o ano e a ligação para /admin', () => {
    const html = render();
    expect(html).toContain('2026');
    expect(html).toMatch(/<a[^>]*href="\/admin"[^>]*>Área do restaurante<\/a>/);
  });

  it('sem contactos configurados, os botões de WhatsApp e e-mail não aparecem', () => {
    expect(MARKETING_CONTACT).toEqual({ whatsapp: '', email: '' });
    const html = render();
    expect(html).not.toContain('wa.me');
    expect(html).not.toContain('mailto:');
  });

  it('com contactos configurados, mostra os botões com as ligações certas', () => {
    const html = render({ whatsapp: '+351 912 345 678', email: 'ola@exemplo.pt' });
    expect(html).toContain('https://wa.me/351912345678?text=');
    expect(html).toContain('mailto:ola@exemplo.pt?subject=');
  });

  it('só um dos contactos preenchido mostra só esse botão', () => {
    const html = render({ whatsapp: '', email: 'ola@exemplo.pt' });
    expect(html).not.toContain('wa.me');
    expect(html).toContain('mailto:');
  });

  it('valida os contactos antes de criar as ligações', () => {
    expect(buildWhatsAppUrl('')).toBeNull();
    expect(buildWhatsAppUrl('123')).toBeNull();
    expect(buildEmailUrl('')).toBeNull();
    expect(buildEmailUrl('sem-arroba')).toBeNull();
  });
});

describe('Metadados e geração da página (/)', () => {
  it('é estática e não consulta o Supabase', () => {
    expect(homePage.dynamic).toBe('force-static');
    for (const file of [
      'src/app/page.tsx',
      'src/components/marketing/landing-page.tsx',
      'src/lib/marketing/contact.ts',
    ]) {
      const source = readFileSync(resolve(__dirname, '..', file), 'utf8');
      expect(source, file).not.toMatch(/from ['"][^'"]*supabase/i);
    }
  });

  it('tem título, descrição, Open Graph e pode ser indexada', () => {
    const { metadata } = homePage;
    expect(metadata.title).toEqual({ absolute: 'O Seu Menu — Carta digital para restaurantes' });
    expect(metadata.description).toBe(LANDING_TAGLINE);
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({
      title: 'O Seu Menu — Carta digital para restaurantes',
      locale: 'pt_PT',
      siteName: 'O Seu Menu',
    });
  });
});
