import { cva } from 'class-variance-authority';

/**
 * Receita do Alert — mensagem persistente sobre o estado de algo na tela.
 *
 * Quatro tons. Existem quatro famílias de feedback nos tokens (sucesso, perigo,
 * aviso, informação), todas com superfície, borda, texto e ícone medidos no
 * contrato de contraste, nos dois temas. Expor menos deixaria as outras serem
 * improvisadas com opacidade na tela.
 *
 * Nenhuma cor vem de opacidade. Valor gerado por alfa não está no contrato e muda
 * conforme o que estiver atrás.
 *
 * O ÍCONE É PROP, NÃO FILHO, e o conteúdo é sempre envolvido.
 *
 * A versão anterior usava uma grade de duas colunas em que a primeira tinha
 * largura zero, e contava com `col-start-2` no título e na descrição para
 * escapar dela. Funcionava — desde que quem usasse envolvesse tudo. Texto solto
 * como filho era posicionado automaticamente na coluna de largura zero e saía
 * quebrado, uma palavra por linha, sem erro nenhum.
 *
 * Componente que só funciona com a composição certa é armadilha: a composição
 * errada precisa quebrar visivelmente ou não quebrar nada.
 */

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export const alertVariants = cva(
  [
    'ds:relative ds:flex ds:w-full ds:items-start ds:gap-3',
    'ds:rounded-lg ds:border ds:px-4 ds:py-3',
    'ds:font-sans ds:text-sm',
  ],
  {
    variants: {
      tone: {
        info: 'ds:bg-info-surface ds:border-info-border ds:text-info-text',
        success: 'ds:bg-success-surface ds:border-success-border ds:text-success-text',
        warning: 'ds:bg-warning-surface ds:border-warning-border ds:text-warning-text',
        danger: 'ds:bg-danger-surface ds:border-danger-border ds:text-danger-text',
      },
    },
    defaultVariants: { tone: 'info' },
  },
);

/** Cor do ícone por tom. Separada da raiz porque o ícone tem token próprio. */
export const alertIconVariants = cva(
  ['ds:shrink-0 ds:translate-y-0.5', 'ds:[&>svg]:size-4 ds:[&>svg]:block'],
  {
    variants: {
      tone: {
        info: 'ds:text-info-icon',
        success: 'ds:text-success-icon',
        warning: 'ds:text-warning-icon',
        danger: 'ds:text-danger-icon',
      },
    },
    defaultVariants: { tone: 'info' },
  },
);

export const alertSlots = {
  /** `min-w-0` para o texto poder encolher: sem ele, uma palavra longa empurra
   *  o alerta para fora do contêiner em vez de quebrar. */
  content: 'ds:grid ds:min-w-0 ds:flex-1 ds:gap-y-0.5',
  title: 'ds:min-h-4 ds:font-medium ds:tracking-tight',
  description: 'ds:grid ds:justify-items-start ds:gap-1 ds:[&_p]:leading-relaxed',
} as const;
