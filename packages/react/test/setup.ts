import '@testing-library/jest-dom/vitest';

/**
 * jsdom não implementa Pointer Capture nem `scrollIntoView`, e o Radix depende
 * dos dois para abrir painéis ancorados. Sem estes stubs o Select nem abre no
 * teste — o clique estoura em `hasPointerCapture is not a function`, e a suíte
 * de contrato reprovaria por limitação do ambiente, não por divergência do
 * componente.
 *
 * Não é maquiagem: o que se está verificando é papel, teclado e estado
 * anunciado. A captura de ponteiro é detalhe de como o navegador entrega o
 * evento, e nenhuma asserção do contrato fala dela.
 */
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
