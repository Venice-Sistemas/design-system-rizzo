export interface SelectContractOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectContractGroup {
  label: string;
  opcoes: SelectContractOption[];
}

export interface SelectContractHarness {
  /**
   * Monta o componente no document.body. Recebe `opcoes` — ou `grupos`, e aí as
   * opções vêm agrupadas sob rótulos. Cada plataforma decide como transformá-las
   * em itens.
   */
  render: (props: Record<string, unknown>) => void | Promise<void>;
  /** Desmonta o que `render` montou. */
  cleanup: () => void;
  /** Aparece no título da suíte, para distinguir plataformas. */
  nome?: string;
}

/**
 * Executa a suíte de conformidade do Select contra uma implementação.
 *
 * Usa os globais `describe`/`it`/`expect` do runner — Vitest, Jest e Jasmine os
 * fornecem, então o mesmo arquivo serve aos três.
 */
export declare function runSelectContract(harness: SelectContractHarness): void;
