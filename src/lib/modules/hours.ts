import type { Json, MenuLocale, RestaurantHoursRow, TimeSlot } from '@/types/database';

export const LISBON_TIMEZONE = 'Europe/Lisbon';

export interface DaySchedule {
  dayOfWeek: number; // 0 = Segunda-feira .. 6 = Domingo
  closed: boolean;
  slots: TimeSlot[];
}

export const WEEKDAY_LABELS: Record<MenuLocale, readonly string[]> = {
  pt: [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo',
  ],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function isValidTimeString(value: string): boolean {
  return TIME_PATTERN.test(value.trim());
}

export function timeToMinutes(timeStr: string): number {
  const [hoursRaw, minutesRaw] = timeStr.split(':');
  return Number(hoursRaw) * 60 + Number(minutesRaw);
}

export function parseSlotsJson(raw: Json | null | undefined): TimeSlot[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const slots: TimeSlot[] = [];
  for (const item of raw) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const obj = item as Record<string, Json | undefined>;
      const open = typeof obj.open === 'string' ? obj.open.trim() : '';
      const close = typeof obj.close === 'string' ? obj.close.trim() : '';
      if (isValidTimeString(open) && isValidTimeString(close)) {
        slots.push({ open, close });
      }
    }
  }
  return slots;
}

export function normalizeWeeklySchedule(
  rows: readonly Pick<RestaurantHoursRow, 'day_of_week' | 'closed' | 'slots'>[],
): DaySchedule[] {
  const byDay = new Map<number, DaySchedule>();

  for (const row of rows) {
    if (row.day_of_week >= 0 && row.day_of_week <= 6) {
      const parsedSlots = row.closed ? [] : parseSlotsJson(row.slots);
      byDay.set(row.day_of_week, {
        dayOfWeek: row.day_of_week,
        closed: row.closed || parsedSlots.length === 0,
        slots: parsedSlots,
      });
    }
  }

  return Array.from({ length: 7 }, (_, dayIdx) => {
    const existing = byDay.get(dayIdx);
    if (existing) {
      return existing;
    }
    return {
      dayOfWeek: dayIdx,
      closed: true,
      slots: [],
    };
  });
}

const SHORT_EN_WEEKDAY_TO_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export interface LisbonLocalTime {
  dayOfWeek: number; // 0 = Mon .. 6 = Sun
  minutesSinceMidnight: number;
  formattedTime: string; // HH:MM
}

export function getLisbonLocalTime(now: Date = new Date()): LisbonLocalTime {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: LISBON_TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const weekdayToken = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  let hourNum = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minuteNum = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');

  if (hourNum === 24) {
    hourNum = 0;
  }

  const dayOfWeek = SHORT_EN_WEEKDAY_TO_INDEX[weekdayToken] ?? 0;
  const formattedTime = `${String(hourNum).padStart(2, '0')}:${String(minuteNum).padStart(2, '0')}`;

  return {
    dayOfWeek,
    minutesSinceMidnight: hourNum * 60 + minuteNum,
    formattedTime,
  };
}

export interface OpenStatusResult {
  isOpen: boolean;
  currentDayOfWeek: number;
  localTime: string;
  activeSlot: TimeSlot | null;
}

/**
 * Avalia se o restaurante está aberto neste exato instante no fuso Europe/Lisbon.
 * Suporta tanto horários diurnos (ex.: 12:00–15:00) como horários que atravessam a meia-noite
 * (ex.: sexta 19:00–01:00 avaliado sábado às 00:30).
 */
export function evaluateLisbonOpenStatus(
  weeklySchedule: readonly DaySchedule[],
  now: Date = new Date(),
): OpenStatusResult {
  const lisbon = getLisbonLocalTime(now);
  const today = weeklySchedule.find((d) => d.dayOfWeek === lisbon.dayOfWeek);

  // 1. Verificar turnos do próprio dia atual em Lisboa
  if (today && !today.closed) {
    for (const slot of today.slots) {
      const start = timeToMinutes(slot.open);
      const end = timeToMinutes(slot.close);

      if (end > start) {
        if (lisbon.minutesSinceMidnight >= start && lisbon.minutesSinceMidnight < end) {
          return {
            isOpen: true,
            currentDayOfWeek: lisbon.dayOfWeek,
            localTime: lisbon.formattedTime,
            activeSlot: slot,
          };
        }
      } else if (end < start) {
        // Turno noturno que cruza a meia-noite iniciado hoje (ex.: 19:30 -> 01:00)
        if (lisbon.minutesSinceMidnight >= start) {
          return {
            isOpen: true,
            currentDayOfWeek: lisbon.dayOfWeek,
            localTime: lisbon.formattedTime,
            activeSlot: slot,
          };
        }
      }
    }
  }

  // 2. Verificar se um turno iniciado ontem prolongou-se após a meia-noite até agora
  const yesterdayIndex = (lisbon.dayOfWeek + 6) % 7;
  const yesterday = weeklySchedule.find((d) => d.dayOfWeek === yesterdayIndex);
  if (yesterday && !yesterday.closed) {
    for (const slot of yesterday.slots) {
      const start = timeToMinutes(slot.open);
      const end = timeToMinutes(slot.close);
      if (end < start && lisbon.minutesSinceMidnight < end) {
        return {
          isOpen: true,
          currentDayOfWeek: lisbon.dayOfWeek,
          localTime: lisbon.formattedTime,
          activeSlot: slot,
        };
      }
    }
  }

  return {
    isOpen: false,
    currentDayOfWeek: lisbon.dayOfWeek,
    localTime: lisbon.formattedTime,
    activeSlot: null,
  };
}

export function formatDaySlots(day: DaySchedule, closedLabel: string): string {
  if (day.closed || day.slots.length === 0) {
    return closedLabel;
  }
  return day.slots.map((slot) => `${slot.open}–${slot.close}`).join(' · ');
}
