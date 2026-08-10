/**
 * Conformidade do Checkbox de React ao contrato compartilhado.
 *
 * As asserções NÃO estão aqui — estão em @venice-sistemas/contracts/checkbox.
 * Este arquivo só ensina a montar o componente.
 */

import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { runCheckboxContract } from '@venice-sistemas/contracts/checkbox';
import { Checkbox, type CheckboxProps } from './checkbox';

let container: HTMLDivElement | null = null;
let root: Root | null = null;

runCheckboxContract({
  nome: 'Checkbox (react)',

  render(props) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    act(() => {
      root!.render(<Checkbox {...(props as CheckboxProps)} />);
    });
  },

  cleanup() {
    act(() => root?.unmount());
    container?.remove();
    root = null;
    container = null;
  },
});
