/**
 * O que é ESPECÍFICO da implementação React.
 *
 * Comportamento — papel, teclado, desabilitado, carregando, nome acessível — não
 * está aqui. Está em @rizzopark/contracts/button, rodando via
 * button.contract.test.tsx, e a mesma suíte vai rodar contra Angular. Duplicar
 * aqui faria este arquivo virar a fonte da verdade do comportamento, que é
 * exatamente o que o contrato existe para impedir.
 *
 * Sobra o que só faz sentido em React: `asChild`, ref, escape hatch de classe, e
 * detalhes de implementação que já causaram bug e merecem trava.
 */

import { describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import axe from 'axe-core';
import { afterEach } from 'vitest';
import { Button } from './button';

afterEach(cleanup);

describe('Button (react)', () => {
  describe('asChild', () => {
    it('renderiza o filho no lugar do button, herdando o estilo', () => {
      render(
        <Button asChild variant="link">
          <a href="/areas">Ver áreas</a>
        </Button>,
      );
      const link = screen.getByRole('link', { name: 'Ver áreas' });
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('data-slot', 'button');
      expect(link.className).toContain('ds:');
    });

    it('não emite type nem disabled no elemento delegado', () => {
      // Um <a> não tem nenhum dos dois. Emiti-los produz HTML inválido, e
      // `disabled` num link não faz nada além de confundir quem inspeciona.
      render(
        <Button asChild>
          <a href="/areas">Ver áreas</a>
        </Button>,
      );
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('type');
      expect(link).not.toHaveAttribute('disabled');
    });
  });

  describe('escape hatch', () => {
    it('aceita className sem perder as classes próprias', () => {
      render(<Button className="minha-classe">Registrar</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('minha-classe');
      expect(button.className.length).toBeGreaterThan('minha-classe'.length);
    });

    it('encaminha a ref', () => {
      const ref = { current: null } as React.RefObject<HTMLButtonElement | null>;
      render(<Button ref={ref as React.RefObject<HTMLButtonElement>}>Registrar</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('regressões de implementação', () => {
    it('o wrapper do rótulo gera caixa — nunca display:contents', () => {
      // Já usou `contents`, que não gera caixa. Sem caixa, `opacity` não se
      // aplica: o rótulo ficava visível com o indicador desenhado por cima.
      // jsdom não calcula layout, então o que dá para travar aqui é a classe.
      const { container } = render(<Button loading>Registrar</Button>);
      const wrapper = container.querySelector('button > span:not([aria-hidden])');
      expect(wrapper?.className).toContain('opacity-0');
      expect(wrapper?.className).not.toContain('contents');
    });

    it('renderiza o indicador só quando carregando', () => {
      const { container } = render(<Button loading>Registrar</Button>);
      expect(container.querySelector('button > span[aria-hidden="true"]')).not.toBeNull();
      cleanup();
      const { container: parado } = render(<Button>Registrar</Button>);
      expect(parado.querySelector('button > span[aria-hidden="true"]')).toBeNull();
    });

    it('a variante omitida é idêntica a variant="default"', () => {
      render(<Button>Registrar</Button>);
      const omitida = screen.getByRole('button').className;
      cleanup();

      render(<Button variant="default">Registrar</Button>);
      const explicita = screen.getByRole('button').className;

      expect(omitida).toBe(explicita);
      expect(omitida).toContain('bg-primary');
    });

    it('a altura vem de token, não de valor cru', () => {
      // Se a implementação hardcodar `h-9`, os tokens viram decoração e a
      // próxima plataforma não tem de onde derivar a medida.
      render(<Button size="lg">Registrar</Button>);
      expect(screen.getByRole('button').className).toContain('--rp-size-control-lg');
    });
  });

  describe('acessibilidade automatizada', () => {
    /**
     * `color-contrast` fica DESLIGADA. O jsdom não tem layout nem canvas, então o
     * axe não consegue avaliar a regra — ele falha por dentro e segue. A suíte
     * passaria dando a impressão de ter verificado.
     *
     * Contraste é verificado de verdade em @rizzopark/tokens, contra os valores
     * resolvidos do build, onde quebra o CI. Um lugar só, e o certo.
     */
    const run = (container: HTMLElement) => axe.run(container, { rules: { 'color-contrast': { enabled: false } } });

    for (const variant of ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const) {
      it(`variante ${variant} sem violações`, async () => {
        const { container } = render(<Button variant={variant}>Registrar</Button>);
        expect((await run(container)).violations).toEqual([]);
      });
    }

    it('sem violações quando desabilitado', async () => {
      const { container } = render(<Button disabled>Registrar</Button>);
      expect((await run(container)).violations).toEqual([]);
    });

    it('sem violações quando carregando', async () => {
      const { container } = render(<Button loading>Registrar</Button>);
      expect((await run(container)).violations).toEqual([]);
    });
  });
});
