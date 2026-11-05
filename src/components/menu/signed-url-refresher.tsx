'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DISH_PHOTO_REFRESH_INTERVAL_MS } from '@/lib/storage/dish-photos';

export function SignedUrlRefresher({ hasSignedPhotos }: { hasSignedPhotos: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!hasSignedPhotos) {
      return;
    }

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, DISH_PHOTO_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [hasSignedPhotos, router]);

  return null;
}
