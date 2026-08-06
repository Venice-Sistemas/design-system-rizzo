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
| `variant` | `primary` · `secondary` · `danger` · `ghost` | `secondary` | Peso visual da ação |
| `size` | `sm` · `md` · `lg` | `md` | Altura do controle |
| `loading` | `boolean` | `false` | Ação em andamento |
| `disabled` | `boolean` | `false` | Indisponível |
| `type` | `button` · `submit` · `reset` | `button` | Igual ao HTML |
| `children` | `ReactNode` | — | Rótulo, e opcionalmente ícones |

Mais os atributos nativos de `<button>`. Nenhum tipo vindo de biblioteca externa.

**O padrão é `secondary`, não `primary`, de propósito.** Uma tela deve ter um botão primário,
não seis. Se o padrão fosse `primary`, o caminho preguiçoso seria o errado — e o caminho
preguiçoso é o que acontece.

**Ícone não tem prop.** `<Button><IconSave /> Salvar</Button>` funciona: o botão aplica o
gap por token. Prop de ícone existiria só para controlar posição, e composição já resolve
isso sem inventar API.

### Deliberadamente fora, por ora

`asChild` / polimorfismo (renderizar como outro elemento) e `fullWidth`. Nenhum dos dois tem
consumidor real ainda, e `asChild` é idioma de biblioteca — entra só se uma tela exigir, e
com nome nosso.

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
| foco visível | Anel de 2px com offset. Aparece com teclado; não aparece em clique de mouse |
| pressionado | Fundo escurece mais um degrau |
| desabilitado | Sem interação, sem foco, cursor padrão |
| carregando | **Continua focável.** Clique e submit são ignorados |

**Carregando não é desabilitado.** `disabled` tira o elemento da ordem de tabulação — se o
foco estava nele quando a ação começou, o foco vai para o `<body>` e o usuário de teclado se
perde. Além disso leitores de tela não anunciam mudanças em elemento desabilitado, então o
"carregando" passaria despercebido justamente por quem mais precisa do aviso.

## Tokens consumidos

| Papel | Token |
|---|---|
| fundo | `color.action.{variant}.background.default` |
| fundo · hover | `color.action.{variant}.background.hover` |
| fundo · pressionado | `color.action.{variant}.background.active` |
| fundo · desabilitado | `color.action.{variant}.background.disabled` |
| frente | `color.action.{variant}.foreground.default` |
| frente · desabilitado | `color.action.{variant}.foreground.disabled` |
| borda (`secondary`) | `color.action.secondary.border.default` |
| anel de foco | `color.border.focus`, `border.focus.width`, `border.focus.offset` |
| altura | `size.control.{size}` |
| alvo clicável | `size.target.min` |
| raio | `radius.control` |
| espaçamento interno | `space.md` lateral, `space.xs` entre ícone e rótulo |
| tipografia | `typography.label.md` |

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

## Plataformas

| Plataforma | Situação | Notas |
|---|---|---|
| web | `em construção` | `<button>` nativo; sem biblioteca headless, porque não há comportamento complexo a delegar |
| react native | `não implementado` | Será `Pressable`. Sem hover; o resto do contrato vale igual |
