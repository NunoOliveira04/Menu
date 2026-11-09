'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';

interface CategoryNavItem {
  /** Id da secção na página (âncora legível, ex.: `peixe-bacalhau`). */
  anchor: string;
  name: string;
}

interface CategoryNavProps {
  items: readonly CategoryNavItem[];
  label: string;
}

export function CategoryNav({ items, label }: CategoryNavProps) {
  const [activeAnchor, setActiveAnchor] = useState(items[0]?.anchor ?? '');
  const listRef = useRef<HTMLUListElement>(null);
  const signature = items.map((item) => item.anchor).join('|');

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.anchor))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveAnchor(visible.target.id);
        }
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: [0.15, 0.4, 0.7] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items, signature]);

  useEffect(() => {
    const list = listRef.current;
    const current = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!list || !current) {
      return;
    }
    // Centra a categoria ativa só na barra (sem mexer no scroll da página).
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = current.offsetLeft - (list.clientWidth - current.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, target), behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [activeAnchor]);

  // Faz scroll até à secção sem acrescentar `#...` ao endereço da carta.
  function handleClick(event: MouseEvent<HTMLAnchorElement>, anchor: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    const section = document.getElementById(anchor);
    if (!section) {
      return;
    }
    event.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    setActiveAnchor(anchor);
  }

  if (items.length < 2) {
    return null;
  }

  return (
    <nav aria-label={label} className="menu-nav">
      <ul ref={listRef} className="menu-nav-scroll no-scrollbar">
        {items.map((item) => {
          const isActive = item.anchor === activeAnchor;
          return (
            <li key={item.anchor}>
              <a
                href={`#${item.anchor}`}
                className="menu-pill"
                aria-current={isActive ? 'true' : undefined}
                onClick={(event) => handleClick(event, item.anchor)}
              >
                {item.name}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
