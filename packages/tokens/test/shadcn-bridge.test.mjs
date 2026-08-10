/**
 * A ponte shadcn é o que decide se o Design System é adotado.
 *
 * O build já falha se o mapa apontar para um token inexistente. Este teste cobre
 * o caso inverso: o formato regredir e deixar de emitir variáveis que o app
 * consome. O sintoma seria um componente perdendo a cor em produção, sem erro em
 * lugar nenhum — variável CSS ausente não avisa, só não pinta.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import tokens from '../dist/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(HERE, '../dist/shadcn.css'), 'utf8');

/**
 * Um mapa POR BLOCO, não um do arquivo inteiro.
 *
 * A ponte emite dois temas, e os dois declaram os mesmos nomes. Varrer o arquivo
 * de uma vez faria o último bloco sobrescrever o primeiro, e o teste passaria a
 * afirmar coisas sobre um tema achando que fala do outro.
 */
function bloco(seletor) {
  const re = new RegExp(`${seletor}\\s*\\{([^}]*)\\}`, 'm');
  const corpo = css.match(re);
  if (!corpo) throw new Error(`bloco ${seletor} não encontrado em shadcn.css`);
  return new Map(
    [...corpo[1].matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)].map((m) => [m[1], m[2].trim()]),
  );
}

const declared = bloco('^:root');
const declaredDark = bloco("^\\.dark,\\s*\\n\\[data-theme='dark'\\]");

/** O contrato mínimo do shadcn. Faltar qualquer um destes quebra componente. */
const CONTRATO_SHADCN = [
  'background', 'foreground',
  'card', 'card-foreground',
  'popover', 'popover-foreground',
  'primary', 'primary-foreground',
  'secondary', 'secondary-foreground',
  'muted', 'muted-foreground',
  'accent', 'accent-foreground',
  'destructive', 'destructive-foreground',
  'border', 'input', 'ring', 'radius',
];

describe('ponte shadcn', () => {
  it.each(CONTRATO_SHADCN)('declara --%s', (name) => {
    expect(declared.has(name)).toBe(true);
    expect(declared.get(name)).not.toMatch(/undefined|NaN|^$/);
  });

  it('cobre as séries de gráfico e a barra lateral', () => {
    for (const n of [1, 2, 3, 4, 5]) expect(declared.has(`chart-${n}`)).toBe(true);
    for (const n of ['sidebar', 'sidebar-primary', 'sidebar-ring']) expect(declared.has(n)).toBe(true);
  });

  it('todo valor é uma cor ou dimensão resolvida, nunca um var() pendurado', () => {
    // Se um valor sair como `var(--algo)`, a ponte virou indireção em vez de
    // ponte, e o app precisaria definir `--algo` — exatamente o acoplamento que
    // ela existe para remover.
    for (const [name, value] of declared) {
      expect(value, `--${name} não resolveu`).toMatch(/^(#[0-9a-f]{3,8}|\d+(\.\d+)?(px|rem)?|transparent)$/i);
    }
  });

  it('no tema claro, --primary NÃO é a cor de marca', () => {
    // O defeito que existia no parking-new-front: --primary apontava para o verde
    // do símbolo e dava 3,51:1 com texto branco. Adotar a ponte corrigiu isso, e
    // este teste impede que a correção se perca depois.
    expect(declared.get('primary')).not.toBe(tokens.color.brand.default);
    expect(declared.get('primary-foreground')).toBe('#ffffff');
  });

  it('no tema escuro, --primary É a cor de marca — com tinta escura por cima', () => {
    // A inversão é deliberada, não um descuido. Sobre fundo escuro o verde escuro
    // da ação desaparece; quem carrega a ação é o verde do símbolo, e o texto vira
    // escuro. É o mesmo padrão que o shadcn usa no dark.
    //
    // O que garante que isso é legível não é este teste, é o contrato de
    // contraste, que mede o par nos dois temas. Aqui só travamos a INTENÇÃO, para
    // ninguém "corrigir" o escuro achando que ele repetiu o defeito do claro.
    expect(declaredDark.get('primary')).toBe(tokens.color.brand.default);
    expect(declaredDark.get('primary-foreground')).not.toBe('#ffffff');
  });

  it('os dois temas declaram o mesmo conjunto de cores', () => {
    // Cobertura desigual é o defeito que ninguém percebe até trocar de tema e uma
    // variável cair para o valor do outro. `--radius` fica de fora dos dois lados:
    // raio não muda com tema e é declarado uma vez só, no :root.
    const cores = (m) => [...m.keys()].filter((k) => k !== 'radius').sort();
    expect(cores(declaredDark)).toEqual(cores(declared));
  });

  it('não emite variável específica de aplicação', () => {
    // Tela de autenticação, sombra de card e a fonte vinda do next/font são do
    // app. Emiti-las daqui faria o Design System opinar sobre coisa que não
    // conhece, e criaria conflito silencioso com quem já as define.
    for (const n of ['auth-canvas-top', 'auth-grid-line', 'brand-subtle', 'shadow-card', 'font-poppins']) {
      expect(declared.has(n), `--${n} é do app, não do Design System`).toBe(false);
    }
  });
});
