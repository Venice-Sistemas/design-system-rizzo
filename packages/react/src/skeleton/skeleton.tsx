'use client';

import type * as React from 'react';
import { cn, skeletonVariants } from '@venice-sistemas/styles';

/**
 * Skeleton — implementa docs/contracts/skeleton.md.
 *
 * A forma vem de quem usa: o esqueleto só cumpre a função se tiver a medida do
 * conteúdo que substitui.
 */

export interface SkeletonProps extends React.ComponentProps<'div'> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      // O esqueleto é decoração de carregamento, não conteúdo. Sem isto, um
      // leitor de tela percorre uma sequência de caixas vazias enquanto a página
      // carrega — ruído que não informa nada.
      //
      // Quem precisa anunciar o carregamento faz isso na região que contém o
      // esqueleto, com aria-busy: é lá que se sabe O QUE está carregando.
      aria-hidden="true"
      className={cn(skeletonVariants(), className)}
      {...props}
    />
  );
}
