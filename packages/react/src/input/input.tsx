'use client';

import type * as React from 'react';
import { cn, inputVariants } from '@venice-sistemas/styles';

/**
 * Input — implementa docs/contracts/input.md.
 *
 * Não há prop de erro. O estado de erro vem de `aria-invalid`, que é o que o
 * leitor de tela anuncia — e a borda vermelha é derivada dele por CSS. Uma prop
 * `variant="error"` paralela permitiria pintar sem anunciar, e vermelho sem
 * anúncio é informação só para quem enxerga.
 *
 * Não há prop de rótulo. O nome acessível vem de um `<label>` associado ou de
 * `aria-label`, e os dois moram fora do campo. Aceitar `label` aqui produziria um
 * componente que renderiza um `<label>` sem saber onde ele deve ficar no layout.
 */

export interface InputProps extends React.ComponentProps<'input'> {}

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input type={type} data-slot="input" className={cn(inputVariants(), className)} {...props} />
  );
}
