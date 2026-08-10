export interface ModalContractHarness {
  /** Monta o modal com as props recebidas (inclui `open` e `onOpenChange`). */
  render: (props: Record<string, unknown>) => void | Promise<void>;
  /** Desmonta o que `render` montou. */
  cleanup: () => void;
  /** `data-slot` da raiz do conteúdo — `dialog-content` ou `alert-dialog-content`. */
  slot: string;
  /** Fecha por Escape e clique fora? `false` para o AlertDialog, que exige decisão. */
  dispensavel: boolean;
  /** Aparece no título da suíte, para distinguir plataformas. */
  nome?: string;
}

/**
 * Executa a suíte de conformidade compartilhada por Dialog e AlertDialog.
 *
 * Uma suíte para os dois: eles são o mesmo componente, e a diferença é o que
 * `dispensavel` descreve.
 */
export declare function runModalContract(harness: ModalContractHarness): void;
