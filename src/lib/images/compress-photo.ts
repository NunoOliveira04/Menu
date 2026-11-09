/**
 * Redimensionamento e compressão de fotografias no browser, antes do envio para uma Server Action.
 *
 * As Server Actions do Next.js aceitam por omissão no máximo 1 MB por pedido, e uma fotografia
 * tirada com o telemóvel tem normalmente 3–8 MB. Por isso, a imagem é reduzida no cliente
 * (lado maior ~1200 px, WebP ou JPEG com qualidade ~0,8) para ficar entre 200 e 400 KB.
 * A validação dos magic bytes continua a ser feita no servidor.
 *
 * Usa só APIs nativas (createImageBitmap + canvas), sem dependências.
 */

/** Lado maior da imagem final, em píxeis. */
export const PHOTO_MAX_DIMENSION = 1200;

/** Lado maior usado numa segunda tentativa, se a primeira continuar demasiado pesada. */
export const PHOTO_FALLBACK_DIMENSION = 960;

/** Qualidades a experimentar, por ordem, até o ficheiro caber no alvo. */
export const PHOTO_QUALITY_STEPS = [0.8, 0.72, 0.64] as const;

/** Tamanho-alvo da fotografia comprimida (400 KB). */
export const PHOTO_TARGET_MAX_BYTES = 400 * 1024;

/**
 * Limite rígido do ficheiro enviado. Fica abaixo de 1 MB (limite por omissão das Server Actions)
 * para deixar margem para os restantes campos do formulário.
 */
export const PHOTO_UPLOAD_HARD_LIMIT_BYTES = 900 * 1024;

export const PHOTO_ERROR_NOT_IMAGE =
  'O ficheiro escolhido não é uma imagem. Escolhe uma fotografia JPEG, PNG, WebP ou HEIC.';
export const PHOTO_ERROR_DECODE =
  'Não foi possível abrir esta fotografia neste browser. Tenta outra imagem ou tira a foto novamente.';
export const PHOTO_ERROR_TOO_LARGE =
  'Mesmo depois de reduzida, a fotografia continua demasiado pesada. Tenta uma imagem mais simples.';
export const PHOTO_ERROR_ENCODE =
  'Não foi possível preparar a fotografia para envio. Tenta novamente.';

export class PhotoPreparationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PhotoPreparationError';
  }
}

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Calcula as dimensões finais mantendo a proporção, sem nunca ampliar a imagem.
 */
export function computeResizedDimensions(
  width: number,
  height: number,
  maxDimension: number = PHOTO_MAX_DIMENSION,
): Dimensions {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { width: 0, height: 0 };
  }

  const longest = Math.max(width, height);
  if (longest <= maxDimension) {
    return { width: Math.round(width), height: Math.round(height) };
  }

  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export type EncodeFn = (quality: number) => Promise<Blob | null>;

/**
 * Codifica com qualidades decrescentes e devolve o primeiro resultado dentro do alvo.
 * Se nenhum couber, devolve o mais pequeno obtido (ou null se a codificação falhar sempre).
 */
export async function encodeWithinBudget(
  encode: EncodeFn,
  qualitySteps: readonly number[] = PHOTO_QUALITY_STEPS,
  targetBytes: number = PHOTO_TARGET_MAX_BYTES,
): Promise<Blob | null> {
  let smallest: Blob | null = null;

  for (const quality of qualitySteps) {
    const blob = await encode(quality);
    if (!blob) {
      continue;
    }
    if (!smallest || blob.size < smallest.size) {
      smallest = blob;
    }
    if (blob.size <= targetBytes) {
      return blob;
    }
  }

  return smallest;
}

/** Nome final do ficheiro com a extensão do formato de saída. */
export function buildCompressedFileName(originalName: string, mimeType: string): string {
  const extension = mimeType === 'image/webp' ? 'webp' : mimeType === 'image/png' ? 'png' : 'jpg';
  const base = originalName.replace(/\.[^./\\]+$/, '').trim() || 'fotografia';
  return `${base}.${extension}`;
}

/** HEIC/HEIF do iPhone chegam muitas vezes com `type` vazio; aceita-os pela extensão. */
export function looksLikeImageFile(file: { type: string; name: string }): boolean {
  if (file.type.startsWith('image/')) {
    return true;
  }
  return /\.(jpe?g|png|webp|avif|heic|heif)$/i.test(file.name);
}

interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      // `from-image` aplica a orientação EXIF (fotos de telemóvel tiradas na vertical).
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      // Alguns browsers não descodificam certos formatos via createImageBitmap; tenta <img>.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = objectUrl;
    await img.decode();
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(objectUrl),
    };
  } catch {
    URL.revokeObjectURL(objectUrl);
    throw new PhotoPreparationError(PHOTO_ERROR_DECODE);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

export interface CompressPhotoOptions {
  /** Lado maior em píxeis (por omissão 1200). */
  maxDimension?: number;
  /** Mantém a transparência (logotipos): sem fundo branco; WebP ou, em alternativa, PNG. */
  keepTransparency?: boolean;
}

/** Opções para logotipos: 512 px chegam e a transparência mantém-se. */
export const LOGO_COMPRESS_OPTIONS: CompressPhotoOptions = {
  maxDimension: 512,
  keepTransparency: true,
};

async function renderAndEncode(
  image: DecodedImage,
  maxDimension: number,
  keepTransparency = false,
): Promise<Blob | null> {
  const { width, height } = computeResizedDimensions(image.width, image.height, maxDimension);
  if (width === 0 || height === 0) {
    throw new PhotoPreparationError(PHOTO_ERROR_DECODE);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new PhotoPreparationError(PHOTO_ERROR_ENCODE);
  }

  // Fundo branco: PNG transparentes não ficam pretos ao passar para JPEG.
  if (!keepTransparency) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image.source, 0, 0, width, height);

  // WebP quando o browser o sabe codificar (o Safari antigo devolve PNG); senão JPEG.
  const probe = await canvasToBlob(canvas, 'image/webp', PHOTO_QUALITY_STEPS[0]);
  const fallbackType = keepTransparency ? 'image/png' : 'image/jpeg';
  const outputType = probe?.type === 'image/webp' ? 'image/webp' : fallbackType;

  return encodeWithinBudget((quality) => {
    if (outputType === 'image/webp' && quality === PHOTO_QUALITY_STEPS[0] && probe) {
      return Promise.resolve(probe);
    }
    return canvasToBlob(canvas, outputType, quality);
  });
}

/**
 * Prepara uma fotografia para envio: corrige a orientação, reduz o lado maior para ~1200 px
 * e comprime para WebP/JPEG. Lança `PhotoPreparationError` com uma mensagem em português.
 */
export async function compressPhotoForUpload(
  file: File,
  options: CompressPhotoOptions = {},
): Promise<File> {
  const maxDimension = options.maxDimension ?? PHOTO_MAX_DIMENSION;
  const keepTransparency = options.keepTransparency ?? false;
  if (!looksLikeImageFile(file)) {
    throw new PhotoPreparationError(PHOTO_ERROR_NOT_IMAGE);
  }

  const image = await decodeImage(file);
  try {
    let blob = await renderAndEncode(image, maxDimension, keepTransparency);
    if (blob && blob.size > PHOTO_UPLOAD_HARD_LIMIT_BYTES) {
      blob = await renderAndEncode(
        image,
        Math.min(maxDimension, PHOTO_FALLBACK_DIMENSION),
        keepTransparency,
      );
    }

    if (!blob) {
      throw new PhotoPreparationError(PHOTO_ERROR_ENCODE);
    }
    if (blob.size > PHOTO_UPLOAD_HARD_LIMIT_BYTES) {
      throw new PhotoPreparationError(PHOTO_ERROR_TOO_LARGE);
    }

    return new File([blob], buildCompressedFileName(file.name, blob.type), {
      type: blob.type,
      lastModified: Date.now(),
    });
  } finally {
    image.release();
  }
}

export type PreparePhotoResult = { ok: true } | { ok: false; error: string };

/**
 * Substitui, no FormData, o ficheiro do campo indicado pela versão comprimida.
 * Campos vazios (nenhuma foto escolhida) ficam como estão.
 */
export async function preparePhotoField(
  formData: FormData,
  fieldName: string,
  options: CompressPhotoOptions = {},
): Promise<PreparePhotoResult> {
  const entry = formData.get(fieldName);
  if (!(entry instanceof File) || entry.size === 0) {
    return { ok: true };
  }

  try {
    const compressed = await compressPhotoForUpload(entry, options);
    formData.set(fieldName, compressed, compressed.name);
    return { ok: true };
  } catch (error) {
    const message = error instanceof PhotoPreparationError ? error.message : PHOTO_ERROR_ENCODE;
    return { ok: false, error: message };
  }
}
