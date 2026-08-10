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
 * Superfície flutuante — o painel em si, sem posicionamento, raio nem sombra.
 *
 * Raio e elevação ficam em quem usa porque não são os mesmos: o diálogo é menos
 * arredondado e mais elevado que o popover, e a hierarquia de raio acompanha a de
 * elevação. Unificar os dois aqui achataria essa diferença.
 */
export const overlayPanel = [
  'ds:z-50 ds:border ds:border-border',
  'ds:bg-popover ds:text-popover-foreground',
  'ds:outline-none',
].join(' ');

/**
 * Painel centralizado na viewport — modais.
 *
 * A largura é limitada por `max-w`, nunca fixa: numa viewport estreita um painel
 * de largura fixa vaza para fora da tela e o botão de confirmar fica inalcançável.
 *
 * ARMADILHA: o teto de 32rem é escrito como valor arbitrário, e NÃO como
 * `max-w-lg`. A nossa escala de espaçamento usa nomes de camiseta
 * (`--spacing-sm/md/lg`), e o Tailwind resolve `max-w-*` pela escala de
 * espaçamento — então `max-w-lg` significa "espaçamento lg", 24px, e não a
 * largura de container de 32rem. O modal saía com 24px de largura, sem erro
 * nenhum. Vale para qualquer `max-w-`, `w-` ou `h-` com sufixo `sm`/`md`/`lg`.
 *
 * O `_` no `calc` também é obrigatório: valor arbitrário do Tailwind usa `_` no
 * lugar do espaço, e `calc(100%-2rem)` sem espaços é CSS inválido.
 */
export const overlayCentered = [
  'ds:fixed ds:top-1/2 ds:left-1/2 ds:-translate-x-1/2 ds:-translate-y-1/2',
  'ds:grid ds:w-full ds:max-w-[calc(100%_-_2rem)] ds:sm:max-w-[32rem] ds:gap-md ds:p-lg',
  'ds:rounded-lg ds:shadow-overlay',
  'ds:data-[state=open]:ds-anim-panel-in ds:data-[state=closed]:ds-anim-panel-out',
].join(' ');

/**
 * Painel ancorado a um gatilho — popover e menu.
 *
 * A origem da animação acompanha o lado em que o Radix decidiu abrir, senão o
 * painel cresce para o lado errado quando não cabe embaixo e ele vira para cima.
 *
 * O deslize também acompanha o lado: o painel entra vindo da direção do gatilho.
 * Sem isso o movimento contradiz a posição final quando o Radix vira o painel.
 */
export const overlayAnchored = [
  'ds:min-w-[8rem] ds:overflow-hidden',
  'ds:rounded-md ds:shadow-floating',
  'ds:origin-(--radix-popper-transform-origin)',
  'ds:data-[state=open]:ds-anim-fade-in ds:data-[state=closed]:ds-anim-fade-out',
  'ds:data-[side=bottom]:ds-anim-slide-from-top',
  'ds:data-[side=top]:ds-anim-slide-from-bottom',
  'ds:data-[side=left]:ds-anim-slide-from-right',
  'ds:data-[side=right]:ds-anim-slide-from-left',
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
