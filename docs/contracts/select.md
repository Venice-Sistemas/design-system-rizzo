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

Seis partes, não as onze do shadcn:

| Parte | Descrição |
| --- | --- |
| `Select` | Raiz. Aceita `value`, `defaultValue`, `onValueChange`, `disabled`, `name`, `required` |
| `SelectTrigger` | O que abre. Tem a altura e a borda do `Input`, e declara `aria-invalid` |
| `SelectValue` | O valor escolhido dentro do gatilho. Aceita `placeholder` |
| `SelectContent` | O painel de opções |
| `SelectItem` | Uma opção. Aceita `value` e `disabled` |
| `SelectSeparator` | Divisor visual |

**Ficaram de fora:** `SelectGroup`, `SelectLabel`, `SelectScrollUpButton`,
`SelectScrollDownButton` e `SelectIcon`. Cinco partes sem consumidor hoje. Entram
quando houver demanda — é a regra do repositório, e adicionar depois custa menos
que manter o que ninguém usa.

Nenhum tipo de biblioteca externa aparece na superfície pública.

## Anatomia

```
SelectTrigger  ┌──────────────────────┐
               │ São Paulo         ▾  │   ← SelectValue + chevron decorativo
               └──────────────────────┘
SelectContent  ┌──────────────────────┐
               │ ✓ São Paulo          │   ← SelectItem selecionado
               │   Rio de Janeiro     │
               └──────────────────────┘
```

O gatilho é visualmente um campo, não um botão: ele fica ao lado de `Input` em
formulários, e altura ou borda diferentes desalinham a linha.

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

- **Papel:** `combobox` no gatilho, `listbox` no painel, `option` nos itens
- **Nome acessível:** do `Label` associado, ou de `aria-label` no gatilho
- **Anunciado:** o valor escolhido, a posição na lista, e o estado aberto/fechado
  via `aria-expanded`
- **Alvo de toque:** altura de `size.control.md`, ≥ 36px
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
