# Contrato — Select

**Situação:** web `em construção` · react native `não implementado`
**Última revisão:** 2026-08-13

## Propósito

Escolha de **um** valor entre opções conhecidas, dentro de um formulário.

**Não resolve:** ação (isso é `DropdownMenu`), escolha múltipla, busca dentro das
opções e criação de valor novo.

## Quando não usar

- **Para executar ação** — `DropdownMenu`. Menu executa; select define dado, e a
  diferença aparece no que o leitor de tela anuncia.
- **Para duas ou três opções visíveis ao mesmo tempo** — rádio. O select esconde
  as alternativas atrás de um clique, e comparar exige abrir.
- **Para mais de ~30 opções** — o valor passa a ser encontrado por digitação, e
  isso é um combobox. Este componente não tem busca.
- **Para ligar/desligar** — `Checkbox`.

## Select é dado; menu é ação

A distinção não é estética, é o que muda o anúncio:

```
DropdownMenu   role="menu"      → "menu, 5 itens"
Select         role="listbox"   → "caixa de combinação, São Paulo, 1 de 27"
```

Um select construído com `menuitem` promete ação e entrega dado. Quem enxerga não
nota; quem usa leitor de tela recebe a categoria errada.

## API

Oito partes, não as onze do shadcn:

| Parte | Descrição |
| --- | --- |
| `Select` | Raiz. Aceita `value`, `defaultValue`, `onValueChange`, `disabled`, `name`, `required` |
| `SelectTrigger` | O que abre. Tem a altura e a borda do `Input`, e declara `aria-invalid`. Aceita um ícone antes do `SelectValue` |
| `SelectValue` | O valor escolhido dentro do gatilho. Aceita `placeholder` |
| `SelectContent` | O painel de opções |
| `SelectGroup` | Agrupa opções sob um rótulo. Só faz sentido com `SelectLabel` dentro |
| `SelectLabel` | O rótulo do grupo. **Não é opção:** não recebe foco, não é escolhível |
| `SelectItem` | Uma opção. Aceita `value` e `disabled` |
| `SelectSeparator` | Divisor visual |

**Ficaram de fora:** `SelectScrollUpButton`, `SelectScrollDownButton` e
`SelectIcon`. Os dois botões de rolagem são a afordância do modo `item-aligned`
do Radix; no modo `popper`, que é o nosso, a barra de rolagem nativa já atende
roda, trackpad e toque. Entram se aparecer consumidor — adicionar depois custa
menos que manter o que ninguém usa.

Nenhum tipo de biblioteca externa aparece na superfície pública.

## Anatomia

```
SelectTrigger  ┌──────────────────────┐
               │ São Paulo         ▾  │   ← SelectValue + chevron decorativo
               └──────────────────────┘
SelectContent  ┌──────────────────────┐
               │ Sudeste              │   ← SelectLabel, dentro de SelectGroup
               │ ✓ São Paulo          │   ← SelectItem selecionado
               │   Rio de Janeiro     │
               │ ──────────────────── │   ← SelectSeparator
               │ Sul                  │
               │   Paraná             │
               └──────────────────────┘
```

O gatilho é visualmente um campo, não um botão: ele fica ao lado de `Input` em
formulários, e altura ou borda diferentes desalinham a linha.

**A opção tem a altura do campo**, não a do alvo de toque. A lista abre colada ao
gatilho, e 8px de diferença entre os dois viram um degrau visível. O mínimo de
24px do WCAG 2.5.8 continua satisfeito com folga; o de 44px do 2.5.5, que é AAA,
deixa de ser — é uma troca deliberada, não um descuido.

## Ícone

O gatilho aceita **um ícone antes do `SelectValue`**:

```tsx
<SelectTrigger>
  <MapPin aria-hidden />
  <SelectValue placeholder="Selecione" />
</SelectTrigger>
```

Ele é dimensionado e impedido de encolher pelo próprio gatilho; a cor fica com
quem o coloca. **Não gira ao abrir** — a rotação mira o chevron pelo `data-slot`,
e girar um pino de mapa porque a lista abriu não comunica nada.

O ícone é decorativo: leva `aria-hidden`. Se ele for a única pista do que o campo
significa, o problema é a falta de rótulo, e ícone nenhum resolve.

