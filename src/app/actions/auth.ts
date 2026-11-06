'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { resolveSafeAdminNextPath } from '@/lib/routing/admin-paths';
import { createClient } from '@/lib/supabase/server';
import { authCredentialsSchema } from '@/lib/validations/schemas';
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

  const nextPath = resolveSafeAdminNextPath(formData.get('next'));

  revalidatePath('/', 'layout');
  redirect(nextPath);
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/admin/login');
}
