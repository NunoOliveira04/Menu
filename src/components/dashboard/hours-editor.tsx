'use client';

import { useState } from 'react';
import { Copy, Plus, X } from 'lucide-react';
import { WEEKDAY_LABELS, type DaySchedule } from '@/lib/modules/hours';

export interface EditableDayRow {
  dayOfWeek: number;
  closed: boolean;
  slot1Open: string;
  slot1Close: string;
  hasSlot2: boolean;
  slot2Open: string;
  slot2Close: string;
}

/** Ordem de apresentação: segunda (0) a domingo (6), como em `lib/modules/hours`. */
export const WEEK_DISPLAY_ORDER = [0, 1, 2, 3, 4, 5, 6] as const;

export function buildEditableSchedule(schedule: readonly DaySchedule[]): EditableDayRow[] {
  return Array.from({ length: 7 }, (_, dayIdx) => {
    const found = schedule.find((d) => d.dayOfWeek === dayIdx);
    const slot1 = found?.slots[0];
    const slot2 = found?.slots[1];
    return {
      dayOfWeek: dayIdx,
      // Sem horário guardado: só a segunda-feira (descanso habitual) começa fechada.
      closed: found ? found.closed : dayIdx === 0,
      slot1Open: slot1?.open ?? '12:00',
      slot1Close: slot1?.close ?? '15:00',
      hasSlot2: Boolean(slot2),
      slot2Open: slot2?.open ?? '19:00',
      slot2Close: slot2?.close ?? '23:00',
    };
  });
}

/** Copia os turnos de um dia para todos os outros dias que estão abertos. */
export function copyDayToOpenDays(rows: readonly EditableDayRow[], sourceDay: number) {
  const source = rows.find((row) => row.dayOfWeek === sourceDay);
  if (!source) {
    return [...rows];
  }
  return rows.map((row) =>
    row.dayOfWeek === sourceDay || row.closed
      ? row
      : {
          ...row,
          slot1Open: source.slot1Open,
          slot1Close: source.slot1Close,
          hasSlot2: source.hasSlot2,
          slot2Open: source.slot2Open,
          slot2Close: source.slot2Close,
        },
  );
}

const TIME_INPUT =
  'w-full min-w-0 rounded-lg border border-stone-300 bg-white px-2 py-2 text-sm tabular-nums text-stone-900 focus:border-[#8C3B2B] focus:outline-none focus:ring-2 focus:ring-[#8C3B2B]/20';

/**
 * Editor do horário semanal. Os nomes dos campos mantêm-se (`day_<n>_closed`,
 * `day_<n>_slot1_open`, …) para a Server Action não mudar.
 */
export function HoursEditor({ initialSchedule }: { initialSchedule: readonly DaySchedule[] }) {
  const [rows, setRows] = useState<EditableDayRow[]>(() => buildEditableSchedule(initialSchedule));
  const [copiedFrom, setCopiedFrom] = useState<number | null>(null);

  function update(dayOfWeek: number, patch: Partial<EditableDayRow>) {
    setCopiedFrom(null);
    setRows((prev) =>
      prev.map((row) => (row.dayOfWeek === dayOfWeek ? { ...row, ...patch } : row)),
    );
  }

  return (
    <div>
      <input type="hidden" name="hours_submitted" value="true" />
      <ul className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200">
        {WEEK_DISPLAY_ORDER.map((dayIdx) => {
          const row = rows.find((r) => r.dayOfWeek === dayIdx);
          if (!row) {
            return null;
          }
          const dayName = WEEKDAY_LABELS.pt[dayIdx] ?? '';
          const prefix = `day_${dayIdx}`;
          return (
            <li key={dayIdx} className="bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-stone-900">{dayName}</span>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-stone-700">
                  <span className={row.closed ? 'text-stone-500' : 'font-medium text-emerald-700'}>
                    {row.closed ? 'Fechado' : 'Aberto'}
                  </span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={!row.closed}
                    onChange={(e) => update(dayIdx, { closed: !e.target.checked })}
                    aria-label={`${dayName}: aberto`}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="relative h-6 w-11 rounded-full bg-stone-300 transition peer-checked:bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-[#8C3B2B]/40 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
                  />
                </label>
              </div>

              {row.closed ? (
                <input type="hidden" name={`${prefix}_closed`} value="true" />
              ) : (
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-[4.25rem_minmax(0,1fr)_auto_minmax(0,1fr)_2.25rem] items-center gap-2">
                    <span className="text-xs font-medium text-stone-500">1.º turno</span>
                    <input
                      type="time"
                      aria-label={`${dayName}: abre (1.º turno)`}
                      name={`${prefix}_slot1_open`}
                      value={row.slot1Open}
                      onChange={(e) => update(dayIdx, { slot1Open: e.target.value })}
                      className={TIME_INPUT}
                    />
                    <span className="text-xs text-stone-400">até</span>
                    <input
                      type="time"
                      aria-label={`${dayName}: fecha (1.º turno)`}
                      name={`${prefix}_slot1_close`}
                      value={row.slot1Close}
                      onChange={(e) => update(dayIdx, { slot1Close: e.target.value })}
                      className={TIME_INPUT}
                    />
                    <span aria-hidden="true" />
                  </div>

                  {row.hasSlot2 && (
                    <div className="grid grid-cols-[4.25rem_minmax(0,1fr)_auto_minmax(0,1fr)_2.25rem] items-center gap-2">
                      <input type="hidden" name={`${prefix}_slot2_enabled`} value="true" />
                      <span className="text-xs font-medium text-stone-500">2.º turno</span>
                      <input
                        type="time"
                        aria-label={`${dayName}: abre (2.º turno)`}
                        name={`${prefix}_slot2_open`}
                        value={row.slot2Open}
                        onChange={(e) => update(dayIdx, { slot2Open: e.target.value })}
                        className={TIME_INPUT}
                      />
                      <span className="text-xs text-stone-400">até</span>
                      <input
                        type="time"
                        aria-label={`${dayName}: fecha (2.º turno)`}
                        name={`${prefix}_slot2_close`}
                        value={row.slot2Close}
                        onChange={(e) => update(dayIdx, { slot2Close: e.target.value })}
                        className={TIME_INPUT}
                      />
                      <button
                        type="button"
                        onClick={() => update(dayIdx, { hasSlot2: false })}
                        aria-label={`${dayName}: remover 2.º turno`}
                        title="Remover 2.º turno"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                    {!row.hasSlot2 && (
                      <button
                        type="button"
                        onClick={() => update(dayIdx, { hasSlot2: true })}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C3B2B] hover:underline"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        Adicionar 2.º turno
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setRows((prev) => copyDayToOpenDays(prev, dayIdx));
                        setCopiedFrom(dayIdx);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900 hover:underline"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      Copiar para os outros dias abertos
                    </button>
                    {copiedFrom === dayIdx && (
                      <span role="status" className="text-xs text-emerald-700">
                        Copiado. Falta guardar.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-stone-500">Hora de Portugal Continental.</p>
    </div>
  );
}
