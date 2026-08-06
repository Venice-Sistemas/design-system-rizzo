# @rizzopark/sandbox

App Next.js mínimo que consome `@rizzopark/react` **exatamente como uma aplicação real
consumiria**: pelo pacote publicado, não pelo código-fonte.

Não é vitrine — para isso existe a galeria. Este app existe para falhar quando algo quebra
de um jeito que teste unitário e Storybook não pegam.

## O que ele verifica

**1. Tailwind não vazou como requisito.** Este app **não tem Tailwind instalado**, de
propósito. Ele importa `@rizzopark/react/styles.css` e mais nada. Se os botões renderizarem
certos aqui, o Tailwind é ferramenta de build nossa e não dependência de quem consome —
que é o teste prático de PA-9.

**2. A diretiva `"use client"` sobreviveu ao bundle.** O esbuild remove diretivas de nível
de módulo ao empacotar, e um script do build a recoloca. Se ele falhar, o Next trata os
componentes como Server Components e o erro só aparece em runtime, com mensagem que não
aponta para a causa. `next build` aqui é o único lugar onde isso aparece cedo.

**3. Server Components e bundling.** A página é um Server Component que renderiza um
componente client. É a composição normal do App Router e a que mais quebra em biblioteca
mal empacotada.

## Rodar

```bash
pnpm --filter @rizzopark/react build
pnpm --filter @rizzopark/sandbox dev
```

`next build` é o que roda no CI — se ele passa, o pacote é consumível.
