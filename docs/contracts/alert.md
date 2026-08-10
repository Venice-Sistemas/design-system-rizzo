# Contrato — Alert

**Situação:** web `em construção` · react native `não implementado`
**Última revisão:** 2026-08-10

## Propósito

Mensagem persistente sobre o estado de algo que está na tela — uma falha ao salvar, um aviso
de contexto, uma confirmação que precisa ficar visível.

**Não resolve:** notificação efêmera (isso é toast), diálogo que exige decisão (isso é
`AlertDialog`) e erro de campo (isso é a mensagem do campo, junto dele).

## Quando não usar

- **Para erro de um campo específico** — a mensagem tem que ficar ao lado do campo e ser
  referenciada por `aria-describedby`. Um alerta no topo do formulário obriga quem usa leitor
  de tela a procurar qual campo falhou.
- **Para algo que some sozinho** — use toast. Um alerta que desaparece leva a informação junto.
- **Para confirmar uma ação destrutiva** — use `AlertDialog`. Alerta não interrompe o fluxo,
  e confirmação precisa interromper.

## A decisão central: tom e urgência são coisas diferentes

```
tone     é COR       — a que família de feedback a mensagem pertence
urgent   é ANÚNCIO   — se o leitor de tela interrompe o que está lendo
```

O shadcn junta as duas e fixa `role="alert"` em todo alerta. `role="alert"` é região viva
**assertiva**: interrompe na hora. Isso está certo para uma falha que bloqueia a tarefa e
errado para uma caixa informativa que já nasce renderizada — ela passa a interromper a leitura
sem motivo, e **quem enxerga nunca percebe o defeito**.

Por isso o padrão aqui é `status` (polido), e a interrupção é uma escolha explícita.

| `urgent` | `role` | `aria-live` | Quando |
|---|---|---|---|
| `false` (padrão) | `status` | `polite` | A mensagem informa, e pode esperar a frase atual terminar |
| `true` | `alert` | `assertive` | A mensagem bloqueia a tarefa em andamento |

Um alerta de tom `danger` que já estava na tela quando a página abriu **não** deve ser
`urgent`. Um erro que apareceu porque a submissão falhou, sim.

## API

| Prop | Valores | Padrão | Descrição |
|---|---|---|---|
| `tone` | `info` · `success` · `warning` · `danger` | `info` | Família de feedback — decisão de cor |
| `urgent` | `boolean` | `false` | Interrompe o leitor de tela |
| `className` | `string` | — | Escape hatch |

Partes: `Alert`, `AlertTitle`, `AlertDescription`.

**Quatro tons, não dois.** Existem quatro famílias de feedback nos tokens, todas com
superfície, borda, texto e ícone medidos no contrato de contraste, nos dois temas. Expor só
`default` e `destructive` deixaria as outras serem improvisadas com opacidade na tela.

## Anatomia

```
Alert                    grade de 2 colunas
├── <svg>                ícone opcional, 16px — decorativo, aria-hidden
├── AlertTitle           coluna 2
└── AlertDescription     coluna 2
```

Sem ícone, a primeira coluna colapsa para zero e o texto encosta na borda — sem precisar de
variante de layout.

O ícone é **decoração**: a informação está no texto. Um ícone anunciado repete o tom que a cor
já dá a quem enxerga e não acrescenta nada a quem não enxerga.

## O que o Alert NÃO faz

**Não é focável.** Região viva é anunciada sem receber foco. Um alerta focável entra na ordem
de tabulação sem ter ação, e quem navega por teclado para nele sem poder fazer nada.

**Não tem botão de fechar.** Alerta dispensável é outro componente, com regra própria: o foco
precisa ir para algum lugar quando ele some. Enfiar um X aqui produz foco perdido no `body`.

## Tokens consumidos

| Papel | Token |
|---|---|
| superfície | `color.feedback.{tone}.surface` |
| borda | `color.feedback.{tone}.border` |
| texto | `color.feedback.{tone}.text` |
| ícone | `color.feedback.{tone}.icon` |
| raio | `radius.container` |

Nenhuma cor vem de opacidade. O shadcn usa `bg-destructive/10` com `text-destructive` — par
que ninguém mediu, e cujo resultado muda conforme o que estiver atrás.

## Verificação

`packages/contracts/src/alert.mjs`, executado em `packages/react/src/alert/alert.contract.test.tsx`.
Toda plataforma passa pela mesma suíte.
