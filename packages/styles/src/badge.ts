import { cva } from 'class-variance-authority';

/**
 * Receita do Badge — rótulo curto de status ou categoria.
 *
 * Seis variantes, acompanhando o shadcn.
 *
 * O hover só se aplica quando o badge é renderizado COMO LINK — é o que o
 * seletor `[a&]` faz. Um badge que é só rótulo continua sem estado de hover, e
 * sem entrar na ordem de tabulação: badge não é controle, e um rótulo com
 * aparência de controle esconde a ação de quem navega por teclado.
 *
 * O hover vem de TOKEN MEDIDO, não de `bg-primary/90`. Valor gerado por
 * opacidade não passa pelo contrato de contraste e muda conforme o que estiver
 * atrás — é a mesma decisão tomada no Button e no Alert.
 */

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';

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
        default: 'ds:bg-primary ds:text-primary-foreground ds:[a&]:hover:bg-primary-hover',
        secondary: 'ds:bg-secondary ds:text-secondary-foreground ds:[a&]:hover:bg-secondary-hover',
        destructive:
          'ds:bg-destructive ds:text-destructive-foreground ds:[a&]:hover:bg-destructive-hover',
        // A borda do outline é a mesma do botão contornado: 3,23:1, não a
        // decorativa de 1,63:1. Num rótulo contornado é a borda que o delimita.
        outline:
          'ds:bg-transparent ds:text-foreground ds:border-outline-border ds:[a&]:hover:bg-accent ds:[a&]:hover:text-accent-foreground',
        ghost: 'ds:bg-transparent ds:text-foreground ds:[a&]:hover:bg-accent ds:[a&]:hover:text-accent-foreground',
        link: 'ds:bg-transparent ds:text-link ds:underline-offset-4 ds:[a&]:hover:underline',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);
