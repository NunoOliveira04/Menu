'use client';

import { useActionState, useEffect, useState } from 'react';
import Image from 'next/image';
import { Clock, Globe, ShieldAlert, Sparkles } from 'lucide-react';
import { updateRestaurantAction } from '@/app/actions/restaurant';
import { INITIAL_ACTION_STATE } from '@/app/actions/types';
import { useCompressedPhotoSubmit } from '@/components/dashboard/use-compressed-photo-submit';
import { parseRestaurantSettings } from '@/lib/auth/access';
import { WEEKDAY_LABELS, type DaySchedule } from '@/lib/modules/hours';
import { parseTranslationsJson } from '@/lib/modules/i18n';
import { MENU_THEMES } from '@/lib/themes/registry';
import type { RestaurantMemberRole, RestaurantRow, RestaurantStyle } from '@/types/database';

interface RestaurantSettingsFormProps {
  restaurant: RestaurantRow;
  role: RestaurantMemberRole;
  initialSchedule: DaySchedule[];
  /** URL público da foto de capa atual, ou null. */
  coverPhotoUrl: string | null;
}

const STYLE_OPTIONS: RestaurantStyle[] = ['classico', 'moderno', 'escuro'];

const COVER_PHOTO_FIELDS = ['coverPhoto'] as const;

interface EditableDayRow {
  dayOfWeek: number;
  closed: boolean;
  slot1Open: string;
  slot1Close: string;
  hasSlot2: boolean;
  slot2Open: string;
  slot2Close: string;
}

function buildEditableSchedule(schedule: DaySchedule[]): EditableDayRow[] {
  return Array.from({ length: 7 }, (_, dayIdx) => {
    const found = schedule.find((d) => d.dayOfWeek === dayIdx);
    const slot1 = found?.slots[0];
    const slot2 = found?.slots[1];
    return {
      dayOfWeek: dayIdx,
      closed: found ? found.closed : dayIdx === 0,
      slot1Open: slot1?.open ?? '12:00',
      slot1Close: slot1?.close ?? '15:00',
      hasSlot2: Boolean(slot2),
      slot2Open: slot2?.open ?? '19:00',
      slot2Close: slot2?.close ?? '23:00',
    };
  });
}

