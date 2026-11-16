import { describe, expect, it } from 'vitest';
import { findNextOpening, formatNextOpening, type DaySchedule } from '@/lib/modules/hours';

// 0 = segunda … 6 = domingo. Segunda fechado; terça a domingo 12:00–15:00 e 19:00–22:30.
const SCHEDULE: DaySchedule[] = Array.from({ length: 7 }, (_, dayOfWeek) => ({
  dayOfWeek,
  closed: dayOfWeek === 0,
  slots:
    dayOfWeek === 0
      ? []
      : [
          { open: '12:00', close: '15:00' },
          { open: '19:00', close: '22:30' },
        ],
}));

// 2026-11-17 é uma terça-feira; em novembro Lisboa está em UTC+0.
const at = (iso: string) => new Date(iso);

describe('Próxima abertura (horário da carta)', () => {
  it('entre turnos, abre mais logo no mesmo dia', () => {
    const next = findNextOpening(SCHEDULE, at('2026-11-17T16:30:00Z'));
    expect(next).toEqual({ daysFromToday: 0, dayOfWeek: 1, time: '19:00' });
    expect(formatNextOpening(next!, 'pt')).toBe('abre às 19:00');
    expect(formatNextOpening(next!, 'en')).toBe('opens at 19:00');
  });

  it('depois do fecho, abre amanhã', () => {
    const next = findNextOpening(SCHEDULE, at('2026-11-17T23:30:00Z'));
    expect(next).toEqual({ daysFromToday: 1, dayOfWeek: 2, time: '12:00' });
    expect(formatNextOpening(next!, 'pt')).toBe('abre amanhã às 12:00');
    expect(formatNextOpening(next!, 'en')).toBe('opens tomorrow at 12:00');
  });

  it('salta os dias de folga', () => {
    // Domingo à noite → segunda está fechado → abre terça.
    const next = findNextOpening(SCHEDULE, at('2026-11-22T23:00:00Z'));
    expect(next).toEqual({ daysFromToday: 2, dayOfWeek: 1, time: '12:00' });
    expect(formatNextOpening(next!, 'pt')).toBe('abre terça-feira às 12:00');
    expect(formatNextOpening(next!, 'en')).toBe('opens Tuesday at 12:00');
  });

  it('sem nenhum turno na semana, não há próxima abertura', () => {
    const closed = SCHEDULE.map((day) => ({ ...day, closed: true, slots: [] }));
    expect(findNextOpening(closed, at('2026-11-17T10:00:00Z'))).toBeNull();
  });
});
