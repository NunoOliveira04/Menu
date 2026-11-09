'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useDragToDismiss } from '@/components/menu/use-drag-to-dismiss';

interface DishPhotoProps {
  src: string;
  alt: string;
  dishName: string;
  openLabel: string;
  closeLabel: string;
}

/**
 * Miniatura do prato que abre a fotografia em grande.
 * Fecha com «Fechar», Esc, toque fora da foto ou arrastando para baixo.
 */
export function DishPhoto({ src, alt, dishName, openLabel, closeLabel }: DishPhotoProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drag = useDragToDismiss(() => setOpen(false));

  useEffect(() => {
    if (!open) {
      return;
    }
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      } else if (event.key === 'Tab') {
        // Só há um elemento focável no diálogo.
        event.preventDefault();
        closeRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="menu-thumb"
        aria-label={`${openLabel}: ${dishName}`}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          width={640}
          height={400}
          sizes="(min-width: 640px) 600px, 100vw"
          className="menu-thumb-img"
        />
      </button>

      {open && (
        <div
          className="menu-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={dishName}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <button
            ref={closeRef}
            type="button"
            className="menu-lightbox-close"
            onClick={() => setOpen(false)}
          >
            {closeLabel}
          </button>
          <figure className="menu-lightbox-figure" style={drag.style} {...drag.bind}>
            <div className="menu-lightbox-frame">
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(min-width: 640px) 600px, 100vw"
                className="menu-lightbox-img"
                draggable={false}
              />
            </div>
            <figcaption className="menu-lightbox-caption">{dishName}</figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
