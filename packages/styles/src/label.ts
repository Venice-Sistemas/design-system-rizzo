/**
 * Receita do Label — o nome visível de um campo.
 *
 * `select-none` porque o duplo clique num rótulo seleciona a palavra em vez de
 * focar o campo, e o gesto de quem clica rápido duas vezes num rótulo é "quero
 * mexer neste campo", não "quero copiar esta palavra".
 *
 * O estado desabilitado vem do CAMPO, não do rótulo: `peer-disabled` lê o irmão
 * anterior. Um rótulo com prop `disabled` própria poderia ficar dessincronizado
 * do campo que ele nomeia.
 */

export const labelVariants = (): string =>
  [
    'ds:inline-flex ds:items-center ds:gap-2',
    'ds:font-sans ds:text-sm ds:leading-none ds:font-medium ds:text-foreground',
    'ds:select-none',
    // Token medido, não `opacity-50`: opacidade sobre o texto do rótulo o leva
    // para perto do fundo e o nome do campo é a última coisa que deve sumir.
    'ds:peer-disabled:cursor-not-allowed ds:peer-disabled:text-disabled-foreground',
  ].join(' ');
