# Contrato — Card

**Situação:** web `em construção` · react native `não implementado`
**Última revisão:** 2026-08-10

## Propósito

Superfície que agrupa conteúdo relacionado e o separa visualmente do restante da página.

**Não resolve:** hierarquia de documento, navegação e ênfase por cor. O Card não declara
cabeçalho, não declara região e não tem variante.

## Quando não usar

- **Para mensagem de erro ou aviso** — use `Alert`, que tem os tokens de feedback medidos.
  Um card vermelho é uma decisão de cor solta na tela.
- **Para item de lista repetido** — considere uma lista com `<li>`. Um card por item vira uma
  parede de bordas, e a semântica de lista se perde.
- **Para agrupar campos de formulário** — `<fieldset>` com `<legend>` dá o agrupamento de
  graça no leitor de tela; o Card só dá a caixa.

## API

Composição, não configuração:

| Parte | Elemento | Descrição |
|---|---|---|
| `Card` | `div` | A superfície |
| `CardHeader` | `div` | Título e descrição |
| `CardTitle` | `div` | Título — **sem nível de cabeçalho** |
| `CardDescription` | `div` | Texto de apoio |
| `CardContent` | `div` | Conteúdo |
| `CardFooter` | `div` | Ações ou metadados |

Todas aceitam `className`.

**Por que partes e não props.** Uma prop `title: string` obrigaria uma segunda prop no dia em
que alguém precisasse de um ícone ao lado do título, e uma terceira no dia seguinte. Conteúdo
de card é arbitrário por natureza.

## Duas ausências deliberadas

**`CardTitle` não é `<h3>`.** O Card não sabe em que nível da hierarquia da página está.
Chutar um nível produz documento com cabeçalhos fora de ordem, e isso atrapalha a navegação
por leitor de tela mais do que a ausência de cabeçalho. Quem sabe o nível é a tela:

```tsx
<CardTitle asChild><h2>Setor Centro</h2></CardTitle>
```

**`Card` não é `role="region"`.** Região sem nome acessível é anunciada como "região", sem
dizer qual. Quem precisa disso declara na tela, com `aria-labelledby` apontando para o título.

## Anatomia

```
Card                     superfície, borda, elevação `raised`, padding vertical
├── CardHeader           padding horizontal
│   ├── CardTitle
│   └── CardDescription
├── CardContent          padding horizontal
└── CardFooter           padding horizontal
```

O padding horizontal mora nas partes, não na raiz. É o que permite um conteúdo de largura
total — uma tabela, uma imagem — encostar nas bordas sem desfazer o padding do resto.

## Estados

O Card não tem estados. Ele é superfície, não controle. Um card clicável é um card contendo um
controle, e é o controle que tem hover e foco.

## Tokens consumidos

| Papel | Token |
|---|---|
| fundo | `color.surface.default` |
| texto | `color.text.primary` |
| borda | `color.border.default` |
| descrição | `color.text.secondary` |
| elevação | `elevation.raised` |
| raio | `radius.container` |
| espaçamento | `space.lg`, `space.2xs`, `space.sm` |

A elevação vem de token **semântico**, nunca de `shadow-sm`. React Native não tem `box-shadow`,
e "pequeno" não tem tradução para `elevation` do Android nem para `shadowOffset` do iOS.

## Verificação

`packages/react/src/card/card.test.tsx`. Sem contrato executável compartilhado: o que o Card
garante não é comportamento, é a ausência de semântica inventada.
