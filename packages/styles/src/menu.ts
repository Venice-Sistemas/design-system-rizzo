import { cva } from 'class-variance-authority';
import { overlayAnchored, overlayPanel } from './overlay';

/**
 * Receitas do Popover e do DropdownMenu.
 *
 * Os dois são painéis ANCORADOS: nascem colados a um gatilho, e não centralizados
 * na viewport. É a diferença que os separa dos modais e a razão de compartilharem
 * `overlayAnchored`, que carrega a origem da animação vinda do Radix — sem ela o
 * painel cresce para o lado errado quando não cabe embaixo e o Radix o vira para
 * cima.
 *
 * Nenhum dos dois tem véu. Véu significa "o resto da página está inerte", e nos
 * dois casos ela não está: o conteúdo atrás continua legível e alcançável.
 */

export const popoverSlots = {
  content: [overlayPanel, overlayAnchored, 'ds:w-72 ds:p-md'].join(' '),
} as const;

export const menuSlots = {
  content: [overlayPanel, overlayAnchored, 'ds:p-1 ds:max-h-(--radix-dropdown-menu-content-available-height)'].join(' '),

  /** Rótulo de grupo. Não é item: não recebe foco e não é acionável. */
  label: 'ds:px-2 ds:py-1.5 ds:font-sans ds:text-xs ds:font-medium ds:text-muted-foreground',

  separator: 'ds:-mx-1 ds:my-1 ds:h-px ds:bg-border',
} as const;

/**
 * Item de menu.
 *
 * `highlighted`, não `hover`. Num menu o teclado e o mouse compartilham UM
 * destaque: descer com a seta precisa pintar o item, e passar o mouse precisa
 * mover esse mesmo destaque. Dois estados independentes produzem dois itens
 * pintados ao mesmo tempo, e a pessoa não sabe qual o Enter vai acionar.
 * `data-highlighted` é o que o Radix mantém sincronizado entre os dois.
 */
export const menuItemVariants = cva(
  [
    'ds:relative ds:flex ds:cursor-default ds:select-none ds:items-center ds:gap-2',
    'ds:rounded-sm ds:px-2 ds:py-1.5',
    'ds:font-sans ds:text-sm ds:outline-none',
    'ds:[&>svg]:pointer-events-none ds:[&>svg]:size-4 ds:[&>svg]:shrink-0',
    'ds:data-[disabled]:pointer-events-none ds:data-[disabled]:opacity-50',
    // Altura mínima de toque sem esticar o item: menu com itens de 44px vira uma
    // lista comprida demais para caber na tela.
    'ds:min-h-[var(--rp-size-target-min)]',
  ],
  {
    variants: {
      variant: {
        default:
          'ds:text-foreground ds:data-[highlighted]:bg-accent ds:data-[highlighted]:text-accent-foreground',
        // Destrutivo destaca com a superfície de perigo, não só com texto
        // vermelho: texto vermelho sobre destaque cinza fica com contraste
        // imprevisível, porque nenhum dos dois foi medido contra o outro.
        destructive:
          'ds:text-danger-text ds:data-[highlighted]:bg-danger-surface ds:data-[highlighted]:text-danger-text',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export type MenuItemVariant = 'default' | 'destructive';
