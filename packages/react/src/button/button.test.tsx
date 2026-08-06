/**
 * Testes do Button — cada bloco corresponde a uma seção de docs/contracts/button.md.
 *
 * O que NÃO é testado aqui: classe CSS e estrutura de DOM. Isso é implementação, e
 * travar implementação em teste é o que impede trocar a camada interna depois — a
 * coisa exata que PA-9 existe para preservar. O que se testa é comportamento
 * observável: o que o usuário faz e o que o leitor de tela recebe.
 */

import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { Button } from './button';

afterEach(cleanup);

describe('Button', () => {
  describe('elemento e papel', () => {
    it('renderiza um <button> nativo, não um div com role', async () => {
      render(<Button>Registrar</Button>);
      const button = screen.getByRole('button', { name: 'Registrar' });
      expect(button.tagName).toBe('BUTTON');
    });

    it('usa type="button" por padrão', () => {
      // Sem isto, um botão dentro de <form> submete o formulário sem querer —
      // o padrão do HTML é "submit", e é uma armadilha clássica.
      render(<Button>Registrar</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('aceita type="submit" quando é isso que se quer', () => {
      render(<Button type="submit">Salvar</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('teclado', () => {
    it('recebe foco por Tab', async () => {
      const user = userEvent.setup();
      render(<Button>Registrar</Button>);
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('aciona com Enter', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Registrar</Button>);
      await user.tab();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('aciona com Espaço', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Registrar</Button>);
      await user.tab();
      await user.keyboard(' ');
      expect(onClick).toHaveBeenCalledOnce();
    });
  });

  describe('desabilitado', () => {
    it('não aciona no clique', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button disabled onClick={onClick}>
          Registrar
        </Button>,
      );
      await user.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('sai da ordem de tabulação', async () => {
      const user = userEvent.setup();
      render(<Button disabled>Registrar</Button>);
      await user.tab();
      expect(screen.getByRole('button')).not.toHaveFocus();
    });
  });

  describe('carregando', () => {
    it('anuncia estado ocupado', () => {
      render(<Button loading>Registrar</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('CONTINUA focável — carregando não é desabilitado', async () => {
      // Se usasse `disabled`, o elemento sairia da ordem de tabulação e o foco
      // cairia no body no meio da ação. Quem navega por teclado se perderia, e o
      // leitor de tela não anunciaria a mudança de estado em elemento desabilitado.
      const user = userEvent.setup();
      render(<Button loading>Registrar</Button>);
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('preserva o nome acessível', () => {
      // O rótulo some da vista por opacidade, não por `visibility` nem
      // `aria-hidden` — os dois o removeriam da árvore de acessibilidade, e o
      // leitor de tela anunciaria só "botão, ocupado".
      render(<Button loading>Registrar</Button>);
      expect(screen.getByRole('button')).toHaveAccessibleName('Registrar');
    });

    it('esconde o rótulo por opacidade, num elemento que gera caixa', () => {
      // Regressão: o wrapper já usou `display: contents`, que não gera caixa —
      // e sem caixa `opacity` não se aplica. O rótulo ficava visível com o
      // spinner desenhado por cima. jsdom não calcula layout, então o que dá
      // para travar aqui é a classe; o visual é conferido no sandbox.
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

    it('ignora o clique', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Registrar
        </Button>,
      );
      await user.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('nome acessível', () => {
    it('avisa no console quando não há nome', () => {
      // Botão só de ícone sem aria-label é mudo no leitor de tela e parece normal
      // para quem enxerga. Tornar o caminho inacessível barulhento é o que faz
      // PA-3 valer: a acessibilidade é responsabilidade do componente.
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<Button />);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('sem nome acessível'), expect.anything());
      warn.mockRestore();
    });

    it('não avisa quando há aria-label', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<Button aria-label="Fechar">✕</Button>);
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  describe('acessibilidade automatizada', () => {
    /**
     * `color-contrast` fica DESLIGADA aqui, e não por conveniência.
     *
     * O jsdom não tem layout nem canvas, então o axe não consegue avaliar a regra —
     * ele apenas falha por dentro e segue em frente. O resultado seria pior que
     * inútil: a suíte passaria dando a impressão de que o contraste foi verificado.
     *
     * Contraste é verificado de verdade em @rizzopark/tokens, contra os valores
     * resolvidos do build, e lá ele quebra o build. Um lugar só, e o certo.
     */
    const run = (container: HTMLElement) => axe.run(container, { rules: { 'color-contrast': { enabled: false } } });

    // O que sobra aqui é violação estrutural. Continua não pegando ordem de foco
    // sem sentido nem rótulo que mente — isso exige auditoria manual antes de
    // o componente ser considerado `estável`.
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

  describe('padrões do shadcn', () => {
    it('marca o elemento com data-slot', () => {
      render(<Button>Registrar</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button');
    });

    it('expõe data-loading como gancho de estilo', () => {
      render(<Button loading>Registrar</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-loading', 'true');
    });

    it('a variante padrão é a cor primária', () => {
      // Pedido explícito: o botão nasce com a cor da marca. Como `default` é o
      // valor omitido, isto trava que ele e `variant="default"` são a mesma coisa.
      render(<Button>Registrar</Button>);
      const semVariante = screen.getByRole('button').className;
      cleanup();

      render(<Button variant="default">Registrar</Button>);
      const comDefault = screen.getByRole('button').className;

      expect(semVariante).toBe(comDefault);
      expect(semVariante).toContain('bg-primary');
    });
  });
});
