'use client';

import { forwardRef, useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { isDev } from '../lib/dev';

/**
 * Button — implementa docs/contracts/button.md.
 *
 * Elemento `<button>` nativo, sem biblioteca headless: não há comportamento
 * complexo a delegar, e o nativo já entrega papel, Enter, Espaço e foco de graça.
 * Recriar isso à mão só introduziria bugs.
 */

const button = cva(
  [
    'ds:relative ds:inline-flex ds:items-center ds:justify-center ds:gap-xs',
    'ds:font-default ds:text-label ds:font-medium ds:whitespace-nowrap',
    'ds:rounded-control ds:border ds:border-transparent',
    'ds:cursor-pointer ds:select-none',
    'ds:transition-colors ds:duration-150',
    // Foco só por teclado. Em clique de mouse o anel não aparece, o que evita o
    // reflexo de removê-lo com outline:none e cegar quem navega por teclado.
    'ds:outline-none ds:focus-visible:outline-2 ds:focus-visible:outline-offset-2 ds:focus-visible:outline-border-focus',
    // O alvo clicável nunca é menor que o mínimo, mesmo com size="sm". O
    // pseudo-elemento expande a área sem alterar o desenho nem o layout.
    'ds:after:absolute ds:after:left-1/2 ds:after:top-1/2 ds:after:-translate-x-1/2 ds:after:-translate-y-1/2',
    'ds:after:h-[max(100%,var(--rp-size-target-min))] ds:after:w-[max(100%,var(--rp-size-target-min))]',
    'ds:disabled:cursor-not-allowed',
    'ds:motion-reduce:transition-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'ds:bg-action-primary ds:text-action-primary-fg',
          'ds:not-disabled:hover:bg-action-primary-hover',
          'ds:not-disabled:active:bg-action-primary-active',
        ],
        secondary: [
          'ds:bg-action-secondary ds:text-action-secondary-fg ds:border-action-secondary-border',
          'ds:not-disabled:hover:bg-action-secondary-hover',
          'ds:not-disabled:active:bg-action-secondary-active',
        ],
        danger: [
          'ds:bg-action-danger ds:text-action-danger-fg',
          'ds:not-disabled:hover:bg-action-danger-hover',
          'ds:not-disabled:active:bg-action-danger-active',
        ],
        ghost: [
          'ds:bg-transparent ds:text-action-ghost-fg',
          'ds:not-disabled:hover:bg-action-ghost-hover',
          'ds:not-disabled:active:bg-action-ghost-active',
        ],
      },
      size: {
        sm: 'ds:h-[var(--rp-size-control-sm)] ds:px-sm',
        md: 'ds:h-[var(--rp-size-control-md)] ds:px-md',
        lg: 'ds:h-[var(--rp-size-control-lg)] ds:px-md',
      },
    },
    compoundVariants: [
      {
        // Desabilitado é o mesmo em toda variante: some a identidade da ação.
        variant: ['primary', 'secondary', 'danger'],
        class: 'ds:disabled:bg-disabled-bg ds:disabled:text-disabled-fg ds:disabled:border-transparent',
      },
      { variant: 'ghost', class: 'ds:disabled:bg-transparent ds:disabled:text-disabled-fg' },
    ],
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
);

/**
 * Os tipos públicos são DECLARADOS, não inferidos do cva.
 *
 * `VariantProps<typeof button>` parece elegante e arrasta
 * `class-variance-authority/types` para dentro do .d.ts publicado. A partir daí,
 * trocar o cva por qualquer outra coisa vira breaking change para quem consome —
 * que é exatamente o acoplamento que PA-9 existe para impedir. O contrato em
 * docs/contracts/button.md é a fonte destes nomes; o cva é detalhe interno.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'color'> {
  /** Peso visual da ação. O padrão é `secondary`: uma tela tem um botão primário, não seis. */
  variant?: ButtonVariant;
  /** Altura do controle. O alvo clicável nunca encolhe abaixo do mínimo. */
  size?: ButtonSize;
  /** Ação em andamento. Diferente de `disabled`: o botão continua focável. */
  loading?: boolean;
  children?: ReactNode;
  /** Escape hatch. Use com parcimônia — se você precisa sempre, falta uma variante. */
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, loading = false, disabled = false, type = 'button', children, className, onClick, ...rest },
  forwardedRef,
) {
  const localRef = useRef<HTMLButtonElement>(null);
  const ref = (forwardedRef ?? localRef) as React.RefObject<HTMLButtonElement>;

  useAccessibleNameWarning(ref, children);

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={disabled}
      // Carregando NÃO usa `disabled`: isso tiraria o botão da ordem de tabulação
      // e o foco cairia no body no meio da ação. `aria-busy` anuncia o estado sem
      // sequestrar o foco de quem navega por teclado.
      aria-busy={loading || undefined}
      onClick={loading ? preventWhileLoading : onClick}
      className={cn(button({ variant, size }), className)}
    >
      {/*
        `opacity-0`, e não `invisible` nem `aria-hidden`. Os dois últimos tiram o
        rótulo da árvore de acessibilidade, e o botão ficaria SEM NOME justamente
        enquanto carrega — o leitor de tela anunciaria "botão, ocupado" e nada mais.
        Com opacidade o conteúdo some da vista, continua ocupando o mesmo espaço
        (botão que encolhe move o layout) e o nome acessível permanece.
      */}
      <span className={loading ? 'ds:opacity-0' : undefined}>{children}</span>
      {loading && <Spinner />}
    </button>
  );
});

function preventWhileLoading(event: React.MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
  event.stopPropagation();
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'ds:absolute ds:h-[1em] ds:w-[1em] ds:rounded-pill',
        'ds:border-2 ds:border-current ds:border-t-transparent',
        'ds:animate-spin ds:motion-reduce:animate-none',
      )}
    />
  );
}

/**
 * Avisa, em desenvolvimento, quando o botão não tem nome acessível.
 *
 * O caso comum é botão só de ícone sem `aria-label` — invisível para quem enxerga
 * e completamente mudo no leitor de tela. Tornar o caminho inacessível barulhento
 * é o que faz PA-3 valer na prática: acessibilidade é propriedade do componente,
 * não responsabilidade de quem consome lembrar.
 */
function useAccessibleNameWarning(ref: React.RefObject<HTMLButtonElement>, children: ReactNode) {
  useEffect(() => {
    if (!isDev) return;
    const node = ref.current;
    if (!node) return;
    const hasName = Boolean(
      node.textContent?.trim() || node.getAttribute('aria-label') || node.getAttribute('aria-labelledby'),
    );
    if (!hasName) {
      console.warn(
        '[@rizzopark/react] Button sem nome acessível. Um botão só de ícone precisa de `aria-label` — ' +
          'sem ele, o leitor de tela anuncia apenas "botão" e o usuário não tem como saber o que ele faz.',
        node,
      );
    }
  }, [ref, children]);
}
