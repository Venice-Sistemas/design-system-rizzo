/** Props que o contrato do Button exige de toda plataforma. */
export interface ButtonContractProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  children?: unknown;
  onClick?: (event: unknown) => void;
  'aria-label'?: string;
}

export interface ButtonHarness {
  /** Monta o componente no `document.body` com as props dadas. */
  render(props: ButtonContractProps): void | Promise<void>;
  /** Desmonta o que `render` montou. Roda depois de cada asserção. */
  cleanup(): void;
  /** Aparece no título da suíte, para distinguir plataformas na saída do runner. */
  nome?: string;
}

/**
 * Executa o contrato do Button contra uma implementação.
 *
 * Usa os globais `describe`/`it`/`expect` do runner, então chame no corpo de um
 * arquivo de teste. Espelha `docs/contracts/button.md` — se um bloco falhar, a
 * resposta está lá.
 */
export declare function runButtonContract(harness: ButtonHarness): void;
