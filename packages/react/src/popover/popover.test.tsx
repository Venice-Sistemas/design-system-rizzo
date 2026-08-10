/**
 * Popover — o que o distingue de um Dialog.
 *
 * Sem contrato executável compartilhado: o Popover é uma caixa ancorada, e o que
 * ele garante em relação ao modal é uma AUSÊNCIA — não prende foco, não torna a
 * página inerte, não tem véu. Ausências se verificam melhor onde a plataforma
 * monta, porque o mecanismo que as produziria é específico dela.
 */

import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

afterEach(cleanup);

const exemplo = (props = {}) => (
  <>
    <button>antes</button>
    <Popover {...props}>
      <PopoverTrigger>Detalhes</PopoverTrigger>
      <PopoverContent>
        <p>Setor Centro, 120 vagas.</p>
      </PopoverContent>
    </Popover>
    <button>depois</button>
  </>
);

describe('Popover', () => {
  it('não renderiza o conteúdo fechado', () => {
    render(exemplo());
    expect(document.querySelector('[data-slot="popover-content"]')).toBe(null);
  });

  it('abre pelo gatilho', async () => {
    render(exemplo());
    await userEvent.click(screen.getByText('Detalhes'));
    expect(document.querySelector('[data-slot="popover-content"]')).not.toBe(null);
  });

  it('NÃO torna o resto da página inerte', async () => {
    // É a diferença para o Dialog. Um popover que esconde a página do leitor de
    // tela é um modal mal desenhado: ele não prende o foco, então a pessoa
    // continua alcançando o que foi escondido — e ouve silêncio.
    render(exemplo({ defaultOpen: true }));
    const conteudo = document.querySelector('[data-slot="popover-content"]')!;
    const raiz = [...document.body.children].find((f) => f.contains(conteudo));
    const irmaos = [...document.body.children].filter((f) => f !== raiz);
    expect(irmaos.some((i) => i.getAttribute('aria-hidden') === 'true')).toBe(false);
  });

  it('não tem véu', async () => {
    render(exemplo({ defaultOpen: true }));
    expect(document.querySelector('[data-slot="popover-scrim"]')).toBe(null);
  });

  it('fecha com Escape e devolve o foco ao gatilho', async () => {
    render(exemplo());
    const gatilho = screen.getByText('Detalhes');
    await userEvent.click(gatilho);
    await userEvent.keyboard('{Escape}');
    expect(document.querySelector('[data-slot="popover-content"]')).toBe(null);
    expect(document.activeElement).toBe(gatilho);
  });

  it('não tem violação de acessibilidade', async () => {
    const { container } = render(exemplo({ defaultOpen: true }));
    const resultado = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
