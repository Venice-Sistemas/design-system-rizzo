import { cva } from 'class-variance-authority';

/**
 * Receita do Alert — mensagem persistente sobre o estado de algo na tela.
 *
 * QUATRO tons, não dois. O shadcn traz `default` e `destructive`; existem quatro
 * famílias de feedback nos tokens (sucesso, perigo, aviso, informação), todas com
 * superfície, borda, texto e ícone medidos no contrato de contraste, nos dois
 * temas. Expor só duas deixaria as outras serem improvisadas com opacidade na
 * tela — que é exatamente o que o shadcn faz com `bg-destructive/10`.
 *
 * Nenhuma cor vem de opacidade. Valor gerado por alfa não está no contrato e muda
 * conforme o que estiver atrás.
 */

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export const alertVariants = cva(
  [
    // Grade de duas colunas: o ícone ocupa a primeira, título e descrição a
    // segunda. Sem ícone, a primeira colapsa para zero e o texto encosta na
    // borda — sem precisar de variante de layout.
    'ds:relative ds:grid ds:w-full ds:grid-cols-[0_1fr] ds:items-start ds:gap-y-0.5',
    'ds:has-[>svg]:grid-cols-[calc(var(--rp-space-md))_1fr] ds:has-[>svg]:gap-x-3',
    'ds:rounded-lg ds:border ds:px-4 ds:py-3',
    'ds:font-sans ds:text-sm',
    'ds:[&>svg]:size-4 ds:[&>svg]:translate-y-0.5',
  ],
  {
    variants: {
      tone: {
        info: 'ds:bg-info-surface ds:border-info-border ds:text-info-text ds:[&>svg]:text-info-icon',
        success:
          'ds:bg-success-surface ds:border-success-border ds:text-success-text ds:[&>svg]:text-success-icon',
        warning:
          'ds:bg-warning-surface ds:border-warning-border ds:text-warning-text ds:[&>svg]:text-warning-icon',
        danger:
          'ds:bg-danger-surface ds:border-danger-border ds:text-danger-text ds:[&>svg]:text-danger-icon',
      },
    },
    defaultVariants: { tone: 'info' },
  },
);

export const alertSlots = {
  title: 'ds:col-start-2 ds:min-h-4 ds:font-medium ds:tracking-tight',
  description: 'ds:col-start-2 ds:grid ds:justify-items-start ds:gap-1 ds:[&_p]:leading-relaxed',
} as const;
