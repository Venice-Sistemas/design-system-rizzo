/**
 * Razão de contraste WCAG 2.x.
 *
 * Vive no pacote de tokens, e não dentro do teste, porque três consumidores
 * precisam da MESMA resposta: o teste que quebra o build, a galeria do Storybook
 * e (mais tarde) qualquer verificação em componente. Duas implementações da mesma
 * fórmula acabam divergindo no arredondamento, e aí a galeria diz que passa
 * enquanto o CI diz que reprova — o pior resultado possível para um contrato.
 *
 * Isto é TypeScript-free de propósito: é consumido por Node, por Vite e
 * potencialmente por ferramenta de design. Os tipos vão no .d.ts ao lado.
 */

/** Limiares WCAG 2.x. */
export const WCAG = {
  /** 1.4.3 — texto normal. */
  TEXT: 4.5,
  /** 1.4.3 — texto grande (≥18pt, ou ≥14pt em negrito). */
  LARGE_TEXT: 3,
  /** 1.4.11 — componentes de interface e objetos gráficos (borda, ícone, anel de foco). */
  NON_TEXT: 3,
};

const srgbToLinear = (channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);

const HEX = /^#([0-9a-fA-F]{6})$/;

function channels(hex) {
  const match = HEX.exec(String(hex).trim());
  if (!match) throw new TypeError(`esperava hex de 6 dígitos, recebi: ${JSON.stringify(hex)}`);
  return [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16) / 255);
}

/** Luminância relativa (WCAG 2.x), de 0 (preto) a 1 (branco). */
export function luminance(hex) {
  const [r, g, b] = channels(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste entre duas cores, de 1 (idênticas) a 21 (preto/branco). */
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/**
 * Avalia um par contra um mínimo. Devolve o número já arredondado para exibição,
 * para que galeria e teste mostrem exatamente o mesmo valor.
 */
export function check(foreground, background, min = WCAG.TEXT) {
  const ratio = contrast(foreground, background);
  return { ratio, rounded: Number(ratio.toFixed(2)), min, passes: ratio >= min };
}
