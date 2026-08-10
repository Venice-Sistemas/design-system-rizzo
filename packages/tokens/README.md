# @venice-sistemas/tokens

Fonte única de verdade dos nossos valores visuais.

É o único pacote do Design System consumido por **todas** as superfícies — os serviços
Next.js, os dois apps React Native e, opcionalmente, o S2Way em CakePHP. Por isso ele não
sabe que React existe.

---

## Uso

```bash
pnpm add @venice-sistemas/tokens
```

**Web** — importe o CSS uma vez, na raiz da aplicação:

```
@venice-sistemas/tokens/css        variáveis CSS + @font-face da Poppins
@venice-sistemas/tokens/tailwind   camada @theme do Tailwind v4 (opcional, importar DEPOIS do css)
@venice-sistemas/tokens/shadcn     ponte para apps que já são shadcn — ver abaixo
@venice-sistemas/tokens            objetos tipados, quando precisar do valor em JS
```

### Adotando num app que já é shadcn

`@venice-sistemas/tokens/shadcn` declara as 41 variáveis do contrato do shadcn com os nossos
valores. Importe depois do `@import 'tailwindcss'`, remova essas declarações do seu `:root`,
e **não mexa no seu `@theme inline`** — ele mapeia exatamente as mesmas variáveis.

O que continua sendo seu:

| | Por quê |
|---|---|
| Bloco `.dark` inteiro | O tema escuro ainda não é emitido daqui. Sem ele o app fica claro no modo escuro. Ele sobrepõe a ponte normalmente. |
| Paleta crua (`--rizzo-*`) | Equivale à nossa camada primitiva, que não é emitida. Ainda é referenciada pelo seu `.dark`, então fica até o tema escuro sair daqui. |
| `--stat-*` | São composições suas via `color-mix` sobre variáveis que a ponte fornece. Seguem funcionando, e passam a refletir a paleta verificada. |
| `--font-poppins`, `--auth-*`, `--shadow-card` | Específicas do app. |

Duas coisas mudam de aparência, e as duas são correções:

- **`--primary`** sai de `#0b9e42` para `#006f00`. Com texto branco, de 3,51:1 (reprova AA)
  para 6,41:1.
- **`--chart-2`** sai do dourado da marca para um dourado escuro. Como marca de dado em
  fundo claro, `#ffd700` dá 1,40:1 e some.

A ponte é um alias de saída, não uma segunda fonte de verdade: os valores vêm dos tokens, e
o build **falha** se o mapa apontar para um token que não existe.

**React Native:**

```
@venice-sistemas/tokens/native     objetos com número em vez de rem, e sombra no formato RN
```

A Poppins precisa ser empacotada e linkada no app RN — os arquivos estão em
`@venice-sistemas/tokens/fonts/`. No web isso é automático via `@font-face`.

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

Nenhum degrau da marca de `50` a `700` atinge 4,5:1 com texto branco. O botão primário
verde com texto branco — que é o que todo mundo desenha primeiro — é inacessível com o verde
do símbolo.

**A solução: separar marca de ação.** `color.brand.default` é o `#02cb03`, e serve à
identidade — símbolo, destaque institucional. A superfície de ação é um tom escuro do mesmo
verde, com texto branco:

| Estado | Token | Contraste com branco |
|---|---|---|
| repouso | `brand.800` `#006f00` | 6,41:1 |
| hover | `brand.900` `#005200` | 9,52:1 |
| pressionado | `brand.950` `#11340f` | 13,80:1 |

Onde o verde precisa ser *texto* — link, ícone, botão contornado, anel de foco — usa-se
`brand.800` via `color.text.link` ou `color.border.focus`, nunca a marca pura.

> **Isto corrige um defeito que está no ar.** O `parking-new-front` documenta a mesma
> conclusão no cabeçalho do `globals.css` — *"Ação primária usa o tom 700 (…) Sobre o 700 dá
> ~5,4:1"* — mas o código faz `--primary: var(--rizzo-green)`, que dá **3,51:1** e reprova.
> A análise deles estava certa; só não foi ligada no token.

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
