'use client';

import { useActionState, useState } from 'react';
import { createFirstRestaurantAction } from '@/app/actions/restaurant';
import { INITIAL_ACTION_STATE } from '@/app/actions/types';
import { slugifyRestaurantName } from '@/lib/utils/slug';

export function OnboardingRestaurantForm() {
  const [state, formAction, isPending] = useActionState(
    createFirstRestaurantAction,
    INITIAL_ACTION_STATE,
  );
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  function handleNameChange(nextName: string) {
    setName(nextName);
    if (!slugTouched) {
      setSlug(slugifyRestaurantName(nextName));
    }
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === 'error' && state.message && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-stone-800">
          Nome do restaurante
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Ex.: Tasca do Castelo"
          className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-[#8C3B2B] focus:outline-none focus:ring-2 focus:ring-[#8C3B2B]/20"
        />
        {state.fieldErrors?.name?.[0] && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-stone-800">
          Endereço público do menu (slug)
        </label>
        <div className="mt-1.5 flex items-center rounded-xl border border-stone-300 bg-white shadow-sm focus-within:border-[#8C3B2B] focus-within:ring-2 focus-within:ring-[#8C3B2B]/20">
          <span className="select-none pl-3.5 pr-1 text-sm text-stone-400">/r/</span>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase());
            }}
            placeholder="tasca-do-castelo"
            className="block w-full rounded-r-xl border-0 bg-transparent py-2.5 pr-3.5 text-sm text-stone-900 focus:outline-none"
          />
        </div>
        <p className="mt-1 text-xs text-stone-500">
          Apenas letras minúsculas sem acentos, números e hífens.
        </p>
        {state.fieldErrors?.slug?.[0] && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.slug[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-stone-800">
          Localidade / Morada curta <span className="text-stone-400">(opcional)</span>
        </label>
        <input
          id="location"
          name="location"
          type="text"
          placeholder="Ex.: Largo da Oliveira, Guimarães"
          className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-[#8C3B2B] focus:outline-none focus:ring-2 focus:ring-[#8C3B2B]/20"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-stone-800">
          Apresentação curta <span className="text-stone-400">(opcional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Uma frase sobre a cozinha ou história da casa."
          className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-[#8C3B2B] focus:outline-none focus:ring-2 focus:ring-[#8C3B2B]/20"
        />
      </div>

      <input type="hidden" name="style" value="classico" />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-[#8C3B2B] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#763123] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'A criar restaurante...' : 'Criar restaurante e abrir painel'}
      </button>
    </form>
  );
}
