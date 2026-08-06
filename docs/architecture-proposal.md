# Rizzo Park Design System — Architecture Proposal

**Versão:** 2.0
**Data:** 2026-08-05
**Status:** Proposta — aguardando revisão técnica e de design
**Substitui:** v1.0 (escrita antes do inventário de arquitetura técnica)

> **O que mudou da v1.0 para a v2.0.** A v1.0 foi escrita sem o documento *Arquitetura
> Técnica – Venice (Rizzo Park) v1.0*. Ele respondeu três das quatro pendências bloqueantes
> e **inverteu uma decisão central**: existem **dois aplicativos React Native em produção**.
> A conclusão da v1.0 de que os componentes seriam exclusivamente React-DOM não sobrevive
> ao fato. Mudanças materiais:
>
> | # | v1.0 | v2.0 | Causa |
> |---|---|---|---|
> | 1 | Componentes só React-DOM | Plano de **duas implementações** (web e RN), tokens compartilhados | App do Usuário e App do Operador são RN |
> | 2 | "Com uma superfície, o DS pode ser overengineering" | **Descartado.** São 6+ superfícies em 3 tecnologias de render | Inventário real |
> | 3 | Tema/white-label como pendência aberta | **Tema em runtime é provavelmente obrigatório** | Serviços web em K8s atendem N cidades a partir de um deploy |
> | 4 | Registro/versão como detalhe operacional | **Version skew entre cidades** vira risco de primeira ordem | VM dedicada por cidade = N deploys independentes |
> | 5 | Ícones como subpath do pacote React | Reavaliado — SVG web e RN exigem alvos de build distintos | RN usa `react-native-svg` |
> | 6 | "Primeira tela" totalmente em aberto | Candidato natural identificado: o novo admin do `parking-new` | Reescrita do S2Way em andamento |

> Este documento **não implementa nada**. Existe para ser revisado e contestado antes da
> primeira linha de código.
> Decisões têm ID (`AD-nn`); pendências têm ID (`P-nn`) e estão consolidadas na seção 19.
> Toda recomendação segue **Problema → Decisão → Justificativa → Trade-off → Consequência**.

---

## Sumário

