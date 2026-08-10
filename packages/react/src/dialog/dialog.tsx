'use client';

import type * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn, dialogSlots } from '@venice-sistemas/styles';

/**
 * Dialog — implementa docs/contracts/dialog.md.
 *
 * `DialogPortal` e `DialogOverlay` NÃO são exportados. Obrigar quem usa a compor
 * `<Portal><Overlay/><Content/></Portal>` é detalhe de implementação vazando para
 * a tela, e a primeira pessoa que esquecer o overlay ganha um modal sem véu, sem
 * erro nenhum. `DialogContent` monta os dois.
 *
 * O botão de fechar é padrão, e desligá-lo é explícito: um modal sem saída
 * visível deixa quem usa mouse sem caminho óbvio — Escape não é descobrível.
 */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export interface DialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  /** Mostra o X no canto. Desligue apenas quando houver outra saída visível. */
  showCloseButton?: boolean;
}

export function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay data-slot="dialog-scrim" className={dialogSlots.scrim} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(dialogSlots.content, className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" className={dialogSlots.close}>
            <XIcon />
            {/* O nome do botão é texto de verdade, escondido visualmente. Um
                `aria-label` seria equivalente para leitor de tela, mas some do
                reconhecimento por voz — quem diz "clicar em fechar" precisa que
                a palavra exista no acessível. */}
            <span className="ds:sr-only">Fechar</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-header" className={cn(dialogSlots.header, className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-footer" className={cn(dialogSlots.footer, className)} {...props} />;
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(dialogSlots.title, className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(dialogSlots.description, className)}
      {...props}
    />
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" className="ds:size-4" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
