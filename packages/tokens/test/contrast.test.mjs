/**
 * Contrato de contraste executável (AD-07).
 *
 * Este teste é a razão de `contrast-pairs.json` existir. Ele lê a SAÍDA DO BUILD —
 * não a fonte — porque o que chega no produto é o valor resolvido. Se um alias for
 * reapontado para um degrau mais claro, é aqui que aparece.
 *
 * Contraste é a única regra de acessibilidade 100% automatizável. Não automatizá-la
 * seria desperdício, então ela quebra o build.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import semanticTokens from '../dist/index.mjs';
// Mesma implementação que a galeria do Storybook consome. Duas cópias da fórmula
// divergiriam no arredondamento, e aí a galeria diria "passa" enquanto o CI diz
// "reprova" — o pior resultado possível para um contrato.
import { contrast } from '../src/contrast.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const readJson = (p) => JSON.parse(readFileSync(join(HERE, p), 'utf8'));

const contract = readJson('../contrast-pairs.json');
const primitives = readJson('../src/primitive/color.json');

/**
 * Resolve o caminho de um token para o hex final.
 *
 * Semânticos vêm do build (valor já resolvido). Primitivos vêm da fonte, porque o
 * build deliberadamente não os emite — e as combinações PROIBIDAS precisam citá-los
 * para poderem ser proibidas.
 */
function resolve(path) {
  const segments = path.split('.');
  const root = segments[0] === 'base' ? primitives : semanticTokens;
  let node = root;
  for (const key of segments) {
    node = node?.[key];
    if (node === undefined) throw new Error(`token não encontrado: ${path}`);
  }
  const value = typeof node === 'object' ? (node.$value ?? node.value) : node;
  if (typeof value !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error(`token ${path} não resolveu para um hex: ${JSON.stringify(value)}`);
  }
  return value;
}

/* --- Testes --------------------------------------------------------------- */

describe('contrato de contraste', () => {
  it('declara pares — o contrato não pode ficar vazio sem alguém perceber', () => {
    expect(contract.allowed.length).toBeGreaterThan(0);
    expect(contract.forbidden.length).toBeGreaterThan(0);
  });

  describe('pares permitidos atingem o mínimo WCAG', () => {
    for (const pair of contract.allowed) {
      it(`${pair.id}: ${pair.foreground} sobre ${pair.background} ≥ ${pair.min}:1`, () => {
        const ratio = contrast(resolve(pair.foreground), resolve(pair.background));
        expect(
          ratio,
          `${pair.id} caiu para ${ratio.toFixed(2)}:1, abaixo do mínimo de ${pair.min}:1`,
        ).toBeGreaterThanOrEqual(pair.min);
      });
    }
  });

  describe('combinações proibidas continuam reprovando', () => {
    // Se alguma passar a atingir 4,5:1, a proibição virou mentira e a documentação
    // precisa mudar — não é motivo de comemoração silenciosa.
    for (const pair of contract.forbidden) {
      it(`${pair.id}: ${pair.foreground} sobre ${pair.background} < 4.5:1`, () => {
        const ratio = contrast(resolve(pair.foreground), resolve(pair.background));
        expect(
          ratio,
          `${pair.id} agora atinge ${ratio.toFixed(2)}:1 — a proibição precisa ser revista`,
        ).toBeLessThan(4.5);
      });
    }
  });

  describe('os valores documentados batem com a realidade', () => {
    // Impede que `measured` vire ficção. Mudou um token? Este teste falha junto e
    // obriga a atualizar o contrato conscientemente, em vez de deixá-lo apodrecer.
    for (const pair of [...contract.allowed, ...contract.forbidden]) {
      it(`${pair.id}: measured declarado como ${pair.measured}`, () => {
        const ratio = contrast(resolve(pair.foreground), resolve(pair.background));
        expect(
          Number(ratio.toFixed(2)),
          `contrast-pairs.json diz ${pair.measured} mas o valor real é ${ratio.toFixed(2)}`,
        ).toBeCloseTo(pair.measured, 1);
      });
    }
  });

  it('a cor de marca não foi alterada por acidente', () => {
    // #02cb03 é o valor de referência de toda a identidade. Toda a escala é derivada
    // dele, e o teste inteiro acima muda de significado se ele mudar.
    expect(resolve('base.color.brand.500')).toBe('#02cb03');
    expect(resolve('color.action.primary.background.default')).toBe('#02cb03');
  });

  it('a frente do botão primário é preta, não branca', () => {
    // Regra que existe por causa desta marca especificamente: branco sobre #02cb03
    // dá 2,20:1. Se alguém "corrigir" para branco, isto pega.
    expect(resolve('color.action.primary.foreground.default')).toBe('#000000');
  });
});
