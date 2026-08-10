/**
 * Receita do Input — campo de texto de uma linha.
 *
 * Sem variante de cor. Um campo tem um estado de erro, e ele vem de
 * `aria-invalid`, não de uma prop `variant="error"`: o atributo é o que o leitor
 * de tela anuncia, e uma prop paralela permitiria pintar de vermelho sem
 * anunciar nada — vermelho sem anúncio é informação só para quem enxerga.
 *
 * A altura vem de token, igual ao Button. Campo e botão lado a lado com alturas
 * de origens diferentes desalinham na primeira vez que alguém mexe numa delas.
 */

export const inputVariants = (): string =>
  [
    'ds:flex ds:w-full ds:min-w-0',
    'ds:h-[var(--rp-size-control-md)] ds:px-3 ds:py-2',
    'ds:rounded-md ds:border ds:border-input ds:bg-card',
    'ds:font-sans ds:text-sm ds:text-foreground',
    'ds:transition-[color,box-shadow] ds:outline-none',
    'ds:motion-reduce:transition-none',

    // O placeholder tem token próprio, medido em 4,67:1. O cinza de texto
    // secundário seria mais escuro do que um placeholder deve ser, e o de borda
    // reprovaria como texto.
    'ds:placeholder:text-placeholder',

    // Seleção com as cores da ação, não as do navegador: o azul padrão sobre a
    // nossa superfície não passou por contraste nenhum.
    'ds:selection:bg-primary ds:selection:text-primary-foreground',

    'ds:focus-visible:border-ring ds:focus-visible:ring-ring/50 ds:focus-visible:ring-[3px]',

    // Erro: borda e anel derivados do MESMO atributo que o leitor de tela lê.
    'ds:aria-invalid:border-destructive ds:aria-invalid:ring-destructive/20',

    // Desabilitado usa token medido, não `opacity-50` — opacidade sobre a
    // superfície do campo derruba a leitura do valor já digitado.
    'ds:disabled:cursor-not-allowed ds:disabled:bg-disabled ds:disabled:text-disabled-foreground ds:disabled:border-disabled',

    // Botão de arquivo: some do fluxo normal e herda a tipografia.
    'ds:file:inline-flex ds:file:h-7 ds:file:border-0 ds:file:bg-transparent ds:file:text-sm ds:file:font-medium',
  ].join(' ');
