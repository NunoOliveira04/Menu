'use server';

import type { ActionState } from '@/app/actions/types';
import { notifyDemoRequest } from '@/lib/marketing/notify-demo-request';
import { createClient } from '@/lib/supabase/server';
import {
  DEMO_REQUEST_SUCCESS,
  demoRequestSchema,
  looksLikeBot,
  readDemoRequestForm,
} from '@/lib/validations/demo-request';

/** Pedido de demonstração da página de apresentação: valida, grava e avisa por e-mail. */
export async function requestDemoAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Robôs recebem a mesma resposta de sucesso, sem gravar nada (não lhes damos pistas).
  if (looksLikeBot(formData)) {
    return { status: 'success', message: DEMO_REQUEST_SUCCESS };
  }

  const parsed = demoRequestSchema.safeParse(readDemoRequestForm(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Verifique os campos assinalados.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('demo_requests').insert({
    name: parsed.data.name,
    restaurant: parsed.data.restaurant,
    phone: parsed.data.phone,
    email: parsed.data.email,
    consent: true,
  });

  if (error) {
    if (error.message.includes('demo_request_duplicate')) {
      // O mesmo telemóvel acabou de pedir: já temos o pedido.
      return { status: 'success', message: DEMO_REQUEST_SUCCESS };
    }
    console.error('[demo-request] não foi possível gravar o pedido:', error.code);
    return {
      status: 'error',
      message: 'Não foi possível enviar o pedido agora. Tente outra vez daqui a pouco.',
    };
  }

  await notifyDemoRequest(parsed.data);
  return { status: 'success', message: DEMO_REQUEST_SUCCESS };
}
