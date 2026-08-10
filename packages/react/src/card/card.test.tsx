/**
 * Card — composição e semântica.
 *
 * Sem contrato executável compartilhado: o Card é agrupamento visual, e o que ele
 * garante não é comportamento, é a ausência de semântica inventada. Testar isso
 * numa suíte multiplataforma verificaria o renderizador, não a nossa regra.
 */

import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import axe from 'axe-core';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

afterEach(cleanup);

const exemplo = (
  <Card>
    <CardHeader>
      <CardTitle>Setor Centro</CardTitle>
      <CardDescription>120 vagas rotativas</CardDescription>
    </CardHeader>
    <CardContent>Conteúdo</CardContent>
    <CardFooter>Rodapé</CardFooter>
  </Card>
);

describe('Card', () => {
  it('marca cada parte com seu data-slot', () => {
    const { container } = render(exemplo);
    for (const slot of ['card', 'card-header', 'card-title', 'card-description', 'card-content', 'card-footer']) {
      expect(container.querySelector(`[data-slot="${slot}"]`), `faltou ${slot}`).not.toBe(null);
    }
  });

  it('NÃO inventa nível de cabeçalho no título', () => {
    // Chutar <h3> produz documento com cabeçalhos fora de ordem, que atrapalha a
    // navegação por leitor de tela mais do que a ausência de cabeçalho. Quem sabe
    // o nível é a tela.
    render(exemplo);
    expect(screen.queryByRole('heading')).toBe(null);
    expect(screen.getByText('Setor Centro').tagName).toBe('DIV');
  });

  it('não impõe papel de região ao card', () => {
    // Um `role="region"` sem nome acessível vira "região" anunciada sem dizer
    // qual. Quem precisa disso declara na tela, com aria-labelledby apontando
    // para o título.
    const { container } = render(exemplo);
    expect(container.querySelector('[data-slot="card"]')?.getAttribute('role')).toBe(null);
  });

  it('aceita className em todas as partes', () => {
    const { container } = render(
      <Card className="ds:mt-2">
        <CardContent className="ds:pb-0">Conteúdo</CardContent>
      </Card>,
    );
    expect(container.querySelector('[data-slot="card"]')?.className).toContain('ds:mt-2');
    expect(container.querySelector('[data-slot="card-content"]')?.className).toContain('ds:pb-0');
  });

  it('não tem violação de acessibilidade', async () => {
    const { container } = render(exemplo);
    const resultado = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
