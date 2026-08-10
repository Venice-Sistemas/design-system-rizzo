/**
 * Leitura da SAÍDA DO BUILD.
 *
 * Nada nesta galeria é escrito à mão — todas as páginas iteram sobre o que o
 * Style Dictionary gerou. É essa propriedade que faz a galeria valer a pena:
 * uma folha de swatches mantida manualmente desatualiza em uma semana, e aí
 * passa a mentir com aparência de documentação.
 *
 * Teste da propriedade: mude um valor em packages/tokens/src/primitive/color.json,
 * rode o build, e a galeria muda sem nenhuma edição aqui.
 */

import semantic from '@venice-sistemas/tokens';
import primitivesJson from '@venice-sistemas/tokens/primitives.json';

export type Leaf = string | number;

export interface FlatToken {
  /** Caminho pontuado, como aparece na fonte: `color.action.primary.background.default`. */
  path: string;
  segments: string[];
  /** Nome da variável CSS correspondente, sem os dois hífens. */
  cssVar: string;
  value: Leaf;
}

const isLeaf = (node: unknown): node is Leaf => typeof node === 'string' || typeof node === 'number';

function flatten(node: unknown, prefix: string[] = [], out: FlatToken[] = []): FlatToken[] {
  if (!node || typeof node !== 'object') return out;
  for (const [key, child] of Object.entries(node as Record<string, unknown>)) {
    if (key.startsWith('$')) continue;
    const segments = [...prefix, key];
    if (isLeaf(child)) {
      out.push({ path: segments.join('.'), segments, cssVar: `--rp-${segments.join('-')}`, value: child });
    } else {
      flatten(child, segments, out);
    }
  }
  return out;
}

/** Tokens semânticos — a interface pública. */
export const semanticTokens = flatten(semantic);

/**
 * Camada primitiva. Vem de um artefato somente-documentação: o build de produto
 * não emite `base`, então a única forma de a galeria desenhar as escalas é este
 * arquivo. Nunca consumir em aplicação.
 */
export const primitiveTokens = flatten((primitivesJson as { base?: unknown }).base ?? {}, ['base']);

/** Filtra por prefixo de caminho: `group(semanticTokens, 'color.action')`. */
export const group = (tokens: FlatToken[], prefix: string): FlatToken[] =>
  tokens.filter((token) => token.path === prefix || token.path.startsWith(`${prefix}.`));

/** Devolve as escalas de cor primitivas na forma { brand: [...degraus], ... }. */
export function colorRamps(): Record<string, FlatToken[]> {
  const ramps: Record<string, FlatToken[]> = {};
  for (const token of group(primitiveTokens, 'base.color')) {
    const [, , family, step] = token.segments;
    if (!step) continue; // white e black não são escalas
    (ramps[family!] ??= []).push(token);
  }
  return ramps;
}

export const isHex = (value: Leaf): value is string => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
