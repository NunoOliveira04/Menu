'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction, registerOwnerAction } from '@/app/actions/auth';
import { INITIAL_ACTION_STATE } from '@/app/actions/types';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="space-y-4" noValidate>
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
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="dono@restaurante.pt"
          className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-[#8C3B2B] focus:outline-none focus:ring-2 focus:ring-[#8C3B2B]/20"
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
          className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-[#8C3B2B] focus:outline-none focus:ring-2 focus:ring-[#8C3B2B]/20"
        />
        {state.fieldErrors?.password?.[0] && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-[#8C3B2B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#763123] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'A entrar...' : 'Iniciar sessão'}
      </button>

      <p className="pt-2 text-center text-sm text-stone-600">
        Ainda não tens conta?{' '}
        <Link href="/registar" className="font-semibold text-[#8C3B2B] hover:underline">
          Registar restaurante
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerOwnerAction, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === 'error' && state.message && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.message}
        </div>
      )}

      {state.status === 'success' && state.message && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="restaurantName" className="block text-sm font-medium text-stone-800">
          Nome do 1.º restaurante <span className="text-stone-400">(opcional agora)</span>
        </label>
        <input
          id="restaurantName"
          name="restaurantName"
          type="text"
          placeholder="Ex.: Tasca do Castelo"
          className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-[#8C3B2B] focus:outline-none focus:ring-2 focus:ring-[#8C3B2B]/20"
        />
        {state.fieldErrors?.restaurantName?.[0] && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.restaurantName[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-stone-800">
          Email do proprietário
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="dono@restaurante.pt"
          className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-[#8C3B2B] focus:outline-none focus:ring-2 focus:ring-[#8C3B2B]/20"
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
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-[#8C3B2B] focus:outline-none focus:ring-2 focus:ring-[#8C3B2B]/20"
        />
        {state.fieldErrors?.password?.[0] && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-[#8C3B2B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#763123] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'A criar conta...' : 'Criar conta'}
      </button>

      <p className="pt-2 text-center text-sm text-stone-600">
        Já tens conta?{' '}
        <Link href="/login" className="font-semibold text-[#8C3B2B] hover:underline">
          Iniciar sessão
        </Link>
      </p>
    </form>
  );
}
