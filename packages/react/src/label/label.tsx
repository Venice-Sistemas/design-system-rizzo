'use client';

import type * as React from 'react';
import { cn, labelVariants } from '@venice-sistemas/styles';

/**
 * Label — implementa docs/contracts/label.md.
 *
 * `<label>` NATIVO, sem @radix-ui/react-label.
 *
 * O que o Radix acrescenta sobre o nativo é essencialmente impedir a seleção de
 * texto no duplo clique — o resto (associação por `htmlFor`, foco ao clicar,
 * ampliação da área de ativação) o navegador já faz. Três linhas aqui evitam uma
 * dependência de runtime num pacote que vai ser consumido por oito aplicações.
 *
 * A troca é consciente e reversível: se aparecer um caso que o nativo não cobre,
 * o Radix volta sem mudar a API deste componente.
 */

export interface LabelProps extends React.ComponentProps<'label'> {}

export function Label({ className, onMouseDown, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      onMouseDown={(event) => {
        onMouseDown?.(event);
        if (event.defaultPrevented) return;
        // O duplo clique num rótulo seleciona a palavra em vez de focar o campo.
        // O gesto de quem clica rápido duas vezes é "quero mexer neste campo".
        // `detail > 1` é o segundo clique em diante.
        if (event.detail > 1) event.preventDefault();
      }}
      className={cn(labelVariants(), className)}
      {...props}
    />
  );
}
