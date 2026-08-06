# @rizzopark/tokens

Fonte única de verdade dos nossos valores visuais.

É o único pacote do Design System consumido por **todas** as superfícies — os serviços
Next.js, os dois apps React Native e, opcionalmente, o S2Way em CakePHP. Por isso ele não
sabe que React existe.

---

## Uso

```bash
pnpm add @rizzopark/tokens
```

**Web** — importe o CSS uma vez, na raiz da aplicação:

```
@rizzopark/tokens/css        variáveis CSS + @font-face da Poppins
@rizzopark/tokens/tailwind   camada @theme do Tailwind v4 (opcional, importar DEPOIS do css)
@rizzopark/tokens            objetos tipados, quando precisar do valor em JS
```

**React Native:**

```
@rizzopark/tokens/native     objetos com número em vez de rem, e sombra no formato RN
```

A Poppins precisa ser empacotada e linkada no app RN — os arquivos estão em
`@rizzopark/tokens/fonts/`. No web isso é automático via `@font-face`.

---

## Estrutura

```
src/
├── primitive/          PRIVADO — tudo sob a raiz `base`, o build não emite
│   ├── color.json          escalas derivadas em OKLCH
│   ├── scale.json          espaço, raio, borda, tamanho, z-index, breakpoint
│   └── typography.json     famílias, tamanhos, pesos, alturas de linha
└── semantic/           PÚBLICO — é isto que componente e aplicação consomem
    ├── color.json
    ├── layout.json
    └── typography.json

contrast-pairs.json     contrato de contraste — executado por test/contrast.test.mjs
build.mjs               Style Dictionary: uma fonte, quatro saídas
```

---

## As duas camadas

```
base.color.brand.500 = #02cb03          primitivo — "que valores existem"
        ↓
color.action.primary.background.default  semântico — "o que este valor significa"
```

**Primitivos vivem sob a raiz `base` e o build não os emite.** A fronteira é estrutural,
não convencional: não existe como consumir um primitivo por acidente, porque ele não chega
ao `dist`.

Isso não é purismo. É o que permite trocar a paleta, introduzir tema por município ou um
modo de alto contraste sem tocar em componente — e com seis superfícies em repositórios
separados, um `find & replace` coordenado é impossível.

**Não existe camada de component tokens** (`button.background`). Ela só será criada se o
white-label por município for confirmado (P-01), ou quando a camada semântica
comprovadamente não expressar alguma necessidade.

---

## Como a paleta foi derivada

Cor de marca: **`#02cb03`**. Em OKLCH: `L 0.7298 · C 0.2477 · H 142.52°`.

As escalas foram geradas em OKLCH — espaço perceptualmente uniforme, então os degraus têm
distância visual constante, o que não acontece mexendo em HSL. Três propriedades:

1. **`base.color.brand.500` é `#02cb03` exato.** A cor institucional existe literalmente no
   sistema; design e marketing não usam um verde diferente do código.
2. **Todas as escalas compartilham as mesmas lightness por degrau.** `brand.700` e
   `danger.700` têm a mesma luminosidade, então são intercambiáveis no mesmo contexto sem
   quebrar a hierarquia visual.
3. **O croma nunca zera nos extremos.** `brand.50` é um verde muito claro, não um cinza.

**A saída é sempre hex, nunca `oklch()`.** A WebView Android do terminal PagSeguro pode não
suportar a função em CSS. Derivamos *em* OKLCH; gravamos e emitimos hex. Revisitar quando
P-06 (matriz de dispositivos) for respondida.

---

## O problema do verde, e como ele foi resolvido

`#02cb03` é um verde muito luminoso. Isso tem uma consequência que decide o desenho de
metade dos componentes:

| Combinação | Contraste | Veredito |
|---|---|---|
| Texto **branco** sobre `#02cb03` | **2,20:1** | ❌ reprova (mínimo 4,5:1) |
| `#02cb03` como **texto** sobre branco | **2,20:1** | ❌ reprova |
| Texto **preto** sobre `#02cb03` | **9,55:1** | ✅ passa com folga |

