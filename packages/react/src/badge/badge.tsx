'use client';

import type * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { badgeVariants, cn, type BadgeVariant } from '@venice-sistemas/styles';

/**
 * Badge — implementa docs/contracts/badge.md.
 *
 * Rótulo, não controle. Não recebe foco, não responde a clique e não tem estado
 * de hover: se a peça precisa disso, ela é um Button ou um link, e usá-la como
 * badge esconde um controle de quem navega por teclado.
 */

export type { BadgeVariant };

export interface BadgeProps extends React.ComponentProps<'span'> {
  /** Peso visual do rótulo. `destructive` é para status de falha, não para ação. */
  variant?: BadgeVariant;
  /** Renderiza o filho no lugar do `<span>`, herdando o estilo. */
  asChild?: boolean;
}

export function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Component = asChild ? Slot : 'span';

  return (
    <Component
      data-slot="badge"
      // Expõe a variante como gancho de estilo e de teste, do mesmo jeito que o
      // Button. Sem isto, verificar a variante em teste exigiria casar strings de
      // classe — que quebram a cada ajuste de receita.
      data-variant={variant ?? 'default'}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}
