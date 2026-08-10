# @venice-sistemas/styles

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
@venice-sistemas/styles     o que o componente PARECE     ← uma implementação
@venice-sistemas/react      como React monta e reage      ┐
@venice-sistemas/angular    como Angular monta e reage    ├ uma por plataforma
@venice-sistemas/native     (React Native, quando houver) ┘
```

## A ordem do import decide quem vence

Num app que também usa Tailwind, importe `styles.css` **antes** do Tailwind do app:

```css
@import '@venice-sistemas/styles/styles.css';  /* primeiro */

@import 'tailwindcss';
```

O motivo não é estilo, é cascata. As nossas classes saem com o prefixo `ds:`
(`ds:h-[var(--rp-size-control-md)]`) e as do app saem sem (`h-11`). As duas caem na camada
`utilities` e têm a mesma especificidade — uma classe cada. Nada além da ordem as separa.

E o `tailwind-merge` não resolve: ele reconhece `h-9` e `h-11` como conflitantes e descarta a
primeira, mas não sabe que `ds:h-[…]` disputa a mesma propriedade, porque o prefixo muda o
nome da classe. O `cn` só enxerga o que passa por ele; a classe do app vem de fora.

Importado depois, o Design System vence e `className` para de funcionar como escape hatch —
que é uma API que o pacote de React oferece e testa. O sintoma é silencioso: o botão fica com
36px onde o app pediu 44px, sem erro em lugar nenhum.

É a contrapartida do prefixo. Ele existe para que customizar a escala de espaçamento do app
não mexa no padding dos nossos componentes; o preço é que o app precisa da última palavra por
ordem, não por especificidade.

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

Não existe CSS nem classe lá. O RN consome `@venice-sistemas/tokens/native` e monta `StyleSheet` a
partir dos mesmos valores. A receita compartilhada é dos frameworks **web**; o que atravessa
para o RN são os tokens e o contrato.

## O CSS

`dist/styles.css` é compilado pelo Tailwind varrendo **só este pacote** — por isso toda
classe precisa estar aqui. Consumidor nenhum precisa de Tailwind: importa o CSS pronto.

O prefixo `ds:` isola nossas utilitárias das de um app que também use Tailwind. Sem ele, se o
consumidor customizar a escala de espaçamento, o padding dos nossos componentes mudaria
junto.
