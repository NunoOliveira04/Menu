'use client';

import { useActionState } from 'react';
import { updateRestaurantAction } from '@/app/actions/restaurant';
import { INITIAL_ACTION_STATE } from '@/app/actions/types';
import { parseRestaurantSettings } from '@/lib/auth/access';
import { MENU_THEMES } from '@/lib/themes/registry';
import type { RestaurantMemberRole, RestaurantRow, RestaurantStyle } from '@/types/database';

interface RestaurantSettingsFormProps {
  restaurant: RestaurantRow;
  role: RestaurantMemberRole;
}

const STYLE_OPTIONS: RestaurantStyle[] = ['classico', 'moderno', 'escuro'];

export function RestaurantSettingsForm({ restaurant, role }: RestaurantSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateRestaurantAction,
    INITIAL_ACTION_STATE,
  );
  const settings = parseRestaurantSettings(restaurant.settings);
  const isOwner = role === 'owner';

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <input type="hidden" name="restaurantId" value={restaurant.id} />

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

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Identidade e Publicação</h2>
        <p className="mt-1 text-sm text-stone-600">
          Informação principal visível no topo do menu público.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-800">
              Nome do restaurante
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={restaurant.name}
              className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none focus:ring-2 focus:ring-[#8C3B2B]/20"
            />
            {state.fieldErrors?.name?.[0] && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-stone-800">
              Identificador único (slug)
            </label>
            <div
              className={`mt-1.5 flex items-center rounded-xl border border-stone-300 ${
                isOwner
                  ? 'bg-white focus-within:border-[#8C3B2B] focus-within:ring-2 focus-within:ring-[#8C3B2B]/20'
                  : 'bg-stone-100 opacity-75'
              }`}
            >
              <span className="select-none pl-3.5 pr-1 text-sm text-stone-400">/r/</span>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                disabled={!isOwner}
                defaultValue={restaurant.slug}
                className="block w-full rounded-r-xl border-0 bg-transparent py-2.5 pr-3.5 text-sm text-stone-900 focus:outline-none disabled:cursor-not-allowed"
              />
            </div>
            {!isOwner && (
              <p className="mt-1 text-xs text-stone-500">
                Apenas o proprietário (owner) pode alterar o endereço público.
              </p>
            )}
            {state.fieldErrors?.slug?.[0] && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.slug[0]}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="location" className="block text-sm font-medium text-stone-800">
              Localidade / Morada curta
            </label>
            <input
              id="location"
              name="location"
              type="text"
              defaultValue={restaurant.location ?? ''}
              placeholder="Ex.: Largo da Oliveira, Guimarães"
              className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none focus:ring-2 focus:ring-[#8C3B2B]/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-stone-800">
              Apresentação do restaurante
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={restaurant.description ?? ''}
              placeholder="Breve descrição da cozinha, especialidades ou história."
              className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none focus:ring-2 focus:ring-[#8C3B2B]/20"
            />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <label
            className={`flex items-start gap-3 ${
              isOwner ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
            }`}
          >
            <input
              type="checkbox"
              name="published"
              disabled={!isOwner}
              defaultChecked={restaurant.published}
              className="mt-1 h-4 w-4 rounded border-stone-300 text-[#8C3B2B] focus:ring-[#8C3B2B] disabled:cursor-not-allowed"
            />
            <div>
              <span className="block text-sm font-semibold text-stone-900">
                Publicar menu publicamente
              </span>
              <span className="block text-xs text-stone-600">
                Quando ativo, qualquer pessoa com o link ou código QR pode consultar a ementa.
                Quando desligado, apenas membros autenticados do restaurante a conseguem
                pré-visualizar.
                {!isOwner && ' (Reservado ao proprietário.)'}
              </span>
            </div>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Tema Visual do Menu</h2>
        <p className="mt-1 text-sm text-stone-600">
          O tema <strong>Clássico Editorial</strong> é o padrão recomendado. A arquitetura suporta
          também Moderno e Escuro.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {STYLE_OPTIONS.map((styleKey) => {
            const theme = MENU_THEMES[styleKey];
            return (
              <label
                key={theme.id}
                className="relative flex cursor-pointer flex-col rounded-xl border border-stone-200 p-4 transition hover:border-[#8C3B2B]/50 has-[:checked]:border-[#8C3B2B] has-[:checked]:bg-[#FAF6F0]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-stone-900">{theme.label}</span>
                  <input
                    type="radio"
                    name="style"
                    value={theme.id}
                    defaultChecked={restaurant.style === theme.id}
                    className="h-4 w-4 border-stone-300 text-[#8C3B2B] focus:ring-[#8C3B2B]"
                  />
                </div>
                <span className="mt-1.5 text-xs leading-relaxed text-stone-600">
                  {theme.description}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Módulos Opcionais</h2>
        <p className="mt-1 text-sm text-stone-600">
          A base do menu (categorias, pratos, preços e fotografias) está sempre ativa. Os módulos
          abaixo vêm desligados por defeito para manter o painel limpo e podem ser ativados quando
          precisares.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3.5 hover:bg-stone-50">
            <input
              type="checkbox"
              name="module_languages"
              defaultChecked={settings.modules.languages}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#8C3B2B] focus:ring-[#8C3B2B]"
            />
            <div>
              <span className="block text-sm font-medium text-stone-900">Traduções / Idiomas</span>
              <span className="block text-xs text-stone-500">
                Suporte multi-língua (PT, EN, FR, ES) para clientes internacionais.
              </span>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3.5 hover:bg-stone-50">
            <input
              type="checkbox"
              name="module_allergens"
              defaultChecked={settings.modules.allergens}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#8C3B2B] focus:ring-[#8C3B2B]"
            />
            <div>
              <span className="block text-sm font-medium text-stone-900">Alergénios</span>
              <span className="block text-xs text-stone-500">
                Ficha de alergénios obrigatórios por prato.
              </span>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3.5 hover:bg-stone-50">
            <input
              type="checkbox"
              name="module_highlights"
              defaultChecked={settings.modules.highlights}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#8C3B2B] focus:ring-[#8C3B2B]"
            />
            <div>
              <span className="block text-sm font-medium text-stone-900">
                Destaques / Sugestão do Chef
              </span>
              <span className="block text-xs text-stone-500">
                Realçar pratos recomendados no topo da carta.
              </span>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3.5 hover:bg-stone-50">
            <input
              type="checkbox"
              name="module_hours"
              defaultChecked={settings.modules.hours}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#8C3B2B] focus:ring-[#8C3B2B]"
            />
            <div>
              <span className="block text-sm font-medium text-stone-900">
                Horário de Funcionamento
              </span>
              <span className="block text-xs text-stone-500">
                Mostrar horários de abertura e dias de descanso no rodapé.
              </span>
            </div>
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[#8C3B2B] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#763123] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'A guardar alterações...' : 'Guardar definições'}
        </button>
      </div>
    </form>
  );
}
