'use client';

import type * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { checkboxSlots, cn } from '@venice-sistemas/styles';

/**
 * Checkbox — implementa docs/contracts/checkbox.md.
 *
 * Sobre @radix-ui/react-checkbox, e não sobre `<input type="checkbox">`. Aqui a
 * dependência se paga: estado indeterminado no nativo exige mexer numa
 * propriedade do DOM por ref (não existe atributo), e a integração com
 * formulário precisa de um input espelho. O Radix resolve os dois.
 *
 * Os glifos são SVG inline, não `lucide-react`. Uma biblioteca de ícones inteira
 * por dois traços seria decidir a estratégia de ícones por acidente — e a
 * proposta de arquitetura já reserva `@venice-sistemas/icons` para essa decisão.
 */

export interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {}

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(checkboxSlots.root, className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className={checkboxSlots.indicator}>
        {props.checked === 'indeterminate' ? <Traco /> : <Visto />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

/* Decorativos: o estado é anunciado por `aria-checked` na raiz, e um glifo
 * anunciado repetiria em palavras o que a ARIA já diz. */

function Visto() {
  return (
    <svg viewBox="0 0 16 16" className={checkboxSlots.glyph} fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Traco() {
  return (
    <svg viewBox="0 0 16 16" className={checkboxSlots.glyph} fill="none" aria-hidden="true">
      <path d="M4 8h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
