'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { preparePhotoField } from '@/lib/images/compress-photo';

/**
 * Intercepta o submit de um formulário com um campo de fotografia, comprime a imagem no browser
 * e só depois envia o FormData para a Server Action (via `useActionState`).
 */
export function useCompressedPhotoSubmit(
  formAction: (payload: FormData) => void,
  photoFieldNames: readonly string[],
) {
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPreparingPhoto) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    setPhotoError(null);
    setIsPreparingPhoto(true);

    try {
      for (const fieldName of photoFieldNames) {
        const result = await preparePhotoField(formData, fieldName);
        if (!result.ok) {
          setPhotoError(result.error);
          return;
        }
      }
    } finally {
      setIsPreparingPhoto(false);
    }

    startTransition(() => {
      formAction(formData);
    });
  }

  return { handleSubmit, isPreparingPhoto, isSubmitting, photoError };
}
