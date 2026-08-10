# Contrato — Button

**Situação:** web `em construção` · react native `não implementado`
**Última revisão:** 2026-08-06

## Propósito

Dispara uma ação. É o controle mais usado do sistema e o que mais sofre com reimplementação
divergente, então é o primeiro a existir.

**Não resolve:** navegação. Um elemento que leva o usuário a outro lugar é um link, não um
botão — muda o papel para leitores de tela, muda o comportamento de teclado (Enter sem
Espaço), e quebra abrir em nova aba. Se o clique muda a URL, use um link.

## Quando não usar

- **Para navegar.** Use um link estilizado. Um `<button onClick={() => router.push()}>` é o
  erro mais comum e o mais invisível para quem enxerga.
- **Para alternar um estado ligado/desligado.** Isso é `Switch` ou `ToggleButton`, que
  anunciam o estado. Um botão que muda de rótulo entre "Ativar" e "Desativar" não anuncia
  nada.
- **Para uma lista de ações.** Três ou mais botões lado a lado geralmente pedem um menu.

## API

| Prop | Valores | Padrão | Descrição |
|---|---|---|---|
| `variant` | `default` · `destructive` · `outline` · `secondary` · `ghost` · `link` | `default` | Peso visual da ação. Nomenclatura do shadcn |
| `size` | `default` · `sm` · `lg` · `icon` | `default` | Altura do controle |
| `loading` | `boolean` | `false` | Ação em andamento |
| `disabled` | `boolean` | `false` | Indisponível |
| `type` | `button` · `submit` · `reset` | `button` | Igual ao HTML |
| `children` | `ReactNode` | — | Rótulo, e opcionalmente ícones |

Mais os atributos nativos de `<button>`. Nenhum tipo vindo de biblioteca externa.

**O padrão é `default`, que é a cor primária da marca.** A nomenclatura vem do shadcn, onde
`default` é o botão de ação principal. Uma tela deve ter **um** primário — para as ações de
apoio ao lado dele existem `outline`, `secondary` e `ghost`.

Mais duas props vindas do shadcn: `asChild`, que delega o elemento ao filho (para envolver um
link mantendo o estilo), e `buttonVariants`, exportado para quem precisa das classes sem o
componente.

**Ícone não tem prop.** `<Button><IconSave /> Salvar</Button>` funciona: o botão aplica o
gap por token. Prop de ícone existiria só para controlar posição, e composição já resolve
isso sem inventar API.

### Deliberadamente fora, por ora

Os tamanhos `xs`, `icon-xs`, `icon-sm` e `icon-lg` que o shadcn passou a documentar. São
aditivos e entram quando houver consumidor — hoje o parking-new-front usa só os quatro acima.

## Anatomia

```
┌─────────────────────────────┐
│  [ícone]  rótulo  [ícone]   │   gap: space.xs
└─────────────────────────────┘
   ↑ padding lateral: space.md
   altura: size.control.{size}
   alvo clicável: nunca menor que size.target.min
```

Quando `loading`, um indicador substitui o conteúdo **sem mudar a largura do botão** — botão
que encolhe ao carregar move o layout inteiro e faz o usuário errar o clique seguinte.

## Estados

| Estado | Comportamento |
|---|---|
| repouso | — |
| hover | Fundo escurece um degrau. Só em dispositivo com ponteiro |
| foco visível | Anel de 3px. Aparece com teclado; não aparece em clique de mouse |
| pressionado | Fundo escurece mais um degrau |
| desabilitado | Sem interação, sem foco, cursor padrão |
| carregando | **Continua focável.** Clique e submit são ignorados |

**Carregando não é desabilitado.** `disabled` tira o elemento da ordem de tabulação — se o
foco estava nele quando a ação começou, o foco vai para o `<body>` e o usuário de teclado se
perde. Além disso leitores de tela não anunciam mudanças em elemento desabilitado, então o
"carregando" passaria despercebido justamente por quem mais precisa do aviso.

## Tokens consumidos

Esta seção é **normativa e completa**: uma implementação nova se constrói a partir dela, sem
consultar nenhuma implementação existente. Se faltar aqui um valor que uma plataforma
precisou inventar, o defeito é do contrato — corrige-se aqui, não no código.

### Por variante

