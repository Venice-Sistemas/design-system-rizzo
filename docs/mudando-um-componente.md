# Mudando um componente

Como uma alteração chega às plataformas **que têm consumidor** sem que nenhuma delas fique
para trás.

O problema que este processo resolve não é técnico, é de atenção: **é fácil mudar a
plataforma que você está mexendo e esquecer as outras.** Quando isso acontece, a divergência
não dá erro — o botão do app simplesmente passa a se comportar diferente do da web, e ninguém
descobre até um usuário reclamar.

**Hoje a única plataforma com consumidor é o React.** Angular e React Native existem como
alvo do contrato, não como entrega pendente: o Button em `packages/angular` é a prova de que
o contrato atravessa framework, e ficou nisso. Nenhum sistema da casa usa Angular. Componente
novo **não** nasce em Angular — nasce quando aparecer o sistema que precisa dele.

---

## A ordem

Sempre a mesma, e a inversão é a origem de quase todo problema:

```
1. contrato          docs/contracts/{componente}.md
2. suíte             packages/contracts/src/{componente}.mjs
3. tokens            packages/tokens/  (se envolver valor novo)
        ↓
4. implementação     react — e só as outras que tiverem consumidor
```

**Contrato primeiro, sempre.** Mudar o código antes é o que produz contrato desatualizado, e
contrato desatualizado é pior que contrato nenhum: a próxima plataforma o lê achando que é
verdade.

Se a mudança envolve valor visual novo, ele entra nos tokens antes das implementações — com
o par no contrato de contraste, senão o build quebra e está certo em quebrar.

---

## Os três tipos de mudança

### Aditiva — uma variante, um tamanho, uma prop opcional

A mais comum e a mais simples. Nada quebra para quem já consome.

1. Contrato: adicione a linha na tabela de API e na de tokens.
2. Suíte: adicione a asserção. Ela passa a falhar em **todas** as plataformas — é assim que
   se descobre quais faltam implementar.
3. Implemente onde há consumidor **agora**. As outras ficam vermelhas de propósito.
4. Marque a plataforma pendente na tabela de Plataformas do contrato.

> Uma plataforma com a suíte vermelha não é falha de processo. É a lista de trabalho,
> visível. O que não pode é ela ficar verde por omissão.

### Corretiva — comportamento errado, contraste reprovando, bug de acessibilidade

Aqui a pressa é justificada, e mesmo assim a ordem não muda.

1. Se o contrato descrevia o comportamento certo e o código divergiu: **só o código muda.**
   Foi o caso da altura do Button — o contrato dizia `size.control.{size}` e o código usava
   `h-9`.
2. Se o contrato descrevia errado: corrija o contrato **e** a suíte no mesmo PR, e depois
   todas as implementações.
3. Correção de acessibilidade **não é breaking**, mesmo mudando markup. Ela entra em patch.

### Quebra — renomear prop, remover variante, mudar padrão

1. Contrato e suíte primeiro.
2. Todas as plataformas no mesmo release. Aqui não vale deixar uma para trás: quem consome
   duas plataformas veria APIs diferentes para o mesmo componente.
3. Depreciação antes da remoção: `@deprecated` **com a alternativa nomeada**, aviso em
   desenvolvimento, e no mínimo um ciclo menor de convivência.
4. Se a migração for mecânica, entregue o codemod ou a instrução de substituição literal.
   Depreciar sem caminho de migração é empurrar trabalho para quem consome.

Antes do `1.0.0` este ciclo está suspenso — mas a mudança ainda é anunciada.

---

## Quando um teste do contrato falha

**Não conserte o teste.** Uma de duas coisas aconteceu:

- a implementação divergiu do contrato → corrija a implementação;
- o contrato está errado → corrija o documento **e** a suíte, num PR que todas as
  plataformas revisam.

Ajustar a asserção para o código passar transforma o contrato em espelho do código, e aí ele
para de servir para qualquer coisa.

---

## O que cada camada garante, e o que não garante

| Camada | Garante | Não pega |
|---|---|---|
| Contrato (documento) | Que exista uma decisão escrita e revisável | Nada sozinho — é texto |
| Suíte de conformidade | Comportamento idêntico: papel, teclado, foco, estados anunciados | Aparência |
| Contrato de contraste | Que nenhum par frente/fundo reprove WCAG | Se a implementação usa o token errado |
| Testes da plataforma | O que é idioma dela — `asChild`, ref, RSC | Comportamento compartilhado |
| Galeria | Revisão visual humana | Regressão sutil sem alguém olhar |

O buraco visível nessa tabela é **aparência**. Hoje ela depende de alguém abrir a galeria.
É o que a regressão visual cobriria, e ela ainda não existe.

---

## Como uma plataforma fica para trás sem ninguém notar

Três formas, em ordem de probabilidade:

1. **A suíte não roda no CI daquela plataforma.** Toda plataforma nova precisa de
   `runXContract` ligado no primeiro dia. Sem isso ela nasce fora do processo.
2. **A asserção foi escrita só no teste da plataforma**, não na suíte compartilhada. Aí ela
   protege uma plataforma e as outras seguem sem saber que existe uma regra.
3. **O contrato foi atualizado e a suíte não.** Documento e suíte mudam sempre juntos — se o
   PR toca um e não o outro, é sinal de revisão incompleta.

---

## Checklist de PR

- [ ] O contrato em `docs/contracts/` reflete o comportamento novo
- [ ] A suíte em `packages/contracts` foi atualizada junto
- [ ] Valor visual novo tem token e par no contrato de contraste
- [ ] Toda plataforma com consumidor está implementada; as demais estão marcadas como
      pendentes na tabela de Plataformas
- [ ] Nada específico de uma plataforma entrou na suíte compartilhada
- [ ] Se é quebra: depreciação anunciada, com alternativa nomeada e caminho de migração
