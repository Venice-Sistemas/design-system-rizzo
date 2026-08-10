# Contrato — Input

**Situação:** web `em construção` · react native `não implementado`
**Última revisão:** 2026-08-10

## Propósito

Campo de texto de uma linha.

**Não resolve:** rótulo, mensagem de erro, máscara e validação. Todos moram fora do campo, e
por motivos diferentes — ver abaixo.

## Quando não usar

- **Para texto de várias linhas** — `<textarea>`. Um input que cresce esconde o conteúdo já
  digitado.
- **Para escolha entre opções conhecidas** — `Select`. Campo livre para algo que tem lista
  produz dado sujo.
- **Para busca com sugestões** — isso é um combobox, com regra própria de teclado e
  `aria-expanded`.

## Três ausências deliberadas

**Sem prop de rótulo.** O nome acessível vem de um `<label>` associado ou de `aria-label`, e os
dois moram fora do campo. Uma prop `label` produziria um componente que renderiza um `<label>`
sem saber onde ele deve ficar no layout — e todo formulário acabaria contornando isso.

**Sem prop de erro.** O estado de erro vem de `aria-invalid`, que é o que o leitor de tela
anuncia; a borda vermelha é **derivada** dele por CSS. Uma prop `variant="error"` paralela
permitiria pintar sem anunciar, e vermelho sem anúncio é informação só para quem enxerga.

**Sem máscara.** Máscara é regra de domínio — o formato de placa muda entre padrão antigo e
Mercosul. Ela pertence à camada que conhece a regra, não ao campo que a exibe.

## API

| Prop | Valores | Padrão | Descrição |
|---|---|---|---|
| `type` | qualquer `type` de `<input>` | `text` | **Encaminhado** — decide o teclado virtual no celular |
| `disabled` | `boolean` | `false` | Sai da ordem de tabulação e recusa digitação |
| `aria-invalid` | `boolean` | — | Estado de erro, anunciado e pintado |
| `className` | `string` | — | Escape hatch |

Todo o resto das props de `<input>` passa direto.

## Placeholder não é rótulo

O contrato verifica que o componente **não** deriva nome acessível do placeholder.

Placeholder some quando o usuário começa a digitar. Um campo cujo nome vem dali fica sem nome
no meio do preenchimento, e quem usa leitor de tela perde a referência do que estava
respondendo. Placeholder serve para exemplo de formato (`ABC1D23`), nunca para dizer o que o
campo é.

## Estados

| Estado | Comportamento |
|---|---|
| repouso | borda `border.strong` |
| foco visível | borda e anel de 3px em `border.focus` |
| erro | borda `action.danger.background` + anel, a partir de `aria-invalid` |
| desabilitado | superfície e texto de desabilitado, cursor bloqueado, fora da tabulação |

Desabilitado usa **token medido**, não `opacity-50`. Opacidade sobre a superfície do campo
derruba a leitura do valor já digitado.

## Tokens consumidos

| Papel | Token |
|---|---|
| superfície | `color.surface.default` |
| texto | `color.text.primary` |
| placeholder | `color.text.placeholder` (4,67:1) |
| borda | `color.border.strong` (3,23:1) |
| borda de foco | `color.border.focus` |
| altura | `size.control.md` |
| seleção | `color.action.primary.background` / `.foreground` |

A altura vem do mesmo token do Button. Campo e botão lado a lado com alturas de origens
diferentes desalinham na primeira vez que alguém mexe numa delas.

## Verificação

`packages/contracts/src/input.mjs`, executado em `packages/react/src/input/input.contract.test.tsx`.

O contrato é curto de propósito: a maior parte do que um campo faz vem do elemento nativo, e
reverificar o navegador seria desperdício. Ele trava as três coisas que uma implementação pode
errar sozinha — usar elemento errado, pintar erro sem anunciar, e desabilitar de um jeito que
ainda aceita digitação.
