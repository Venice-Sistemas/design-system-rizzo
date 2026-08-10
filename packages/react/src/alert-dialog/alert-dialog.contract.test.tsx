/**
 * Conformidade do AlertDialog ao contrato compartilhado de modal.
 *
 * Mesma suíte do Dialog, com `dispensavel: false` — é o parâmetro que descreve a
 * única diferença entre os dois.
 */

import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { runModalContract } from '@venice-sistemas/contracts/modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';

let container: HTMLDivElement | null = null;
let root: Root | null = null;

runModalContract({
  nome: 'AlertDialog (react)',
  slot: 'alert-dialog-content',
  dispensavel: false,

  render(props) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    act(() => {
      root!.render(
        <AlertDialog {...props}>
          <AlertDialogTrigger>Excluir</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Excluir irregularidade?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction variant="destructive">Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
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