| variante | fundo | frente | borda |
|---|---|---|---|
| `default` | `color.action.primary.background.*` | `color.action.primary.foreground.*` | — |
| `destructive` | `color.action.danger.background.*` | `color.action.danger.foreground.*` | — |
| `outline` | `color.action.outline.background.*` | `color.action.outline.foreground.*` | `color.action.outline.border.default` |
| `secondary` | `color.action.secondary.background.*` | `color.action.secondary.foreground.*` | — |
| `ghost` | `color.action.ghost.background.*` | `color.action.ghost.foreground.*` | — |
| `link` | transparente | `color.action.link.foreground.*` | — |

O `*` resolve por estado: `default`, `hover`, `active`, `disabled`. Onde a variante não
define um estado, ele herda o `default`.

A borda de `outline` usa `border.default` da própria variante (3,23:1) e **não**
`color.border.default` (1,63:1): num botão contornado a borda é o que identifica o controle,
e a WCAG 1.4.11 exige 3:1 para isso.

### Por tamanho

| tamanho | altura | padding lateral | gap |
|---|---|---|---|
| `default` | `size.control.md` | `space.md` | `space.xs` |
| `sm` | `size.control.sm` | `space.sm` | 6px |
| `lg` | `size.control.lg` | `space.lg` | `space.xs` |
| `icon` | `size.control.md`, quadrado | — | — |

Com ícone presente, o padding lateral cai um degrau — o ícone já traz margem óptica.

### Comuns a todas

| Papel | Token |
|---|---|
| raio | `radius.control` |
| anel de foco | `color.border.focus`, 3px, 50% de opacidade |
| borda em `aria-invalid` | `color.action.danger.background.default` |
| alvo clicável | nunca menor que `size.target.min`, mesmo em `sm` |
| tipografia | `typography.label.md` |
| ícone | `size.icon.sm` quando não vier dimensionado |

A superfície primária é um tom escuro do verde com texto branco (6,41:1), **não** o verde do
símbolo. `#02cb03` com branco dá 2,20:1 — marca e ação são coisas separadas, e `color.brand`
existe justamente para a primeira.

**Estados vêm de tokens, nunca de opacidade.** Um valor gerado por `opacity` não é medido,
não está no contrato de contraste e muda conforme o fundo atrás. Todos os pares acima estão
verificados na página de Contraste.

## Teclado

| Tecla | Efeito |
|---|---|
| `Tab` | Recebe foco, na ordem visual |
| `Enter` | Aciona |
| `Espaço` | Aciona |

Comportamento nativo do `<button>`. Se a implementação precisar recriar isso à mão, ela está
usando o elemento errado.

## Acessibilidade

- **Papel:** `button` — vindo do elemento `<button>`, não de `role="button"`.
- **Nome acessível:** o conteúdo textual. Botão só de ícone exige `aria-label`; sem ele, o
  componente **avisa no console em desenvolvimento**. O caminho acessível precisa ser o
  caminho fácil, e o inacessível precisa ser barulhento.
- **Anunciado:** nome, papel e, quando carregando, o estado ocupado via `aria-busy`.
- **Alvo de toque:** nunca menor que `size.target.min`, mesmo com `size="sm"`. A área
  clicável pode ultrapassar o desenho visível.
- **Foco:** sempre visível. `:focus-visible`, para não aparecer em clique de mouse.
- **Auditoria manual:** pendente — obrigatória antes de passar para `estável`.

## Conformidade

Este documento é verificado por `@venice-sistemas/contracts/button` — 27 asserções que rodam
contra **cada** implementação. Uma plataforma nova passa a suíte implementando o contrato,
nunca lendo outra implementação.

A suíte usa `@testing-library/dom`, que trabalha sobre o DOM já montado. A plataforma
fornece só uma função de montar:

```js
import { runButtonContract } from '@venice-sistemas/contracts/button';

runButtonContract({
  nome: 'Button (angular)',
  render: (props) => { /* monta no document.body */ },
  cleanup: () => { /* desmonta */ },
});
```

O que a suíte **não** cobre: aparência. Cor, altura e espaçamento vêm dos tokens e são
verificados uma vez, no pacote de tokens, para todas as plataformas.

Se um teste falhar, não conserte o teste. Ou a implementação divergiu, ou o contrato está
errado — e no segundo caso a correção é aqui, junto com a suíte.

## Plataformas

| Plataforma | Situação | Notas |
|---|---|---|
| web (react) | `em construção` | `<button>` nativo; sem biblioteca headless, porque não há comportamento complexo a delegar |
| angular | `não implementado` | Seria `<button>` nativo também. O comportamento complexo, quando houver, vem do Angular CDK — nunca de biblioteca estilizada |
| react native | `não implementado` | Será `Pressable`. Sem hover; o resto do contrato vale igual |
