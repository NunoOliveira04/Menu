'use client';

import { useEffect, useId, useRef, useState } from 'react';

export interface AllergenSheetItem {
  code: string;
  number: number;
  shortCode: string;
  label: string;
}

interface AllergenSheetButtonProps {
  dishName: string;
  allergens: readonly AllergenSheetItem[];
  buttonLabel: string;
  sheetTitle: string;
  note: string;
  closeLabel: string;
}

export function AllergenSheetButton({
  dishName,
  allergens,
  buttonLabel,
  sheetTitle,
  note,
  closeLabel,
}: AllergenSheetButtonProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('disabled'));

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  if (allergens.length === 0) {
    return null;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="menu-allergen-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span>{buttonLabel}</span>
        <span className="menu-allergen-nums" aria-hidden="true">
          {allergens.map((allergen) => allergen.number).join(' · ')}
        </span>
      </button>

      {open && (
        <div className="menu-sheet-root">
          <button
            type="button"
            className="menu-sheet-backdrop"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="menu-sheet-panel"
          >
            <div className="menu-sheet-handle" aria-hidden="true" />
            <div className="menu-sheet-header">
              <div>
                <p className="menu-sheet-kicker">{dishName}</p>
                <h2 id={titleId} className="menu-sheet-title">
                  {sheetTitle}
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                className="menu-sheet-close"
                onClick={() => setOpen(false)}
              >
                {closeLabel}
              </button>
            </div>

            <ul className="menu-sheet-list">
              {allergens.map((allergen) => (
                <li key={allergen.code}>
                  <span className="menu-sheet-number">{allergen.number}</span>
                  <span>
                    <span className="menu-sheet-code">{allergen.shortCode}</span>
                    {allergen.label}
                  </span>
                </li>
              ))}
            </ul>

            <p className="menu-sheet-note">{note}</p>
          </div>
        </div>
      )}
    </>
  );
}
