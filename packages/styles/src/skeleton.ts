/**
 * Receita do Skeleton — o bloco cinza que ocupa o lugar do conteúdo enquanto ele
 * carrega.
 *
 * Não tem variante nem tamanho: a forma vem de quem usa, porque um esqueleto só
 * serve se tiver a medida do conteúdo que substitui. Dar-lhe tamanhos próprios
 * (`sm`/`md`/`lg`) produziria blocos que não correspondem a nada na tela.
 */

export const skeletonVariants = (): string =>
  [
    'ds:animate-pulse ds:rounded-md ds:bg-accent',
    // Sem animação, o esqueleto vira um bloco cinza parado — que é o
    // comportamento correto: quem pede movimento reduzido não deve receber
    // pulsação, e um retângulo estático continua comunicando "aqui vem algo".
    'ds:motion-reduce:animate-none',
  ].join(' ');
