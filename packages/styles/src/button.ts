import { cva } from 'class-variance-authority';
import { cn } from './cn';

/**
 * Receita de classe do Button. Implementa a seção "Tokens consumidos" de
 * docs/contracts/button.md.
 *
 * Sem framework: recebe props visuais, devolve string. React, Angular e qualquer
 * outra plataforma web importam daqui — se cada uma tivesse a sua cópia, as
 * tabelas divergiriam na primeira vez que alguém mexesse em uma.
 *
 * Três decisões registradas no contrato:
 *
 *   1. Hover e active vêm de TOKEN MEDIDO, não de `bg-primary/90`. Valor gerado
 *      por opacidade não está no contrato de contraste e muda conforme o fundo.
 *   2. Desabilitado usa token medido em vez de `opacity-50`: opacidade sobre um
 *      verde escuro com texto branco derruba a leitura para perto de 2:1.
 *   3. A borda de `outline` tem 3,23:1, não a borda decorativa de 1,63:1 — num
 *      botão contornado a borda é o que identifica o controle, e a WCAG 1.4.11
 *      exige 3:1 para isso.
 */

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

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
    // A área clicável nunca fica abaixo do mínimo de toque, nem em size="sm".
    'ds:after:absolute ds:after:left-1/2 ds:after:top-1/2 ds:after:-translate-x-1/2 ds:after:-translate-y-1/2',
    'ds:after:h-[max(100%,var(--rp-size-target-min))] ds:after:w-[max(100%,var(--rp-size-target-min))]',
    'ds:motion-reduce:transition-none',
  ],
  {
    variants: {
      variant: {
        default: [
          'ds:bg-primary ds:text-primary-foreground ds:shadow-raised',
          'ds:not-disabled:hover:bg-primary-hover ds:not-disabled:active:bg-primary-active',
        ],
        destructive: [
          'ds:bg-destructive ds:text-destructive-foreground ds:shadow-raised',
          'ds:not-disabled:hover:bg-destructive-hover ds:not-disabled:active:bg-destructive-active',
        ],
        outline: [
          'ds:bg-card ds:text-foreground ds:border-outline-border ds:shadow-raised',
          'ds:not-disabled:hover:bg-accent ds:not-disabled:active:bg-accent-active',
        ],
        secondary: [
          'ds:bg-secondary ds:text-secondary-foreground ds:shadow-raised',
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
      // Altura vem de TOKEN, não de um número solto: implementação que hardcoda deixa os
      // tokens decorativos e a próxima plataforma sem de onde derivar a medida.
      size: {
        default: 'ds:h-[var(--rp-size-control-md)] ds:px-4 ds:py-2 ds:has-[svg]:px-3',
        sm: 'ds:h-[var(--rp-size-control-sm)] ds:gap-1.5 ds:px-3 ds:has-[svg]:px-2.5',
        lg: 'ds:h-[var(--rp-size-control-lg)] ds:px-6 ds:has-[svg]:px-4',
        icon: 'ds:size-[var(--rp-size-control-md)]',
      },
    },
    compoundVariants: [
      {
        variant: ['default', 'destructive', 'outline', 'secondary'],
        class:
          'ds:disabled:bg-disabled ds:disabled:text-disabled-foreground ds:disabled:border-transparent ds:disabled:shadow-none',
      },
      { variant: ['ghost', 'link'], class: 'ds:disabled:text-disabled-foreground ds:disabled:no-underline' },
    ],
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

/**
 * Classes das partes internas.
 *
 * Ficam aqui, e não na plataforma, por dois motivos: uma classe que mora só numa
 * plataforma existe só nela — é por aí que a divergência começa; e o Tailwind
 * varre apenas este pacote, então classe fora daqui não é gerada.
 */
export const buttonSlots = {
  /**
   * Wrapper do rótulo.
   *
   * `inline-flex`, NUNCA `display: contents`: elemento com `contents` não gera
   * caixa, e sem caixa `opacity` não se aplica — o rótulo ficaria visível com o
   * indicador desenhado por cima.
   *
   * `opacity-0` em vez de `invisible` ou `aria-hidden`: os dois últimos tiram o
   * rótulo da árvore de acessibilidade, e o botão ficaria sem nome enquanto
   * carrega.
   *
   * `gap-[inherit]` puxa o gap da raiz em vez de repetir o valor por tamanho —
   * `sm` usa 1.5 e os demais 2, e duplicar garantiria divergência.
   */
  label: (loading = false): string =>
    cn('ds:inline-flex ds:items-center ds:gap-[inherit]', loading && 'ds:opacity-0'),

  /** Indicador de carregamento. Absoluto, para não empurrar o rótulo. */
  spinner:
    'ds:absolute ds:size-[1em] ds:rounded-full ds:border-2 ds:border-current ds:border-t-transparent ds:animate-spin ds:motion-reduce:animate-none',
} as const;
