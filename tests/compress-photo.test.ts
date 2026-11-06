import { describe, expect, it, vi } from 'vitest';
import {
  PHOTO_ERROR_NOT_IMAGE,
  PHOTO_MAX_DIMENSION,
  PHOTO_TARGET_MAX_BYTES,
  PHOTO_UPLOAD_HARD_LIMIT_BYTES,
  buildCompressedFileName,
  computeResizedDimensions,
  encodeWithinBudget,
  looksLikeImageFile,
  preparePhotoField,
} from '@/lib/images/compress-photo';

function blobOfSize(bytes: number, type = 'image/webp'): Blob {
  return new Blob([new Uint8Array(bytes)], { type });
}

describe('Compressão de fotografias no browser (ponto 1)', () => {
  it('mantém o alvo abaixo do limite de 1 MB das Server Actions', () => {
    expect(PHOTO_MAX_DIMENSION).toBe(1200);
    expect(PHOTO_TARGET_MAX_BYTES).toBe(400 * 1024);
    expect(PHOTO_UPLOAD_HARD_LIMIT_BYTES).toBeLessThan(1024 * 1024);
  });

  it('reduz o lado maior para 1200 px mantendo a proporção', () => {
    // Foto típica de telemóvel 4032×3024 (horizontal) e 3024×4032 (vertical)
    expect(computeResizedDimensions(4032, 3024)).toEqual({ width: 1200, height: 900 });
    expect(computeResizedDimensions(3024, 4032)).toEqual({ width: 900, height: 1200 });
    expect(computeResizedDimensions(4000, 4000)).toEqual({ width: 1200, height: 1200 });
  });

  it('nunca amplia imagens já pequenas e trata dimensões inválidas', () => {
    expect(computeResizedDimensions(800, 600)).toEqual({ width: 800, height: 600 });
    expect(computeResizedDimensions(1200, 300)).toEqual({ width: 1200, height: 300 });
    expect(computeResizedDimensions(0, 600)).toEqual({ width: 0, height: 0 });
    expect(computeResizedDimensions(Number.NaN, 600)).toEqual({ width: 0, height: 0 });
  });

  it('pára na primeira qualidade que cabe no alvo', async () => {
    const encode = vi.fn(async (quality: number) => blobOfSize(quality >= 0.8 ? 300_000 : 200_000));
    const result = await encodeWithinBudget(encode, [0.8, 0.7], PHOTO_TARGET_MAX_BYTES);
    expect(result?.size).toBe(300_000);
    expect(encode).toHaveBeenCalledTimes(1);
  });

  it('baixa a qualidade até caber e devolve o mais pequeno se nunca couber', async () => {
    const sizes: Record<number, number> = { 0.8: 700_000, 0.7: 500_000, 0.6: 380_000 };
    const fits = await encodeWithinBudget(
      async (q) => blobOfSize(sizes[q] ?? 0),
      [0.8, 0.7, 0.6],
      PHOTO_TARGET_MAX_BYTES,
    );
    expect(fits?.size).toBe(380_000);

    const neverFits = await encodeWithinBudget(
      async (q) => blobOfSize(q === 0.7 ? 450_000 : 600_000),
      [0.8, 0.7, 0.6],
      PHOTO_TARGET_MAX_BYTES,
    );
    expect(neverFits?.size).toBe(450_000);

    expect(await encodeWithinBudget(async () => null, [0.8, 0.7])).toBeNull();
  });

  it('dá ao ficheiro a extensão do formato de saída', () => {
    expect(buildCompressedFileName('IMG_1234.HEIC', 'image/webp')).toBe('IMG_1234.webp');
    expect(buildCompressedFileName('bacalhau.png', 'image/jpeg')).toBe('bacalhau.jpg');
    expect(buildCompressedFileName('.jpg', 'image/jpeg')).toBe('fotografia.jpg');
  });

  it('aceita HEIC do iPhone sem MIME declarado e rejeita ficheiros que não são imagens', () => {
    expect(looksLikeImageFile({ type: 'image/jpeg', name: 'a.jpg' })).toBe(true);
    expect(looksLikeImageFile({ type: '', name: 'IMG_0001.HEIC' })).toBe(true);
    expect(looksLikeImageFile({ type: 'application/pdf', name: 'ementa.pdf' })).toBe(false);
  });

  it('deixa o FormData intacto quando não há fotografia escolhida', async () => {
    const fd = new FormData();
    fd.set('name', 'Bacalhau');
    fd.set('photo', new File([], ''));
    expect(await preparePhotoField(fd, 'photo')).toEqual({ ok: true });
    expect(await preparePhotoField(new FormData(), 'photo')).toEqual({ ok: true });
  });

  it('devolve um erro claro em português para ficheiros que não são imagens', async () => {
    const fd = new FormData();
    fd.set('photo', new File(['%PDF-1.7'], 'ementa.pdf', { type: 'application/pdf' }));
    expect(await preparePhotoField(fd, 'photo')).toEqual({
      ok: false,
      error: PHOTO_ERROR_NOT_IMAGE,
    });
  });
});
