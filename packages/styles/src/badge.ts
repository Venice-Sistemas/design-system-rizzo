import { cva } from 'class-variance-authority';

/**
 * Receita do Badge — rótulo curto de status ou categoria.
 *
 * Quatro variantes. Badge não é controle: um badge que se comporta como link
 * convida a torná-lo clicável, e aí o certo é um `<a>` ou um Button — não um
 * rótulo com aparência de link. Variante que existe acaba sendo usada.
 *
 * Sem opacidade em lugar nenhum: valor gerado por opacidade não está no contrato
 * de contraste e muda conforme o que estiver atrás.
 */

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export const badgeVariants = cva(
  [
    'ds:inline-flex ds:w-fit ds:shrink-0 ds:items-center ds:justify-center ds:gap-1',
    'ds:overflow-hidden ds:whitespace-nowrap',
    'ds:rounded-full ds:border ds:border-transparent ds:px-2 ds:py-0.5',
    'ds:font-sans ds:text-xs ds:font-medium',
    'ds:[&>svg]:pointer-events-none ds:[&>svg]:size-3',
  ],
  {
    variants: {
      variant: {
        default: 'ds:bg-primary ds:text-primary-foreground',
        secondary: 'ds:bg-secondary ds:text-secondary-foreground',
        destructive: 'ds:bg-destructive ds:text-destructive-foreground',
        // A borda do outline é a mesma do botão contornado: 3,23:1, não a
        // decorativa de 1,63:1. Num rótulo contornado é a borda que o delimita.
        outline: 'ds:bg-transparent ds:text-foreground ds:border-outline-border',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);
