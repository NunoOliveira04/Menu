interface CategorySeparatorProps {
  ornament: 'azulejo' | 'rule';
}

export function CategorySeparator({ ornament }: CategorySeparatorProps) {
  if (ornament === 'rule') {
    return <div className="menu-rule" aria-hidden="true" />;
  }

  return (
    <div className="menu-azulejo" aria-hidden="true">
      <svg className="menu-azulejo-svg" viewBox="0 0 168 24" focusable="false">
        {Array.from({ length: 7 }, (_, index) => (
          <g key={index} transform={`translate(${index * 24} 0)`}>
            <rect
              x="1.5"
              y="1.5"
              width="21"
              height="21"
              rx="1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <path d="M12 4.5 L19.5 12 L12 19.5 L4.5 12 Z" fill="currentColor" />
            <circle cx="12" cy="12" r="2.1" fill="var(--color-bg)" />
          </g>
        ))}
      </svg>
    </div>
  );
}
