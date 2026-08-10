import { overlayCentered, overlayPanel, overlayScrim, overlaySlots } from './overlay';

/**
 * Receitas do Dialog e do AlertDialog.
 *
 * Os dois compartilham tudo o que é visual. A diferença entre eles não é
 * aparência, é comportamento — o AlertDialog não fecha por Escape nem por clique
 * fora — e por isso mora na implementação, não aqui.
 *
 * A única diferença visual é o botão de fechar: o Dialog tem um X no canto, o
 * AlertDialog não. Um X num diálogo que exige decisão é uma terceira saída sem
 * significado — sair sem escolher.
 */

export const dialogSlots = {
  scrim: overlayScrim,
  content: [overlayPanel, overlayCentered].join(' '),
  header: overlaySlots.header,
  footer: overlaySlots.footer,
  title: overlaySlots.title,
  description: overlaySlots.description,

  /** O ícone do X. */
  closeIcon: 'ds:size-4',

  /**
   * O nome do botão de fechar, escondido visualmente.
   *
   * Texto de verdade em vez de `aria-label`: os dois são equivalentes para leitor
   * de tela, mas o `aria-label` some do reconhecimento por voz — quem diz "clicar
   * em fechar" precisa que a palavra exista no acessível.
   */
  closeLabel: 'ds:sr-only',

  /** O X do canto. Alvo ampliado até o mínimo de toque, como no Button. */
  close: [
    'ds:absolute ds:top-4 ds:right-4 ds:z-10',
    'ds:inline-flex ds:size-6 ds:items-center ds:justify-center',
    'ds:rounded-md ds:text-muted-foreground ds:transition-colors',
    'ds:hover:bg-accent ds:hover:text-accent-foreground',
    'ds:focus-visible:ring-ring/50 ds:focus-visible:ring-[3px] ds:outline-none',
    'ds:motion-reduce:transition-none',
    'ds:after:absolute ds:after:left-1/2 ds:after:top-1/2 ds:after:-translate-x-1/2 ds:after:-translate-y-1/2',
    'ds:after:h-[max(100%,var(--rp-size-target-min))] ds:after:w-[max(100%,var(--rp-size-target-min))]',
  ].join(' '),
} as const;
