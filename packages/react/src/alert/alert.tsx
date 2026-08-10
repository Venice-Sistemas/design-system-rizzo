'use client';

import type * as React from 'react';
import {
  alertIconVariants,
  alertSlots,
  alertVariants,
  cn,
  type AlertTone,
} from '@venice-sistemas/styles';

/**
 * Alert — implementa docs/contracts/alert.md.
 *
 * A decisão central está em `urgent`, e ela separa duas coisas que o shadcn junta:
 *
 *   tone     é COR      — que família de feedback a mensagem pertence
 *   urgent   é ANÚNCIO  — se o leitor de tela interrompe o que está lendo
 *
 * O shadcn fixa `role="alert"` em todo alerta. `role="alert"` é região viva
 * assertiva: interrompe na hora. Isso está certo para uma falha que bloqueia a
 * tarefa e errado para uma caixa informativa que já nasce na tela — ela passa a
 * interromper a leitura sem motivo, e quem enxerga nunca percebe o defeito.
 *
 * O padrão é `status` (polido) porque a maioria dos alertas de uma tela
 * administrativa é informativa e já está renderizada quando a página abre.
 */

export type { AlertTone };

export interface AlertProps extends Omit<React.ComponentProps<'div'>, 'role'> {
  /** Família de feedback. É decisão de COR, não de urgência. */
  tone?: AlertTone;
  /**
   * Interrompe o leitor de tela. Reserve para o que bloqueia a tarefa em
   * andamento — um erro de submissão, não um aviso de contexto.
   */
  urgent?: boolean;
  /**
   * Ícone opcional, à esquerda do conteúdo.
   *
   * É prop e não filho porque a posição dele é decisão do componente, não de
   * quem usa. Passado como filho, ele dependeria de o conteúdo estar envolvido
   * do jeito certo — e a composição errada quebrava o layout em silêncio.
   *
   * Sempre decorativo: a informação está no texto. Um ícone anunciado repete o
   * tom que a cor já dá a quem enxerga e não acrescenta nada a quem não enxerga.
   */
  icon?: React.ReactNode;
}

export function Alert({
  className,
  tone = 'info',
  urgent = false,
  icon,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      data-slot="alert"
      data-tone={tone}
      role={urgent ? 'alert' : 'status'}
      // `aria-live` explícito junto do papel: alguns leitores tratam o papel
      // implícito de forma inconsistente quando o elemento já está no DOM no
      // momento do carregamento — que é o caso mais comum aqui.
      aria-live={urgent ? 'assertive' : 'polite'}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    >
      {icon ? (
        <span data-slot="alert-icon" aria-hidden="true" className={alertIconVariants({ tone })}>
          {icon}
        </span>
      ) : null}

      {/* O conteúdo é SEMPRE envolvido, inclusive texto solto. É o que faz
          `<Alert>uma frase</Alert>` funcionar tão bem quanto a composição com
          título e descrição. */}
      <div data-slot="alert-content" className={alertSlots.content}>
        {children}
      </div>
    </div>
  );
}

export function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-title" className={cn(alertSlots.title, className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="alert-description" className={cn(alertSlots.description, className)} {...props} />
  );
}
