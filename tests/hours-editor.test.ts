import { describe, expect, it } from 'vitest';
import {
  WEEK_DISPLAY_ORDER,
  buildEditableSchedule,
  copyDayToOpenDays,
} from '@/components/dashboard/hours-editor';
import { WEEKDAY_LABELS } from '@/lib/modules/hours';

describe('Editor do horário no admin', () => {
  it('mostra os dias de segunda a domingo', () => {
    expect(WEEK_DISPLAY_ORDER.map((i) => WEEKDAY_LABELS.pt[i])).toEqual([
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
      'Domingo',
    ]);
  });

  it('carrega o horário guardado e preenche os dias em falta', () => {
    const rows = buildEditableSchedule([
      { dayOfWeek: 1, closed: false, slots: [{ open: '12:00', close: '15:00' }] },
      {
        dayOfWeek: 4,
        closed: false,
        slots: [
          { open: '12:30', close: '15:30' },
          { open: '19:00', close: '23:30' },
        ],
      },
    ]);
    expect(rows).toHaveLength(7);
    expect(rows[1]).toMatchObject({ closed: false, slot1Open: '12:00', hasSlot2: false });
    expect(rows[4]).toMatchObject({ hasSlot2: true, slot2Open: '19:00', slot2Close: '23:30' });
    // Sem dados: segunda começa fechada, os outros abertos com valores por omissão.
    expect(rows[0]?.closed).toBe(true);
    expect(rows[2]?.closed).toBe(false);
  });

  it('copia os turnos de um dia só para os outros dias abertos', () => {
    const rows = buildEditableSchedule([
      { dayOfWeek: 0, closed: true, slots: [] },
      {
        dayOfWeek: 1,
        closed: false,
        slots: [
          { open: '11:30', close: '14:30' },
          { open: '18:30', close: '22:00' },
        ],
      },
      { dayOfWeek: 2, closed: false, slots: [{ open: '12:00', close: '15:00' }] },
    ]);
    const copied = copyDayToOpenDays(rows, 1);
    expect(copied[0]).toEqual(rows[0]); // segunda continua fechada e igual
    expect(copied[2]).toMatchObject({
      closed: false,
      slot1Open: '11:30',
      slot1Close: '14:30',
      hasSlot2: true,
      slot2Open: '18:30',
      slot2Close: '22:00',
    });
    expect(rows[2]?.slot1Open).toBe('12:00'); // não altera o original
  });
});
