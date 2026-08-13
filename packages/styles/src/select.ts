import { inputVariants } from './input';
import { menuSlots } from './menu';
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
    /* O valor ocupa a sobra e os ícones não encolhem: sem `flex-1` o
     * `justify-between` espalharia ícone, valor e chevron em três pontos da
     * linha, em vez de agrupar ícone e valor à esquerda. */
    'ds:[&>span]:flex-1 ds:[&>span]:min-w-0 ds:[&>span]:truncate',
    'ds:[&>svg]:size-4 ds:[&>svg]:shrink-0',
    /* Só o último `svg` gira, que é o chevron — ele é renderizado depois dos
     * filhos. Mirar todo `svg` faria o ícone da esquerda girar junto, e girar um
     * pino de mapa porque a lista abriu não quer dizer nada. */
    'ds:data-[state=open]:[&>svg:last-child]:rotate-180',
  ].join(' '),

  /**
   * O chevron do próprio componente, não um ícone que o consumidor põe.
   *
   * **Sem transição, e isso não é esquecimento.** O giro usa a propriedade
   * `rotate`, cujo valor inicial é `none` — que não interpola com ângulo. Com
   * `transition-transform` aqui a transição empaca e o chevron fica parado em
   * `0deg`: some a animação *e* o giro. Declarar `rotate-0` como base também
   * não resolve, porque aí é ele que vence a regra de `data-[state=open]`.
   *
   * Girar sem animar é melhor que não girar.
   */
  chevron: 'ds:opacity-50',

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

  /**
   * O teto de altura mora no painel, e a rolagem aqui: quem rola precisa ser o
   * elemento com altura limitada, não o de fora.
   */
  viewport: 'ds:p-0 ds:overflow-y-auto',

  group: 'ds:p-0',

  /**
   * Mesmo rótulo do menu. Os dois são título de seção dentro de painel
   * flutuante, e divergir aqui é o tipo de diferença que ninguém decide — só
   * aparece quando alguém mexe num dos dois.
   */
  label: menuSlots.label,

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
    'ds:[&>svg]:size-4 ds:[&>svg]:shrink-0',
    /* A altura do campo, não a do alvo de toque: a opção fica embaixo do
     * gatilho e a diferença de 8px aparece como degrau. Segue passando no
     * mínimo de 24px do WCAG 2.5.8. */
    'ds:min-h-[var(--rp-size-control-md)]',
  ].join(' '),

  /** A marca de selecionado ocupa a calha que o `pl-8` do item reservou. */
  itemIndicator:
    'ds:absolute ds:left-2 ds:flex ds:size-4 ds:items-center ds:justify-center',

  glyph: 'ds:size-4',

  separator: 'ds:-mx-1 ds:my-1 ds:h-px ds:bg-border',
} as const;
