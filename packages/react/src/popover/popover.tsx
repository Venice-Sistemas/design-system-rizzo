'use client';

import type * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn, popoverSlots } from '@venice-sistemas/styles';

/**
 * Popover — implementa docs/contracts/popover.md.
 *
 * NÃO é modal, e a diferença para o Dialog é essa. Não tem véu, o resto da página
 * continua legível e alcançável, e o conteúdo atrás não fica `aria-hidden`.
 *
 * O corolário é que ele não serve para pedir decisão: como não prende o foco nem
 * bloqueia a página, o usuário pode simplesmente clicar em outro lugar e o
 * popover some. Se a resposta importa, é Dialog.
 */

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
/** Âncora alternativa, quando o painel deve nascer colado a outra coisa que não o gatilho. */
export const PopoverAnchor = PopoverPrimitive.Anchor;

export interface PopoverContentProps
  extends React.ComponentProps<typeof PopoverPrimitive.Content> {}

export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(popoverSlots.content, className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
