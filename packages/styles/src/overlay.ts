/**
 * O que Dialog, AlertDialog, Popover e DropdownMenu têm em comum.
 *
 * Existe porque quatro cópias do mesmo véu e do mesmo painel divergem na primeira
 * vez que alguém ajusta uma — e ninguém percebe, porque cada uma tem o próprio
 * teste passando. É a mesma razão de o pacote `styles` existir para as
 * plataformas, aplicada dentro de uma plataforma só.
 *
 * A divisão: `scrim` e `panel` são compartilhados; o posicionamento é de cada
 * componente, porque um modal centraliza na viewport e um popover ancora no
 * gatilho — e essa diferença é a razão de serem componentes diferentes.
 */

/** Véu atrás do modal. Único lugar do sistema onde alfa é o mecanismo, não atalho. */
export const overlayScrim = [
  'ds:fixed ds:inset-0 ds:z-50 ds:bg-scrim',
  'ds:data-[state=open]:ds-anim-fade-in ds:data-[state=closed]:ds-anim-fade-out',
].join(' ');

/**
 * Superfície flutuante — o painel em si, sem posicionamento.
 *
 * `elevation.overlay`, não `raised`: o segundo é a elevação de um card, que está
 * no fluxo da página. Um painel que flutua sobre um véu precisa se separar de
 * tudo, e usar a mesma sombra do card apagaria a diferença.
 */
export const overlayPanel = [
  'ds:z-50 ds:rounded-xl ds:border ds:border-border',
  'ds:bg-popover ds:text-popover-foreground',
  'ds:shadow-overlay ds:outline-none',
].join(' ');

/**
 * Painel centralizado na viewport — modais.
 *
 * A largura é limitada por `max-w`, nunca fixa: numa viewport estreita um painel
 * de largura fixa vaza para fora da tela e o botão de confirmar fica inalcançável.
 */
export const overlayCentered = [
  'ds:fixed ds:top-1/2 ds:left-1/2 ds:-translate-x-1/2 ds:-translate-y-1/2',
  'ds:grid ds:w-full ds:max-w-[calc(100%-2rem)] ds:sm:max-w-lg ds:gap-md ds:p-lg',
  'ds:data-[state=open]:ds-anim-panel-in ds:data-[state=closed]:ds-anim-panel-out',
].join(' ');

/**
 * Painel ancorado a um gatilho — popover e menu.
 *
 * A origem da animação acompanha o lado em que o Radix decidiu abrir, senão o
 * painel cresce para o lado errado quando não cabe embaixo e ele vira para cima.
 */
export const overlayAnchored = [
  'ds:min-w-[8rem] ds:overflow-hidden ds:p-1',
  'ds:origin-(--radix-popper-transform-origin)',
  'ds:data-[state=open]:ds-anim-fade-in ds:data-[state=closed]:ds-anim-fade-out',
].join(' ');

/** Cabeçalho e rodapé, iguais nos dois modais. */
export const overlaySlots = {
  header: 'ds:flex ds:flex-col ds:gap-2xs ds:text-center ds:sm:text-left',
  title: 'ds:font-sans ds:text-lg ds:leading-none ds:font-semibold ds:text-foreground',
  description: 'ds:font-sans ds:text-sm ds:text-muted-foreground',
  // Em telas estreitas os botões empilham com o principal EM CIMA: o polegar
  // alcança a parte de baixo com mais facilidade, e a ação principal não deve
  // ser a mais fácil de tocar por acidente num diálogo destrutivo.
  footer: 'ds:flex ds:flex-col-reverse ds:gap-sm ds:sm:flex-row ds:sm:justify-end',
} as const;
