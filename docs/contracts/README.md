# Contratos de componente

Um contrato descreve **o que um componente é e como se comporta**, sem dizer como ele é
implementado. Ele é escrito antes do código e revisado uma vez só.

## Por que isto existe

Nosso ecossistema tem duas plataformas de render — React DOM e React Native — e elas não
compartilham implementação. HTML semântico é onde mora a acessibilidade grátis na web;
comportamento nativo é o que se espera num app. Forçar uma implementação única sacrificaria
os dois.

O que o usuário percebe não é se as implementações compartilham código. É se a cor de perigo
é a mesma e se o botão desabilitado se comporta igual. **A consistência vem dos tokens e do
comportamento — o contrato é onde o comportamento fica escrito.**

Sem ele, a divergência é inevitável e silenciosa: o `Select` do app ganha busca, o da web
não, e ninguém decidiu isso.

## Quando escrever

Antes do código, e **antes de olhar qualquer biblioteca de referência**. Se o contrato diz
`tone="danger"` e a biblioteca que vamos adaptar diz `variant="destructive"`, o contrato
vence. A ordem importa: escrever o contrato depois de ver a lib produz uma cópia da API da
lib com outro nome.

## O teste de aderência

Aplicável em revisão, a qualquer momento:

> Conseguimos trocar a implementação interna sem que isso seja breaking change para quem
> consome?

Se a resposta for não, uma dependência vazou para a superfície pública.

## O contrato é executável

Texto pode ser lido com folga. Duas plataformas leem o mesmo parágrafo e implementam coisas
diferentes, e ninguém percebe até um usuário reclamar que o botão do app se comporta
diferente do da web.

Por isso cada contrato tem uma suíte em **`packages/contracts`**, que roda contra todas as
implementações. Ela é agnóstica — usa `@testing-library/dom` sobre o DOM já montado, e a
plataforma fornece apenas uma função de montar.

**Nenhuma plataforma é a fonte de outra.** O Angular não lê o React, e o React não lê o
Angular: os dois leem o contrato e passam a mesma suíte.

Duas coisas ficam de fora dela, de propósito:

- **Aparência.** Cor, altura e espaçamento vêm dos tokens, verificados uma vez no pacote de
  tokens para todas as plataformas. Duplicar aqui criaria duas fontes que discordam.
- **O que só existe numa plataforma.** `asChild` é idioma de React e seu teste mora no
  pacote de React. Se virar comportamento esperado em toda plataforma, sobe para o contrato
  — e essa promoção é decisão consciente, não acidente.

Quando um teste do contrato falha, não conserte o teste. Ou a implementação divergiu, ou o
contrato está errado — e aí a correção é no documento e na suíte, num PR que todas as
plataformas revisam.

## Template

Copie `_template.md`. Um arquivo por componente, nomeado pelo componente em minúsculas.

Seções obrigatórias:

| Seção | O que responde |
|---|---|
| **Propósito** | O que resolve, e o que explicitamente não resolve |
| **Quando não usar** | A seção mais valiosa e a mais esquecida |
| **API** | Props, valores possíveis, padrão. Nenhum tipo de biblioteca externa |
| **Anatomia** | As partes visuais e como compõem |
| **Estados** | Repouso, hover, foco, pressionado, desabilitado, carregando |
| **Tokens** | Quais tokens semânticos consome, por estado |
| **Teclado** | Cada tecla e o que ela faz |
| **Acessibilidade** | Papel, nome acessível, o que é anunciado, o que precisa de auditoria manual |
| **Plataformas** | Situação em web e em React Native |

## Situação por plataforma

Todo contrato declara em que pé está cada plataforma, e a galeria mostra isso ao lado do
componente. Sem isso, alguém lê a documentação e tenta importar o que não existe.

- `estável` — implementado, testado, auditado com leitor de tela
- `em construção` — existe, mas ainda não vale confiar
- `não implementado` — o contrato existe, o código não
- `não se aplica` — não faz sentido nessa plataforma

Um componente pode ser `estável` na web e `não implementado` no React Native. É o estado
normal, não uma pendência.
