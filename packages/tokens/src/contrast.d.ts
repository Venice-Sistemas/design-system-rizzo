export declare const WCAG: {
  /** 1.4.3 — texto normal. */
  readonly TEXT: 4.5;
  /** 1.4.3 — texto grande (≥18pt, ou ≥14pt em negrito). */
  readonly LARGE_TEXT: 3;
  /** 1.4.11 — componentes de interface e objetos gráficos. */
  readonly NON_TEXT: 3;
};

/** Luminância relativa (WCAG 2.x), de 0 (preto) a 1 (branco). */
export declare function luminance(hex: string): number;

/** Razão de contraste entre duas cores, de 1 (idênticas) a 21 (preto/branco). */
export declare function contrast(a: string, b: string): number;

export interface ContrastCheck {
  /** Valor bruto, sem arredondar. */
  ratio: number;
  /** Arredondado para 2 casas — use este para exibir, para bater com o teste. */
  rounded: number;
  min: number;
  passes: boolean;
}

/** Avalia um par frente/fundo contra um mínimo WCAG. */
export declare function check(foreground: string, background: string, min?: number): ContrastCheck;