`SelectItem` também aceita ícone, pela mesma regra de dimensionamento.

## Lista longa

O painel cresce até o que couber entre o gatilho e a borda da janela, e a partir
daí **rola**. O teto vem do Radix, que mede o espaço disponível; não é um número
escolhido à mão, porque o espaço depende de onde o gatilho está na tela.

Rolar não muda o valor: o destaque acompanha a seta do teclado, e só `Enter`
escolhe.

A rolagem **não tem asserção na suíte** — jsdom não faz layout, então nada ali
rola de verdade e um teste passaria sem provar nada. É verificada no Storybook,
na story `Escolha` com as 27 UFs.

## Estados

| Estado | Comportamento |
| --- | --- |
| repouso | Borda de campo; placeholder quando não há valor |
| hover | Sem mudança de cor — o gatilho é campo, e campo não reage a hover |
| foco visível | Anel de foco do campo, o mesmo do `Input` |
| aberto | `data-state="open"`; chevron gira |
| item selecionado | Marca de seleção à esquerda, e `aria-selected="true"` |
| desabilitado | Opacidade reduzida, cursor bloqueado, não abre |
| inválido | `aria-invalid` pinta borda e anel, como no `Input` |

## Tokens consumidos

| Papel | Token |
| --- | --- |
| Altura do gatilho | `size.control.md` |
| Borda do gatilho | `border.input` |
| Fundo do gatilho | `bg.card` |
| Texto | `text.foreground` |
| Placeholder | `text.placeholder` |
| Anel de foco | `ring` |
| Borda e anel de erro | `destructive` |
| Painel | `overlayPanel` (fundo `popover`, borda `border`) |
| Item em destaque | `bg.accent` / `text.accent-foreground` |

Nenhum valor novo: o gatilho reusa os do `Input` e o painel os do `Popover`.

## Teclado

O modelo é o de campo, não o de menu — **`Tab` alcança o gatilho**, ao contrário
do `DropdownMenu`, onde `Tab` fecha.

| Tecla | Efeito |
| --- | --- |
| `Tab` | Alcança e sai do gatilho |
| `Enter` / `Espaço` / `↓` / `↑` | Abre o painel |
| `↓` / `↑` (aberto) | Move entre opções |
| `Home` / `End` | Primeira e última opção |
| letra | Salta para a próxima opção iniciada por ela |
| `Enter` | Escolhe e fecha |
| `Escape` | Fecha **sem** alterar o valor, e devolve o foco ao gatilho |

`Escape` preservar o valor é o que separa este componente de um menu: cancelar
uma escolha não pode deixar o campo diferente de como estava.

## Acessibilidade

- **Papel:** `combobox` no gatilho, `listbox` no painel, `option` nos itens,
  `group` no `SelectGroup`
- **Nome acessível:** do `Label` associado, ou de `aria-label` no gatilho
- **Grupo:** o `SelectLabel` nomeia o grupo por `aria-labelledby`. O rótulo não é
  `option` e não entra na contagem — anunciar "1 de 32" numa lista de 27 opções
  mais 5 títulos faz a pessoa procurar cinco itens que não existem
- **Anunciado:** o valor escolhido, a posição na lista, e o estado aberto/fechado
  via `aria-expanded`
- **Alvo de toque:** `size.control.md` no gatilho **e na opção** — 36px. Passa no
  mínimo de 24px do WCAG 2.5.8 (AA); não alcança os 44px do 2.5.5 (AAA)
- **Auditoria manual:** pendente

Opção desabilitada **continua anunciada**, com `aria-disabled` — pular esconde
que ela existe, e quem não enxerga fica procurando algo que está ali.

## Dependências

Sobre `@radix-ui/react-select`, e não sobre `<select>` nativo. O nativo acerta
teclado e leitor de tela de graça, mas não aceita marca de selecionado nem item
desabilitado com aparência própria, e no Windows abre um painel do sistema que
ignora o tema — inclusive o escuro.

No React Native a decisão será outra: lá existe `Picker`, e o mapeamento das
partes precisa ser desenhado antes de implementar.

## Verificação

`packages/contracts/src/select.mjs`, executado em
`packages/react/src/select/select.contract.test.tsx`.
