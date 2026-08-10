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
import darkTokens from '../dist/index.dark.mjs';
// Mesma implementação que a galeria do Storybook consome. Duas cópias da fórmula
// divergiriam no arredondamento, e aí a galeria diria "passa" enquanto o CI diz
// "reprova" — o pior resultado possível para um contrato.
import { contrast } from '../src/contrast.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const readJson = (p) => JSON.parse(readFileSync(join(HERE, p), 'utf8'));

const contract = readJson('../contrast-pairs.json');
const primitives = readJson('../src/primitive/color.json');

/**
 * Os dois temas emitidos, cada um com o campo do contrato que registra a medida.
 *
 * Um par permitido precisa atingir o mínimo NOS DOIS. Antes disso o contrato só
 * media o claro, e o tema escuro — que já rodava em produção no front — nunca
 * tinha passado por verificação nenhuma.
 */
const TEMAS = [
  { nome: 'claro', tokens: semanticTokens, campo: 'measured' },
  { nome: 'escuro', tokens: darkTokens, campo: 'measuredDark' },
];

/**
 * Resolve o caminho de um token para o hex final, no tema pedido.
 *
 * Semânticos vêm do build (valor já resolvido). Primitivos vêm da fonte, porque o
 * build deliberadamente não os emite — e as combinações PROIBIDAS precisam citá-los
 * para poderem ser proibidas. Primitivo é o mesmo nos dois temas: o que muda é
 * para qual degrau cada semântico aponta.
 */
function resolve(path, tokens = semanticTokens) {
  const segments = path.split('.');
  const root = segments[0] === 'base' ? primitives : tokens;
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

  for (const tema of TEMAS) {
    describe(`pares permitidos atingem o mínimo WCAG — tema ${tema.nome}`, () => {
      for (const pair of contract.allowed) {
        it(`${pair.id}: ${pair.foreground} sobre ${pair.background} ≥ ${pair.min}:1`, () => {
          const ratio = contrast(resolve(pair.foreground, tema.tokens), resolve(pair.background, tema.tokens));
          expect(
            ratio,
            `${pair.id} caiu para ${ratio.toFixed(2)}:1 no tema ${tema.nome}, abaixo do mínimo de ${pair.min}:1`,
          ).toBeGreaterThanOrEqual(pair.min);
        });
      }
    });
  }

  it('todo par permitido declara a medida dos dois temas', () => {
    // Sem isto, adicionar um par sem `measuredDark` passaria despercebido e o
    // tema escuro voltaria a ficar sem registro do que foi medido.
    const semEscuro = contract.allowed.filter((p) => typeof p.measuredDark !== 'number');
    expect(semEscuro.map((p) => p.id), 'pares sem measuredDark').toEqual([]);
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

    // Proibidos citam primitivo, que não muda com o tema — só os permitidos têm
    // medida por tema.
    for (const pair of contract.allowed) {
      it(`${pair.id}: measuredDark declarado como ${pair.measuredDark}`, () => {
        const ratio = contrast(resolve(pair.foreground, darkTokens), resolve(pair.background, darkTokens));
        expect(
          Number(ratio.toFixed(2)),
          `contrast-pairs.json diz measuredDark ${pair.measuredDark} mas o valor real é ${ratio.toFixed(2)}`,
        ).toBeCloseTo(pair.measuredDark, 1);
      });
    }
  });

  it('a cor de marca não foi alterada por acidente', () => {
    // #02cb03 é o valor de referência de toda a identidade, e toda a escala é
    // derivada dele. Note que a marca NÃO é a superfície de ação — são coisas
    // diferentes, e confundi-las é o erro que este teste separa do próximo.
    expect(resolve('base.color.brand.500')).toBe('#02cb03');
    expect(resolve('color.brand.default')).toBe('#02cb03');
  });

  it('a superfície de ação primária não é o verde do símbolo', () => {
    // O verde puro com texto branco dá 2,20:1. A ação usa um tom escuro (6,41:1).
    // Se alguém "simplificar" apontando a ação para a cor de marca, isto pega —
    // é justamente o defeito que existe hoje no parking-new-front.
    const surface = resolve('color.action.primary.background.default');
    expect(surface).not.toBe(resolve('color.brand.default'));
    expect(resolve('color.action.primary.foreground.default')).toBe('#ffffff');
  });
});
