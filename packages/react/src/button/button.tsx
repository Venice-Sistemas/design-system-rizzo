'use client';

import type * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { buttonSlots, buttonVariants, cn, type ButtonSize, type ButtonVariant } from '@venice-sistemas/styles';
import { isDev } from '../lib/dev';
import { useAccessibleName } from '../lib/use-accessible-name';

/**
 * Button — implementa docs/contracts/button.md.
 *
 * Este arquivo cuida só de MARCAÇÃO e COMPORTAMENTO. Toda classe vem de
 * @venice-sistemas/styles, que o Angular consome igual — se a receita morasse aqui, a
 * outra plataforma teria que recriá-la e as duas divergiriam na primeira
 * alteração.
 *
 * Expõe `data-slot`, `asChild` e `buttonVariants` reexportado.
 */

export type { ButtonVariant, ButtonSize };

export interface ButtonProps extends Omit<React.ComponentProps<'button'>, 'color'> {
  /** Peso visual da ação. `default` é a cor primária da marca. */
  variant?: ButtonVariant;
  /** Altura do controle. A área clicável nunca encolhe abaixo do mínimo de toque. */
  size?: ButtonSize;
  /** Ação em andamento. Diferente de `disabled`: o botão continua focável. */
  loading?: boolean;
  /** Renderiza o filho no lugar do `<button>`, herdando o estilo. Para envolver um link. */
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled = false,
  asChild = false,
  type = 'button',
  children,
  onClick,
  ref,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button';
  // Com asChild não checamos o nome: quem manda no elemento é o filho, e o aviso
  // apontaria para um nó que não controlamos.
  const composedRef = useAccessibleName<HTMLButtonElement>(ref, isDev && !asChild);

  return (
    <Component
      data-slot="button"
      // Gancho de estilo para o consumidor, sem precisar de prop nem de classe
      // interna nossa — mesma ideia do data-slot.
      data-loading={loading || undefined}
      ref={composedRef}
      // Com asChild, `type` e `disabled` não se aplicam: um <a> não tem nenhum dos
      // dois, e emiti-los produz HTML inválido.
      {...(asChild ? {} : { type, disabled })}
      aria-busy={loading || undefined}
      onClick={loading ? swallow : onClick}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          <span className={buttonSlots.label(loading)}>{children}</span>
          {loading && <span aria-hidden="true" className={buttonSlots.spinner} />}
        </>
      )}
    </Component>
  );
}

function swallow(event: React.MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
  event.stopPropagation();
}
