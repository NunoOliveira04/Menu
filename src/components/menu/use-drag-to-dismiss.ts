'use client';

import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';

/** Distância (px) a partir da qual largar o dedo fecha o painel. */
export const DRAG_DISMISS_DISTANCE_PX = 90;
/** Velocidade (px/ms) que fecha o painel mesmo com um gesto curto. */
export const DRAG_DISMISS_VELOCITY = 0.55;

/** Decide se um gesto para baixo deve fechar o painel. */
export function shouldDismissDrag(distancePx: number, durationMs: number): boolean {
  if (distancePx >= DRAG_DISMISS_DISTANCE_PX) {
    return true;
  }
  const velocity = durationMs > 0 ? distancePx / durationMs : 0;
  return distancePx >= 24 && velocity >= DRAG_DISMISS_VELOCITY;
}

/**
 * Arrastar para baixo para fechar (bottom sheet, foto ampliada).
 * `bind` vai para a zona onde se agarra (com `touch-action: none` no CSS);
 * `style` vai para o elemento que se move.
 */
export function useDragToDismiss(onDismiss: () => void) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ y: number; t: number } | null>(null);

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    // Toques em botões (ex.: «Fechar») continuam a ser cliques normais.
    if ((event.target as HTMLElement | null)?.closest('button, a')) {
      return;
    }
    start.current = { y: event.clientY, t: performance.now() };
    setDragging(true);
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Sem captura o gesto continua a funcionar enquanto o dedo estiver sobre a zona.
    }
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (!start.current) {
      return;
    }
    setOffset(Math.max(0, event.clientY - start.current.y));
  }

  function finish(event: PointerEvent<HTMLElement>) {
    if (!start.current) {
      return;
    }
    const distance = Math.max(0, event.clientY - start.current.y);
    const duration = performance.now() - start.current.t;
    start.current = null;
    setDragging(false);
    if (shouldDismissDrag(distance, duration)) {
      onDismiss();
    }
    // Volta à posição inicial (também prepara a próxima abertura depois de fechar).
    setOffset(0);
  }

  const style: CSSProperties = {
    transform: offset > 0 ? `translateY(${offset}px)` : undefined,
    transition: dragging ? 'none' : 'transform 180ms ease-out',
  };

  return {
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
    },
    style,
    offset,
  };
}
