'use client';

import type * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { buttonVariants, cn, dialogSlots } from '@venice-sistemas/styles';

/**
 * AlertDialog — implementa docs/contracts/alert-dialog.md.
 *
 * Visualmente é o Dialog. As diferenças são todas de comportamento, e todas
 * apontam para a mesma regra: **este diálogo exige uma decisão**.
 *
 *   não fecha por Escape        um reflexo de teclado não pode desfazer a pergunta
 *   não fecha por clique fora   nem um clique perdido
 *   não tem X no canto          seria uma terceira saída sem significado
 *   o foco vai para o CANCELAR  a saída segura é a que já está sob o dedo
 *
 * As três primeiras o Radix não faz sozinho — `onEscapeKeyDown` e
 * `onPointerDownOutside` precisam ser barrados aqui.
 */

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export interface AlertDialogContentProps
  extends React.ComponentProps<typeof AlertDialogPrimitive.Content> {}

export function AlertDialogContent({ className, ...props }: AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay data-slot="alert-dialog-scrim" className={dialogSlots.scrim} />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        onEscapeKeyDown={(event) => event.preventDefault()}
        className={cn(dialogSlots.content, className)}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="alert-dialog-header" className={cn(dialogSlots.header, className)} {...props} />
  );
}

export function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="alert-dialog-footer" className={cn(dialogSlots.footer, className)} {...props} />
  );
}

export function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(dialogSlots.title, className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(dialogSlots.description, className)}
      {...props}
    />
  );
}

/**
 * A ação que confirma. `destructive` por padrão NÃO: nem toda confirmação apaga
 * algo, e um botão vermelho em toda confirmação dessensibiliza para o vermelho
 * que importa.
 */
export function AlertDialogAction({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> & {
  variant?: 'default' | 'destructive';
}) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  );
}

/** A saída segura. Recebe o foco quando o diálogo abre — o Radix cuida disso. */
export function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      {...props}
    />
  );
}
