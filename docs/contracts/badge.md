# Contrato — Badge

**Situação:** web `em construção` · react native `não implementado`
**Última revisão:** 2026-08-10

## Propósito

Rótulo curto que classifica algo já presente na tela — o status de um ticket, a categoria de
um setor.

**Não resolve:** ação. Badge não é controle: não recebe foco, não responde a clique e não tem
estado de hover.

## Quando não usar

- **Para algo clicável** — use `Button` (`variant="ghost"` ou `"link"`) ou um link. Um rótulo
  com aparência de controle esconde a ação de quem navega por teclado.
- **Para mensagem com corpo de texto** — use `Alert`. Badge é uma ou duas palavras; texto que
  precisa quebrar linha não cabe num rótulo arredondado.
- **Para contagem em cima de um ícone** — isso é um contador de notificação, componente
  diferente, com regra própria de leitura ("3 mensagens não lidas", não "3").

## API

| Prop | Valores | Padrão | Descrição |
|---|---|---|---|
| `variant` | `default` · `secondary` · `destructive` · `outline` · `ghost` · `link` | `default` | Peso visual do rótulo |
| `asChild` | `boolean` | `false` | Renderiza o filho no lugar do `<span>`, herdando o estilo |
| `className` | `string` | — | Escape hatch |

Seis variantes, acompanhando o shadcn.

O hover só se aplica quando o badge é renderizado **como link** — é o que o seletor `[a&]` faz.
Um badge que é só rótulo continua sem estado de hover e fora da ordem de tabulação. A distinção
importa: um rótulo com aparência de controle esconde a ação de quem navega por teclado.

O hover vem de **token medido**, não de `bg-primary/90`. Valor gerado por opacidade não passa
pelo contrato de contraste e muda conforme o que estiver atrás — mesma decisão do Button e do
Alert.

## Anatomia

Um único elemento com texto, opcionalmente precedido de um ícone de 12px. Sem partes internas.

## Estados

| Estado | Comportamento |
|---|---|
| repouso | única aparência |
| hover | **nenhum** quando é rótulo; só quando renderizado como link |
| foco visível | **não focável** |
| pressionado | não se aplica |
| desabilitado | não se aplica — um rótulo desabilitado não significa nada |
| carregando | não se aplica — use `Skeleton` no lugar do badge |

A ausência de estados no rótulo é a decisão principal deste contrato. O hover existe apenas
quando o badge de fato virou um link — aí ele é um controle, e um controle sem hover é pior.

## Tokens consumidos

| Papel | Token |
|---|---|
| fundo `default` | `color.action.primary.background.default` |
| texto `default` | `color.action.primary.foreground.default` |
| fundo `secondary` | `color.action.secondary.background.default` |
| texto `secondary` | `color.action.secondary.foreground.default` |
| fundo `destructive` | `color.action.danger.background.default` |
| texto `destructive` | `color.action.danger.foreground.default` |
| borda `outline` | `color.action.outline.border.default` (3,23:1) |
| texto `outline` | `color.text.primary` |
| raio | `radius.pill` |

Nenhuma cor vem de opacidade. O shadcn usa `bg-primary/90` e `bg-destructive/60`; valor gerado
por opacidade não está no contrato de contraste e muda conforme o que estiver atrás.

## Verificação

`packages/react/src/badge/badge.test.tsx`. Não há contrato executável compartilhado: badge não
tem comportamento, e uma suíte multiplataforma sobre um `<span>` com cor verificaria o
renderizador, não a nossa regra.
