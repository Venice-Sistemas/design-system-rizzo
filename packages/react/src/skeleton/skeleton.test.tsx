/**
 * Skeleton — o que ele NÃO deve fazer.
 *
 * A regra que importa aqui é de acessibilidade, não de aparência: o esqueleto é
 * decoração de carregamento e precisa sair da árvore acessível. Uma tela cheia de
 * esqueletos anunciados vira uma sequência de caixas vazias no leitor de tela.
 */

import { describe, expect, it, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import axe from 'axe-core';
import { Skeleton } from './skeleton';

afterEach(cleanup);

describe('Skeleton', () => {
  it('sai da árvore acessível', () => {
    const { container } = render(<Skeleton className="ds:h-4 ds:w-32" />);
    expect(container.querySelector('[data-slot="skeleton"]')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('marca o elemento com data-slot', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBe(null);
  });

  it('recebe a forma de quem usa', () => {
    // Sem tamanho próprio de propósito: um esqueleto só cumpre a função se tiver
    // a medida do conteúdo que substitui.
    const { container } = render(<Skeleton className="ds:h-10 ds:w-full ds:rounded-full" />);
    const el = container.querySelector('[data-slot="skeleton"]');
    expect(el?.className).toContain('ds:h-10');
    expect(el?.className).toContain('ds:rounded-full');
  });

  it('respeita a preferência por movimento reduzido', () => {
    // Sem animação o esqueleto vira um bloco parado, que continua comunicando
    // "aqui vem algo" — degradação correta, não perda de função.
    const { container } = render(<Skeleton />);
    expect(container.querySelector('[data-slot="skeleton"]')?.className).toContain(
      'ds:motion-reduce:animate-none',
    );
  });

  it('não tem violação de acessibilidade', async () => {
    const { container } = render(<Skeleton className="ds:h-4 ds:w-32" />);
    const resultado = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
