'use client';

import { useActionState, useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { ChevronDown, Clock, Globe, ShieldAlert, Sparkles } from 'lucide-react';
import { updateRestaurantAction } from '@/app/actions/restaurant';
import { INITIAL_ACTION_STATE } from '@/app/actions/types';
import { AppearancePicker } from '@/components/dashboard/appearance-picker';
import { HoursEditor } from '@/components/dashboard/hours-editor';
import { useCompressedPhotoSubmit } from '@/components/dashboard/use-compressed-photo-submit';
import { parseRestaurantSettings } from '@/lib/auth/access';
import { LOGO_COMPRESS_OPTIONS } from '@/lib/images/compress-photo';
import { restaurantInitials } from '@/lib/menu/hero';
import { parseMenuBackgroundId, parseMenuLayout } from '@/lib/themes/backgrounds';
import type { DaySchedule } from '@/lib/modules/hours';
import { parseTranslationsJson } from '@/lib/modules/i18n';
import type { RestaurantMemberRole, RestaurantRow } from '@/types/database';

interface RestaurantSettingsFormProps {
  restaurant: RestaurantRow;
  role: RestaurantMemberRole;
  initialSchedule: DaySchedule[];
  /** URL público do logotipo atual, ou null. */
  logoUrl: string | null;
  /** Endereço público da carta (para mostrar ao dono). */
  publicMenuUrl: string;
}

const IMAGE_FIELDS = ['logoPhoto'] as const;
const IMAGE_FIELD_OPTIONS = { logoPhoto: LOGO_COMPRESS_OPTIONS } as const;

const INPUT =
  'mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none focus:ring-2 focus:ring-[#8C3B2B]/20';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-stone-600">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ModuleSwitch({
  name,
  checked,
  onChange,
  icon,
  title,
  description,
}: {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-3.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FAF6F0] text-[#8C3B2B]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-stone-900">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-stone-500">{description}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative mt-1 h-6 w-11 shrink-0 rounded-full bg-stone-300 transition peer-checked:bg-[#8C3B2B] peer-focus-visible:ring-2 peer-focus-visible:ring-[#8C3B2B]/40 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
      />
    </label>
  );
}

