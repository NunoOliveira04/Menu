import type { DemoRequestInput } from '@/lib/validations/demo-request';

/*
 * Aviso por e-mail (Resend) quando alguém pede uma demonstração.
 *
 * Variáveis de ambiente (no Vercel, nunca no código, porque o repositório é público):
 * - RESEND_API_KEY: chave da Resend com acesso de envio para oseumenu.pt;
 * - DEMO_REQUESTS_NOTIFY_EMAIL: para onde vão os avisos.
 * Sem alguma delas, o pedido fica gravado mas não é enviado aviso.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
export const DEMO_REQUEST_FROM = 'O Seu Menu <avisos@oseumenu.pt>';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildDemoRequestEmail(request: DemoRequestInput) {
  const subject = `Novo pedido de demonstração — ${request.restaurant}`;
  const rows: Array<[string, string]> = [
    ['Nome', request.name],
    ['Restaurante', request.restaurant],
    ['Telemóvel', request.phone],
    ['E-mail', request.email ?? '(não indicado)'],
  ];
  const text = [
    'Novo pedido de demonstração em oseumenu.pt:',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'O pedido também ficou gravado na tabela demo_requests do Supabase.',
  ].join('\n');
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;color:#2B1D16">
<p style="margin:0 0 12px">Novo pedido de demonstração em <strong>oseumenu.pt</strong>:</p>
<table style="border-collapse:collapse">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#5F4B40">${label}</td><td style="padding:4px 0"><strong>${escapeHtml(value)}</strong></td></tr>`,
    )
    .join('')}</table>
<p style="margin:16px 0 0;color:#5F4B40">O pedido também ficou gravado na tabela <code>demo_requests</code> do Supabase.</p>
</div>`;
  return { subject, text, html };
}

/** Envia o aviso. Devolve true se a Resend aceitou o e-mail. Nunca lança erro. */
export async function notifyDemoRequest(
  request: DemoRequestInput,
  env: { apiKey?: string; to?: string } = {
    apiKey: process.env.RESEND_API_KEY,
    to: process.env.DEMO_REQUESTS_NOTIFY_EMAIL,
  },
): Promise<boolean> {
  const apiKey = env.apiKey?.trim();
  const to = env.to?.trim();
  if (!apiKey || !to) {
    console.warn('[demo-request] aviso por e-mail desligado: falta RESEND_API_KEY ou o destino.');
    return false;
  }

  const { subject, text, html } = buildDemoRequestEmail(request);
  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: DEMO_REQUEST_FROM,
        to: [to],
        subject,
        text,
        html,
        // Responder ao aviso vai direto para o restaurante (quando deixou e-mail).
        ...(request.email ? { reply_to: request.email } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error(`[demo-request] a Resend recusou o aviso (HTTP ${response.status}).`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[demo-request] falha ao enviar o aviso:', (error as Error).name);
    return false;
  }
}
