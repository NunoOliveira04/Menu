'use client';

import { useRef, useState, useTransition, type FormEvent } from 'react';
import { preparePhotoField, type CompressPhotoOptions } from '@/lib/images/compress-photo';

/**
 * Intercepta o submit de um formulário com um campo de fotografia, comprime a imagem no browser
 * e só depois envia o FormData para a Server Action (via `useActionState`).
 */
export function useCompressedPhotoSubmit(
  formAction: (payload: FormData) => void,
  photoFieldNames: readonly string[],
  fieldOptions: Readonly<Partial<Record<string, CompressPhotoOptions>>> = {},
) {
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoErrorField, setPhotoErrorField] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  /** Limpa os campos de fotografia (para não reenviar a mesma foto no próximo submit). */
  function clearPhotoFields() {
    const form = formRef.current;
    if (!form) {
      return;
    }
    for (const fieldName of photoFieldNames) {
      const input = form.elements.namedItem(fieldName);
      if (input instanceof HTMLInputElement) {
        input.value = '';
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPreparingPhoto) {
      return;
    }

    formRef.current = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    setPhotoError(null);
    setPhotoErrorField(null);
    setIsPreparingPhoto(true);

    try {
      for (const fieldName of photoFieldNames) {
        const result = await preparePhotoField(formData, fieldName, fieldOptions[fieldName]);
        if (!result.ok) {
          setPhotoError(result.error);
          setPhotoErrorField(fieldName);
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

  return {
    handleSubmit,
    clearPhotoFields,
    isPreparingPhoto,
    isSubmitting,
    photoError,
    photoErrorField,
  };
}
