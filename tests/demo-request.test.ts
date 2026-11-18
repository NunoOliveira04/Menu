import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockInsert } = vi.hoisted(() => ({ mockInsert: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ from: () => ({ insert: mockInsert }) })),
}));

import { requestDemoAction } from '@/app/actions/demo-request';
import { INITIAL_ACTION_STATE } from '@/app/actions/types';
import { DemoRequestButton } from '@/components/marketing/demo-request-dialog';
import {
  buildDemoRequestEmail,
  DEMO_REQUEST_FROM,
  notifyDemoRequest,
} from '@/lib/marketing/notify-demo-request';
import {
  DEMO_REQUEST_SUCCESS,
  demoRequestSchema,
  looksLikeBot,
  normalizePhone,
} from '@/lib/validations/demo-request';

function form(fields: Record<string, string>, startedAgoMs = 10_000): FormData {
  const fd = new FormData();
  fd.set('startedAt', String(Date.now() - startedAgoMs));
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

const VALID = {
  name: 'Maria Silva',
  restaurant: 'Tasca do Largo',
  phone: '+351 912 345 678',
  email: 'Maria@Exemplo.pt',
  consent: 'on',
};

describe('Pedido de demonstração: validação', () => {
  it('aceita um pedido válido e normaliza telemóvel e e-mail', () => {
    const parsed = demoRequestSchema.parse({ ...VALID, consent: true });
    expect(parsed.phone).toBe('+351912345678');
    expect(parsed.email).toBe('maria@exemplo.pt');
  });

  it('o e-mail é opcional', () => {
    expect(demoRequestSchema.parse({ ...VALID, email: '', consent: true }).email).toBeNull();
  });

  it('recusa telemóvel inválido, nome curto e falta de autorização', () => {
    expect(demoRequestSchema.safeParse({ ...VALID, phone: '123', consent: true }).success).toBe(
      false,
    );
    expect(demoRequestSchema.safeParse({ ...VALID, name: 'A', consent: true }).success).toBe(false);
    expect(demoRequestSchema.safeParse({ ...VALID, consent: false }).success).toBe(false);
  });

  it('normaliza telemóveis com espaços e traços', () => {
    expect(normalizePhone(' 912-345 678 ')).toBe('912345678');
  });

  it('deteta robôs: campo escondido preenchido ou envio instantâneo', () => {
    expect(looksLikeBot(form({ website: 'spam' }))).toBe(true);
    expect(looksLikeBot(form({}, 500))).toBe(true);
    expect(looksLikeBot(form({}))).toBe(false);
  });
});

describe('Pedido de demonstração: ação do servidor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 200 })),
    );
  });

  it('grava o pedido e responde com sucesso', async () => {
    mockInsert.mockResolvedValue({ error: null });
    const result = await requestDemoAction(INITIAL_ACTION_STATE, form(VALID));
    expect(result).toEqual({ status: 'success', message: DEMO_REQUEST_SUCCESS });
    expect(mockInsert).toHaveBeenCalledWith({
      name: 'Maria Silva',
      restaurant: 'Tasca do Largo',
      phone: '+351912345678',
      email: 'maria@exemplo.pt',
      consent: true,
    });
  });

  it('robôs recebem sucesso mas nada é gravado', async () => {
    const result = await requestDemoAction(INITIAL_ACTION_STATE, form({ ...VALID, website: 'x' }));
    expect(result.status).toBe('success');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('erros de validação voltam por campo', async () => {
    const result = await requestDemoAction(
      INITIAL_ACTION_STATE,
      form({ ...VALID, phone: 'abc', consent: '' }),
    );
    expect(result.status).toBe('error');
    expect(result.fieldErrors?.phone).toBeDefined();
    expect(result.fieldErrors?.consent).toBeDefined();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('o mesmo telemóvel repetido não dá erro ao cliente', async () => {
    mockInsert.mockResolvedValue({ error: { code: 'P0001', message: 'demo_request_duplicate' } });
    const result = await requestDemoAction(INITIAL_ACTION_STATE, form(VALID));
    expect(result.status).toBe('success');
  });

  it('falha ao gravar mostra uma mensagem para tentar outra vez', async () => {
    mockInsert.mockResolvedValue({ error: { code: '42501', message: 'denied' } });
    const result = await requestDemoAction(INITIAL_ACTION_STATE, form(VALID));
    expect(result.status).toBe('error');
    expect(result.message).toMatch(/Tente outra vez/);
  });
});

describe('Pedido de demonstração: aviso por e-mail (Resend)', () => {
  const request = demoRequestSchema.parse({ ...VALID, consent: true });

  it('o e-mail tem os dados do pedido, escapados', () => {
    const email = buildDemoRequestEmail({ ...request, restaurant: 'Tasca <b>' });
    expect(email.subject).toBe('Novo pedido de demonstração — Tasca <b>');
    expect(email.html).toContain('Tasca &lt;b&gt;');
    expect(email.text).toContain('Telemóvel: +351912345678');
  });

  it('envia do endereço oseumenu.pt para o destino configurado, com resposta para o restaurante', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const ok = await notifyDemoRequest(request, { apiKey: 're_test', to: 'avisos@exemplo.pt' });
    expect(ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer re_test');
    expect(JSON.parse(String(init.body))).toMatchObject({
      from: DEMO_REQUEST_FROM,
      to: ['avisos@exemplo.pt'],
      reply_to: 'maria@exemplo.pt',
    });
  });

  it('sem chave ou sem destino não envia (e não rebenta)', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect(await notifyDemoRequest(request, { apiKey: '', to: 'x@y.pt' })).toBe(false);
    expect(await notifyDemoRequest(request, { apiKey: 're_x', to: '' })).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('se a Resend falhar, devolve false sem lançar erro', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 422 })),
    );
    expect(await notifyDemoRequest(request, { apiKey: 're_x', to: 'x@y.pt' })).toBe(false);
  });
});

describe('Pedido de demonstração: modal', () => {
  it('o botão abre um modal com os campos e a autorização', () => {
    const html = renderToStaticMarkup(createElement(DemoRequestButton, { className: 'btn' }));
    expect(html).toMatch(/<button[^>]*aria-haspopup="dialog"[^>]*>Peça uma demonstração<\/button>/);
    expect(html).toContain('<dialog');
    for (const name of [
      'name',
      'restaurant',
      'phone',
      'email',
      'consent',
      'website',
      'startedAt',
    ]) {
      expect(html, name).toContain(`name="${name}"`);
    }
    expect(html).toContain('type="tel"');
    expect(html).toContain('Aceito que usem estes dados só para me contactarem');
    expect(html).not.toMatch(/presencial|online|no seu restaurante/i);
  });
});
