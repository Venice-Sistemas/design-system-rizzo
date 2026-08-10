/**
 * Badge — o que é possível verificar sem contrato compartilhado.
 *
 * Não há `badge.contract.test.tsx` de propósito: badge não tem comportamento.
 * É um `<span>` com texto e cor, e um contrato executável sobre isso verificaria
 * a biblioteca de render, não a nossa regra. O repositório é explícito quanto a
 * isso — teste cerimonial ensina o time a ignorar a prática.
 *
 * O que importa e é testável está aqui: o elemento certo, a variante exposta como
 * dado, e a ausência de semântica de controle.
 */

import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import axe from 'axe-core';
import { Badge } from './badge';

afterEach(cleanup);

describe('Badge', () => {
  it('renderiza um span, não um elemento interativo', () => {
    // Badge com semântica de botão esconde um controle de quem navega por
    // teclado: ele apareceria na ordem de tabulação sem fazer nada.
    render(<Badge>Pago</Badge>);
    const badge = screen.getByText('Pago');
    expect(badge.tagName).toBe('SPAN');
    expect(badge.getAttribute('role')).toBe(null);
    expect(badge.tabIndex).toBe(-1);
  });

  it('marca o elemento com data-slot', () => {
    render(<Badge>Pago</Badge>);
    expect(screen.getByText('Pago').getAttribute('data-slot')).toBe('badge');
  });

  it('expõe a variante como data-variant', () => {
    render(<Badge variant="destructive">Irregular</Badge>);
    expect(screen.getByText('Irregular').getAttribute('data-variant')).toBe('destructive');
  });

  it('usa default quando a variante é omitida', () => {
    render(<Badge>Regular</Badge>);
    expect(screen.getByText('Regular').getAttribute('data-variant')).toBe('default');
  });

  it.each(['default', 'secondary', 'destructive', 'outline'] as const)(
    'aceita variant="%s"',
    (variant) => {
      render(<Badge variant={variant}>Status</Badge>);
      expect(screen.getByText('Status').getAttribute('data-variant')).toBe(variant);
    },
  );

  it('aceita className como escape hatch', () => {
    render(<Badge className="ds:mt-2">Pago</Badge>);
    expect(screen.getByText('Pago').className).toContain('ds:mt-2');
  });

  it('renderiza o filho no lugar do span com asChild', () => {
    render(
      <Badge asChild>
        <a href="/tickets">Ver tickets</a>
      </Badge>,
    );
    const link = screen.getByRole('link', { name: 'Ver tickets' });
    expect(link.getAttribute('data-slot')).toBe('badge');
  });

  it('não tem violação de acessibilidade', async () => {
    // `color-contrast` desligada pelo mesmo motivo do Button: o jsdom não tem
    // layout nem canvas, o axe não consegue avaliar a regra e passaria dando a
    // impressão de ter verificado. Contraste é medido em @venice-sistemas/tokens.
    const { container } = render(<Badge>Pago</Badge>);
    const resultado = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
