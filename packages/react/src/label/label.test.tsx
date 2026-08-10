/**
 * Label — o que justifica não usar @radix-ui/react-label.
 *
 * Sem contrato executável compartilhado: o que o Label faz de essencial é
 * associação, e associação é comportamento do NAVEGADOR. Uma suíte
 * multiplataforma sobre isso testaria o jsdom.
 *
 * O que está aqui é a prova de que o nativo cobre o caso — se algum destes
 * falhar, a decisão de dispensar o Radix precisa ser revista.
 */

import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { Label } from './label';
import { Input } from '../input/input';

afterEach(cleanup);

describe('Label', () => {
  it('é um <label> nativo', () => {
    render(<Label htmlFor="placa">Placa</Label>);
    expect(screen.getByText('Placa').tagName).toBe('LABEL');
  });

  it('marca o elemento com data-slot', () => {
    render(<Label htmlFor="placa">Placa</Label>);
    expect(screen.getByText('Placa').getAttribute('data-slot')).toBe('label');
  });

  it('dá nome acessível ao campo associado', () => {
    // É a razão de existir do componente. Sem `htmlFor`, o campo fica sem nome e
    // quem usa leitor de tela ouve "caixa de edição" e nada mais.
    render(
      <>
        <Label htmlFor="placa">Placa do veículo</Label>
        <Input id="placa" />
      </>,
    );
    expect(screen.getByLabelText('Placa do veículo')).toBeTruthy();
  });

  it('foca o campo ao clicar', async () => {
    render(
      <>
        <Label htmlFor="placa">Placa</Label>
        <Input id="placa" />
      </>,
    );
    await userEvent.click(screen.getByText('Placa'));
    expect(document.activeElement).toBe(screen.getByLabelText('Placa'));
  });

  it('não seleciona o texto no duplo clique', async () => {
    // O comportamento que o Radix acrescenta, reproduzido em três linhas. Quem
    // clica rápido duas vezes num rótulo quer mexer no campo, não copiar a
    // palavra.
    render(<Label htmlFor="placa">Placa</Label>);
    const rotulo = screen.getByText('Placa');
    const evento = new MouseEvent('mousedown', { bubbles: true, cancelable: true, detail: 2 });
    rotulo.dispatchEvent(evento);
    expect(evento.defaultPrevented).toBe(true);
  });

  it('permite ao chamador cancelar esse comportamento', () => {
    const rotuloProps = { onMouseDown: (e: React.MouseEvent) => e.preventDefault() };
    render(<Label htmlFor="placa" {...rotuloProps}>Placa</Label>);
    const evento = new MouseEvent('mousedown', { bubbles: true, cancelable: true, detail: 1 });
    screen.getByText('Placa').dispatchEvent(evento);
    expect(evento.defaultPrevented).toBe(true);
  });

  it('não tem violação de acessibilidade', async () => {
    const { container } = render(
      <>
        <Label htmlFor="placa">Placa</Label>
        <Input id="placa" />
      </>,
    );
    const resultado = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
