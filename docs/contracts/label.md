# Contrato — Label

**Situação:** web `em construção` · react native `não implementado`
**Última revisão:** 2026-08-10

## Propósito

O nome visível de um campo, associado a ele de forma que leitor de tela e clique funcionem.

**Não resolve:** texto de ajuda, mensagem de erro e indicação de obrigatoriedade. Os três são
conteúdo adicional e vivem ao lado, referenciados por `aria-describedby`.

## Quando não usar

- **Para texto de ajuda** — um `<p>` com `aria-describedby`. Enfiar a ajuda no rótulo faz o
  leitor de tela ler o parágrafo inteiro toda vez que o campo recebe foco.
- **Para o título de um grupo de campos** — `<fieldset>` com `<legend>`. Um `<label>` só
  nomeia um controle.
- **Para o rótulo de um botão** — o texto do botão já é o nome dele.

## API

| Prop | Valores | Padrão | Descrição |
|---|---|---|---|
| `htmlFor` | `string` | — | **O `id` do campo.** É a razão de existir do componente |
| `className` | `string` | — | Escape hatch |

Todo o resto das props de `<label>` passa direto.

## Sem `@radix-ui/react-label`

Este é um `<label>` nativo.

O que o Radix acrescenta sobre o nativo é essencialmente impedir a seleção de texto no duplo
clique. O resto — associação por `htmlFor`, foco ao clicar, ampliação da área de ativação — o
navegador já faz. Reproduzir esse comportamento custa três linhas e evita uma dependência de
runtime num pacote que será consumido por oito aplicações.

A troca é consciente e reversível: se aparecer um caso que o nativo não cobre, o Radix volta
sem mudar a API deste componente. Os testes de plataforma existem para detectar isso — se algum
deles falhar, a decisão precisa ser revista.

## Estado desabilitado vem do campo

O rótulo não tem prop `disabled`. Ele lê o estado do campo irmão por `peer-disabled`.

Um rótulo com estado próprio poderia ficar dessincronizado do campo que ele nomeia — e um
rótulo apagado ao lado de um campo ativo é pior do que nenhum dos dois.

O apagamento usa **token medido**, não `opacity-50`: opacidade leva o texto do rótulo para
perto do fundo, e o nome do campo é a última coisa que deve sumir.

## Tokens consumidos

| Papel | Token |
|---|---|
| texto | `color.text.primary` |
| texto desabilitado | `color.action.primary.foreground.disabled` |
| tamanho | `typography.label.md` |

## Verificação

`packages/react/src/label/label.test.tsx`.

Sem contrato executável compartilhado: o que o Label faz de essencial é associação, e
associação é comportamento do navegador. Uma suíte multiplataforma sobre isso testaria o
ambiente de teste, não a nossa regra.
