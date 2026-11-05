'use client';

import { useEffect, useRef, useState } from 'react';

interface CategoryNavItem {
  id: string;
  name: string;
}

interface CategoryNavProps {
  items: readonly CategoryNavItem[];
  label: string;
}

export function CategoryNav({ items, label }: CategoryNavProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const listRef = useRef<HTMLUListElement>(null);
  const signature = items.map((item) => item.id).join('|');

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(`cat-${item.id}`))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) {
          return;
        }
        const nextId = visible.target.id.replace(/^cat-/, '');
        if (nextId) {
          setActiveId(nextId);
        }
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: [0.15, 0.4, 0.7] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items, signature]);

  useEffect(() => {
    const current = listRef.current?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!current) {
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    current.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [activeId]);

  if (items.length < 2) {
    return null;
  }

  return (
    <nav aria-label={label} className="menu-nav">
      <ul ref={listRef} className="menu-nav-scroll no-scrollbar">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#cat-${item.id}`}
                className="menu-pill"
                aria-current={isActive ? 'true' : undefined}
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
