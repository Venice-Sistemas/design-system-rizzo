/**
 * Conformidade do Select de React ao contrato compartilhado.
 *
 * As asserções NÃO estão aqui — estão em @venice-sistemas/contracts/select.
 * Este arquivo só ensina a montar o componente.
 */

import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { runSelectContract } from '@venice-sistemas/contracts/select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

interface Opcao {
  value: string;
  label: string;
  disabled?: boolean;
}

let container: HTMLDivElement | null = null;
let root: Root | null = null;

runSelectContract({
  nome: 'Select (react)',

  render(props) {
    const { opcoes, placeholder, ...raiz } = props as {
      opcoes: Opcao[];
      placeholder?: string;
    } & Record<string, unknown>;

    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);

    act(() => {
      root!.render(
        <Select {...raiz}>
          <SelectTrigger aria-label={raiz['aria-label'] as string} aria-invalid={raiz['aria-invalid'] as boolean}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {opcoes.map((opcao) => (
              <SelectItem key={opcao.value} value={opcao.value} disabled={opcao.disabled}>
                {opcao.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>,
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
