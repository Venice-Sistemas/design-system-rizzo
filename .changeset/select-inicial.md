---
'@venice-sistemas/react': minor
'@venice-sistemas/styles': minor
---

Adiciona o `Select` — escolha de um valor entre opções conhecidas, dentro de
formulário.

Oito partes: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`,
`SelectGroup`, `SelectLabel`, `SelectItem` e `SelectSeparator`.

O gatilho tem a altura e a borda do `Input`, porque os dois ficam lado a lado em
formulários, e aceita um ícone antes do valor. A opção tem essa mesma altura: a
lista abre colada ao gatilho, e diferença de altura entre os dois vira degrau.

O modelo de teclado é o de campo, não o de menu: `Tab` alcança o gatilho, e
`Escape` fecha **sem** alterar o valor.

Lista longa rola — o painel cresce até o que couber entre o gatilho e a borda da
janela.

Aditivo — nada muda para quem já consome.
