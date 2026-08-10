# Contrato — DropdownMenu

**Situação:** web `em construção` · react native `não implementado`
**Última revisão:** 2026-08-10

## Propósito

Lista de ações que abre a partir de um gatilho.

**Não resolve:** escolha de valor num formulário (isso é `Select`), conteúdo informativo (isso é
`Popover`) e navegação principal (isso é uma nav, com links de verdade).

## Quando não usar

- **Para escolher um valor** — `Select`. Menu executa ação; select define dado, e a diferença
  aparece no que o leitor de tela anuncia.
- **Para menos de três ações** — dois botões visíveis são melhores do que dois cliques.
- **Para navegar entre páginas** — um menu de `menuitem` não é uma lista de links. Quem usa
  leitor de tela perde a navegação por links da página.

## O modelo de teclado é o oposto do resto da biblioteca

```
fora de um menu     Tab navega entre controles
dentro de um menu   Tab FECHA; as setas navegam
```

Um menu cujos itens são alcançáveis por Tab **não é um menu** — é uma lista de botões numa
caixa. Quem usa leitor de tela recebe a promessa de "menu" e o comportamento de outra coisa.

| Tecla | Comportamento |
|---|---|
| `↓` / `↑` | Move entre itens, **circulando** nas pontas |
| `Enter` / `Espaço` | Aciona o item e fecha |
| `Escape` | Fecha e **devolve o foco ao gatilho** |
| `Tab` | Fecha |

### Circular é decisão nossa

O Radix não circula por padrão: a seta para no último item e fica lá, sem sinal de que chegou ao
fim. Num menu curto isso é indistinguível de travamento — a pessoa segura a seta e nada
acontece.

A APG trata a circulação como opcional. Aqui ela é ligada (`loop`), e o argumento é o mesmo que
limita o tamanho: um menu longo o bastante para a circulação desorientar não deveria ser um
menu.

## API

Sete partes, não as quinze do shadcn:

| Parte | Descrição |
|---|---|
| `DropdownMenu` | Raiz |
| `DropdownMenuTrigger` | O que abre; declara `aria-haspopup="menu"` |
| `DropdownMenuContent` | O painel. Aceita `loop` (padrão `true`) |
| `DropdownMenuItem` | Ação. Aceita `variant="destructive"` |
| `DropdownMenuLabel` | Rótulo de grupo — **não é item**, não recebe foco |
| `DropdownMenuSeparator` | Divisor visual |
| `DropdownMenuGroup` | Agrupa itens relacionados |

**Ficaram de fora:** submenu (`Sub`, `SubTrigger`, `SubContent`), item de rádio, item de
checkbox e `Shortcut`. Dez partes que nenhuma tela chama hoje, e o submenu é a parcela mais
complexa de acertar em teclado. Entram quando houver demanda — é a regra do repositório, e o
custo de adicionar depois é menor que o de manter o que ninguém usa.

## Item desabilitado continua anunciado

Ele não é pulado pela navegação, e declara `aria-disabled`.

Pular esconde que a opção existe: quem não enxerga fica procurando uma ação que está ali,
apenas indisponível.

## Destaque é um só

Teclado e mouse compartilham o **mesmo** destaque (`data-highlighted`). Descer com a seta pinta
o item; passar o mouse move esse mesmo destaque.

Dois estados independentes — um de `hover`, outro de foco — produzem dois itens pintados ao
mesmo tempo, e a pessoa não sabe qual o `Enter` vai acionar.

O item destrutivo destaca com a **superfície** de perigo, não só com texto vermelho: texto
vermelho sobre um destaque cinza tem contraste imprevisível, porque nenhum dos dois foi medido
contra o outro.

## Tokens consumidos

| Papel | Token |
|---|---|
| superfície | `color.surface.raised` |
| item destacado | `color.action.ghost.background.hover` |
| item destrutivo | `color.feedback.danger.surface` / `.text` |
| separador | `color.border.default` |
| alvo mínimo | `size.target.min` |

O item tem **altura mínima** de toque, não altura fixa: itens de 44px transformariam um menu de
seis ações numa lista que não cabe na tela.

## Verificação

`packages/contracts/src/menu.mjs`, executado em
`packages/react/src/dropdown-menu/dropdown-menu.contract.test.tsx`.

O contrato abre o menu **clicando no gatilho**, não forçando `open`. O comportamento de foco de
um menu depende de onde o foco estava quando ele abriu; montado já aberto, o gatilho nunca
recebeu foco e não há para onde devolvê-lo — o teste reprovaria uma implementação correta.
