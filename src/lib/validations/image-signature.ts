export type AllowedImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

export interface DetectedImageSignature {
  mimeType: AllowedImageMimeType;
  extension: 'jpg' | 'png' | 'webp' | 'avif';
}

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;

function matchesAscii(bytes: Uint8Array, offset: number, ascii: string): boolean {
  if (offset < 0 || offset + ascii.length > bytes.length) {
    return false;
  }
  for (let i = 0; i < ascii.length; i += 1) {
    if (bytes[offset + i] !== ascii.charCodeAt(i)) {
      return false;
    }
  }
  return true;
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  const b0 = bytes[offset] ?? 0;
  const b1 = bytes[offset + 1] ?? 0;
  const b2 = bytes[offset + 2] ?? 0;
  const b3 = bytes[offset + 3] ?? 0;
  return ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;
}

/**
 * Inspeciona os magic bytes iniciais de um ficheiro binário e devolve o formato real
 * apenas se corresponder a JPEG, PNG, WebP ou AVIF válidos.
 */
export function detectImageSignature(
  input: ArrayBuffer | Uint8Array,
): DetectedImageSignature | null {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);

  // JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mimeType: 'image/jpeg', extension: 'jpg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= PNG_MAGIC.length &&
    PNG_MAGIC.every((expected, idx) => bytes[idx] === expected)
  ) {
    return { mimeType: 'image/png', extension: 'png' };
  }

  // WebP: "RIFF" + 4-byte size + "WEBP" + "VP8" ("VP8 ", "VP8L", or "VP8X")
  if (
    bytes.length >= 15 &&
    matchesAscii(bytes, 0, 'RIFF') &&
    matchesAscii(bytes, 8, 'WEBP') &&
    matchesAscii(bytes, 12, 'VP8')
  ) {
    return { mimeType: 'image/webp', extension: 'webp' };
  }

  // AVIF: ISO Base Media File Format (ISOBMFF) `ftyp` box with major or compatible brand `avif` or `avis`
  if (bytes.length >= 12 && matchesAscii(bytes, 4, 'ftyp')) {
    const declaredBoxSize = readUint32BE(bytes, 0);
    const maxBoxEnd =
      declaredBoxSize >= 16
        ? Math.min(declaredBoxSize, bytes.length, 64)
        : Math.min(bytes.length, 32);

    const majorBrand = matchesAscii(bytes, 8, 'avif') || matchesAscii(bytes, 8, 'avis');
    if (majorBrand) {
      return { mimeType: 'image/avif', extension: 'avif' };
    }

    // Compatible brands start at byte 16 in 4-byte increments
    for (let offset = 16; offset + 4 <= maxBoxEnd; offset += 4) {
      if (matchesAscii(bytes, offset, 'avif') || matchesAscii(bytes, offset, 'avis')) {
        return { mimeType: 'image/avif', extension: 'avif' };
      }
    }
  }

  return null;
}
