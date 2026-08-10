# Contrato — AlertDialog

**Situação:** web `em construção` · react native `não implementado`
**Última revisão:** 2026-08-10

## Propósito

Interrompe a tarefa para exigir uma decisão sobre uma ação de consequência — apagar,
cancelar, sobrescrever.

**Não resolve:** qualquer coisa que não exija decisão. Se a pessoa pode simplesmente fechar e
seguir, é `Dialog`.

## Quando não usar

- **Para confirmar algo reversível** — confirmação de rotina treina o usuário a clicar em
  "sim" sem ler. Prefira executar e oferecer desfazer.
- **Para avisar sem pedir nada** — `Alert` na página.
- **Para um formulário** — `Dialog`. Este componente prende o usuário até ele escolher, e um
  formulário longo transforma isso em armadilha.

## É o Dialog, com quatro diferenças

Visualmente são o mesmo componente. Todas as diferenças são de comportamento, e todas apontam
para a mesma regra: **este diálogo exige uma decisão.**

| | `Dialog` | `AlertDialog` |
|---|---|---|
| `Escape` | fecha | **não fecha** |
| clique fora | fecha | **não fecha** |
| X no canto | tem | **não tem** |
| foco ao abrir | no painel | **no botão de cancelar** |

Um reflexo de teclado ou um clique perdido não podem desfazer a pergunta. E um X seria uma
terceira saída sem significado — sair sem escolher.

O foco no cancelar é deliberado: a saída segura é a que já está sob o dedo. Quem pressiona
Enter por reflexo cancela, não confirma.

## API

| Parte | Descrição |
|---|---|
| `AlertDialog` | Raiz |
| `AlertDialogTrigger` | O que abre |
| `AlertDialogContent` | O painel; monta portal e véu |
| `AlertDialogHeader` · `AlertDialogTitle` · `AlertDialogDescription` · `AlertDialogFooter` | Estrutura |
| `AlertDialogAction` | Confirma. Aceita `variant="destructive"` |
| `AlertDialogCancel` | Sai sem agir. Recebe o foco ao abrir |

**`AlertDialogAction` não é `destructive` por padrão.** Nem toda confirmação apaga algo, e um
botão vermelho em toda confirmação dessensibiliza para o vermelho que importa.

## O rodapé empilha com o principal em cima

Em telas estreitas os botões empilham em `column-reverse`. O polegar alcança a parte de baixo
com mais facilidade — e num diálogo destrutivo a ação principal não deve ser a mais fácil de
tocar por acidente.

## Escreva a pergunta, não o rótulo

O título deve dizer o que vai acontecer, não pedir confirmação genérica:

```
✗  "Tem certeza?"
✓  "Excluir esta irregularidade?"
```

E a descrição diz o que não dá para desfazer. Quem lê só o título precisa conseguir decidir.

## Tokens consumidos

Os mesmos do `Dialog` — a receita é compartilhada em `packages/styles/src/dialog.ts`.

## Verificação

`packages/contracts/src/modal.mjs`, com `dispensavel: false`. Uma suíte para os dois: escrever
duas quase idênticas garantiria que a segunda ficaria para trás na primeira correção feita na
primeira.
