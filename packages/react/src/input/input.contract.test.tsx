/**
 * Conformidade do Input de React ao contrato compartilhado.
 *
 * As asserções NÃO estão aqui — estão em @venice-sistemas/contracts/input. Este
 * arquivo só ensina a montar o componente.
 */

import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { runInputContract } from '@venice-sistemas/contracts/input';
import { Input, type InputProps } from './input';

let container: HTMLDivElement | null = null;
let root: Root | null = null;

runInputContract({
  nome: 'Input (react)',

  render(props) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    act(() => {
      root!.render(<Input {...(props as InputProps)} />);
    });
  },

  cleanup() {
    act(() => root?.unmount());
    container?.remove();
    root = null;
    container = null;
  },
});
