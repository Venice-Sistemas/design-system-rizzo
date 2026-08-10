/**
 * Conformidade do Dialog ao contrato compartilhado de modal.
 *
 * As asserções estão em @venice-sistemas/contracts/modal — a mesma suíte roda
 * contra o AlertDialog, com `dispensavel: false`.
 */

import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { runModalContract } from '@venice-sistemas/contracts/modal';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from './dialog';

let container: HTMLDivElement | null = null;
let root: Root | null = null;

runModalContract({
  nome: 'Dialog (react)',
  slot: 'dialog-content',
  dispensavel: true,

  render(props) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    act(() => {
      root!.render(
        <Dialog {...props}>
          <DialogTrigger>Abrir</DialogTrigger>
          <DialogContent>
            <DialogTitle>Encerrar ticket</DialogTitle>
            <DialogDescription>O veículo será liberado.</DialogDescription>
          </DialogContent>
        </Dialog>,
      );
    });
  },

  cleanup() {
    act(() => root?.unmount());
    container?.remove();
    root = null;
    container = null;
  },
});
