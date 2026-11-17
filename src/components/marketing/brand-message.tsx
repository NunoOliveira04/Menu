import { BookOpen } from 'lucide-react';
import { BRAND_FONT_CLASSES, BRAND_FONT_STYLE } from '@/lib/fonts/brand';

/**
 * Ecrã simples com as cores e as letras da marca, para mensagens como
 * «carta não encontrada», «página não encontrada» ou «algo correu mal».
 */
export function BrandMessage({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className={`${BRAND_FONT_CLASSES} flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(60%_40%_at_50%_0%,rgba(242,180,65,0.18),transparent_70%)] bg-stone-50 px-5 py-16 text-center font-sans text-stone-900`}
      style={BRAND_FONT_STYLE}
    >
      <p className="flex items-center gap-2.5">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#B4412A] text-[#FBF6EC] shadow-[0_6px_16px_-8px_rgba(180,65,42,0.8)]"
          aria-hidden="true"
        >
          <BookOpen className="h-4 w-4" />
        </span>
        <span className="font-serif text-[26px]">
          O Seu <span className="text-[#B4412A]">Menu</span>
        </span>
      </p>
      <div className="mt-10 w-full max-w-md rounded-3xl border border-stone-200 bg-white px-6 py-10 shadow-[0_24px_60px_-30px_rgba(43,29,22,0.35)] sm:px-10">
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#B4412A]">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-[30px] leading-[1.15]">{title}</h1>
        <div className="mt-4 text-[17px] leading-relaxed text-stone-600">{children}</div>
        {actions && (
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export const BRAND_BUTTON_PRIMARY =
  'inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#B4412A] px-6 text-base font-semibold text-[#FBF6EC] transition hover:bg-[#9A3722] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B4412A]/35';
export const BRAND_BUTTON_OUTLINE =
  'inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-[#1F3D2E] px-6 text-base font-semibold text-[#1F3D2E] transition hover:bg-[#1F3D2E] hover:text-[#FBF6EC] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1F3D2E]/30';