1. [Contexto](#1-contexto) · 2. [Objetivos](#2-objetivos) · 3. [Não objetivos](#3-não-objetivos)
· 4. [Princípios arquiteturais](#4-princípios-arquiteturais) · 5. [Arquitetura conceitual](#5-arquitetura-conceitual)
· 6. [Arquitetura técnica](#6-arquitetura-técnica) · 7. [Design Tokens](#7-design-tokens)
· 8. [Foundations](#8-foundations) · 9. [Components](#9-components) · 10. [Patterns](#10-patterns)
· 11. [Accessibility](#11-accessibility) · 12. [Documentation](#12-documentation)
· 13. [Governance](#13-governance) · 14. [Versioning](#14-versioning) · 15. [Testing](#15-testing)
· 16. [Tooling](#16-tooling) · 17. [Trade-offs](#17-trade-offs) · 18. [Riscos](#18-riscos)
· 19. [Decisões pendentes](#19-decisões-ainda-pendentes) · 20. [Roadmap](#20-roadmap-de-implementação)

---

## 1. Contexto

### 1.1 O ecossistema real

Da *Arquitetura Técnica – Venice (Rizzo Park) v1.0* e do repositório `parking-new`:

**Modelo híbrido.** Núcleo operacional isolado em **VM dedicada por cidade** (S2Way,
`client-api`, `parking-feeder`); serviços transversais e modernos em **Kubernetes**
(Aeropay, OCR, Datahub Panel, serviços web auxiliares).

**Superfícies de interface existentes:**

| Superfície | Tecnologia | Ambiente | Usuário | Público? |
|---|---|---|---|---|
| **S2Way** (painel admin) | CakePHP (legado) | VM por cidade | Equipe interna, gestores municipais | Não |
| **App do Usuário** | **React Native** | iOS / Android | Cidadão | Sim |
| **App do Operador** | **React Native** | Terminal Android PagSeguro | Fiscal de campo | Não |
| **Serviços Web Auxiliares** | **Next.js** | K8s (centralizado) | Cidadão | **Sim** |
| **Frontend do OCR** | **Next.js** | K8s | Equipe interna | Não |
| **Datahub Panel** | CoffeeScript | K8s | Gestão / análise | Não |
| **Novo admin do `parking-new`** | ainda não existe | a definir | Equipe interna, gestores | Não |

**Três fatos derivados que reorganizam toda a proposta:**

**F-1 — Existem duas plataformas de render React, não uma.** React Native (dois apps) e
React DOM (Next.js). Ambos são React — mesmo modelo de componente, hooks e context — mas
com camadas de primitivo e de estilo incompatíveis (`View`/`Text` vs `div`/`span`;
`StyleSheet` vs CSS). É a restrição técnica dominante deste documento.

**F-2 — Serviços centralizados atendem múltiplas cidades a partir de um único deploy.**
Os serviços web auxiliares em K8s são citizen-facing e multi-município. Se a identidade
visual variar por cidade, **não existe alternativa a tema em runtime** — não dá para
compilar um bundle por cidade num serviço compartilhado. O S2Way, por rodar em VM
dedicada, poderia ter tema em build-time; o K8s não. Runtime cobre os dois.

**F-3 — Cada cidade é um deploy independente.** VM dedicada por município significa que
uma mudança de token **não chega a todos ao mesmo tempo**. Cidades diferentes vão rodar
versões diferentes do DS por períodos indeterminados. Isso é um problema de versionamento e
de governança, não de código — e é grave o bastante para ter seção própria (14.3).

**Do `parking-new` (reescrita do S2Way em NestJS):** multi-tenant com escopo por cidade
(ADR-006) e conceito de Rede; M02 prevê quatro perfis de login (administrador, operacional,
usuário externo, fiscal de campo); documentação em pt-BR com ADRs numerados e rastreabilidade
regra ↔ teste; migração incremental com o legado em produção em paralelo.

### 1.2 Onde o DS se encaixa — e onde não se encaixa

Nem toda superfície é cliente do DS. Definir isso agora evita escopo infinito.

| Superfície | Tokens | Componentes | Justificativa |
|---|---|---|---|
| Novo admin do `parking-new` | ✅ | ✅ **web** | Greenfield. Consumidor natural nº 1. |
| Serviços Web Auxiliares (Next.js) | ✅ | ✅ **web** | Citizen-facing, público, e onde a inconsistência é mais visível. |
| Frontend do OCR (Next.js) | ✅ | ✅ **web** | Interno, baixo risco. Bom segundo consumidor. |
| App do Usuário (RN) | ✅ | 🟡 **condicional** | Depende de P-02 (haverá refresh do app?). |
| App do Operador (RN) | ✅ | 🟡 **condicional** | Idem. Restrições de hardware podem exigir tratamento próprio. |
| S2Way (CakePHP) | 🟡 **só tokens** | ❌ | Está sendo substituído. Investir em componentes ali é jogar fora. Tokens via CSS custom properties é barato e evita divergência durante a convivência. |
| Datahub Panel (CoffeeScript) | 🟡 opcional | ❌ | Interno, nicho, tecnologia em fim de vida. Fora do escopo. |
| Aeropay | ❌ | ❌ | Serviço de orquestração. Não tem UI. |

### 1.3 A restrição que nenhum DS de referência resolve

Carbon, Material, USWDS e Polaris foram desenhados para **produto de tela, em escritório,
em hardware bom**. Duas das superfícies da Rizzo Park são o oposto:

- **Fiscal de campo**, ao sol, possivelmente com luva, em **terminal PagSeguro** — tela
  pequena, Android embarcado, toque impreciso, leitura em um segundo.
- **Cidadão na rua**, apressado, tentando ativar ticket antes de sair do carro.

Isso não é detalhe cosmético. Reaparece em contraste (§7), densidade e sizing (§8), alvo de
toque (§11) e na matriz de dispositivos (**P-06**).

---

## 2. Objetivos

Em ordem de prioridade:

1. **Unificar a linguagem visual entre 6+ superfícies em 3 tecnologias de render.** Hoje não
   existe nada garantindo que o verde de "pago" no app do cidadão seja o mesmo do painel.
2. **Acessibilidade embutida**, com atenção especial às superfícies públicas (serviços web
   auxiliares e app do cidadão), onde há exposição legal real.
3. **Acelerar a construção do novo admin do `parking-new`** — o maior bloco de UI nova
   previsto.
4. **Mudança visual centralizada**, sabendo que a propagação não é atômica entre cidades (F-3).
5. **Sobreviver à convivência com o legado.** S2Way permanece em produção por cidade durante
   toda a migração.
6. **Ser barato de manter por um time pequeno.** DS que consome mais do que devolve é passivo.

---

## 3. Não objetivos

- **Não é produto open source.** Sem API pública para terceiros.
- **Não é framework de aplicação.** Sem roteamento, data fetching, estado de servidor ou auth.
- **Não contém regra de negócio.** Nada de `<TicketCard>`, `<PlacaInput>` com validação
  Mercosul ou `<StatusVaga>`. Ver §10.
- **Não unifica RN e web em uma implementação só.** Ver AD-02 — é decisão deliberada, não
  omissão.
- **Não moderniza o S2Way nem o Datahub Panel.** Tokens, no máximo.
- **Não busca paridade de inventário com Carbon/Material.** 60+ componentes é o custo deles,
  não a nossa necessidade.
- **Não substitui discovery de produto.** Define *como* a interface se comporta, não *qual*
  deve existir.

---

## 4. Princípios arquiteturais

**PA-1 — O DS serve superfícies que existem, não hipóteses.** Nenhum componente entra sem
consumidor real esperando.

**PA-2 — Uma camada só é adicionada quando a dor já existe.** Component tokens, temas,
pacotes, plataformas: cada um responde a um problema observado.

**PA-3 — Acessibilidade é propriedade do componente, não do consumidor.** Se dá para usar o
componente certo e produzir tela inacessível, o componente está mal projetado.

**PA-4 — Tokens semânticos são a interface pública; primitivos são detalhe interno.**
Aplicação escreve `color.action.background`, nunca `blue.600`.

**PA-5 — Consistência entre plataformas vem dos tokens e do comportamento, não de código
compartilhado.** O usuário não percebe se web e RN compartilham implementação. Percebe se a
cor de perigo é a mesma e se o botão desabilitado se comporta igual. Otimizar para código
compartilhado sacrificando semântica nativa é otimizar a métrica errada.

**PA-6 — Composição acima de configuração.** Props explodem combinatoriamente; composição, não.

**PA-7 — O DS é opinado, mas tem saída de emergência documentada.** Sem escape hatch, o time
faz fork na aplicação — e aí existem dois DS.

**PA-8 — Antes do 1.0, mudança é barata. Depois, com N cidades em N versões (F-3), é cara
de um jeito que nenhum outro projeto da casa conhece.** A janela para errar é agora.

---

## 5. Arquitetura conceitual

### 5.1 Camadas e dependências

```
┌───────────────────────────────────────────────────────────────────┐
│ GOVERNANCE      quem decide, como muda, como se deprecia          │  transversal
│ DOCUMENTATION   como e por quê usar cada camada                   │  transversal
│ ACCESSIBILITY   restrição sobre tokens, foundations, componentes  │  transversal
└───────────────────────────────────────────────────────────────────┘
                              ⇣ governa · documenta · restringe

  ┌─────────────────────────────────────────────────────────────┐
  │ APPLICATION UI                        fora do Design System │
  │ Tela de gestão de vagas · mapa do fiscal · ativação         │
  └──────────────────────────┬──────────────────────────────────┘
                             │ consome
  ┌──────────────────────────┴──────────────────────────────────┐
  │ TEMPLATES        app shell, layout de página   (AD-13)      │
  ├──────────────────────────┬──────────────────────────────────┤
  │ PATTERNS         formulário · estado vazio · confirmação    │
  ├──────────────────────────┬──────────────────────────────────┤
  │ COMPONENTS       ┌───────┴────────┐   ┌──────────────────┐  │
  │                  │ implementação  │   │  implementação   │  │
  │                  │      WEB       │   │  REACT NATIVE    │  │
  │                  └───────┬────────┘   └────────┬─────────┘  │
  ├──────────────────────────┴─────────────────────┴────────────┤
  │ FOUNDATIONS      regras de uso — cor, tipo, layout, ícones  │
  ├──────────────────────────┬──────────────────────────────────┤
  │ DESIGN TOKENS    ÚNICA camada compartilhada por TODAS as    │
  │                  plataformas — é o ponto de unificação      │
  ├──────────────────────────┬──────────────────────────────────┤
  │ DESIGN PRINCIPLES                                           │
  └─────────────────────────────────────────────────────────────┘
```

**A leitura essencial:** o sistema é um **V invertido**. Ele diverge no topo (duas
implementações de componente) e converge na base (um conjunto de tokens). A unificação é
real, mas acontece na camada de valores e de comportamento documentado — não na de código.

Regra de dependência, como no backend: dependências apontam para dentro. Token não conhece
componente. Componente não conhece pattern.

### 5.2 Responsabilidade por camada

| Camada | Responsabilidade | Compartilhada entre plataformas? | Está no DS? |
|---|---|---|---|
| **Design Principles** | Critério de desempate. Por que o sistema é como é. | ✅ Totalmente | Sim |
| **Design Tokens** | Valor nomeado. Fonte de verdade única. | ✅ Fonte única, **saídas por plataforma** | Sim |
| **Foundations** | Regra de *uso* dos valores. | ✅ Regra compartilhada, **exceções documentadas por plataforma** | Sim |
| **Accessibility** | Baseline + validação. | 🟡 Conceito compartilhado, **APIs divergentes** (ARIA vs `accessibility*`) | Sim (transversal) |
| **Components** | Unidade de UI sem domínio, com a11y embutida. | ❌ **Implementação por plataforma**, contrato compartilhado | Sim |
| **Patterns** | Composição recomendada para problema recorrente. | ✅ Doc compartilhada | Sim (majoritariamente doc) |
| **Templates** | Estrutura de página reutilizável. | ❌ Por plataforma | Condicional (AD-13) |
| **Guidelines** | Terminologia de domínio, tom, mensagens. | ✅ Totalmente | Sim, mínimo |
| **Documentation** | Superfície de consumo, por público. | ✅ Um site | Sim |
| **Governance** | Processo de mudança, versão, depreciação. | ✅ | Sim |

### 5.3 O conceito de *contrato de componente*

Com duas implementações, é preciso um artefato que a v1.0 não previa: o **contrato**. Para
cada componente do DS, um documento único define nome, variantes, estados, tokens
consumidos, comportamento de teclado/toque e requisitos de acessibilidade — **independente
de plataforma**. Web e RN implementam o mesmo contrato.

É o que impede a divergência silenciosa ("o `Select` do app tem busca, o da web não"). O
contrato é revisado uma vez; as implementações são conferidas contra ele.

---

## 6. Arquitetura técnica

### 6.1 A questão central mudou

A v1.0 perguntava "vale a pena ser agnóstico de framework?". Com o inventário real, a
pergunta é outra e mais precisa:

> **Como servir React DOM e React Native sem manter dois design systems?**

Web Components (Estratégia C original) está ainda mais fora: não resolve React Native de
forma alguma. Descartada sem mais análise.

### 6.2 As opções reais

| Critério | **1. Duas implementações, tokens compartilhados** | **2. react-native-web** | **3. Lib universal (Tamagui / NativeWind)** | **4. Lógica compartilhada + views por plataforma** |
|---|---|---|---|---|
| Complexidade | 🟡 média | 🟡 média | 🔴 alta | 🔴 alta |
| Manutenção | 🔴 2× por componente | 🟢 1× | 🟡 1× + a lib | 🟡 1,4× |
| DX web (Next.js/RSC) | 🟢 nativa | 🔴 RNW é client-only, **incompatível com RSC** | 🟡 varia; compilador ajuda | 🟢 nativa |
| DX RN | 🟢 nativa | 🟢 nativa | 🟢 boa | 🟢 nativa |
| **Acessibilidade web** | 🟢 HTML semântico (`button`, `input`, `dialog`) | 🔴 **regressão** — renderiza `div` com ARIA; perde semântica de formulário | 🟡 melhor que RNW, ainda não nativo | 🟢 HTML semântico |
| Performance web | 🟢 CSS estático | 🔴 estilos em runtime, bundle maior | 🟡 compilador mitiga | 🟢 |
| Risco de ecossistema | 🟢 baixo | 🟡 médio | 🔴 aposta grande em uma lib | 🟡 |
| Divergência entre plataformas | 🔴 real, precisa de disciplina | 🟢 nula | 🟢 baixa | 🟡 baixa no comportamento |
| Custo de reverter | 🟢 baixo | 🔴 alto | 🔴 alto | 🟡 |

> **AD-01 — Tokens compartilhados e agnósticos de plataforma; componentes com implementação
> separada por plataforma, sob um contrato comum. Sem react-native-web, sem lib universal.**
>
> **Problema.** Duas plataformas de render, um time pequeno, e a tentação legítima de
> escrever cada componente uma vez só.
>
> **Decisão.** Três camadas:
> — **Tokens:** fonte única em JSON neutro → saídas para CSS custom properties (web), objetos
> TS (RN) e o que mais surgir. Não sabem que React existe.
> — **Contrato de componente** (§5.3): especificação única, revisada uma vez.
> — **Implementações:** `@rizzopark/react` (web, React DOM) e — quando justificado —
> `@rizzopark/native` (RN). Cada uma usa o melhor da sua plataforma.
>
> **Justificativa.** A opção 2 (RNW) unifica o código ao preço de **rebaixar a acessibilidade
> da web**, que é justamente onde há exposição pública e provável exigência contratual (P-04).
> Trocar `<button>` e `<input>` reais por `div` com ARIA é ir na direção contrária do
> objetivo nº 2. Some-se a incompatibilidade com RSC no Next.js. A opção 3 é uma aposta
> grande em uma dependência de terceiros na camada mais crítica do sistema, feita antes de
> termos experiência com o problema. A opção 1 é a única em que cada plataforma entrega o
> melhor que sabe fazer, e a consistência percebida vem de onde ela realmente vem: tokens e
> comportamento (PA-5).
>
> **Trade-off.** Duplicação real de implementação, e risco de divergência silenciosa entre
> plataformas. É o custo assumido, e o maior deste documento.
>
> **Consequência.** O contrato de componente (§5.3) deixa de ser burocracia e vira o
> mecanismo de controle da duplicação. **E o pacote RN é adiado** — ver AD-03. A opção 4
> (lógica compartilhada em hooks, views por plataforma) permanece disponível como otimização
> oportunista para componentes de estado complexo, se a duplicação doer de fato.

> **AD-02 — Componentes web construídos sobre primitivos headless acessíveis.**
>
> **Problema.** Dialog, Select, Combobox, Menu e Tooltip acessíveis exigem trap de foco,
> `aria-activedescendant`, retorno de foco, `inert`, posicionamento com colisão — dezenas de
> casos-limite por componente, invisíveis para quem enxerga.
>
> **Decisão.** Adotar uma biblioteca headless (**Base UI**, **Radix Primitives** ou **React
> Aria Components**) e aplicar a camada visual sobre ela. Nunca reimplementar comportamento
> acessível complexo. Componentes triviais (Badge, Card, Text) dispensam base headless.
>
> **Justificativa.** Time pequeno não tem orçamento para reimplementar — nem para descobrir
> os bugs só quando um usuário de leitor de tela reclamar.
>
> **Trade-off.** Dependência externa em camada crítica. Radix teve períodos de manutenção
> lenta; Base UI é mais nova (colaboração envolvendo autores de Radix, MUI e Floating UI);
> React Aria é a mais completa em a11y e a mais verbosa de estilizar.
>
> **Consequência.** A escolha é **P-11**, resolvida com um spike de 1 dia. Arquiteturalmente
> o que importa é o **encapsulamento**: a aplicação importa `@rizzopark/react`, nunca a
> headless direto. Isso mantém a troca possível. No RN, o equivalente não existe — a
> acessibilidade é feita à mão com `accessibilityRole`/`accessibilityState`, o que é mais um
> motivo para adiar o pacote RN.

> **AD-03 — O pacote React Native é planejado agora e construído depois. Tokens para RN
> entram na fase 1.**
>
> **Problema.** Os dois apps RN já existem e estão em produção. Construir um pacote de
> componentes RN agora significa reescrever a UI de dois apps funcionais — sem que ninguém
> tenha pedido — e dobrar o custo do DS antes de ele provar valor uma vez.
>
> **Decisão.** Fase 1 entrega **tokens para RN** (os apps já podem consumir cores, espaços e
> tipografia corretos) e **nenhum componente RN**. O pacote `@rizzopark/native` é criado
> quando um destes gatilhos disparar:
> — um dos apps RN entrar em refresh/reescrita de UI (**P-02**);
> — um terceiro app RN aparecer;
> — a divergência visual entre app e web virar reclamação concreta de usuário ou de gestor.
>
> **Justificativa.** Tokens capturam a maior parte do valor de unificação por uma fração do
> custo, e são adotáveis **incrementalmente** num app existente (troque um hex por vez).
> Componentes exigem reescrita de tela — adoção tudo-ou-nada. PA-1 e PA-2.
>
> **Trade-off.** Os apps RN continuarão visualmente divergentes em espaçamento, tipografia e
> comportamento até o pacote existir. Tokens resolvem cor; não resolvem "o botão do app tem
> outro raio e outra altura".
>
> **Consequência.** A arquitetura de tokens precisa nascer multiplataforma **na fase 1** —
> não dá para "adicionar RN depois", porque a modelagem de sombra, tipografia e sizing muda
> quando RN é alvo (§7.4). Adiar componentes é barato; adiar a modelagem de token não é.

> **AD-04 — CSS Modules + CSS custom properties no pacote web. Zero runtime.**
>
> **Problema.** Next.js com React Server Components é hostil a CSS-in-JS de runtime
> (styled-components/emotion forçam `"use client"` em tudo e custam por render).
>
> **Decisão.** CSS Modules resolvendo variáveis CSS geradas pelos tokens. Sem
> styled-components, sem emotion. Se os serviços Next.js usarem Tailwind, publicar
> **adicionalmente** um preset que mapeia os tokens; o DS internamente não depende dele.
>
> **Justificativa.** CSS estático é compatível com RSC, tem custo de runtime zero, e o
> consumo por variável CSS é o que viabiliza **tema em runtime sem rebuild** — requisito
> provável por F-2. É também a única forma de o S2Way em CakePHP consumir os mesmos valores.
>
> **Trade-off.** DX inferior à do Tailwind para quem está habituado; exige disciplina de
> cascata quando o componente aceita `className` externo (mitigável com `@layer`).
>
> **Consequência.** Depende de **P-03**. Se os serviços Next.js já usam Tailwind, o preset
> deixa de ser opcional e vira entregável da fase 1 — sem ele, o time escreve
> `bg-[#0F62FE]` e o DS morre por irrelevância.

### 6.3 Dependências técnicas

```
   novo admin        serviços web      frontend OCR       App Usuário    App Operador
   parking-new        auxiliares         (Next.js)           (RN)        (RN/PagSeguro)
        │                 │                  │                 │              │
        └────────┬────────┴──────────────────┘                 └──────┬───────┘
                 │ import                                             │ import
                 ▼                                                    ▼
        ┌──────────────────┐                            ┌──────────────────────────┐
        │ @rizzopark/react │                            │ @rizzopark/native        │
        │  (web · React DOM)│                           │  (AD-03 — adiado)        │
        └────────┬─────────┘                            └────────────┬─────────────┘
                 │                    ┌──────────────────────────────┘
                 │                    │
                 ▼                    ▼
      ┌──────────────────────────────────────────────────────────────────┐
      │ @rizzopark/tokens        fonte: JSON (DTCG)                      │
      │   ├─ tokens.css     → web (Next.js) + S2Way CakePHP              │
      │   ├─ tokens.ts      → web (tipos) + React Native (objetos)       │
      │   └─ tokens.json    → Figma / outros alvos                       │
      └──────────────────────────────────────────────────────────────────┘
                 ▲
                 │ encapsulada, nunca exposta ao app
        ┌────────┴─────────┐
        │ headless a11y    │  Base UI | Radix | React Aria  (P-11)
        └──────────────────┘

      S2Way (CakePHP, VM/cidade) ──<link rel=stylesheet>──► tokens.css   (só tokens)
      Datahub Panel (CoffeeScript) ─ ─ ─ ─ opcional ─ ─ ─ ► tokens.css
```

---

## 7. Design Tokens

Com F-1 e F-2, os tokens deixaram de ser "a camada portátil que é barato ter" e passaram a
ser **a única coisa que unifica o ecossistema**. É a parte mais importante deste documento.

### 7.1 Os três níveis

```
Primitive Tokens        que valores existem no universo da marca
  color.blue.600 = #0F62FE                    → privado ao pacote
        ↓
Semantic Tokens         o que este valor significa no sistema
  color.action.background → color.blue.600    → INTERFACE PÚBLICA
        ↓
Component Tokens        como este componente se desvia
  button.primary.background → color.action.background
```

**Primitive** — paleta bruta, sem opinião de uso. **Não é consumido por aplicação nem por
componente.** Se um componente referencia `color.blue.600`, tema fica impossível e a
revisão deve reprovar.

**Semantic** — a interface pública (PA-4). Nome descreve intenção: `action`, `danger`,
`surface`, `border.subtle`. É o que permite trocar paleta, tema por cidade ou alto contraste
sem tocar em componente.

**Component** — indireção por componente. Dá ponto de override granular. É também a camada
que **explode em tamanho** (Carbon tem milhares) e a principal armadilha de overengineering.

> **AD-05 — Primitive + Semantic na fase 1. Component tokens quando o tema por cidade for
> confirmado, ou sob demanda comprovada.**
>
> **Problema.** Três níveis é o padrão da indústria; o terceiro custa caro e resolve um
> problema que ainda não está confirmado.
>
> **Decisão.** Duas camadas agora. Component token só quando a camada semântica
> comprovadamente não expressar a necessidade — e a criação fica registrada com justificativa.
>
> **Justificativa.** Com um tema, component tokens são indireção pura. Com N temas
> municipais, viram necessários — mas **P-01 ainda não está respondido**.
>
> **Trade-off.** Se o white-label chegar depois, é preciso refatorar os componentes que hoje
> leem o semântico direto.
>
> **Consequência.** O retrabalho é **localizado e aceitável** desde que a nomenclatura
> semântica esteja correta desde o início — por isso AD-06 não é negociável. **Se P-01 for
> "sim", esta decisão é revertida** e component tokens entram na fase 1.

> **AD-06 — Nomenclatura semântica desde o dia um, em todas as plataformas.**
>
> **Problema.** É tentador começar com `--rp-blue-600` porque só existe um tema. Depois, cada
> tema novo vira `find & replace` em 6 superfícies, em 3 tecnologias, em N repositórios.
>
> **Decisão.** Componentes e aplicações **só** consomem tokens semânticos, em web e em RN.
> Primitivos são privados ao pacote de tokens. Regra de lint proíbe o uso externo.
>
> **Justificativa.** Custo zero hoje; preserva a opção mais cara do futuro. Com N repositórios
> separados (F-3), um `find & replace` global é impossível de coordenar.
>
> **Trade-off.** Nomenclatura semântica errada é pior que primitivo — nome que mente confunde
> mais que nome que não diz nada.
>
> **Consequência.** Vale investir tempo real na taxonomia antes de escrevê-la. Eixo sugerido:
> `{categoria}.{papel}.{variante}.{estado}` — ex. `color.action.primary.background.hover`.

### 7.2 Categorias — o que entra agora

| Categoria | Veredito | Quando é necessária | Quando é prematura |
|---|---|---|---|
| **Color** | ✅ **Agora** | Sempre. Maior risco de divergência e o único item de a11y 100% mensurável. | Nunca. |
| **Typography** | ✅ **Agora** | Sempre. Escala ad-hoc é a fonte nº1 de inconsistência percebida. | Nunca — mas comece com **5–6 degraus**, não 12. |
| **Spacing** | ✅ **Agora** | Sempre. Escala base-4 encerra a discussão "14 ou 16?". | Nunca — 7–8 degraus bastam. |
| **Radius** | ✅ **Agora** | 3–4 valores, visível em todo componente, custo ~zero. | Nunca. |
| **Border** | ✅ **Agora**, mínimo | Só *largura* (1px, 2px). As cores vêm de Color. | Categoria completa com estilos compostos. |
| **Sizing** | ✅ **Agora** | **Crítico aqui.** Altura de controle e alvo de toque mínimo, com valores possivelmente distintos entre admin desktop e terminal PagSeguro. Sem token, cada superfície inventa o seu. | Escala completa de largura de container — isso é layout, não token. |
| **Z-index** | ✅ **Agora** | 5–6 níveis nomeados; previne a "guerra do 9999" no admin, que terá modal, dropdown, toast e tooltip cedo. | Nunca — mas mantenha pequeno. |
| **Shadow / Elevation** | 🟡 **Agora, 3 níveis, modelado como semântica** | Necessária no primeiro overlay (fase 1). **Mas ver §7.4** — a modelagem precisa ser de *elevação*, não de valor de sombra, porque RN não tem `box-shadow`. | Escala de 8 níveis com sombras compostas. |
| **Breakpoints** | ✅ **Agora**, mínimo | Serviços web auxiliares são citizen-facing → majoritariamente mobile. Admin é desktop. Os dois no mesmo pacote. 3 breakpoints. | Definir 6 breakpoints. |
| **Motion** | 🔴 **Depois** | Quando houver transição real (drawer, skeleton, toast). | Agora. Sem consumidor, é token morto. **Mas a política de `prefers-reduced-motion` entra já** — política é foundation, não token. |
| **Density** | 🟡 **Modelar agora, ativar depois** | Ver **P-07**. Admin desktop e terminal PagSeguro plausivelmente precisam de escalas de altura/espaço diferentes. | Implementar dois modos completos antes de confirmar a necessidade. |
| **Opacity / Blur** | 🔴 **Provavelmente nunca** | Se surgir sobreposição sofisticada. | Agora e provavelmente sempre. Estado desabilitado deve ser cor semântica, não opacidade. |

> **AD-07 — Escala de cor derivada e validada por contraste, com teste que quebra o build.**
>
> **Problema.** Paleta escolhida a olho produz pares que reprovam em contraste, e isso só
> aparece na auditoria — quando os componentes já existem em 6 superfícies.
>
> **Decisão.** Cada par semântico (texto sobre fundo, borda sobre fundo) tem contraste
> verificado por teste automatizado no pacote de tokens. Par que reprova quebra o build.
>
> **Justificativa.** Contraste é a única regra de acessibilidade totalmente automatizável.
> Não automatizá-la é desperdício. E para uso ao sol, o mínimo WCAG (4.5:1) é **piso**, não meta.
>
> **Trade-off.** Restringe a marca — nem toda cor bonita passa.
>
> **Consequência.** Depende de **P-05** (existe identidade visual definida?). Se houver cor
> institucional fixa que reprova, a saída é derivar variações acessíveis a partir dela e
> reservar a original para uso decorativo/não textual.

### 7.3 Tema em runtime

> **AD-08 — A arquitetura de tokens nasce preparada para tema em runtime, mesmo que só exista
> um tema.**
>
> **Problema.** F-2: os serviços web auxiliares em K8s atendem N cidades a partir de um deploy
> único. Se a identidade variar por município, tema em build-time é tecnicamente impossível
> nessas superfícies.
>
> **Decisão.** Web: tokens semânticos emitidos como CSS custom properties sob um seletor de
> escopo (`:root` para o padrão, `[data-theme="x"]` para variações). Trocar tema = trocar um
> atributo. RN: um `ThemeProvider` com objetos de token via Context, já na fase 1 — mesmo com
> um tema só.
>
> **Justificativa.** No web isso é **custo zero** — é como CSS custom properties funcionam de
> qualquer jeito. No RN o custo é pequeno (um Context) e retrofitar tema num app que lê
> tokens de um import estático é caro. Preparar agora é barato; converter depois não é.
>
> **Trade-off.** Um nível de indireção sem uso imediato — flerta com PA-2.
>
> **Consequência.** Justificado porque o custo é quase nulo e a probabilidade é alta (VM por
> cidade e contrato por município são fortes indícios). Confirmar em **P-01**. Note que
> *preparar a arquitetura* é diferente de *construir os temas* — os temas só existem quando
> houver o segundo.

### 7.4 Assimetrias entre plataformas

Isto é o que a v1.0 não tinha. Tokens não são uniformemente portáveis — algumas categorias
precisam ser modeladas de forma **semântica** justamente porque o valor concreto diverge.

| Categoria | Web | React Native | Como modelar |
|---|---|---|---|
| **Cor** | `#hex` / `oklch()` | `#hex` | Trivial. **Cuidado:** `oklch()` pode não existir em WebView Android antiga do terminal PagSeguro — ver **P-06**. |
| **Espaço** | `rem` (escala com o usuário) | número (dp, **não escala**) | Emitir `rem` no web e número no RN a partir do **mesmo valor base**. Documentar que a escala tipográfica do usuário afeta o web e não o RN. |
| **Tipografia** | `font-family` por nome + webfont | fonte precisa estar **bundled/linkada** no app | Token nomeia a família; o *carregamento* é responsabilidade da plataforma e vira instrução de setup. |
| **Sombra** | `box-shadow` (composta, múltiplas camadas) | iOS: `shadowColor/Offset/Opacity/Radius` · Android: `elevation` (não configurável) | **Modelar como `elevation.raised` / `elevation.overlay`**, nunca como valor de sombra. Cada plataforma traduz. É o caso mais claro de por que o token precisa ser semântico. |
| **Estados** | `:hover`, `:focus-visible`, `:active` | não existe hover; press via `Pressable` | Token de estado existe nos dois; `hover` simplesmente não é usado no RN. |
| **Layout** | `flexDirection: row` padrão | `flexDirection: column` padrão | Diferença de primitivo, não de token — mas precisa estar na documentação de Foundations. |
| **Breakpoints** | media queries / container queries | `Dimensions` / `useWindowDimensions` | Mesmos valores; mecanismo de aplicação diferente. |

> **AD-09 — Fonte da verdade em JSON no formato DTCG, compilada por Style Dictionary, com
> alvos web e RN desde a fase 1.**
>
> **Problema.** Precisamos de uma fonte única gerando CSS, TS/RN e potencialmente JSON para
> Figma, sem duplicação manual — e as assimetrias de §7.4 precisam de transformação, não de
> cópia.
>
> **Decisão.** Tokens em JSON no formato do Design Tokens Community Group (`$value`/`$type`),
> transformados por Style Dictionary. Repositório é a fonte da verdade. Alvos: `tokens.css`,
> `tokens.ts` (web), `tokens.native.ts` (RN).
>
> **Justificativa.** Style Dictionary é maduro, resolve aliases entre níveis e transforma por
> plataforma — que é exatamente o problema de §7.4. DTCG ainda é draft, mas a convergência do
> ecossistema é clara, e é o formato que o Figma Variables exporta, caso P-08 traga Figma.
>
> **Trade-off.** Uma ferramenta de build a mais. Escrever CSS custom properties à mão seria
> mais simples — e impossibilitaria o alvo RN.
>
> **Consequência.** Se houver Figma com Variables, é preciso decidir a **direção única** da
> sincronização. Bidirecional sempre diverge. Recomendação prévia: código como fonte da
> verdade, Figma como consumidor.

---

## 8. Foundations

### 8.1 Classificação

**🟢 Essencial agora**

| Foundation | Por quê | Escopo mínimo |
|---|---|---|
| **Color** | Base de tudo; define papéis semânticos e regras de contraste. | Papéis: surface, texto, ação, borda, feedback. Neutros + 1 de marca + 4 de feedback. |
| **Typography** | Segunda maior fonte de inconsistência, e a que mais diverge hoje entre app e web. | 1 família (2 no máximo), 5–6 degraus, 2 pesos, altura de linha por degrau, regra de degrau em mobile. |
| **Spacing** | Encerra a discussão pixel a pixel. | Escala base-4, 7–8 degraus, vocabulário de aplicação (inset/stack/inline). |
| **Layout** | Onde nasce a densidade — crítico para o terminal PagSeguro. | Primitivas de composição, larguras de container, **nota explícita sobre a diferença de flex padrão entre web e RN**. |
| **Responsive behavior** | Serviços citizen-facing são majoritariamente mobile; admin é desktop. Mesmo pacote. | 3 breakpoints, política mobile-first, comportamento da navegação. |
| **Accessibility** | Transversal, mais barata desde o início, e com exposição pública real. | Baseline, estilo de foco visível, alvo de toque mínimo, política de movimento reduzido, **mapeamento ARIA ↔ `accessibility*` do RN**. |
| **Icons** | Domínio fortemente icônico (vaga, veículo, irregularidade, pagamento). Sem decisão, cada superfície importa um pacote diferente — provavelmente já é o caso. | Conjunto pronto adotado + regras de tamanho, alinhamento e rótulo acessível. |

**🟡 Pode entrar depois**

| Foundation | Quando | Por que não agora |
|---|---|---|
| **Elevation** | Junto do primeiro overlay — fase 1 ou 2. | Como *sistema* precisa de casos reais; como 3 níveis semânticos já entra via token (§7.4). |
| **Density** | Quando P-07 confirmar necessidade de modo compacto para o terminal PagSeguro. | Implementar dois modos completos antes de confirmar é caro e provavelmente errado. |
| **Motion** | Quando houver interação que se beneficie: drawer, skeleton, toast, transição de rota. | Sem consumidor, é token morto. A política de movimento reduzido entra já. |
| **Grid** | Se surgir necessidade real de alinhamento entre páginas complexas. | Ver AD-10. |
| **Data visualization** | Quando os relatórios do `parking-new` ganharem tela — e, no futuro, se o Datahub Panel for modernizado. | Foundation cara e específica; não antecipar. |
| **Content / UX writing** | Quando houver ≥2 pessoas escrevendo interface. | Uma página de terminologia de domínio já resolve a maior parte. |

**🔴 Provavelmente desnecessário**

| Foundation | Por quê |
|---|---|
| **Dark mode** | Depende de **P-09**. Em admin é *nice to have*. **Alto contraste para uso ao sol é plausivelmente mais valioso** — mas os dois precisam de confirmação antes de qualquer construção. |
| **Internacionalização / RTL** | Operação municipal brasileira (**P-10**). RTL é custo permanente em cada componente, em duas plataformas, para probabilidade próxima de zero. |
| **Sistema de ilustração** | Marketing e polimento; não resolve inconsistência funcional. |
| **Sound design / haptics** | Poderia fazer sentido no app do operador (confirmação tátil ao registrar irregularidade), mas é decisão do app, não do DS. |

> **AD-10 — Primitivas de layout, não sistema de grid de 12 colunas.**
>
> **Problema.** Grid de 12 colunas é herança da era pré-CSS Grid; adiciona um vocabulário
> inteiro para resolver o que hoje é nativo — e **não tem tradução no React Native**.
>
> **Decisão.** Primitivas de composição — `Stack` (vertical com gap tokenizado), `Inline`
> (horizontal com wrap), `Grid` (CSS Grid no web) — em vez de sistema formal de grid.
>
> **Justificativa.** CSS Grid e `gap` resolvem nativamente o que o grid de 12 colunas
> emulava, e `Stack`/`Inline` traduzem diretamente para Flexbox no RN (`gap` disponível em RN
> recente). Um grid de colunas não traduziria — seria mais uma divergência entre plataformas.
>
> **Trade-off.** Perde-se o alinhamento rígido entre páginas que um grid formal daria — o que
> importa mais em produto de marketing do que em back-office de dados.
>
> **Consequência.** Se um designer entrar (P-08) e trabalhar com grid no Figma, revisitar.
> Introduzir grid depois é aditivo, não breaking.

> **AD-11 — Conjunto de ícones existente + ícones de domínio desenhados sob medida, com
> pipeline de build para as duas plataformas.**
>
> **Problema.** Desenhar um conjunto completo é trabalho de designer dedicado por semanas.
> Não decidir nada significa cada uma das 6 superfícies importando de uma biblioteca
> diferente — o que provavelmente já acontece.
>
> **Decisão.** Adotar um conjunto open source consistente (Lucide, Phosphor ou Material
> Symbols) e desenhar **apenas** o que o domínio exige e não existe: vaga, parquímetro, talão
> de irregularidade, placa, fiscal, PDV. **SVG como fonte única**, compilado para componentes
> web (SVG inline) e RN (`react-native-svg`).
>
> **Justificativa.** Ícone genérico não diferencia produto; ícone de domínio comunica o que
> nenhum conjunto pronto tem. E com duas plataformas, o pipeline de build é obrigatório —
> não dá para manter dois conjuntos de arquivos à mão.
>
> **Trade-off.** Ícone customizado pode destoar do conjunto base (peso de traço, grid,
> cantos). Mitigável adotando as métricas do conjunto escolhido.
>
> **Consequência.** O pipeline de duas saídas é o argumento que **pode** justificar
> `@rizzopark/icons` como pacote separado mais cedo do que a v1.0 supunha — ver AD-19.
> Os ícones customizados dependem de quem saiba desenhá-los (**P-08**); sem designer,
> comece 100% com o conjunto pronto.

---

## 9. Components

### 9.1 Critérios objetivos de inclusão

Um candidato passa por um **teste de entrada**. Não é lista de desejos — é uma porta.

**Obrigatórios — todos verdadeiros:**

1. **Existe consumidor real hoje.** Uma tela em construção precisa dele agora (PA-1).
2. **Não contém regra de negócio.** Não conhece ticket, placa, vaga, tarifa ou município.
3. **A API está estável o suficiente.** Você consegue nomear as props sem "depende de como
   vamos usar".

**De valor — pelo menos dois verdadeiros:**

4. **Regra de três.** Já apareceu (ou aparecerá comprovadamente) em 3+ lugares ou 2+ superfícies.
5. **Comportamento não trivial.** Foco, teclado, portal, posicionamento, estado assíncrono.
6. **Acessibilidade padronizável.** Errar é fácil; padronizar evita repetir o erro em 6 lugares.
7. **Risco real de divergência.** Sem o componente, duas implementações nascem diferentes — e
   a diferença é percebida.

**Aprovação = todos os obrigatórios + ≥2 de valor.**

**Critério adicional para promover à camada RN** (quando o pacote existir): o componente
precisa ter **contrato que faça sentido nas duas plataformas**. Um `Table` web denso não
tem equivalente razoável num terminal de tela pequena — a versão RN seria outro componente,
com outro nome, não a mesma coisa.

### 9.2 Quando NÃO criar um componente

- **Há um consumidor só, e não há segundo à vista.** Deixe na aplicação. Promover depois é
  barato; depreciar o que nunca deveria existir, não.
- **É wrapper que só renomeia props.** `<PrimaryButton>` = `<Button variant="primary">` é
  atalho, e atalho pertence à aplicação.
- **É layout puro resolvido em 5 linhas de CSS.**
- **Codifica regra de negócio.** `<StatusIrregularidade>` mapeia enum de domínio para cor —
  isso é UI de aplicação. O DS fornece `<Badge tone="danger">`; a aplicação escolhe o tom.
  *(Se o mapeamento se repetir entre superfícies, o lugar é um pacote de domínio
  compartilhado — não o DS. Confundir isso é o erro que transforma DS em monólito de
  frontend.)*
- **O comportamento ainda está em discovery.** Componentizar cedo congela decisão de produto
  que ainda vai mudar quatro vezes.
- **Existe primitivo nativo que já resolve.** Nem toda `<table>` precisa de `<Table>`.
- **A "variante" é outro componente.** Cadeia de `if variant === …` com layouts distintos →
  quebre em dois.

> **AD-12 — Componentes nascem na aplicação e são promovidos ao DS; não o contrário.**
>
> **Problema.** O modo mais comum de um DS morrer é ser construído antecipadamente sobre
> suposições, não atender a nenhuma tela real, e virar museu enquanto o time contorna.
>
> **Decisão.** O DS é construído **a reboque da primeira tela real**. Constrói-se a tela,
> identifica-se o genérico, promove-se. Exceção: a base mínima (Button, Field, Input, Text)
> pode ser antecipada — risco de errar baixo, custo de não ter alto.
>
> **Justificativa.** API projetada contra uso real acerta; contra a imaginação, não. É o
> mesmo raciocínio de TDD que o `parking-new` já adota — comportamento vem de caso concreto.
>
> **Trade-off.** Parece mais lento no começo e cria um período com UI "pré-DS" na aplicação.
>
> **Consequência.** Precisa existir uma **primeira tela candidata**. O candidato natural é
> uma tela do novo admin do `parking-new` — ver **P-12** e o roadmap.

### 9.3 Inventário provável da fase 1 (indicativo, não comprometido)

Sujeito a AD-12. Como ordem de grandeza para um admin de gestão:

`Button` · `Input` · `Field` (label + descrição + erro + wiring de a11y) · `Select` ·
`Checkbox` · `Radio` · `Text/Heading` · `Stack/Inline` · `Card` · `Badge` · `Table` ·
`Dialog` · `Toast` · `Spinner/Skeleton` · `EmptyState`

**~15 componentes web, zero RN.** Se a fase 1 terminar com 40, o filtro falhou.

---

## 10. Patterns

### 10.1 A fronteira

| Nível | Definição | Conhece domínio? | Onde mora | Teste |
|---|---|---|---|---|
| **Component** | Unidade indivisível de UI com API própria. | Não | `@rizzopark/react` (e futuramente `/native`) | Faz sentido isolado, sem contexto de tela? |
| **Pattern** | Composição recomendada de componentes para problema recorrente. | Não | Documentação (código só se comprovado) | Duas telas diferentes resolveriam isto do mesmo jeito? |
| **Template** | Estrutura de página inteira, reutilizável entre produtos. | Não | Pacote, **se** ≥2 superfícies | Mais de uma superfície teria esta mesma casca? |
| **Application UI** | Tela concreta, com regra de negócio. | **Sim** | Aplicação | Precisa saber o que é uma vaga para funcionar? |

**A pergunta que resolve 90% dos casos:** *"isto precisa conhecer o domínio de estacionamento
para funcionar?"* Se sim, é Application UI. Sem exceção.

### 10.2 Avaliação dos exemplos propostos

| Exemplo | Classificação proposta | Veredito | Comentário |
|---|---|---|---|
| Button | Component | ✅ **Correto** | Caso canônico. |
| Form Field | Component | ✅ **Correto**, e mais importante do que parece | `Field` carrega o wiring de a11y (`label/for`, `aria-describedby` para dica **e** erro, `aria-invalid`, `aria-required`). É onde a maioria dos times erra, e onde a divergência web↔RN é maior. Deve ser dos primeiros. |
| Login Form | Pattern | 🟡 **Agora é Application UI; vira Pattern em breve** | M02 prevê quatro perfis de login (administrador, operacional, usuário externo, fiscal). Quando ≥2 fluxos existirem compartilhando estrutura, vira Pattern — e o que se documenta é a receita (ordem de campos, tratamento de erro, `autocomplete`, permitir colar senha — WCAG 2.2 · 3.3.8), não um `<LoginForm>`. |
| Dashboard Layout | Pattern/Template | 🟡 **Template**, e só com ≥2 superfícies | "Layout" é estrutura de página → Template, não Pattern. Ver AD-13. |
| Parking Management Screen | Application UI | ✅ **Correto** | Caso canônico do lado oposto. |

### 10.3 Exemplos ancorados no ecossistema real

```
Button, Badge, Field, Dialog, Table                        → Component
Layout de formulário (agrupamento, ordem, erros)           → Pattern (doc)
Estado vazio / erro / carregando                           → Pattern (doc)
Confirmação de ação destrutiva                             → Pattern (doc)
Listagem com filtro + paginação + ordenação                → Pattern (doc) → talvez Template
Fluxo multi-etapa (recarga, ativação de ticket)            → Pattern (doc)
App shell do admin (nav lateral + topo + conteúdo)         → Template, se ≥2 superfícies
Cadastro de área com setores e tarifas                     → Application UI
Mapa de vagas em tempo real                                → Application UI
Registro de irregularidade com foto e OCR                  → Application UI
Seletor de município/rede no cabeçalho                     → Application UI (escopo por cidade é domínio)
Tela de captura de placa no terminal PagSeguro             → Application UI (hardware-specific)
```

Os dois últimos parecem candidatos a componente e não são: o seletor de município depende de
escopo por cidade (ADR-006) e a captura de placa depende do SDK do hardware PagSeguro. Ambos
são domínio ou plataforma — nunca DS.

> **AD-13 — Templates ficam fora do DS até existir uma segunda superfície com a mesma casca.**
>
> **Problema.** App shell parece candidato óbvio, mas é a peça mais acoplada a navegação,
> permissão e rotas — tudo de aplicação. E o admin e os serviços citizen-facing têm cascas
> completamente diferentes.
>
> **Decisão.** O app shell vive na aplicação até que uma segunda superfície precise do mesmo.
>
> **Justificativa.** Extrair cedo obriga a inventar uma abstração de navegação e permissão
> sem conhecer o segundo caso — e ela nasce errada. Com quatro perfis de login previstos
> (M02), pode haver mais de um admin no futuro; aí a extração se justifica, com dois casos
> na mão.
>
> **Trade-off.** Trabalho de extração quando a segunda superfície chegar.
>
> **Consequência.** Extração com dois casos conhecidos produz abstração melhor que invenção
> com um. Custo assumido de propósito.

> **AD-14 — Patterns são documentação primeiro; viram código só com duplicação comprovada.**
>
> **Problema.** Codificar patterns cedo produz componentes gigantes e inflexíveis
> (`<DataTablePage>` com 40 props) que ninguém usa sem lutar.
>
> **Decisão.** Pattern nasce como página de documentação: o problema, a composição
> recomendada, exemplo copiável, e o que **não** fazer. Vira código quando a mesma composição
> estiver duplicada em ≥2 lugares e for estável.
>
> **Justificativa.** Documentação captura ~80% do valor (consistência de decisão) com ~5% do
> custo, e não engessa. Componente errado é pior que ausência de componente. E patterns em
> doc **são compartilháveis entre web e RN**, enquanto código não é (AD-01).
>
> **Trade-off.** Doc não é aplicada por compilador.
>
> **Consequência.** A revisão de código vira o mecanismo de aplicação. Sustentável em time
> pequeno; deixa de ser quando o time crescer.

---

## 11. Accessibility

### 11.1 Baseline

> **AD-15 — Baseline WCAG 2.2 nível AA para todas as superfícies web do DS; equivalente
> funcional documentado para React Native.**
>
> **Problema.** Sem baseline explícito, acessibilidade vira opinião e some sob prazo. E há
> superfícies **citizen-facing** (serviços web auxiliares, app do cidadão) em contexto de
> serviço público municipal.
>
> **Decisão.** WCAG 2.2 AA como baseline não negociável dos componentes web. Componente que
> não atende não é publicado. Para RN, o baseline é o **equivalente funcional** — mesmo
> critério, API diferente: `accessibilityRole`, `accessibilityLabel`, `accessibilityState`,
> ordem de foco, contraste, alvo de toque.
>
> **Justificativa.** AA é o patamar referenciado por regulação praticamente em todo lugar,
> incluindo o contexto brasileiro de governo eletrônico (o eMAG deriva de WCAG; a LBI —
> Lei 13.146/2015 — trata de acessibilidade de sites de uso público). **A exigência
> contratual específica precisa ser confirmada — P-04.** A escolha de 2.2 em vez de 2.1 é
> deliberada: os critérios novos de AA são especialmente relevantes aqui — **2.5.8 Target
> Size (mín. 24×24 CSS px)** para campo, **2.4.11 Focus Not Obscured**, **3.3.8 Accessible
> Authentication** (permitir colar senha — afeta os quatro fluxos de login do M02) e
> **3.3.7 Redundant Entry**.
>
> **Trade-off.** Restringe a paleta e aumenta o esforço por componente, agora em duas
> plataformas com APIs distintas.
>
> **Consequência.** O custo é maior no componente e **menor em cada uma das 6 superfícies** —
> cada tela herda a conformidade. É o argumento econômico central a favor do DS, e ele fica
> mais forte quanto mais superfícies existem.

**Dois requisitos próprios da Rizzo Park, além do AA:**

- **Alvo de toque de 44×44** nos controles das interfaces de campo e mobile — não 24×24.
  O mínimo WCAG é piso legal; luva, sol e movimento exigem mais. Confirmar em **P-06**.
- **Contraste acima do mínimo** nos elementos críticos de leitura em campo (AD-07).

### 11.2 Estratégia por área

| Área | Web | React Native |
|---|---|---|
| **Contraste** | Validado no token, por par semântico. Reprovar quebra o build. | Mesmo token, mesma validação — o teste roda uma vez, na fonte. |
| **Teclado** | Operável só por teclado; ordem de tab segue a ordem visual; nada de `tabindex` positivo. | Menos relevante (toque), mas teclado externo em terminal existe. |
| **Foco** | Sempre visível. Nunca `outline: none` sem substituto. Trap em modal, devolução ao gatilho. Delegado à headless (AD-02). | `accessibilityViewIsModal`, ordem de foco explícita. **Feito à mão** — sem headless equivalente. |
| **Leitor de tela** | Nome, papel, valor. Região viva para toast e erro assíncrono. NVDA como referência. | TalkBack (Android) e VoiceOver (iOS). |
| **ARIA** | *Nenhum ARIA é melhor que ARIA errado.* HTML semântico primeiro. | `accessibilityRole` é o análogo; conjunto de papéis é menor e mais grosseiro. |
| **Movimento reduzido** | `prefers-reduced-motion` respeitado por padrão. | `AccessibilityInfo.isReduceMotionEnabled()`. |
| **Formulários** | Rótulo visível (nunca placeholder-como-rótulo), erro associado e anunciado, `autocomplete` correto, nunca só cor para indicar erro. | Mesmas regras; associação via `accessibilityLabel` / `accessibilityHint`. |

### 11.3 Validação técnica

Quatro camadas, do mais barato ao mais caro:

1. **Lint** — `eslint-plugin-jsx-a11y` (web) e `eslint-plugin-react-native-a11y` (RN).
2. **axe-core em cada story/teste** de componente web — bloqueia no CI.
3. **Testes de teclado/toque** escritos à mão para componentes complexos.
4. **Auditoria manual com leitor de tela** — por componente, na promoção a estável,
   registrada na doc (data, ferramenta, resultado).

> **Aviso honesto:** ferramentas automatizadas detectam apenas uma fração minoritária dos
> problemas reais. Elas pegam "imagem sem alt", não "a ordem de foco não faz sentido". As
> camadas 3 e 4 são onde a acessibilidade acontece — e são as primeiras a cair sob pressão.
> Se a auditoria manual não estiver na definição de pronto, ela não vai acontecer.

---

## 12. Documentation

### 12.1 Estrutura

```
Introduction         princípios, escopo, o que está e o que não está no DS   [todos]
Getting Started      instalar e usar — trilha por plataforma (web / RN)      [dev]
Foundations          cor, tipo, espaço, layout, ícones, a11y                 [designer, dev]
Tokens               referência navegável + como consumir em cada plataforma [designer, dev]
Components           contrato + playground web + status por plataforma       [dev, designer]
Patterns             receitas de composição (compartilhadas)                 [dev, product/UX]
Accessibility        baseline, checklist por plataforma, como testar         [todos]
Guidelines           terminologia de domínio, tom, mensagens de erro         [product/UX, dev]
Contribution         propor, construir, promover, publicar                   [dev]
Architecture         este documento + ADRs subsequentes                      [dev]
Changelog            gerado, não escrito à mão                               [dev]
```

**Novidade em relação à v1.0:** todo componente exibe uma **matriz de disponibilidade por
plataforma** — `web: estável · rn: não implementado`. Sem isso, um dev de RN lê a doc e
tenta importar algo que não existe.

### 12.2 Por público

**Não construa três sites.** Um site, organizado para cada público achar o que precisa. Três
sites divergem em uma semana.

| Público | O que precisa | Onde |
|---|---|---|
| **Desenvolvedor** | Props, exemplos copiáveis, restrições de RSC, escape hatches, diferenças entre plataformas. | Getting Started, Components, Contribution |
| **Designer** | Valores dos tokens, regras de uso, inventário visual, estados e variantes. | Foundations, Tokens, Components (visão visual) |
| **Product / UX** | Que componente já existe (para não pedir novo), patterns, terminologia. | Patterns, Guidelines, índice visual |

> **AD-16 — Storybook como site único. Docusaurus só se comprovado necessário.**
>
> **Problema.** O `parking-new` já usa Docusaurus, e padronizar é tentador. Mas Docusaurus
> não renderiza componente vivo com controles, e Storybook documenta narrativa mal.
>
> **Decisão.** **Um site: Storybook**, com páginas MDX para o conteúdo narrativo (princípios,
> foundations, patterns, contratos, governança) ao lado das stories. Não montar um segundo
> site na fase 1.
>
> **Justificativa.** Para time pequeno, dois sites significa dois deploys, dois temas, links
> quebrados entre eles e conteúdo duplicado. Storybook é insubstituível (playground, addon de
> a11y, base para teste visual); Docusaurus é substituível por MDX.
>
> **Trade-off.** MDX no Storybook é pior para texto longo — busca fraca, navegação pobre.
> Este documento, por exemplo, fica desconfortável lá.
>
> **Consequência.** Aceito na fase 1. Reavaliar em ~15 páginas narrativas, ou quando design e
> product reclamarem. Migrar MDX → Docusaurus depois é barato: é markdown. **Nota sobre RN:**
> `@storybook/react-native` é sensivelmente mais fraco que o web; quando o pacote RN existir,
> a opção provável é um app Expo de demonstração em vez de um segundo Storybook — decisão
> adiada junto com AD-03.

**Regras válidas desde o primeiro componente:**

- Todo componente documenta: **o que é, quando usar, quando NÃO usar, props, estados,
  acessibilidade, disponibilidade por plataforma, do/don't**. "Quando não usar" é a seção
  mais valiosa e a mais esquecida.
- Documentação vive **no mesmo PR** que o código — mesma regra que o `parking-new` aplica ao
  `core/`.
- Exemplo em doc é código executado, não bloco de texto que apodrece.

---

## 13. Governance

Proporcional ao time atual. Todo o processo abaixo cabe em uma página; se crescer, foi longe
demais.

### 13.1 Modelo: steward, não comitê

> **AD-17 — Steward único, com par de design quando houver designer.**
>
> **Problema.** Modelos federados e com comitê pressupõem dezenas de contribuidores. Aqui
> criariam burocracia com a mesma pessoa nos dois lados da mesa.
>
> **Decisão.** Um **steward** nomeado, responsável final por tokens, superfície pública e
> releases. Qualquer pessoa contribui. Design tem par com veto sobre o visual — quando
> existir designer (**P-08**).
>
> **Justificativa.** Consistência precisa de dono, não de processo. Com poucas pessoas, o
> dono é o processo.
>
> **Trade-off.** Ponto único de falha; viés pessoal pode virar padrão do sistema.
>
> **Consequência.** Mitigar exigindo que toda decisão relevante fique **escrita** (ADR) — o
> registro substitui o comitê. É o que o `parking-new` já faz.

**Pergunta de governança criada pelo inventário:** as superfícies existentes foram construídas
pelo mesmo time? Se houver times ou fornecedores distintos por sistema, o modelo de steward
único precisa de um fórum leve de alinhamento entre consumidores. **P-13.**

### 13.2 Matriz de permissão

| Ação | Quem | Cerimônia |
|---|---|---|
| Consumir o DS | Qualquer dev | Nenhuma |
| Reportar bug / propor componente | Qualquer pessoa | Issue com o teste de entrada (§9.1) respondido |
| Implementar componente aprovado | Qualquer dev | PR + revisão do steward |
| **Adicionar** token semântico | Dev, com aprovação do steward | PR justificando por que os existentes não servem |
| **Alterar valor** de token | **Só o steward** (+ par de design) | PR + teste de contraste + revisão visual + nota de release + **plano de propagação entre cidades** (§14.3) |
| Alterar contrato de componente | **Só o steward** | Contrato revisado antes das implementações |
| Alterar API pública | **Só o steward** | Ver §13.4 |
| Publicar release | Steward ou CI | Changeset obrigatório |
| Alterar princípios/arquitetura | Steward + revisão dos consumidores | Novo ADR |

**Por que token é mais restrito que componente:** um token alterado muda silenciosamente
todas as superfícies ao mesmo tempo, sem que ninguém tenha pedido. Maior alcance, menor
visibilidade.

### 13.3 Como uma mudança é proposta

```
Ideia
  ├─ bug ou ajuste pequeno?     ──────────►  PR direto
  ├─ componente novo?           ──────────►  Issue com o teste de entrada (§9.1)
  │                                            ├─ reprovado → fica na aplicação
  │                                            └─ aprovado  → contrato → PR (código + doc + testes + a11y)
  ├─ mudança de token?          ──────────►  PR: motivo, impacto visual, contraste, plano de propagação
  └─ decisão arquitetural?      ──────────►  ADR curto, discutido antes do código
```

### 13.4 Breaking changes e depreciação

**É breaking:** remover/renomear prop ou componente, mudar comportamento padrão, mudar
significado de token semântico, mudar valor de token de forma que altere layout.
**Não é:** adicionar prop opcional, adicionar componente, corrigir bug de acessibilidade
(mesmo alterando markup).

**Ciclo:**

1. `@deprecated` no JSDoc **com a alternativa nomeada** — não só "não use mais".
2. Aviso em console só em desenvolvimento, uma vez por componente.
3. Banner na documentação apontando a alternativa.
4. Manter funcionando por no mínimo um ciclo de release menor **e** um prazo acordado com os
   consumidores — que, com N cidades, é mais longo do que o instinto sugere (§14.3).
5. Remover só em major.
6. Se a migração for mecânica, **entregar codemod** ou instrução de substituição literal.
   Depreciar sem caminho de migração é empurrar trabalho para o consumidor.

Antes do 1.0 o ciclo é suspenso (PA-8) — mas a mudança ainda é anunciada.

### 13.5 Como garantir consistência

Em ordem de eficácia:

1. **Tornar o caminho certo o mais fácil.** Único mecanismo que escala.
2. **Automação:** lint contra valor hardcoded, teste de contraste, lints de a11y.
3. **Revisão de código** com checklist curto.
4. **Documentação.**
5. Processo e reunião — último recurso, e sinal de que 1 e 2 falharam.

---

## 14. Versioning

> **AD-18 — SemVer + Changesets, versão travada entre os pacotes, e um período 0.x deliberado.**
>
> **Problema.** Declarar 1.0 cedo encarece a correção dos erros iniciais — que são certos.
> Versionar independentemente por pacote confunde ("qual combinação é compatível?").
>
> **Decisão.** SemVer estrito na superfície pública; Changesets gerando versão e changelog a
> partir dos PRs; **versão travada** entre os pacotes (`tokens@0.4.0` e `react@0.4.0` sobem
> juntos); **permanecer em 0.x até duas superfícies consumirem o DS em produção**.
>
> **Justificativa.** Versão travada elimina a matriz de compatibilidade — em time pequeno,
> vale mais que a precisão do versionamento independente. E se o pacote RN existir depois, a
> trava garante que tokens de web e RN nunca fiquem defasados entre si, que é a divergência
> mais perigosa do sistema.
>
> **Trade-off.** Releases "vazios" (tokens sobe sem mudança). Irrelevante na prática.
>
> **Consequência.** A documentação precisa dizer explicitamente que 0.x pode quebrar em minor,
> e o critério de saída (duas superfícies em produção) precisa estar escrito — senão o 0.x
> dura três anos.

**Superfície pública versionada:** props e exports de componentes; nomes de tokens
**semânticos** e das variáveis CSS geradas; comportamento observável (teclado, anúncios).

**NÃO é superfície pública** (pode mudar em patch): nomes de tokens **primitivos**; estrutura
interna de DOM e nomes de classe CSS gerados; qual biblioteca headless está por baixo.

Isso precisa estar escrito. Sem isso, alguém depende de um nome de classe interna e
transforma refatoração em breaking change.

### 14.3 Version skew entre cidades — o problema que só existe aqui

> **AD-19 — Tratar a propagação de mudanças como assíncrona por natureza; nenhuma mudança
> pode assumir atualização simultânea.**
>
> **Problema.** F-3: cada município roda em VM dedicada, com deploy independente. Uma mudança
> de token publicada hoje pode chegar à cidade A amanhã e à cidade F em três meses. Durante
> esse intervalo, **a mesma marca aparece diferente em cidades diferentes** — e um bug de
> acessibilidade corrigido continua em produção em N lugares.
>
> **Decisão.** Três regras:
> — **Nenhuma mudança de token assume propagação atômica.** Toda alteração de valor precisa
> declarar se é aceitável conviver com a versão anterior em produção. Se não for (ex.: correção
> de contraste que é requisito legal), vira **rollout coordenado**, com lista de cidades e
> acompanhamento — não é só publicar no npm.
> — **Janela de suporte explícita:** o DS suporta a versão minor atual e a anterior. Cidade
> que ficar para trás disso vira dívida rastreada, não situação normal.
> — **Visibilidade:** manter um registro de qual versão do DS cada superfície/cidade consome.
> Sem esse dado, não há como saber o alcance real de nenhuma mudança.
>
> **Justificativa.** É consequência direta do modelo de infraestrutura, não do DS — mas é o DS
> que sofre. Ignorar isso significa descobrir, meses depois, que "a correção foi feita" e
> mesmo assim o problema persiste em produção.
>
> **Trade-off.** Overhead de acompanhamento que um DS single-deploy não teria.
>
> **Consequência.** Como o novo admin do `parking-new` também será por cidade, o problema não
> desaparece com a migração — é permanente enquanto o modelo de VM por município existir. Vale
> confirmar como o time trata isso hoje para o próprio S2Way (**P-14**) e reaproveitar o
> mecanismo, em vez de inventar outro.

---

## 15. Testing

Proporcional ao risco — mesma filosofia do `parking-new`: nada de teste cerimonial.

| Camada | O que cobre | Quando | Custo |
|---|---|---|---|
| **Type-check** | Contrato de props. | Sempre | ~0 |
| **Contraste de tokens** | Todo par semântico atende AA. Roda uma vez, protege as duas plataformas. | **Fase 1** | Baixo · valor altíssimo |
| **Teste de comportamento** (Vitest + Testing Library) | O que o usuário faz: clicar, tabular, digitar, fechar com Esc. **Nunca** classe CSS ou estrutura de DOM. | Fase 1, componentes interativos | Médio |
| **axe por componente** | Violações estruturais de a11y. | Fase 1 | Baixo (automatizado) |
| **Teste de teclado** | Ordem de foco, trap, retorno. | Por componente complexo | Médio · insubstituível |
| **App de fumaça** (Next.js real no repo) | Bundling, `"use client"`, RSC, SSR, CSS. | Fase 1 | Baixo · pega classe inteira de bug |
| **Conformidade ao contrato** | Web e RN implementam o mesmo contrato. | Quando o pacote RN existir | Médio |
| **Regressão visual** | Mudança de token quebrando componente. | **Fase 2+**, ~15 componentes | Alto (infra + baselines) |
| **Leitor de tela (manual)** | O que nenhuma ferramenta pega. | Na promoção a estável | Alto · obrigatório mesmo assim |

> **AD-20 — Regressão visual adiada para a fase 2.**
>
> **Problema.** VRT é o teste mais citado para DS e um dos mais caros: baselines por
> plataforma, falso-positivo por renderização de fonte, manutenção competindo com o trabalho
> real.
>
> **Decisão.** Fora da fase 1. Entra quando o inventário passar de ~15 componentes, ou na
> primeira vez que uma mudança de token quebrar algo silenciosamente.
>
> **Justificativa.** Com 8 componentes e um consumidor, revisão humana no Storybook pega o
> mesmo. O valor do VRT cresce com componentes × consumidores — e aqui os consumidores vão
> crescer, então o VRT **vai** se justificar. Só não agora.
>
> **Trade-off.** Haverá uma regressão não detectada em algum momento. É o gatilho que
> justifica o investimento.
>
> **Consequência.** Quando entrar: **só no CI, em container**, nunca na máquina do dev
> (renderização de fonte no Windows difere e gera falso-positivo eterno). Chromatic é a opção
> paga de menor atrito; Playwright em container é a gratuita, com mais manutenção.

**Explicitamente não medido:** cobertura percentual de componentes. Em biblioteca de UI, essa
métrica incentiva teste de renderização inútil. O que vale medir é binário: *todo componente
interativo tem teste de teclado e de axe?*

---

## 16. Tooling

### 16.1 Estrutura de repositório

> **AD-21 — Monorepo com dois pacotes publicados agora, dois apps privados, e dois pacotes
> planejados.**
>
> ```
> rizzo-park-design-system/
> ├── packages/
> │   ├── tokens/          @rizzopark/tokens    → PUBLICADO (fase 1)
> │   │                      saídas: .css · .ts (web) · .native.ts (RN) · .json
> │   ├── react/           @rizzopark/react     → PUBLICADO (fase 1)
> │   ├── icons/           @rizzopark/icons     → PLANEJADO (ver gatilho abaixo)
> │   └── native/          @rizzopark/native    → PLANEJADO (AD-03)
> ├── apps/
> │   ├── docs/            Storybook            → privado
> │   └── sandbox/         Next.js de fumaça    → privado
> └── docs/                contratos, ADRs, esta proposta
> ```
>
> **Justificativa, pacote a pacote:**
> — **tokens separado: obrigatório.** É a única camada compartilhada por todas as plataformas
> e o único consumível pelo S2Way em CakePHP. A separação é o que dá sentido à estratégia.
> — **react: sim.** Produto principal da fase 1.
> — **icons: agora tem argumento real** que a v1.0 não tinha. Com web e RN, os ícones precisam
> de duas saídas de build (SVG inline e `react-native-svg`) a partir de uma fonte única
> (AD-11) — o que é trabalho de pacote, não de subpath. **Gatilho:** criar junto com o pacote
> RN, ou antes se o conjunto de ícones de domínio crescer o suficiente para pesar no build.
> Até lá, `@rizzopark/react/icons`.
> — **native: planejado, não construído** (AD-03).
> — **sandbox: essencial.** Um Next.js real no repo pega erro de RSC, `"use client"` e
> bundling antes do consumidor. Vale mais que vários testes unitários.
>
> **Trade-off.** Separar ícones depois exige migração de imports nos consumidores.
>
> **Consequência.** Mecânica e trivial durante o 0.x.

**Monorepo vale a pena?** Sim, por um motivo específico: você precisa alterar token e
componente **no mesmo PR** e ver o efeito. Multi-repo obrigaria a publicar token para testar
componente. Isso mataria a velocidade — e com um pacote RN futuro, mataria duas vezes.

### 16.2 Cadeia de ferramentas

| Necessidade | Recomendação | Observação |
|---|---|---|
| Gerenciador de pacotes | **pnpm** com workspaces | O `CLAUDE.md` do `parking-new` declara pnpm, mas o repo tem `package-lock.json`. Vale alinhar — o DS deve nascer coerente. |
| Orquestração de build | **Nenhuma na fase 1** — scripts pnpm | Turborepo quando o build incomodar. Com 2 pacotes, não incomoda. |
| Transformação de tokens | **Style Dictionary** (AD-09) | Alvos: `.css`, `.ts`, `.native.ts`, `.json` |
| Build da lib | **tsup** ou tsc + bundler leve | Requisito crítico: **preservar `"use client"`** no output. Validar no spike — é armadilha conhecida e silenciosa. |
| Formato de saída | **ESM** | CJS só se surgir consumidor que exija. RN tem requisitos próprios de empacotamento quando o pacote existir. |
| Exports | **Subpath exports**, sem barrel único | Barrel gigante degrada tree-shaking e o build do consumidor. |
| Documentação | **Storybook** (AD-16) | + addon de a11y |
| Testes | **Vitest + Testing Library + axe** | Mesmo runner do `parking-new` — menos troca de contexto. RN usaria Jest + RNTL quando existir. |
| Versionamento | **Changesets** (AD-18) | |
| CI | **GitHub Actions** | O ecossistema já roda K8s, então há infra e cultura de CI. |
| Registro | **PENDENTE — P-15** | GitHub Packages é o de menor atrito (a org `Venice-Sistemas` existe); npm privado tem melhor DX. Definir também o escopo: `@rizzopark` ou `@venice`. |
| Lint / formatação | ESLint + Prettier alinhados ao `parking-new` | + `eslint-plugin-jsx-a11y` |

### 16.3 Pipeline de CI

```
PR aberto
  ├─ lint + type-check
  ├─ testes unitários + axe
  ├─ teste de contraste dos tokens          ← quebra o build se reprovar
  ├─ build de todos os pacotes
  ├─ build do sandbox Next.js               ← pega erro de RSC/bundling
  └─ preview do Storybook                   ← revisão visual humana

merge em main
  └─ Changesets abre/atualiza o PR de release

merge do PR de release
  └─ publica pacotes + deploy do Storybook
```

---

## 17. Trade-offs

**T-1 — Duas implementações de componente em troca de qualidade nativa em cada plataforma.**
Ganhamos HTML semântico no web (base da acessibilidade), compatibilidade com RSC, e
comportamento nativo no RN. Perdemos a implementação única e assumimos risco de divergência.
Mitigação: contrato de componente (§5.3) + adiar o pacote RN até haver gatilho (AD-03).

**T-2 — Tokens como único ponto de unificação, em troca de simplicidade.**
Ganhamos uma camada compartilhada de verdade por todas as 6 superfícies, inclusive o legado.
Perdemos a unificação de espaçamento e comportamento nos apps RN até o pacote existir.

**T-3 — Menos camadas de token em troca de flexibilidade futura.**
Ganhamos clareza e menos manutenção. Perdemos o override por componente. Mitigação:
nomenclatura semântica correta desde o início torna a introdução posterior localizada.

**T-4 — Patterns como documentação em troca de garantia.**
Ganhamos flexibilidade, evitamos abstração prematura, e patterns passam a ser a única camada
de componente compartilhável entre web e RN. Perdemos aplicação automática. Mitigação:
revisão de código — que deixa de funcionar quando o time crescer.

**T-5 — Um site de documentação em troca de qualidade editorial.**
Ganhamos um deploy e uma fonte de verdade. Perdemos a boa leitura de texto longo.

**T-6 — DS construído a reboque de tela real, em troca de velocidade inicial.**
Ganhamos APIs que funcionam e zero componente órfão. Perdemos a sensação de progresso — e a
expectativa precisa ser gerenciada, porque "o DS tem 6 componentes" soa a pouco para quem não
conhece o critério.

---

## 18. Riscos

| # | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R-1 | **Divergência silenciosa entre web e RN** — o mesmo componente se comporta diferente nas duas plataformas e ninguém percebe até um usuário reclamar. | **Alta** | Alto | Contrato de componente (§5.3) revisado antes das implementações; teste de conformidade ao contrato; adiar o pacote RN reduz a exposição no curto prazo. |
| R-2 | **Version skew entre cidades** — a mesma marca aparece diferente em municípios diferentes por meses. | **Alta** | Alto | AD-19: propagação tratada como assíncrona, janela de suporte explícita, registro de versão por cidade. |
| R-3 | **DS sem designer vira depósito de componentes** — decisões visuais por conveniência de implementação. | Alta se P-08 = não | Alto | Foundations escritas *antes* dos componentes; revisão visual em bloco por release; sem designer, adotar uma referência visual coerente em vez de improvisar. |
| R-4 | **Adoção falha** — as equipes contornam o DS. Risco maior aqui do que num produto único, porque são 6 superfícies com histórias e donos possivelmente diferentes. | Média | Crítico | AD-12 (nascer de tela real); medir consumo; se contornarem, o defeito é do DS. Ver P-13. |
| R-5 | **Acessibilidade cortada sob prazo** — primeiro item a cair, e há superfícies públicas. | Alta | Alto (jurídico/contratual) | Automatizar o que der e **quebrar o build**. O que depende de disciplina humana some. |
| R-6 | **DS absorve regra de negócio** — `<StatusIrregularidade>` entra "só desta vez" e a fronteira se dissolve. | Média | Alto | Critério de §10.1 aplicado em revisão; pacote de domínio compartilhado dá destino legítimo a esse código. |
| R-7 | **Escopo infla** — 40 componentes, 8 usados. | Média | Médio | Teste de entrada (§9.1); auditar consumo por trimestre; depreciar o não usado. |
| R-8 | **O DS é desenhado só para o admin desktop** e não serve às superfícies de campo e cidadão — onde a UI mais importa. | Média | Alto | Incluir uma superfície citizen-facing ou de campo na fase 2; não deixar o admin definir sozinho todas as foundations. Responder P-06 e P-07. |
| R-9 | **Dependência headless estagna ou muda de rumo.** | Baixa/Média | Médio | Encapsulamento (AD-02) mantém a troca viável. |
| R-10 | **Tokens divergem entre Figma e código**, se houver Figma. | Média | Médio | Direção única de sincronização, decidida explicitamente (P-08). |
| R-11 | **Bus factor 1.** | Alta | Alto | ADRs obrigatórios. Este documento é a primeira parcela. |

---

## 19. Decisões ainda pendentes

Resolvidas pelo documento de arquitetura técnica, e portanto **removidas** desta lista:
número e natureza das superfícies; existência de React Native; consumo de tokens pelo legado;
justificativa de um pacote versionado.

| ID | Pergunta | Informação faltante | Por que importa | O que ela altera |
|---|---|---|---|---|
| **P-01** | Cada município tem identidade visual própria (cor, logo)? | Se há exigência contratual de marca por prefeitura. VM por cidade e contrato por município são indícios fortes, não confirmação. | É a decisão estruturante do sistema de tokens. E, por F-2, se a resposta for sim, tema em runtime deixa de ser precaução e vira requisito. | AD-05 (component tokens entram na fase 1), AD-08, escopo do Foundation de cor, esforço de teste. |
| **P-02** | Os apps React Native passarão por refresh/reescrita de UI? Em que horizonte? | Roadmap dos apps. | É o gatilho de AD-03. Sem refresh à vista, um pacote de componentes RN não tem consumidor — e reescrever a UI de app em produção sem demanda é o pior investimento possível. | Se e quando `@rizzopark/native` existe; se `@rizzopark/icons` é antecipado; escopo das fases 2 e 3. |
| **P-03** | Os serviços Next.js (auxiliares e OCR) usam Tailwind? | Stack real desses projetos. | Se usam, um DS em CSS Modules sem preset será contornado — o time escreverá utilitários com valores literais e o DS perde a razão de existir. | AD-04; se o preset Tailwind é entregável da fase 1. |
| **P-04** | Há exigência contratual/legal de acessibilidade nos contratos municipais (eMAG, WCAG, nível)? | Texto de edital ou contrato. | Muda a11y de boa prática para requisito com consequência jurídica — e pode exigir laudo formal. Os serviços citizen-facing são a superfície exposta. | AD-15 (nível), orçamento de auditoria, necessidade de relatório de conformidade. |
| **P-05** | Existe identidade visual definida (paleta, tipografia, licenciamento de fonte)? | Manual de marca, se houver. | Cor institucional pode reprovar em contraste; fonte licenciada pode não ter licença de webfont — e RN exige a fonte empacotada no app, que é outra licença. | Geração da paleta (AD-07), Foundation de tipografia, hospedagem/empacotamento de fontes. |
| **P-06** | Qual a matriz de dispositivos e navegadores? Em especial: qual terminal PagSeguro, qual Android, qual WebView? | Especificação do hardware de campo e analytics dos apps. | Determina que CSS é permitido (container queries, `:has`, `oklch`) e se o alvo de toque precisa superar o mínimo WCAG. É a diferença entre um DS que funciona em campo e um que não. | Formato de cor dos tokens, alvo de a11y, matriz de suporte, estratégia de teste. |
| **P-07** | O admin desktop e as interfaces de campo/mobile precisam de densidades diferentes? | Comparação das telas reais e feedback dos fiscais. | Determina se `density` é uma dimensão de primeira classe nos tokens de sizing e spacing, ou se um único conjunto atende. | Modelagem de sizing/spacing (§7.2), Foundation de densidade, complexidade do sistema como um todo. |
| **P-08** | Existe designer, arquivo Figma e marca definida? | Composição do time. | Sem designer, o DS precisa de outra estratégia (adotar referência externa em vez de criar). Com Figma, é preciso decidir a direção da sincronização. | AD-09 (fluxo de tokens), AD-11 (ícones), AD-17 (governança), R-3, público da documentação. |
| **P-09** | Dark mode e/ou alto contraste são requisito? | Necessidade real dos usuários. Suspeito que alto contraste (uso ao sol) valha mais que dark mode — mas é suposição minha. | Definem se a camada semântica precisa nascer multi-tema mesmo com um tema ativo, e mudam a modelagem de sombra/elevação. | Estrutura dos tokens de cor, esforço de teste, §7.4. |
| **P-10** | Haverá algum idioma além de pt-BR? | Escopo de mercado. | i18n em componente é custo permanente, agora em duas plataformas. | Se componentes aceitam strings customizáveis; se RTL entra na matriz de teste. |
| **P-11** | Qual biblioteca headless: Base UI, Radix ou React Aria? | Comparação prática, não teórica. | Afeta DX, bundle, qualidade de a11y e risco de manutenção de longo prazo. | Implementação de AD-02. **Resolver com spike de 1 dia** construindo o mesmo `Select` nas três. |
| **P-12** | A reescrita do `parking-new` inclui um novo frontend administrativo? Quando começa? | Roadmap da reescrita. O backend está em curso; o frontend não aparece no inventário. | É o consumidor natural nº 1 e a âncora de AD-12. Sem ele, a fase 1 perde a tela real e o DS vira especulação. | Viabilidade e cronograma da fase 1 inteira; inventário de componentes. |
| **P-13** | As superfícies são construídas pelo mesmo time, ou há times/fornecedores distintos? | Organização das equipes. | Steward único (AD-17) pressupõe proximidade. Com fornecedores distintos, é preciso um fórum leve de alinhamento e contratos mais explícitos. | Modelo de governança, formato da documentação, R-4. |
| **P-14** | Como o time hoje coordena a propagação de mudanças entre as VMs das cidades? | Processo de deploy existente do S2Way. | AD-19 deve reaproveitar o mecanismo que já existe, não inventar outro. | Implementação prática de AD-19, janela de suporte, ferramenta de rastreio de versão. |
| **P-15** | Onde os pacotes serão publicados, e sob qual escopo (`@rizzopark` ou `@venice`)? | Se há org npm paga; preferência entre GitHub Packages e npm privado. | Afeta autenticação de CI, `.npmrc` dos consumidores e atrito de onboarding em N repositórios. | Configuração de release, nomenclatura. |

**Bloqueantes para iniciar a fase 1:** **P-12** (existe tela real?), **P-03** (Tailwind?),
**P-01** (white-label?). **P-11** se resolve com um spike. Os demais podem ser respondidos
durante a fase 1.

---

## 20. Roadmap de implementação

Fases com **critério de saída**, não datas — datas sem P-12 respondido seriam ficção.

### Fase 0 — Discovery e alinhamento *(sem código de produção)*

- Responder P-12, P-03, P-01 com quem decide produto.
- **Auditoria visual das superfícies existentes:** capturar as telas principais do S2Way, do
  App do Usuário, do App do Operador e dos serviços web, e contar — quantas cores, quantos
  tamanhos de fonte, quantos raios, quantos estilos de botão. **É o dado que justifica o DS
  em números** e o argumento mais forte que existe para conseguir apoio.
- Levantar P-06 (matriz de dispositivos) — depende de informação de campo, então começar cedo.
- Spike de 1 dia: mesmo `Select` em Base UI, Radix e React Aria → resolve P-11.
- Revisar e aprovar este documento; convertê-lo em `ADR-001` do repositório do DS.

**Saída:** pendências bloqueantes respondidas; inventário visual quantificado; arquitetura
aprovada; primeira tela escolhida.

---

### Fase 1 — Fundação, ancorada em uma tela real do novo admin

- Monorepo com `tokens`, `react`, `docs`, `sandbox` (AD-21).
- Tokens: color, typography, spacing, radius, border-width, sizing, z-index, elevation(3),
  breakpoints. Primitive + Semantic. **Saídas para web e RN desde já** (AD-03/AD-09).
  **Teste de contraste no CI desde o primeiro commit.**
- Foundations escritas: cor, tipografia, espaçamento, layout, acessibilidade — com as
  assimetrias de plataforma (§7.4) documentadas.
- Contratos de componente para o inventário da fase 1 (§5.3).
- 8 a 12 componentes web **derivados da tela escolhida**. Nenhum RN.
- Storybook com doc por componente (incluindo "quando não usar" e disponibilidade por
  plataforma) + axe no CI.
- Changesets, CI, primeiro release `0.1.0`.
- A tela real construída sobre o DS. **É o teste de verdade.**

**Saída:** uma tela em produção 100% sobre o DS, sem CSS de contorno. Se houver contorno, a
fase 1 não terminou — e o contorno é o requisito que faltava.

---

### Fase 2 — Segundo consumidor e adoção de tokens no que já existe

- Segunda superfície web consumindo o DS — **preferencialmente um serviço citizen-facing**,
  para que as foundations não sejam definidas só pelo admin (R-8).
- **Adoção incremental de tokens nos apps RN**: substituir hex e espaçamentos literais pelos
  tokens, sem tocar em estrutura de componente. Ganho de consistência sem reescrita.
- **Tokens no S2Way** via CSS custom properties, se o custo se provar baixo — reduz a
  dissonância durante a convivência.
- Patterns documentados a partir da duplicação que apareceu de fato (AD-14).
- Regressão visual, se o gatilho de AD-20 disparar.
- Tema/white-label, **se P-01 = sim**.
- Auditoria manual com leitor de tela nos componentes críticos.
- Implementar o registro de versão por superfície/cidade (AD-19).

**Saída:** dois consumidores web em produção; apps RN consumindo tokens; patterns escritos a
partir de duplicação real.

---

### Fase 3 — Estabilização e decisão sobre React Native

- Declarar `1.0.0` (critério de AD-18 atendido).
- **Reavaliar AD-03 com P-02 respondido.** Se houver refresh de app à vista, `@rizzopark/native`
  e `@rizzopark/icons` entram aqui, com os contratos já escritos desde a fase 1.
- Templates, se ≥2 superfícies compartilharem casca (AD-13).
- Motion, se houver interação que justifique.
- Density, se P-07 confirmar.
- Auditar consumo: depreciar componente sem uso (R-7).
- Reavaliar AD-16 (site de documentação) e AD-21 (estrutura de pacotes).

**Saída:** superfície pública estável; ciclo de depreciação em vigor; decisão sobre RN tomada
com dados.

---

### O que explicitamente NÃO está no roadmap

Não por serem ruins — por não haver evidência de que sejam necessários:

- Web Components ou suporte multi-framework;
- react-native-web ou biblioteca universal de estilo;
- Modernização do Datahub Panel ou do Aeropay;
- Componentes para o S2Way (está sendo substituído);
- Data visualization;
- Sincronização bidirecional com Figma;
- Internacionalização;
- Publicação open source.

---

## Anexo A — Índice de decisões

| ID | Decisão | Depende de |
|---|---|---|
| AD-01 | Tokens compartilhados + implementações por plataforma sob contrato comum | — |
| AD-02 | Componentes web sobre primitivos headless acessíveis | P-11 |
| AD-03 | Pacote RN planejado agora, construído depois; tokens RN na fase 1 | P-02 |
| AD-04 | CSS Modules + custom properties, zero runtime | P-03 |
| AD-05 | Primitive + Semantic agora; Component tokens sob demanda | P-01 |
| AD-06 | Nomenclatura semântica desde o dia um, em todas as plataformas | — |
| AD-07 | Paleta validada por contraste, quebrando o build | P-05 |
| AD-08 | Arquitetura preparada para tema em runtime | P-01 |
| AD-09 | Tokens em JSON DTCG + Style Dictionary, alvos web e RN | P-08 |
| AD-10 | Primitivas de layout, não grid de 12 colunas | P-08 |
| AD-11 | Conjunto de ícones existente + ícones de domínio, build para duas plataformas | P-08 |
| AD-12 | Componentes promovidos a partir de tela real | P-12 |
| AD-13 | Templates fora do DS até a segunda superfície | — |
| AD-14 | Patterns como documentação primeiro | — |
| AD-15 | Baseline WCAG 2.2 AA (web) + equivalente funcional (RN) | P-04, P-06 |
| AD-16 | Storybook como site único de documentação | — |
| AD-17 | Governança por steward único | P-08, P-13 |
| AD-18 | SemVer + Changesets + versão travada + 0.x deliberado | — |
| AD-19 | Propagação assíncrona entre cidades; janela de suporte explícita | P-14 |
| AD-20 | Regressão visual adiada para a fase 2 | — |
| AD-21 | Monorepo: 2 pacotes publicados, 2 planejados, 2 apps privados | P-02, P-15 |

## Anexo B — Rastreabilidade superfície × camada

| Superfície | Tokens | Componentes | Patterns | Fase de adoção |
|---|---|---|---|---|
| Novo admin `parking-new` | ✅ | ✅ web | ✅ | Fase 1 |
| Serviços Web Auxiliares | ✅ | ✅ web | ✅ | Fase 2 |
| Frontend do OCR | ✅ | ✅ web | ✅ | Fase 2 |
| App do Usuário (RN) | ✅ | 🟡 AD-03 | ✅ | Tokens fase 2 · componentes fase 3+ |
| App do Operador (RN) | ✅ | 🟡 AD-03 | ✅ | Tokens fase 2 · componentes fase 3+ |
| S2Way (CakePHP) | 🟡 opcional | ❌ | ❌ | Fase 2, se barato |
| Datahub Panel | ❌ | ❌ | ❌ | Fora de escopo |
| Aeropay | — | — | — | Sem UI |
