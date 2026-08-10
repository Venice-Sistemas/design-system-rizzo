/**
 * Receita do Checkbox.
 *
 * O alvo VISUAL tem 16px, que é o tamanho certo para não dominar a linha de
 * texto ao lado. O alvo CLICÁVEL é ampliado por um pseudo-elemento até o mínimo
 * de toque, do mesmo jeito que o Button — aumentar a caixa visível resolveria o
 * toque e estragaria o alinhamento com o rótulo.
 */

export const checkboxSlots = {
  root: [
    'ds:peer ds:relative ds:size-4 ds:shrink-0',
    'ds:rounded-[4px] ds:border ds:border-input ds:bg-card ds:shadow-raised',
    'ds:transition-shadow ds:outline-none ds:motion-reduce:transition-none',
    'ds:focus-visible:border-ring ds:focus-visible:ring-ring/50 ds:focus-visible:ring-[3px]',

    // Marcado e indeterminado usam a MESMA superfície: os dois significam "este
    // campo foi decidido", e o que os separa é o glifo, não a cor.
    'ds:data-[state=checked]:bg-primary ds:data-[state=checked]:border-primary ds:data-[state=checked]:text-primary-foreground',
    'ds:data-[state=indeterminate]:bg-primary ds:data-[state=indeterminate]:border-primary ds:data-[state=indeterminate]:text-primary-foreground',

    'ds:disabled:cursor-not-allowed ds:disabled:bg-disabled ds:disabled:border-disabled ds:disabled:text-disabled-foreground',

    // Área de toque ampliada sem mexer na caixa visível.
    'ds:after:absolute ds:after:left-1/2 ds:after:top-1/2 ds:after:-translate-x-1/2 ds:after:-translate-y-1/2',
    'ds:after:h-[max(100%,var(--rp-size-target-min))] ds:after:w-[max(100%,var(--rp-size-target-min))]',
  ].join(' '),

  indicator: 'ds:flex ds:items-center ds:justify-center ds:text-current',
} as const;
