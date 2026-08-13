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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './select';

interface Opcao {
  value: string;
  label: string;
  disabled?: boolean;
}

interface Grupo {
  label: string;
  opcoes: Opcao[];
}

function Opcoes({ opcoes }: { opcoes: Opcao[] }) {
  return opcoes.map((opcao) => (
    <SelectItem key={opcao.value} value={opcao.value} disabled={opcao.disabled}>
      {opcao.label}
    </SelectItem>
  ));
}

let container: HTMLDivElement | null = null;
let root: Root | null = null;

runSelectContract({
  nome: 'Select (react)',

  render(props) {
    const { opcoes, grupos, placeholder, ...raiz } = props as {
      opcoes?: Opcao[];
      grupos?: Grupo[];
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
            {grupos
              ? grupos.map((grupo) => (
                  <SelectGroup key={grupo.label}>
                    <SelectLabel>{grupo.label}</SelectLabel>
                    <Opcoes opcoes={grupo.opcoes} />
                  </SelectGroup>
                ))
              : <Opcoes opcoes={opcoes ?? []} />}
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
