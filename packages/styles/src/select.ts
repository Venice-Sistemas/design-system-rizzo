import { inputVariants } from './input';
import { overlayAnchored, overlayPanel } from './overlay';

/**
 * Receita do Select — implementa docs/contracts/select.md.
 *
 * O gatilho reusa `inputVariants` em vez de ter receita própria: ele fica ao
 * lado de campos de texto num formulário, e altura ou borda de origens
 * diferentes desalinham a linha na primeira vez que alguém mexe numa delas.
 *
 * O que ele acrescenta é o necessário para caber um valor e um chevron — o
 * `Input` alinha texto, o gatilho alinha dois filhos.
 */
export const selectSlots = {
  trigger: [
    inputVariants(),
    'ds:items-center ds:justify-between ds:gap-2',
    'ds:cursor-pointer ds:text-left',
    // O valor pode ser mais longo que o campo; o chevron não encolhe.
    'ds:[&>span]:truncate',
    'ds:[&>svg]:size-4 ds:[&>svg]:shrink-0 ds:[&>svg]:opacity-50',
    // Só o chevron gira. O painel abre por conta do Radix.
    'ds:data-[state=open]:[&>svg]:rotate-180 ds:[&>svg]:transition-transform',
    'ds:motion-reduce:[&>svg]:transition-none',
  ].join(' '),

  /** Vazio, o gatilho mostra o placeholder com o token medido para isso. */
  placeholder: 'ds:text-placeholder',

  content: [
    overlayPanel,
    overlayAnchored,
    'ds:p-1 ds:max-h-(--radix-select-content-available-height)',
    // Acompanha a largura do gatilho: painel mais estreito que o campo corta o
    // valor que a pessoa acabou de ler ali em cima.
    'ds:min-w-(--radix-select-trigger-width)',
  ].join(' '),

  viewport: 'ds:p-0',

  /**
   * `highlighted`, não `hover`: teclado e mouse compartilham UM destaque, como
   * no menu. Dois estados independentes pintam dois itens ao mesmo tempo, e a
   * pessoa não sabe qual o Enter escolhe.
   */
  item: [
    'ds:relative ds:flex ds:w-full ds:cursor-default ds:select-none ds:items-center',
    'ds:gap-2 ds:rounded-sm ds:py-1.5 ds:pr-2 ds:pl-8',
    'ds:font-sans ds:text-sm ds:text-foreground ds:outline-none',
    'ds:data-[highlighted]:bg-accent ds:data-[highlighted]:text-accent-foreground',
    // Desabilitado continua na lista e continua anunciado — some só o clique.
    'ds:data-[disabled]:pointer-events-none ds:data-[disabled]:opacity-50',
    'ds:min-h-[var(--rp-size-target-min)]',
  ].join(' '),

  /** A marca de selecionado ocupa a calha que o `pl-8` do item reservou. */
  itemIndicator:
    'ds:absolute ds:left-2 ds:flex ds:size-4 ds:items-center ds:justify-center',

  glyph: 'ds:size-4',

  separator: 'ds:-mx-1 ds:my-1 ds:h-px ds:bg-border',
} as const;
