'use client';

import type * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { isDev } from '../lib/dev';
import { useAccessibleName } from '../lib/use-accessible-name';

/**
 * Button — implementa docs/contracts/button.md.
 *
 * Segue os padrões do shadcn/ui: mesma nomenclatura de variante e tamanho, mesmo
 * `data-slot`, mesmo `asChild`, `buttonVariants` exportado. Não é imitação
 * gratuita — é o que permite trocar o import num app shadcn sem refatorar, e faz
 * quem conhece a biblioteca ler este código sem tradução.
 *
 * Três desvios deliberados, todos registrados no contrato:
 *
 *   1. Hover e active vêm de TOKEN MEDIDO, não de `bg-primary/90`. Valor gerado
 *      por opacidade não está no contrato de contraste e muda conforme o fundo.
 *   2. Desabilitado usa token medido em vez de `opacity-50`: opacidade sobre um
 *      verde escuro com texto branco derruba a leitura para perto de 2:1.
 *   3. A borda de `outline` tem 3,23:1, não a borda decorativa de 1,63:1. Num
 *      botão contornado a borda é o que identifica o controle, e a WCAG 1.4.11
 *      exige 3:1 para isso.
 */

export const buttonVariants = cva(
  [
    'ds:relative ds:inline-flex ds:shrink-0 ds:items-center ds:justify-center ds:gap-2 ds:whitespace-nowrap',
    'ds:font-sans ds:text-sm ds:font-medium',
    'ds:rounded-md ds:border ds:border-transparent',
    'ds:cursor-pointer ds:select-none ds:transition-all',
    'ds:outline-none ds:focus-visible:ring-[3px] ds:focus-visible:ring-ring/50 ds:focus-visible:border-ring',
    'ds:aria-invalid:border-destructive ds:aria-invalid:ring-destructive/20',
    'ds:disabled:pointer-events-none',
    // Ícone acompanha o texto sem precisar de prop: dimensiona sozinho e não
    // rouba o clique. É o que torna `<Icon /> Salvar` suficiente.
    "ds:[&_svg]:pointer-events-none ds:[&_svg]:shrink-0 ds:[&_svg:not([class*='size-'])]:size-4",
    // Descendente, não filho direto: o conteúdo vive dentro de um wrapper (ver
    // abaixo), então `>svg` nunca casaria e o padding não se ajustaria ao ícone.
    // A área clicável nunca fica abaixo do mínimo de toque, nem em size="sm".
    'ds:after:absolute ds:after:left-1/2 ds:after:top-1/2 ds:after:-translate-x-1/2 ds:after:-translate-y-1/2',
    'ds:after:h-[max(100%,var(--rp-size-target-min))] ds:after:w-[max(100%,var(--rp-size-target-min))]',
    'ds:motion-reduce:transition-none',
  ],
  {
    variants: {
      variant: {
        default: [
          'ds:bg-primary ds:text-primary-foreground ds:shadow-xs',
          'ds:not-disabled:hover:bg-primary-hover ds:not-disabled:active:bg-primary-active',
        ],
        destructive: [
          'ds:bg-destructive ds:text-destructive-foreground ds:shadow-xs',
          'ds:not-disabled:hover:bg-destructive-hover ds:not-disabled:active:bg-destructive-active',
        ],
        outline: [
          'ds:bg-card ds:text-foreground ds:border-outline-border ds:shadow-xs',
          'ds:not-disabled:hover:bg-accent ds:not-disabled:active:bg-accent-active',
        ],
        secondary: [
          'ds:bg-secondary ds:text-secondary-foreground ds:shadow-xs',
          'ds:not-disabled:hover:bg-secondary-hover ds:not-disabled:active:bg-secondary-active',
        ],
        ghost: [
          'ds:bg-transparent ds:text-accent-foreground',
          'ds:not-disabled:hover:bg-accent ds:not-disabled:active:bg-accent-active',
        ],
        link: [
          'ds:bg-transparent ds:text-link ds:underline-offset-4',
          'ds:not-disabled:hover:text-link-hover ds:not-disabled:hover:underline',
        ],
      },
      size: {
        default: 'ds:h-9 ds:px-4 ds:py-2 ds:has-[svg]:px-3',
        sm: 'ds:h-8 ds:gap-1.5 ds:px-3 ds:has-[svg]:px-2.5',
        lg: 'ds:h-11 ds:px-6 ds:has-[svg]:px-4',
        icon: 'ds:size-9',
      },
    },
    compoundVariants: [
      {
        variant: ['default', 'destructive', 'outline', 'secondary'],
        class: 'ds:disabled:bg-disabled ds:disabled:text-disabled-foreground ds:disabled:border-transparent ds:disabled:shadow-none',
      },
      { variant: ['ghost', 'link'], class: 'ds:disabled:text-disabled-foreground ds:disabled:no-underline' },
    ],
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

/**
 * Tipos públicos DECLARADOS, não inferidos do cva.
 *
 * `VariantProps<typeof buttonVariants>` arrastaria `class-variance-authority/types`
 * para o .d.ts publicado, e trocar o cva viraria breaking change para quem
 * consome. O contrato é a fonte destes nomes; o cva é detalhe interno.
 */
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

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
      // Gancho de estilo para o consumidor sem precisar de prop nem de classe
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
          {/*
            `opacity-0`, não `invisible` nem `aria-hidden`: os dois últimos tiram o
            rótulo da árvore de acessibilidade, e o botão ficaria SEM NOME enquanto
            carrega — o leitor de tela anunciaria só "botão, ocupado". Com
            opacidade o conteúdo some da vista, segura o mesmo espaço (botão que
            encolhe move o layout) e o nome permanece.

            O wrapper é `inline-flex`, NUNCA `display: contents`. Elemento com
            `contents` não gera caixa, e sem caixa `opacity` não se aplica — o
            rótulo continuaria visível com o spinner desenhado por cima.

            `gap-[inherit]` puxa o gap do botão em vez de repetir o valor por
            tamanho: `sm` usa 1.5 e os demais 2, e duplicar isso aqui garantiria
            divergência na primeira vez que alguém mexesse em um dos dois.
          */}
          <span className={cn('ds:inline-flex ds:items-center ds:gap-[inherit]', loading && 'ds:opacity-0')}>
            {children}
          </span>
          {loading && <Spinner />}
        </>
      )}
    </Component>
  );
}

function swallow(event: React.MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
  event.stopPropagation();
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="ds:absolute ds:size-[1em] ds:rounded-full ds:border-2 ds:border-current ds:border-t-transparent ds:animate-spin ds:motion-reduce:animate-none"
    />
  );
}
