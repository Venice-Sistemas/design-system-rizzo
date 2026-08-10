# Contrato — Checkbox

**Situação:** web `em construção` · react native `não implementado`
**Última revisão:** 2026-08-10

## Propósito

Escolha binária independente — cada caixa decide uma coisa, sem relação com as vizinhas.

**Não resolve:** escolha entre alternativas mutuamente exclusivas (isso é radio), nem
alternância de estado que tem efeito imediato (isso é switch).

## Quando não usar

- **Para ligar/desligar algo que aplica na hora** — use switch. Checkbox tem semântica de
  formulário: o usuário marca e depois confirma. Um checkbox que age no clique quebra essa
  expectativa.
- **Para escolher uma entre várias** — radio. Checkboxes mutuamente exclusivos obrigam o
  usuário a descobrir a regra por tentativa.
- **Para filtrar uma lista longa** — considere um combobox com múltipla seleção. Vinte
  checkboxes viram uma parede.

## API

| Prop | Valores | Padrão | Descrição |
|---|---|---|---|
| `checked` | `boolean` · `'indeterminate'` | — | Estado; `indeterminate` é o terceiro estado |
| `onCheckedChange` | `(v) => void` | — | Chamado na alternância |
| `disabled` | `boolean` | `false` | Sai da tabulação e recusa interação |
| `className` | `string` | — | Escape hatch |

O nome acessível vem de um `Label` associado ou de `aria-label` — o checkbox não tem prop de
rótulo, pelo mesmo motivo do `Input`.

## O terceiro estado

`checked="indeterminate"` anuncia `aria-checked="mixed"`.

Serve ao caso de "selecionar todos" com seleção parcial. Usar `false` ali faria um controle
com metade dos itens marcados ser anunciado como vazio — quem enxerga vê o traço, quem não
enxerga ouve "não marcado".

Marcado e indeterminado compartilham a mesma superfície de propósito: os dois significam "este
campo foi decidido", e o que os separa é o glifo, não a cor.

## Estados

| Estado | Comportamento |
|---|---|
| repouso | borda `border.strong`, superfície do card |
| foco visível | borda e anel de 3px em `border.focus` |
| marcado | superfície da ação primária, glifo de visto |
| indeterminado | mesma superfície, glifo de traço, `aria-checked="mixed"` |
| desabilitado | tokens de desabilitado, fora da tabulação |

**Espaço alterna. Enter não.** Num formulário, Enter submete — um checkbox que alterna com
Enter engole a submissão.

## Alvo de toque

A caixa **visual** tem 16px, que é o tamanho certo para não dominar a linha de texto ao lado.
O alvo **clicável** é ampliado por um pseudo-elemento até o mínimo de toque, do mesmo jeito que
o Button. Aumentar a caixa visível resolveria o toque e estragaria o alinhamento com o rótulo.

## Dependências

Sobre `@radix-ui/react-checkbox`, não sobre `<input type="checkbox">`. Aqui a dependência se
paga: o estado indeterminado no nativo exige mexer numa propriedade do DOM por ref (não existe
atributo), e a integração com formulário precisa de um input espelho.

Os glifos são **SVG inline**, não `lucide-react`. Uma biblioteca de ícones inteira por dois
traços decidiria a estratégia de ícones por acidente — e a proposta de arquitetura reserva
`@venice-sistemas/icons` para essa decisão.

## Tokens consumidos

| Papel | Token |
|---|---|
| superfície | `color.surface.default` |
| borda | `color.border.strong` (3,23:1) |
| borda de foco | `color.border.focus` |
| superfície marcada | `color.action.primary.background.default` |
| glifo | `color.action.primary.foreground.default` |
| alvo mínimo | `size.target.min` |

## Verificação

`packages/contracts/src/checkbox.mjs`, executado em
`packages/react/src/checkbox/checkbox.contract.test.tsx`.
