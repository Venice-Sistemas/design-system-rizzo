# Contrato — Skeleton

**Situação:** web `em construção` · react native `não implementado`
**Última revisão:** 2026-08-10

## Propósito

Bloco que ocupa o lugar do conteúdo enquanto ele carrega, preservando o layout para que a
página não salte quando o conteúdo chegar.

**Não resolve:** anunciar o carregamento. Isso é responsabilidade da região que contém os
esqueletos — é lá que se sabe *o que* está carregando.

## Quando não usar

- **Para carregamento de uma ação** (salvar, entrar) — use `loading` no `Button`. O esqueleto
  é para conteúdo que ainda não existe, não para ação em andamento.
- **Quando o layout final é imprevisível** — um esqueleto com forma errada engana mais do que
  ajuda, porque a página salta de qualquer jeito. Prefira um indicador simples.
- **Para esperas abaixo de ~300ms** — o esqueleto pisca e o efeito é de defeito, não de
  carregamento.

## API

| Prop | Valores | Padrão | Descrição |
|---|---|---|---|
| `className` | `string` | — | **A forma vem daqui** — altura, largura e raio |

Sem `variant` e sem `size`, de propósito. Um esqueleto só cumpre a função se tiver a medida do
conteúdo que substitui; tamanhos próprios (`sm`/`md`/`lg`) produziriam blocos que não
correspondem a nada na tela.

## A regra que importa

**O esqueleto sai da árvore acessível** (`aria-hidden="true"`).

Ele é decoração de carregamento, não conteúdo. Sem isso, um leitor de tela percorre uma
sequência de caixas vazias enquanto a página carrega — ruído que não informa nada e que dá a
impressão de que a página está quebrada.

Quem precisa anunciar o carregamento faz na região:

```tsx
<div aria-busy={carregando} aria-live="polite">
  {carregando ? <Skeleton className="ds:h-4 ds:w-32" /> : <p>{nome}</p>}
</div>
```

## Estados

| Estado | Comportamento |
|---|---|
| repouso | pulsação contínua |
| movimento reduzido | **bloco parado**, sem pulsação |

A degradação com `prefers-reduced-motion` é perda de animação, não de função: um retângulo
cinza estático continua comunicando "aqui vem algo".

## Tokens consumidos

| Papel | Token |
|---|---|
| fundo | `color.action.ghost.background.hover` |
| raio | `radius.control` |

O fundo é o mesmo cinza de baixa ênfase usado em hover de menu. Ele não precisa passar em
contraste: não carrega informação, e por isso está fora do contrato de contraste.

## Verificação

`packages/react/src/skeleton/skeleton.test.tsx`. Sem contrato executável compartilhado — o
componente não tem comportamento além do `aria-hidden`, que o teste de plataforma já cobre.