export function RestaurantSettingsForm({
  restaurant,
  role,
  initialSchedule,
  logoUrl,
  publicMenuUrl,
}: RestaurantSettingsFormProps) {
  const [state, formAction, isActionPending] = useActionState(
    updateRestaurantAction,
    INITIAL_ACTION_STATE,
  );
  const {
    handleSubmit,
    clearPhotoFields,
    isPreparingPhoto,
    isSubmitting,
    photoError,
    photoErrorField,
  } = useCompressedPhotoSubmit(formAction, IMAGE_FIELDS, IMAGE_FIELD_OPTIONS);

  useEffect(() => {
    if (state.status === 'success') {
      clearPhotoFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- corre a cada novo resultado da action
  }, [state]);

  const isPending = isActionPending || isSubmitting;
  const isBusy = isPending || isPreparingPhoto;
  const logoError =
    photoErrorField === 'logoPhoto' ? photoError : state.fieldErrors?.logoPhoto?.[0];

  const initialSettings = parseRestaurantSettings(restaurant.settings);
  const existingTranslations = parseTranslationsJson(restaurant.translations);
  const isOwner = role === 'owner';

  const [languagesEnabled, setLanguagesEnabled] = useState(initialSettings.modules.languages);
  const [allergensEnabled, setAllergensEnabled] = useState(initialSettings.modules.allergens);
  const [highlightsEnabled, setHighlightsEnabled] = useState(initialSettings.modules.highlights);
  const [hoursEnabled, setHoursEnabled] = useState(initialSettings.modules.hours);

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-4" noValidate aria-busy={isBusy}>
      <input type="hidden" name="restaurantId" value={restaurant.id} />
      {/* Campos que já não aparecem no painel mantêm o valor atual. */}
      <input type="hidden" name="location" value={restaurant.location ?? ''} />

      {state.status === 'error' && state.message && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.message}
        </div>
      )}

      <Section title="Restaurante" description="O que aparece no topo da carta.">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-white text-xl font-semibold text-[#1F3A5F]">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Logotipo atual"
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              ) : (
                <span aria-hidden="true">{restaurantInitials(restaurant.name)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <label htmlFor="logoPhoto" className="block text-sm font-medium text-stone-800">
                Logotipo
              </label>
              <input
                id="logoPhoto"
                name="logoPhoto"
                type="file"
                accept="image/*"
                disabled={isBusy}
                aria-describedby="logoPhoto-help"
                className="block w-full text-xs text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#F3ECE1] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#8C3B2B] hover:file:bg-[#E7DDD0]"
              />
              <p id="logoPhoto-help" aria-live="polite" className="text-xs text-stone-500">
                {isPreparingPhoto
                  ? 'A otimizar a imagem…'
                  : 'Imagem quadrada. PNG com fundo transparente fica melhor.'}
              </p>
              {logoUrl && (
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-red-700">
                  <input
                    type="checkbox"
                    name="removeLogo"
                    className="h-4 w-4 rounded border-stone-300 text-red-600 focus:ring-red-600"
                  />
                  Remover logotipo
                </label>
              )}
              {logoError && (
                <p role="alert" className="text-xs text-red-600">
                  {logoError}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-800">
              Nome
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={restaurant.name}
              className={INPUT}
            />
            {state.fieldErrors?.name?.[0] && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-stone-800">
              Descrição curta
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={restaurant.description ?? ''}
              placeholder="Ex.: Cozinha portuguesa de temporada."
              className={INPUT}
            />
          </div>

          {languagesEnabled && (
            <div>
              <label htmlFor="descriptionEn" className="block text-sm font-medium text-stone-800">
                Descrição curta em inglês
              </label>
              <textarea
                id="descriptionEn"
                name="descriptionEn"
                rows={2}
                defaultValue={existingTranslations.en?.description ?? ''}
                placeholder="Ex.: Seasonal Portuguese cooking."
                className={INPUT}
              />
              <p className="mt-1 text-xs text-stone-500">
                Se ficar vazio, a carta em inglês mostra o texto em português.
              </p>
              {state.fieldErrors?.descriptionEn?.[0] && (
                <p className="mt-1 text-xs text-red-600">{state.fieldErrors.descriptionEn[0]}</p>
              )}
            </div>
          )}
        </div>
      </Section>

      <Section
        title="Aspeto"
        description="Escolhe a cor, a disposição dos pratos e o fundo da carta."
      >
        <AppearancePicker
          initialStyle={restaurant.style}
          initialBackground={parseMenuBackgroundId(restaurant.settings)}
          initialLayout={parseMenuLayout(restaurant.settings)}
        />
      </Section>

      <Section
        title="O que aparece na carta"
        description="Liga só o que precisas. O que está desligado não aparece na carta nem no painel."
      >
        <div className="-my-3.5 divide-y divide-stone-100">
          <ModuleSwitch
            name="module_languages"
            checked={languagesEnabled}
            onChange={setLanguagesEnabled}
            icon={<Globe className="h-4 w-4" aria-hidden="true" />}
            title="Versão em inglês"
            description="Mostra o botão PT / EN e deixa-te escrever os pratos em inglês."
          />
          <ModuleSwitch
            name="module_allergens"
            checked={allergensEnabled}
            onChange={setAllergensEnabled}
            icon={<ShieldAlert className="h-4 w-4" aria-hidden="true" />}
            title="Alergénios"
            description="Marca em cada prato os 14 alergénios obrigatórios."
          />
          <ModuleSwitch
            name="module_highlights"
            checked={highlightsEnabled}
            onChange={setHighlightsEnabled}
            icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
            title="Selo «Da casa»"
            description="Destaca pratos especiais com uma etiqueta."
          />
          <ModuleSwitch
            name="module_hours"
            checked={hoursEnabled}
            onChange={setHoursEnabled}
            icon={<Clock className="h-4 w-4" aria-hidden="true" />}
            title="Horário"
            description="Mostra o horário de funcionamento no fim da carta."
          />
        </div>
      </Section>

      {hoursEnabled && (
        <Section
          title="Horário"
          description="Liga os dias em que abres. Podes ter até dois turnos por dia (ex.: almoço e jantar)."
        >
          <HoursEditor initialSchedule={initialSchedule} />
        </Section>
      )}

      <details className="group rounded-2xl border border-stone-200 bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
          <span>
            <span className="block text-lg font-semibold text-stone-900">Avançado</span>
            <span className="mt-0.5 block text-sm text-stone-600">Endereço da carta.</span>
          </span>
          <ChevronDown
            className="h-5 w-5 text-stone-500 transition group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-stone-100 p-5 sm:p-6">
          <label htmlFor="slug" className="block text-sm font-medium text-stone-800">
            Endereço da carta
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
          <p className="mt-1.5 break-all text-xs text-stone-500">
            Agora: <span className="font-medium text-stone-700">{publicMenuUrl}</span>
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Atenção: se mudares o endereço, os códigos QR já impressos deixam de funcionar.
          </p>
          {!isOwner && (
            <p className="mt-1 text-xs text-stone-500">Só o dono pode mudar o endereço.</p>
          )}
          {state.fieldErrors?.slug?.[0] && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.slug[0]}</p>
          )}
        </div>
      </details>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex items-center justify-between gap-3">
          <p aria-live="polite" className="min-w-0 text-sm">
            {state.status === 'success' && state.message && !isBusy ? (
              <span className="text-emerald-700">Guardado.</span>
            ) : state.status === 'error' && !isBusy ? (
              <span className="text-red-700">Não foi guardado.</span>
            ) : (
              <span className="text-stone-500">
                {isPreparingPhoto ? 'A otimizar a imagem…' : isPending ? 'A guardar…' : ''}
              </span>
            )}
          </p>
          <button
            type="submit"
            disabled={isBusy}
            className="shrink-0 rounded-xl bg-[#8C3B2B] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#763123] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? 'A guardar…' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  );
}
