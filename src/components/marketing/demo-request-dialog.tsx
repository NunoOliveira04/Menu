'use client';

import { CheckCircle2, X } from 'lucide-react';
import { useActionState, useEffect, useId, useRef, useState } from 'react';
import { requestDemoAction } from '@/app/actions/demo-request';
import { INITIAL_ACTION_STATE } from '@/app/actions/types';

const FIELD =
  'mt-1.5 block w-full rounded-xl border border-[#D5C6B3] bg-white px-4 py-3 text-base text-[#2B1D16] placeholder:text-[#A08D80] focus:border-[#B4412A] focus:outline-none focus:ring-4 focus:ring-[#B4412A]/15';
const LABEL = 'block text-[15px] font-semibold text-[#2B1D16]';
const ERROR = 'mt-1 text-sm text-[#9A3722]';

/**
 * Botão «Peça uma demonstração» que abre um formulário num modal (nome, restaurante,
 * telemóvel e e-mail opcional). O pedido é gravado e enviado por e-mail ao dono do site.
 */
export function DemoRequestButton({
  label = 'Peça uma demonstração',
  className,
}: {
  label?: string;
  className: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formId = useId();
  const [state, formAction, isPending] = useActionState(requestDemoAction, INITIAL_ACTION_STATE);
  // Momento em que o formulário foi aberto (anti-robô: envios instantâneos são ignorados).
  const [startedAt, setStartedAt] = useState(0);
  // Cada abertura começa um formulário novo (depois de um envio com sucesso).
  const [formKey, setFormKey] = useState(0);

  function open() {
    if (state.status === 'success') {
      setFormKey((key) => key + 1);
    }
    setStartedAt(Date.now());
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Fechar ao tocar fora do cartão.
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close();
    };
    dialog.addEventListener('click', onClick);
    return () => dialog.removeEventListener('click', onClick);
  }, []);

  const errors = state.status === 'error' ? state.fieldErrors : undefined;
  const succeeded = state.status === 'success';

  return (
    <>
      <button type="button" onClick={open} className={className} aria-haspopup="dialog">
        {label}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${formId}-title`}
        className="m-0 mt-auto w-full max-w-none rounded-t-[28px] bg-[#FBF6EC] p-0 text-left text-[#2B1D16] shadow-[0_-20px_60px_-20px_rgba(43,29,22,0.5)] backdrop:bg-[#2B1D16]/55 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-lg sm:rounded-[28px]"
      >
        <div className="max-h-[90dvh] overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#B4412A]">
                Demonstração de 10 minutos
              </p>
              <h2 id={`${formId}-title`} className="osm-display mt-2 text-[28px] leading-tight">
                Peça uma demonstração
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Fechar"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#5F4B40] transition hover:bg-[#F2E6D0] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B4412A]/30"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {succeeded ? (
            <div className="py-8 text-center" role="status">
              <CheckCircle2 className="mx-auto h-12 w-12 text-[#1F3D2E]" aria-hidden="true" />
              <p className="osm-display mt-4 text-2xl">{state.message}</p>
              <p className="mt-2 text-[#5F4B40]">
                Entramos em contacto pelo telemóvel que indicou.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-[#1F3D2E] px-6 font-semibold text-[#1F3D2E] transition hover:bg-[#1F3D2E] hover:text-[#FBF6EC]"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form key={formKey} action={formAction} className="mt-6 space-y-4" noValidate>
              <p className="text-[#5F4B40]">
                Deixe o seu contacto e mostramos-lhe a sua própria carta no telemóvel.
              </p>

              {/* Anti-robô: campo invisível (só robôs o preenchem) e hora de abertura. */}
              <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <input type="hidden" name="startedAt" value={startedAt} />

              <div>
                <label htmlFor={`${formId}-name`} className={LABEL}>
                  O seu nome
                </label>
                <input
                  id={`${formId}-name`}
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={80}
                  aria-invalid={Boolean(errors?.name)}
                  className={FIELD}
                />
                {errors?.name?.[0] && <p className={ERROR}>{errors.name[0]}</p>}
              </div>

              <div>
                <label htmlFor={`${formId}-restaurant`} className={LABEL}>
                  Nome do restaurante
                </label>
                <input
                  id={`${formId}-restaurant`}
                  name="restaurant"
                  type="text"
                  autoComplete="organization"
                  required
                  maxLength={120}
                  aria-invalid={Boolean(errors?.restaurant)}
                  className={FIELD}
                />
                {errors?.restaurant?.[0] && <p className={ERROR}>{errors.restaurant[0]}</p>}
              </div>

              <div>
                <label htmlFor={`${formId}-phone`} className={LABEL}>
                  Telemóvel
                </label>
                <input
                  id={`${formId}-phone`}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="912 345 678"
                  aria-invalid={Boolean(errors?.phone)}
                  className={FIELD}
                />
                {errors?.phone?.[0] && <p className={ERROR}>{errors.phone[0]}</p>}
              </div>

              <div>
                <label htmlFor={`${formId}-email`} className={LABEL}>
                  E-mail <span className="font-normal text-[#5F4B40]">(opcional)</span>
                </label>
                <input
                  id={`${formId}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={160}
                  aria-invalid={Boolean(errors?.email)}
                  className={FIELD}
                />
                {errors?.email?.[0] && <p className={ERROR}>{errors.email[0]}</p>}
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-snug text-[#2B1D16]">
                  <input
                    type="checkbox"
                    name="consent"
                    required
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-[#D5C6B3] text-[#B4412A] focus:ring-[#B4412A]"
                  />
                  Aceito que usem estes dados só para me contactarem sobre a demonstração.
                </label>
                {errors?.consent?.[0] && <p className={ERROR}>{errors.consent[0]}</p>}
              </div>

              {state.status === 'error' && state.message && (
                <p
                  role="alert"
                  className="rounded-xl bg-[#B4412A]/10 px-4 py-3 text-sm font-medium text-[#9A3722]"
                >
                  {state.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#B4412A] px-6 text-[17px] font-semibold text-[#FBF6EC] transition hover:bg-[#9A3722] disabled:opacity-70"
              >
                {isPending ? 'A enviar…' : 'Pedir demonstração'}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
