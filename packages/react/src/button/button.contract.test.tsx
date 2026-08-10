/**
 * Conformidade do Button de React ao contrato compartilhado.
 *
 * As asserções NÃO estão aqui — estão em @venice-sistemas/contracts/button, e a mesma
 * suíte vai rodar contra Angular e React Native. Este arquivo só ensina a montar
 * o componente.
 *
 * O que sobra em button.test.tsx é o que é específico de React: `asChild`,
 * encaminhamento de ref, `className` como escape hatch e a varredura do axe.
 */

import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { runButtonContract } from '@venice-sistemas/contracts/button';
import { Button, type ButtonProps } from './button';

let container: HTMLDivElement | null = null;
let root: Root | null = null;

runButtonContract({
  nome: 'Button (react)',

  render(props) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    // `act` sem await: a montagem é síncrona e o contrato espera o elemento já
    // no DOM quando `render` retorna.
    act(() => {
      root!.render(<Button {...(props as ButtonProps)} />);
    });
  },

  cleanup() {
    act(() => root?.unmount());
    container?.remove();
    root = null;
    container = null;
  },
});
