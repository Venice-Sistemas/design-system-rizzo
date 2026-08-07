# @rizzopark/contracts

O contrato de cada componente, em forma executável.

## Por que existe

`docs/contracts/*.md` descreve o que um componente é e como se comporta, sem dizer como é
implementado. Isso resolve metade do problema: **texto pode ser lido com folga.** Duas
plataformas leem o mesmo parágrafo e implementam coisas diferentes, e ninguém percebe até um
usuário reclamar que o botão do app se comporta diferente do da web.

Este pacote é a outra metade. As mesmas asserções rodam contra React, contra Angular e
contra qualquer implementação futura. Uma plataforma **não passa a suíte lendo a outra** —
ela passa implementando o contrato.

## Como uma plataforma se liga

A suíte é agnóstica: ela usa `@testing-library/dom` e `@testing-library/user-event`, que
funcionam sobre qualquer framework que renderize para o DOM. A plataforma só precisa dizer
**como montar o componente**.

```
// no pacote da plataforma, em um arquivo de teste
import { runButtonContract } from '@rizzopark/contracts/button';

runButtonContract({
  render: (props) => { /* monta o componente no document.body */ },
  cleanup: () => { /* desmonta */ },
});
```

## O que a suíte cobre, e o que não cobre

**Cobre** o que é observável no DOM: papel, nome acessível, teclado, foco, estados
anunciados, atributos de gancho. É o que define se dois botões se comportam igual.

**Não cobre** aparência. Cor, altura e espaçamento vêm dos tokens, e são verificados no
pacote de tokens — contra os valores resolvidos do build, uma vez só, para as duas
plataformas. Duplicar isso aqui criaria duas fontes que discordam.

**Também não cobre** o que só existe numa plataforma. `asChild` é um idioma de React; o teste
dele mora no pacote de React. Se um dia virar comportamento esperado em toda plataforma,
sobe para cá — e essa promoção é uma decisão consciente, não um acidente.

## Quando um teste daqui falha

Não corrija o teste. Ou a implementação divergiu do contrato, ou o contrato está errado — e
no segundo caso a correção é em `docs/contracts/`, junto com a suíte, num PR que as duas
plataformas revisam.
