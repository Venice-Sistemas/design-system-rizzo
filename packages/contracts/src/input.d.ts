export interface InputContractHarness {
  /** Monta o componente no document.body com as props recebidas. */
  render: (props: Record<string, unknown>) => void | Promise<void>;
  /** Desmonta o que `render` montou. */
  cleanup: () => void;
  /** Aparece no título da suíte, para distinguir plataformas. */
  nome?: string;
}

/**
 * Executa a suíte de conformidade do Input contra uma implementação.
 *
 * Usa os globais `describe`/`it`/`expect` do runner — Vitest, Jest e Jasmine os
 * fornecem, então o mesmo arquivo serve aos três.
 */
export declare function runInputContract(harness: InputContractHarness): void;