export function RestaurantSettingsForm({
  restaurant,
  role,
  initialSchedule,
  coverPhotoUrl,
}: RestaurantSettingsFormProps) {
  const [state, formAction, isActionPending] = useActionState(
    updateRestaurantAction,
    INITIAL_ACTION_STATE,
  );
  const { handleSubmit, clearPhotoFields, isPreparingPhoto, isSubmitting, photoError } =
    useCompressedPhotoSubmit(formAction, COVER_PHOTO_FIELDS);

  useEffect(() => {
    if (state.status === 'success') {
      clearPhotoFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- corre a cada novo resultado da action
  }, [state]);
  const isPending = isActionPending || isSubmitting;
  const isBusy = isPending || isPreparingPhoto;
  const coverFieldError = photoError ?? state.fieldErrors?.coverPhoto?.[0];
  const initialSettings = parseRestaurantSettings(restaurant.settings);
  const existingTranslations = parseTranslationsJson(restaurant.translations);

  const [selectedStyle, setSelectedStyle] = useState<RestaurantStyle>(restaurant.style);
  const [languagesEnabled, setLanguagesEnabled] = useState(initialSettings.modules.languages);
  const [allergensEnabled, setAllergensEnabled] = useState(initialSettings.modules.allergens);
  const [highlightsEnabled, setHighlightsEnabled] = useState(initialSettings.modules.highlights);
  const [hoursEnabled, setHoursEnabled] = useState(initialSettings.modules.hours);
  const [daysState, setDaysState] = useState<EditableDayRow[]>(() =>
    buildEditableSchedule(initialSchedule),
  );

  const isOwner = role === 'owner';
  const activePreviewTheme = MENU_THEMES[selectedStyle];

  function updateDayRow(dayIdx: number, patch: Partial<EditableDayRow>) {
    setDaysState((prev) =>
      prev.map((row) => (row.dayOfWeek === dayIdx ? { ...row, ...patch } : row)),
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate aria-busy={isBusy}>
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
              placeholder="Ex.: Rua Principal, 12"
              className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none focus:ring-2 focus:ring-[#8C3B2B]/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-stone-800">
              Apresentação do restaurante (PT)
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

          <div className="sm:col-span-2">
            <label htmlFor="coverPhoto" className="block text-sm font-medium text-stone-800">
              Foto de capa da carta
            </label>
            <p className="mt-0.5 text-xs text-stone-500">
              Aparece no topo da carta, por trás do nome. Sem foto, a carta mostra só o nome sobre
              fundo azul.
            </p>
            <div className="mt-2 flex flex-wrap items-start gap-4">
              {coverPhotoUrl ? (
                <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                  <Image
                    src={coverPhotoUrl}
                    alt="Foto de capa atual"
                    fill
                    sizes="144px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-20 w-36 shrink-0 items-end rounded-xl bg-[#1F3A5F] p-2.5"
                >
                  <span className="truncate font-serif text-sm font-semibold text-[#F7F3EC]">
                    {restaurant.name}
                  </span>
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-2">
                <input
                  id="coverPhoto"
                  name="coverPhoto"
                  type="file"
                  accept="image/*"
                  disabled={isBusy}
                  aria-describedby="coverPhoto-help"
                  className="block w-full text-xs text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#F3ECE1] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#8C3B2B] hover:file:bg-[#E7DDD0]"
                />
                <p id="coverPhoto-help" aria-live="polite" className="text-xs text-stone-500">
                  {isPreparingPhoto
                    ? 'A otimizar a fotografia…'
                    : 'A foto é reduzida automaticamente antes de ser enviada.'}
                </p>
                {coverPhotoUrl && (
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-red-700">
                    <input
                      type="checkbox"
                      name="removeCoverPhoto"
                      className="h-4 w-4 rounded border-stone-300 text-red-600 focus:ring-red-600"
                    />
                    Remover foto de capa
                  </label>
                )}
                {coverFieldError && (
                  <p role="alert" className="text-xs text-red-600">
                    {coverFieldError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {languagesEnabled && (
            <div className="sm:col-span-2 rounded-xl border border-[#DFD3C3] bg-[#FAF6F0]/70 p-4">
              <label htmlFor="descriptionEn" className="block text-sm font-medium text-stone-800">
                Apresentação do restaurante em Inglês (EN)
              </label>
              <textarea
                id="descriptionEn"
                name="descriptionEn"
                rows={3}
                defaultValue={existingTranslations.en?.description ?? ''}
                placeholder="Ex.: Seasonal Portuguese cooking with house recipes..."
                className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#8C3B2B] focus:outline-none focus:ring-2 focus:ring-[#8C3B2B]/20"
              />
              <p className="mt-1 text-xs text-stone-500">
                Se ficar em branco, o menu em inglês mostra automaticamente o texto original em
                português.
              </p>
              {state.fieldErrors?.descriptionEn?.[0] && (
                <p className="mt-1 text-xs text-red-600">{state.fieldErrors.descriptionEn[0]}</p>
              )}
            </div>
          )}
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
        <h2 className="font-serif text-xl font-semibold text-stone-900">
          Tema Visual e Pré-visualização
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Escolhe o ambiente visual do teu menu mobile-first. Todos os temas cumprem contraste AA.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {STYLE_OPTIONS.map((styleKey) => {
            const theme = MENU_THEMES[styleKey];
            const isSelected = selectedStyle === theme.id;
            return (
              <label
                key={theme.id}
                className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition ${
                  isSelected
                    ? 'border-[#8C3B2B] bg-[#FAF6F0] ring-1 ring-[#8C3B2B]'
                    : 'border-stone-200 hover:border-[#8C3B2B]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-stone-900">{theme.label}</span>
                  <input
                    type="radio"
                    name="style"
                    value={theme.id}
                    checked={isSelected}
                    onChange={() => setSelectedStyle(theme.id)}
                    className="h-4 w-4 border-stone-300 text-[#8C3B2B] focus:ring-[#8C3B2B]"
                  />
                </div>
                <span className="mt-1.5 text-xs leading-relaxed text-stone-600">
                  {theme.description}
                </span>

                <div
                  aria-hidden="true"
                  className={`mt-3 rounded-lg border p-2.5 ${theme.preview.surfaceBg} ${theme.preview.cardBorder}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`truncate text-xs font-semibold ${theme.preview.fontClass} ${theme.preview.headingText}`}
                    >
                      {restaurant.name}
                    </span>
                    <span className={`h-2 w-5 rounded-full ${theme.preview.accentBg}`} />
                  </div>
                  <div
                    className={`mt-2 rounded-md border p-2 ${theme.preview.cardBg} ${theme.preview.cardBorder}`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`text-[11px] font-medium ${theme.preview.fontClass} ${theme.preview.headingText}`}
                      >
                        Bacalhau Assado
                      </span>
                      <span className={`text-[11px] font-bold ${theme.preview.accentText}`}>
                        18,50 €
                      </span>
                    </div>
                    <p className={`mt-0.5 truncate text-[10px] ${theme.preview.bodyText}`}>
                      Crosta de broa de milho e batata a murro.
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        <div
          aria-label={`Pré-visualização ao vivo do tema ${activePreviewTheme.label}`}
          className={`mt-5 overflow-hidden rounded-2xl border ${activePreviewTheme.preview.cardBorder} ${activePreviewTheme.preview.surfaceBg} p-5 transition`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p
                className={`text-[11px] uppercase tracking-wider ${activePreviewTheme.preview.bodyText}`}
              >
                Pré-visualização · {activePreviewTheme.label}
              </p>
              <p
                className={`mt-0.5 text-xl font-semibold ${activePreviewTheme.preview.fontClass} ${activePreviewTheme.preview.headingText}`}
              >
                {restaurant.name}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                selectedStyle === 'escuro'
                  ? 'bg-[#C6A57A] text-[#1A120C]'
                  : `${activePreviewTheme.preview.accentBg} text-white`
              }`}
            >
              Entradas
            </span>
          </div>

          <div
            className={`mt-4 rounded-xl border p-3.5 ${activePreviewTheme.preview.cardBg} ${activePreviewTheme.preview.cardBorder}`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span
                className={`text-sm font-semibold ${activePreviewTheme.preview.fontClass} ${activePreviewTheme.preview.headingText}`}
              >
                Pataniscas de Bacalhau
              </span>
              <span
                className={`text-sm font-bold tabular-nums ${activePreviewTheme.preview.accentText}`}
              >
                6,50 €
              </span>
            </div>
            <p className={`mt-1 text-xs ${activePreviewTheme.preview.bodyText}`}>
              Fritas na hora em azeite virgem com salsa fresca.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Módulos Opcionais</h2>
        <p className="mt-1 text-sm text-stone-600">
          Liga apenas o que o teu restaurante precisa. Quando um módulo está desligado, os seus
          campos desaparecem do painel e não são mostrados no menu público.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3.5 hover:bg-stone-50 has-[:checked]:border-[#8C3B2B]/50 has-[:checked]:bg-[#FAF6F0]/60">
            <input
              type="checkbox"
              name="module_languages"
              checked={languagesEnabled}
              onChange={(e) => setLanguagesEnabled(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#8C3B2B] focus:ring-[#8C3B2B]"
            />
            <div className="flex-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-stone-900">
                <Globe className="h-4 w-4 text-[#8C3B2B]" aria-hidden="true" />
                Traduções PT / EN
              </span>
              <span className="mt-0.5 block text-xs text-stone-500">
                Edita textos em inglês para categorias, pratos e descrição, com seletor PT/EN no
                menu público.
              </span>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3.5 hover:bg-stone-50 has-[:checked]:border-[#8C3B2B]/50 has-[:checked]:bg-[#FAF6F0]/60">
            <input
              type="checkbox"
              name="module_allergens"
              checked={allergensEnabled}
              onChange={(e) => setAllergensEnabled(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#8C3B2B] focus:ring-[#8C3B2B]"
            />
            <div className="flex-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-stone-900">
                <ShieldAlert className="h-4 w-4 text-[#8C3B2B]" aria-hidden="true" />
                Alergénios (14 da UE)
              </span>
              <span className="mt-0.5 block text-xs text-stone-500">
                Assinala os 14 alergénios oficiais por prato; no menu abrem numa ficha (bottom
                sheet).
              </span>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3.5 hover:bg-stone-50 has-[:checked]:border-[#8C3B2B]/50 has-[:checked]:bg-[#FAF6F0]/60">
            <input
              type="checkbox"
              name="module_highlights"
              checked={highlightsEnabled}
              onChange={(e) => setHighlightsEnabled(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#8C3B2B] focus:ring-[#8C3B2B]"
            />
            <div className="flex-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-stone-900">
                <Sparkles className="h-4 w-4 text-[#8C3B2B]" aria-hidden="true" />
                Destaques, Recomendados e Novos
              </span>
              <span className="mt-0.5 block text-xs text-stone-500">
                Marca pratos especiais com o selo «Da casa» na carta (sem secção dedicada).
              </span>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3.5 hover:bg-stone-50 has-[:checked]:border-[#8C3B2B]/50 has-[:checked]:bg-[#FAF6F0]/60">
            <input
              type="checkbox"
              name="module_hours"
              checked={hoursEnabled}
              onChange={(e) => setHoursEnabled(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#8C3B2B] focus:ring-[#8C3B2B]"
            />
            <div className="flex-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-stone-900">
                <Clock className="h-4 w-4 text-[#8C3B2B]" aria-hidden="true" />
                Horário Semanal
              </span>
              <span className="mt-0.5 block text-xs text-stone-500">
                Configura horários de almoço/jantar e mostra estado Aberto/Fechado em tempo real
                (Europe/Lisbon).
              </span>
            </div>
          </label>
        </div>
      </section>

      {hoursEnabled && (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <input type="hidden" name="hours_submitted" value="true" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-serif text-xl font-semibold text-stone-900">
                Horário Semanal de Funcionamento
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Fuso horário de Portugal Continental (<code className="text-xs">Europe/Lisbon</code>
                ). Suporta 1 ou 2 turnos por dia (ex.: almoço e jantar).
              </p>
            </div>
          </div>

          <div className="mt-5 divide-y divide-stone-100 rounded-xl border border-stone-200">
            {daysState.map((dayRow) => {
              const dayName = WEEKDAY_LABELS.pt[dayRow.dayOfWeek] ?? '';
              return (
                <div
                  key={dayRow.dayOfWeek}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center justify-between gap-4 sm:w-52">
                    <span className="text-sm font-semibold text-stone-900">{dayName}</span>
                    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-stone-600">
                      <input
                        type="checkbox"
                        name={`day_${dayRow.dayOfWeek}_closed`}
                        checked={dayRow.closed}
                        onChange={(e) =>
                          updateDayRow(dayRow.dayOfWeek, { closed: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-stone-300 text-[#8C3B2B] focus:ring-[#8C3B2B]"
                      />
                      Encerrado
                    </label>
                  </div>

                  {dayRow.closed ? (
                    <p className="text-xs italic text-stone-400">Descanso semanal / encerrado</p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="time"
                          aria-label={`${dayName} abertura 1.º turno`}
                          name={`day_${dayRow.dayOfWeek}_slot1_open`}
                          value={dayRow.slot1Open}
                          onChange={(e) =>
                            updateDayRow(dayRow.dayOfWeek, { slot1Open: e.target.value })
                          }
                          className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs text-stone-900 focus:border-[#8C3B2B] focus:outline-none"
                        />
                        <span className="text-xs text-stone-400">às</span>
                        <input
                          type="time"
                          aria-label={`${dayName} fecho 1.º turno`}
                          name={`day_${dayRow.dayOfWeek}_slot1_close`}
                          value={dayRow.slot1Close}
                          onChange={(e) =>
                            updateDayRow(dayRow.dayOfWeek, { slot1Close: e.target.value })
                          }
                          className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs text-stone-900 focus:border-[#8C3B2B] focus:outline-none"
                        />
                      </div>

                      {dayRow.hasSlot2 ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="hidden"
                            name={`day_${dayRow.dayOfWeek}_slot2_enabled`}
                            value="true"
                          />
                          <span className="text-xs text-stone-400">+</span>
                          <input
                            type="time"
                            aria-label={`${dayName} abertura 2.º turno`}
                            name={`day_${dayRow.dayOfWeek}_slot2_open`}
                            value={dayRow.slot2Open}
                            onChange={(e) =>
                              updateDayRow(dayRow.dayOfWeek, { slot2Open: e.target.value })
                            }
                            className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs text-stone-900 focus:border-[#8C3B2B] focus:outline-none"
                          />
                          <span className="text-xs text-stone-400">às</span>
                          <input
                            type="time"
                            aria-label={`${dayName} fecho 2.º turno`}
                            name={`day_${dayRow.dayOfWeek}_slot2_close`}
                            value={dayRow.slot2Close}
                            onChange={(e) =>
                              updateDayRow(dayRow.dayOfWeek, { slot2Close: e.target.value })
                            }
                            className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs text-stone-900 focus:border-[#8C3B2B] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateDayRow(dayRow.dayOfWeek, { hasSlot2: false })}
                            className="ml-1 text-xs font-medium text-red-600 hover:underline"
                          >
                            Remover 2.º
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateDayRow(dayRow.dayOfWeek, { hasSlot2: true })}
                          className="rounded-lg border border-dashed border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-600 transition hover:border-[#8C3B2B] hover:text-[#8C3B2B]"
                        >
                          + 2.º turno (jantar)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isBusy}
          className="rounded-xl bg-[#8C3B2B] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#763123] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPreparingPhoto
            ? 'A otimizar fotografia…'
            : isPending
              ? 'A guardar alterações...'
              : 'Guardar definições'}
        </button>
      </div>
    </form>
  );
}
