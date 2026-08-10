# Contrato — Dialog

**Situação:** web `em construção` · react native `não implementado`
**Última revisão:** 2026-08-10

## Propósito

Painel modal que interrompe a tarefa para uma sub-tarefa — um formulário curto, um detalhe, uma
escolha que não cabe na página.

**Não resolve:** confirmação de ação destrutiva (isso é `AlertDialog`), mensagem sem interação
(isso é `Alert`), e conteúdo ancorado a um gatilho (isso é `Popover`).

## Quando não usar

- **Para um formulário longo** — modal esconde o contexto e não tem para onde rolar bem. Use
  uma página.
- **Para empilhar sobre outro modal** — dois modais abertos deixam o foco e o `Escape`
  ambíguos. Reorganize o fluxo.
- **Para mostrar erro de uma ação** — `Alert` na página. Um modal obriga a fechar antes de
  poder corrigir.

## API

| Parte | Descrição |
|---|---|
| `Dialog` | Raiz; controla `open` / `onOpenChange` |
| `DialogTrigger` | O que abre. Recebe o foco de volta ao fechar |
| `DialogContent` | O painel. **Monta portal e véu por conta própria** |
| `DialogClose` | Qualquer elemento que fecha |
| `DialogHeader` · `DialogTitle` · `DialogDescription` · `DialogFooter` | Estrutura |

`DialogContent` aceita `showCloseButton` (padrão `true`).

**`DialogPortal` e `DialogOverlay` não são exportados.** O shadcn os expõe e obriga a compor
`<Portal><Overlay/><Content/></Portal>` — detalhe de implementação vazando para a tela. A
primeira pessoa que esquecer o overlay ganha um modal sem véu, sem erro em lugar nenhum.

## O título não é opcional

Um diálogo sem nome acessível é anunciado como "diálogo" e nada mais. O nome vem de
`DialogTitle`, referenciado por `aria-labelledby`.

Se o título não deve aparecer, esconda-o visualmente — nunca o omita.

## Foco

| Momento | Comportamento |
|---|---|
| ao abrir | foco entra no painel |
| enquanto aberto | **preso**: Tab circula dentro do diálogo |
| `Escape` | fecha |
| clique fora | fecha |
| ao fechar | foco volta para o gatilho |

A armadilha de foco é o que separa um modal de uma caixa flutuante. Sem ela, Tab leva para a
página atrás — que está coberta pelo véu e não recebe clique.

## Modalidade

O resto da página fica inerte para tecnologia assistiva. Existem duas técnicas aceitas —
`aria-modal="true"` no conteúdo, ou `aria-hidden` nos irmãos — e elas **não** têm o mesmo
suporte: `aria-modal` é inconsistente entre leitores, e a segunda funciona em todos. O contrato
verifica o efeito e aceita qualquer uma; o que não pode é nenhuma das duas.

## Tokens consumidos

| Papel | Token |
|---|---|
| véu | `color.surface.scrim` |
| superfície | `color.surface.raised` |
| borda | `color.border.default` |
| elevação | `elevation.overlay` |
| raio | `radius.container` |

`elevation.overlay`, não `raised`: o segundo é a elevação de um card, que está no fluxo da
página. Um painel que flutua sobre um véu precisa se separar de tudo.

## Verificação

`packages/contracts/src/modal.mjs`, com `dispensavel: true`. A mesma suíte roda contra o
`AlertDialog` com `false` — os dois são o mesmo componente, e o parâmetro descreve a diferença.
