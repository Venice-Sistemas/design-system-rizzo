# @rizzopark/styles

A definição visual dos componentes, sem framework.

## Por que existe

Uma receita de classe é função pura: recebe as props visuais, devolve uma string. Não tem
React dentro, nem Angular.

Se ela morasse no pacote de React, o Angular teria que **recriá-la** — e duas cópias da mesma
tabela de variantes divergem na primeira vez que alguém mexe em uma. O botão do Angular
ganharia um hover diferente sem ninguém ter decidido isso.

Aqui a receita é uma só. As plataformas ficam com o que de fato é delas: marcação e
comportamento.

```
@rizzopark/styles     o que o componente PARECE     ← uma implementação
@rizzopark/react      como React monta e reage      ┐
@rizzopark/angular    como Angular monta e reage    ├ uma por plataforma
@rizzopark/native     (React Native, quando houver) ┘
```

## O que entra aqui

**Toda** classe do componente, incluindo as das partes internas. Se uma classe ficar na
plataforma, ela existe só ali — e é exatamente por aí que a divergência começa.

```ts
buttonVariants({ variant, size })   // a raiz
buttonSlots.label(loading)          // o wrapper do rótulo
buttonSlots.spinner                 // o indicador
```

## O que não entra

Comportamento. Foco, teclado, delegação de elemento, ciclo de vida — isso é da plataforma, e
cada uma resolve com o que tem de melhor: `<button>` nativo, Radix, Angular CDK.

## React Native é exceção

Não existe CSS nem classe lá. O RN consome `@rizzopark/tokens/native` e monta `StyleSheet` a
partir dos mesmos valores. A receita compartilhada é dos frameworks **web**; o que atravessa
para o RN são os tokens e o contrato.

## O CSS

`dist/styles.css` é compilado pelo Tailwind varrendo **só este pacote** — por isso toda
classe precisa estar aqui. Consumidor nenhum precisa de Tailwind: importa o CSS pronto.

O prefixo `ds:` isola nossas utilitárias das de um app que também use Tailwind. Sem ele, se o
consumidor customizar a escala de espaçamento, o padding dos nossos componentes mudaria
junto.
