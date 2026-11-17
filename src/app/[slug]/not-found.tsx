import { BrandMessage } from '@/components/marketing/brand-message';

/** Carta que não existe (endereço errado, QR code antigo ou carta ainda não publicada). */
export default function RestaurantNotFound() {
  return (
    <BrandMessage eyebrow="Carta não encontrada" title="Não encontrámos esta carta">
      <p>
        Confirme o endereço ou peça ajuda ao restaurante. Se acabou de ler um QR code, ele pode
        estar desatualizado.
      </p>
    </BrandMessage>
  );
}
