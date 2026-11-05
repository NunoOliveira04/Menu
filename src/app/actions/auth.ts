'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { authCredentialsSchema, registerOwnerSchema } from '@/lib/validations/schemas';
import { slugifyRestaurantName, isValidSlug } from '@/lib/utils/slug';
import { getPublicAppOrigin } from '@/lib/utils/url';
import type { ActionState } from './types';

function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const flattened = z.flattenError(error);
  return flattened.fieldErrors as Record<string, string[]>;
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = authCredentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Verifica os dados introduzidos.',
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      status: 'error',
      message: 'Email ou palavra-passe incorretos. Tenta novamente.',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/admin');
}

export async function registerOwnerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerOwnerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    restaurantName: formData.get('restaurantName') ?? '',
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Revê os campos assinalados antes de criar a conta.',
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const emailRedirectTo = `${getPublicAppOrigin()}/admin`;
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo,
    },
  });

  if (signUpError) {
    return {
      status: 'error',
      message: signUpError.message.toLowerCase().includes('already')
        ? 'Já existe uma conta registada com este email.'
        : 'Não foi possível criar a conta. Tenta novamente dentro de instantes.',
    };
  }

  // Se o projeto Supabase exigir confirmação por email antes de emitir sessão:
  if (!signUpData.session) {
    return {
      status: 'success',
      message:
        'Conta criada! Verifica a tua caixa de correio para confirmar o email e depois inicia sessão.',
    };
  }

  // Se foi indicado logo o nome do 1.º restaurante e já temos sessão ativa, tenta criá-lo
  const restaurantName = parsed.data.restaurantName?.trim();
  if (restaurantName && restaurantName.length >= 2) {
    const baseSlug = slugifyRestaurantName(restaurantName);
    const candidateSlug = isValidSlug(baseSlug)
      ? baseSlug
      : `restaurante-${Math.random().toString(36).slice(2, 7)}`;

    const { error: firstRpcError } = await supabase.rpc('create_owner_restaurant', {
      p_name: restaurantName,
      p_slug: candidateSlug,
      p_style: 'classico',
    });

    if (firstRpcError) {
      if (firstRpcError.code === '23505') {
        const fallbackSlug = `${candidateSlug.slice(0, 55)}-${Math.random().toString(36).slice(2, 6)}`;
        const { error: retryRpcError } = await supabase.rpc('create_owner_restaurant', {
          p_name: restaurantName,
          p_slug: fallbackSlug,
          p_style: 'classico',
        });

        if (retryRpcError) {
          return {
            status: 'error',
            message:
              'A tua conta foi criada, mas não foi possível criar automaticamente o restaurante (identificador indisponível). Acede a /admin/onboarding para escolher outro endereço.',
          };
        }
      } else {
        return {
          status: 'error',
          message:
            firstRpcError.code === 'P0001'
              ? 'Esta conta já está associada a um restaurante.'
              : 'A tua conta foi criada, mas ocorreu um erro ao criar o primeiro restaurante. Conclui a configuração em /admin/onboarding.',
        };
      }
    }

    revalidatePath('/', 'layout');
    redirect('/admin');
  }

  revalidatePath('/', 'layout');
  redirect('/admin/onboarding');
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/admin/login');
}
