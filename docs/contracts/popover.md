# Contrato — Popover

**Situação:** web `em construção` · react native `não implementado`
**Última revisão:** 2026-08-10

## Propósito

Painel ancorado a um gatilho, com conteúdo secundário que não cabe na tela mas também não
justifica interromper a tarefa.

**Não resolve:** decisão. Como não prende o foco nem bloqueia a página, o usuário pode clicar
fora e o painel some — se a resposta importa, é `Dialog`.

## Quando não usar

- **Para pedir confirmação** — `AlertDialog`. Um popover pode ser dispensado por acidente.
- **Para uma lista de ações** — `DropdownMenu`, que tem o modelo de teclado de menu.
- **Para texto curto de ajuda num ícone** — isso é tooltip, que abre no hover e não recebe
  foco. Popover exige clique.
- **Para um formulário** — o conteúdo cresce, o painel não tem para onde rolar bem, e o
  usuário perde o que digitou ao clicar fora.

## A diferença para o Dialog

| | `Dialog` | `Popover` |
|---|---|---|
| véu | tem | **não tem** |
| posição | centralizado na viewport | **ancorado ao gatilho** |
| resto da página | inerte para leitor de tela | **continua acessível** |
| foco | preso dentro | **não preso** |
| clique fora | fecha | fecha |
| `Escape` | fecha | fecha |

As três primeiras linhas são a mesma decisão vista de ângulos diferentes: o popover **não é
modal**. Um popover que esconde a página do leitor de tela é um modal mal desenhado — como ele
não prende o foco, a pessoa continua alcançando o que foi escondido, e ouve silêncio.

## API

| Parte | Descrição |
|---|---|
| `Popover` | Raiz; controla `open` / `onOpenChange` |
| `PopoverTrigger` | O que abre. Recebe o foco de volta ao fechar |
| `PopoverContent` | O painel; monta o portal por conta própria |
| `PopoverAnchor` | Âncora alternativa, quando o painel deve nascer colado a outra coisa |

`PopoverContent` aceita `align` (padrão `center`) e `sideOffset` (padrão `4`).

## Posicionamento

O Radix decide o lado conforme o espaço disponível e vira o painel quando não cabe. A origem da
animação acompanha essa decisão — sem isso o painel cresce para o lado errado quando abre para
cima, e o movimento contradiz a posição final.

## Tokens consumidos

| Papel | Token |
|---|---|
| superfície | `color.surface.raised` |
| borda | `color.border.default` |
| elevação | `elevation.overlay` |
| raio | `radius.container` |

Sem token de véu: ele não tem véu.

## Verificação

`packages/react/src/popover/popover.test.tsx`.

Sem contrato executável compartilhado: o que o Popover garante em relação ao modal é uma
**ausência** — não prende foco, não torna a página inerte, não tem véu. Ausências se verificam
onde a plataforma monta, porque o mecanismo que as produziria é específico dela.
