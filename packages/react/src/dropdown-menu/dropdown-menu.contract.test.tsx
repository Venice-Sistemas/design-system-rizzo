/**
 * Conformidade do DropdownMenu ao contrato compartilhado.
 *
 * As asserções estão em @venice-sistemas/contracts/menu. Este arquivo só ensina a
 * montar o componente.
 */

import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { runMenuContract } from '@venice-sistemas/contracts/menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

let container: HTMLDivElement | null = null;
let root: Root | null = null;

runMenuContract({
  nome: 'DropdownMenu (react)',

  render({ itemDesabilitado, onSelect, ...props }) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    act(() => {
      root!.render(
        <DropdownMenu {...props}>
          <DropdownMenuTrigger>Ações</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onSelect as () => void}>Editar</DropdownMenuItem>
            <DropdownMenuItem
              disabled={Boolean(itemDesabilitado)}
              onSelect={onSelect as () => void}
            >
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onSelect as () => void}>
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
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
