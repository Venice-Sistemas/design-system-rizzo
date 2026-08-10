export interface MenuContractHarness {
  /** Monta um menu com três itens e um gatilho. `itemDesabilitado` marca o segundo. */
  render: (props: Record<string, unknown>) => void | Promise<void>;
  /** Desmonta o que `render` montou. */
  cleanup: () => void;
  /** Aparece no título da suíte, para distinguir plataformas. */
  nome?: string;
}

/**
 * Executa a suíte de conformidade do DropdownMenu contra uma implementação.
 *
 * O foco é o modelo de teclado, que é o oposto do resto da biblioteca: dentro de
 * um menu, Tab fecha e as setas navegam.
 */
export declare function runMenuContract(harness: MenuContractHarness): void;