Nenhum degrau da marca de `50` a `700` atinge 4,5:1 com texto branco. O botão primário
verde com texto branco — que é o que todo mundo desenha primeiro — é inacessível nesta
marca.

**A solução:** o botão primário usa **frente preta** sobre a marca pura. A cor institucional
aparece em toda a sua intensidade, o contraste vai a 9,55:1, e os estados escurecem o fundo
mantendo a frente preta (`hover` 7,05:1 · `active` 4,87:1).

Onde o verde precisa ser *texto* — link, ícone, botão contornado, anel de foco — usa-se
`base.color.brand.800` (`#006f00`, 6,41:1) via `color.text.link` ou `color.border.focus`,
nunca a marca pura.

**Não use modificador de opacidade para estados** (`hover:bg-primary/90`). Valor gerado por
opacidade não é medido, não está no contrato e muda conforme o fundo atrás. Os estados têm
tokens próprios, e eles são verificados.

---

## O contrato de contraste

`contrast-pairs.json` declara 19 pares permitidos (com o mínimo WCAG de cada) e 3
combinações proibidas. `test/contrast.test.mjs` executa esse contrato contra a **saída do
build** — não contra a fonte, porque o que chega no produto é o valor resolvido.

```bash
pnpm test
```

O teste falha em três situações, e as três são desejadas:

1. Um par permitido cai abaixo do mínimo.
2. Uma combinação proibida passa a atingir 4,5:1 — a proibição virou mentira e a
   documentação precisa mudar.
3. O campo `measured` do JSON diverge do valor real — impede que o contrato apodreça.

Contraste é a única regra de acessibilidade totalmente automatizável. Não automatizá-la
seria desperdício, então ela quebra o build.

---

## Duas decisões que valem revisão explícita

**1. `success` não tem escala própria — reaproveita a da marca.**
Dois verdes quase iguais no mesmo sistema leem como bug, não como intenção. A distinção
entre "ação" e "sucesso" vem da forma (botão preenchido vs badge tingido), não do matiz.
Consequência prática: no domínio, um status "pago/regular" e um botão primário compartilham
o matiz — mas nunca a forma.

**2. Os cinzas são puros, sem tingimento verde.**
Com uma marca tão saturada, um cinza esverdeado competiria com os estados de status do
domínio em baixa saturação. Se o design preferir um tingimento sutil, é uma linha na
geração.

---

## Tipografia

**Poppins**, SIL Open Font License 1.1 — cobre uso web **e** empacotamento no app React
Native, que são licenças distintas. Auto-hospedada, não CDN do Google: melhor para nossos
dispositivos de campo, sem dependência externa em produção e mais defensável em LGPD.

Três pesos (400/500/700), subset `latin`, que cobre todos os diacríticos do português
(`ã õ ç á é í ó ú â ê ô à` estão em U+00C0–U+00FF).

`typography.family.mono` existe para números, identificadores e códigos: monoespaçado
alinha dígitos em coluna, o que torna listas e tabelas de valores bem mais fáceis de varrer.

---

## Assimetrias entre plataformas

O build transforma, não copia:

| Categoria | Web | React Native |
|---|---|---|
| Espaço, tamanho de controle, tamanho de fonte | `rem` — escala com a preferência do usuário | número (dp) — **não** escala |
| Raio, largura de borda, breakpoint | `px` — borda em rem borra em certos zooms | número |
| Família | stack completo com fallback | só `"Poppins"` — RN não aceita stack |
| Elevação | `box-shadow` | `{ shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation }` |

Por isso `elevation` é modelada como **nível semântico** (`flat`, `raised`, `overlay`) e
nunca como valor de sombra: um `box-shadow` literal seria intraduzível para o RN. A tabela
de tradução vive em `build.mjs` e é o único lugar onde sombra vira valor.

---

## Em aberto

- Lint proibindo literal de cor e uso de primitivo fora deste pacote (as regras estão
  descritas em `packages/eslint-config/index.js`).
- Migrar a saída de cor de hex para `oklch()`, se a matriz de dispositivos permitir (P-06).
