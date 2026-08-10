# @venice-sistemas/angular

**Spike, não pacote publicável.** Existe para demonstrar que uma segunda plataforma se
constrói a partir do contrato, sem ler a primeira.

## O que está pronto

`src/button/button.component.ts` é um componente Angular standalone que:

- consome `@venice-sistemas/styles` — **a mesma receita de classe que o React usa**, não uma cópia;
- consome os tokens pelas variáveis CSS, iguais às da web;
- implementa o comportamento descrito em `docs/contracts/button.md`.

**Nenhuma linha veio de `@venice-sistemas/react`.** Não precisou: a aparência está na receita
compartilhada e o comportamento está no contrato. Era exatamente isso que o spike ia provar.

## O que está bloqueado

A suíte de conformidade (`button.contract.spec.ts`) **não roda**. O bloqueio é de toolchain,
não de desenho:

`@analogjs/vite-plugin-angular` quebra a coleta de testes do Vitest. Isolei o problema com
uma sonda mínima — um `describe`/`it` trivial, sem nada de Angular:

| Configuração | Resultado |
|---|---|
| Vitest sozinho | 1 teste coletado e passando |
| Vitest + plugin do Analog | `No test suite found` |

Testado com Angular 19 e 20, Vitest 2 e 3, e com `jit: true`. O mesmo em todas.

## Caminhos para desbloquear

Em ordem do que eu tentaria primeiro:

1. **Jest em vez de Vitest neste pacote.** É o caminho tradicional do Angular e não depende
   do Analog. Custa ter dois runners no monorepo, o que é aceitável — o pacote é isolado.
2. **Fixar uma versão do Analog comprovadamente compatível.** Exige descobrir o par exato
   Angular × Analog × Vitest; eu não achei no tempo que dediquei.
3. **Karma/Jasmine**, o runner histórico do Angular. Mais pesado, mas é o mais garantido.

A suíte em si não precisa mudar em nenhum dos três: ela usa `@testing-library/dom` e os
globais `describe`/`it`/`expect`, que Jest e Jasmine também fornecem.

## O que este spike já demonstrou

Mesmo sem os testes rodando:

- a receita de classe **é** compartilhável entre frameworks web — o Angular importa
  `buttonVariants` e `buttonSlots` e não redefine nada;
- o contrato **foi** suficiente para escrever o componente sem consultar o React;
- a diferença legítima entre plataformas aparece sozinha: `asChild` não existe aqui, porque
  é idioma de React. O equivalente Angular seria uma diretiva de atributo, e entra quando
  houver consumidor — não por simetria.
