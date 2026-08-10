/**
 * Conformidade do Alert de React ao contrato compartilhado.
 *
 * As asserções NÃO estão aqui — estão em @venice-sistemas/contracts/alert. Este
 * arquivo só ensina a montar o componente.
 */

import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { runAlertContract } from '@venice-sistemas/contracts/alert';
import { Alert, type AlertProps } from './alert';

let container: HTMLDivElement | null = null;
let root: Root | null = null;

runAlertContract({
  nome: 'Alert (react)',

  render(props) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    act(() => {
      root!.render(<Alert {...(props as AlertProps)} />);
    });
  },

  cleanup() {
    act(() => root?.unmount());
    container?.remove();
    root = null;
    container = null;
  },
});
