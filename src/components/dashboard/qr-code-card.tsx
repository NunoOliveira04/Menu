'use client';

import { useState } from 'react';
import { Check, Copy, Download, ExternalLink } from 'lucide-react';

interface QrCodeCardProps {
  restaurantName: string;
  slug: string;
  publicUrl: string;
  qrSvgMarkup: string;
  qrPngDataUrl: string;
  published: boolean;
}

export function QrCodeCard({
  restaurantName,
  slug,
  publicUrl,
  qrSvgMarkup,
  qrPngDataUrl,
  published,
}: QrCodeCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silencioso caso clipboard não esteja disponível
    }
  }

  function handleDownloadSvg() {
    const blob = new Blob([qrSvgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-${slug}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <aside
      aria-label="QR code e link da carta"
      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(43,29,22,0.35)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg text-stone-900">QR code para as mesas</h2>
          <p className="mt-0.5 text-xs text-stone-500">
            Imprima este código e ponha-o nas mesas. Os clientes apontam a câmara e a carta de{' '}
            {restaurantName} abre.
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            published
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {published ? 'Publicado' : 'Rascunho'}
        </span>
      </div>

      {!published && (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-900">
          A carta ainda está privada. Publique-a nas <strong>Definições</strong> para os clientes a
          conseguirem abrir.
        </p>
      )}

      <div
        className="mx-auto my-4 flex h-44 w-44 items-center justify-center rounded-2xl border border-stone-200 bg-[#FBF6EC] p-3"
        aria-label={`Código QR para ${publicUrl}`}
        dangerouslySetInnerHTML={{ __html: qrSvgMarkup }}
      />

      <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
        <p className="truncate font-mono text-xs text-stone-700" title={publicUrl}>
          {publicUrl}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copiar link
            </>
          )}
        </button>

        <a
          href={`/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          Ver a carta
        </a>

        <a
          href={qrPngDataUrl}
          download={`qr-${slug}.png`}
          className="col-span-2 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#B4412A] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#9A3722]"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Descarregar para imprimir
        </a>

        <button
          type="button"
          onClick={handleDownloadSvg}
          className="col-span-2 inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#B4412A]/30 bg-[#FBF6EC] px-3 py-2 text-xs font-medium text-[#B4412A] transition hover:bg-[#F2E6D0]"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Ficheiro para a gráfica (SVG)
        </button>
      </div>
    </aside>
  );
}
