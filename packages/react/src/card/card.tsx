'use client';

import type * as React from 'react';
import { cardSlots, cn } from '@venice-sistemas/styles';

/**
 * Card — implementa docs/contracts/card.md.
 *
 * Composição, não configuração: as partes são componentes separados em vez de
 * props (`title`, `footer`) porque conteúdo de card é arbitrário. Uma prop
 * `title: string` obrigaria uma segunda prop no dia em que alguém precisasse de
 * um ícone ao lado do título, e uma terceira no dia seguinte.
 *
 * `CardTitle` renderiza um `<div>`, não um `<h3>`. O Card não sabe em que nível
 * da hierarquia da página ele está, e chutar um nível produz documentos com
 * cabeçalhos fora de ordem — que é pior para navegação por leitor de tela do que
 * não ter cabeçalho. Quem sabe o nível é a tela: `<CardTitle asChild><h2>…`.
 */

export interface CardProps extends React.ComponentProps<'div'> {}

export function Card({ className, ...props }: CardProps) {
  return <div data-slot="card" className={cn(cardSlots.root, className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn(cardSlots.header, className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cn(cardSlots.title, className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-description" className={cn(cardSlots.description, className)} {...props} />
  );
}

export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn(cardSlots.content, className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cn(cardSlots.footer, className)} {...props} />;
}
