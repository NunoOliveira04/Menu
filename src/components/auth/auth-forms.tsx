'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';
import { INITIAL_ACTION_STATE } from '@/app/actions/types';

export function LoginForm({ next = '' }: { next?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state.status === 'error' && state.message && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-stone-800">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="dono@restaurante.pt"
          className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-[0_10px_30px_-18px_rgba(43,29,22,0.35)] focus:border-[#B4412A] focus:outline-none focus:ring-2 focus:ring-[#B4412A]/20"
        />
        {state.fieldErrors?.email?.[0] && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-stone-800">
          Palavra-passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          placeholder="••••••••"
          className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-[0_10px_30px_-18px_rgba(43,29,22,0.35)] focus:border-[#B4412A] focus:outline-none focus:ring-2 focus:ring-[#B4412A]/20"
        />
        {state.fieldErrors?.password?.[0] && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-[#B4412A] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(43,29,22,0.35)] transition hover:bg-[#9A3722] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'A entrar...' : 'Iniciar sessão'}
      </button>
    </form>
  );
}
