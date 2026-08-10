/**
 * Receita do Card — superfície que agrupa conteúdo relacionado.
 *
 * O Card não tem variante. Ele é uma superfície, e superfície com variante vira
 * decisão de cor espalhada por tela: quem quiser um card de perigo usa um Alert,
 * que é o componente que existe para isso e tem os tokens de feedback medidos.
 *
 * A elevação vem de `shadow-raised`, que é token semântico. `shadow-sm` não
 * atravessa para React Native — "pequeno" não tem tradução para `elevation` do
 * Android nem para `shadowOffset` do iOS.
 */

export const cardSlots = {
  root: [
    'ds:flex ds:flex-col ds:gap-lg',
    'ds:rounded-xl ds:border ds:border-border',
    'ds:bg-card ds:text-card-foreground',
    'ds:py-lg ds:shadow-raised',
  ].join(' '),

  /** Cabeçalho: título e descrição. O padding horizontal mora nas partes, não na
   *  raiz, para que um conteúdo de largura total (uma tabela, uma imagem) possa
   *  encostar nas bordas sem desfazer o padding do resto. */
  header: 'ds:flex ds:flex-col ds:gap-2xs ds:px-lg',

  /** Título. Elemento de cabeçalho é responsabilidade de quem usa — o Card não
   *  sabe em que nível da hierarquia da página ele está, e chutar `<h3>` produz
   *  documentos com níveis fora de ordem. */
  title: 'ds:font-sans ds:text-lg ds:leading-none ds:font-semibold',

  description: 'ds:font-sans ds:text-sm ds:text-muted-foreground',

  content: 'ds:px-lg',

  footer: 'ds:flex ds:items-center ds:gap-sm ds:px-lg',
} as const;
