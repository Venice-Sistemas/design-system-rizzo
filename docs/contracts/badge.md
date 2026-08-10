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
| `variant` | `default` · `secondary` · `destructive` · `outline` | `default` | Peso visual do rótulo |
| `asChild` | `boolean` | `false` | Renderiza o filho no lugar do `<span>`, herdando o estilo |
| `className` | `string` | — | Escape hatch |

**Quatro variantes, não seis.** O shadcn traz também `ghost` e `link`. As duas ficaram de fora
de propósito: variante que existe acaba sendo usada, e um badge com aparência de link só teria
uso errado — quem precisa de link deve renderizar um link.

## Anatomia

Um único elemento com texto, opcionalmente precedido de um ícone de 12px. Sem partes internas.

## Estados

| Estado | Comportamento |
|---|---|
| repouso | única aparência |
| hover | **nenhum** — badge não é controle |
| foco visível | **não focável** |
| pressionado | não se aplica |
| desabilitado | não se aplica — um rótulo desabilitado não significa nada |
| carregando | não se aplica — use `Skeleton` no lugar do badge |

A ausência de estados é a decisão principal deste contrato. Adicionar hover a um badge é o
primeiro passo para ele virar um controle acidental.

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
