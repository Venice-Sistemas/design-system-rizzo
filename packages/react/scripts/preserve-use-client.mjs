/**
 * Recoloca a diretiva "use client" no topo do bundle, depois do esbuild.
 *
 * Por que existe: o esbuild REMOVE diretivas de nível de módulo ao empacotar
 * ("Module level directives cause errors when bundled") — inclusive a que o
 * `banner` do tsup insere, porque o banner entra antes dessa etapa. O resultado é
 * um pacote que compila sem erro e quebra em runtime no Next.js, tratando os
 * componentes como Server Components. A mensagem de erro que o usuário vê não
 * aponta para cá.
 *
 * Este script roda depois do tsup e é verificado por apps/sandbox, que é um app
 * Next.js real — o único lugar onde a falha apareceria.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIRECTIVE = "'use client';";
const target = join(dirname(fileURLToPath(import.meta.url)), '../dist/index.js');

const source = readFileSync(target, 'utf8');

if (source.startsWith(DIRECTIVE) || source.startsWith('"use client";')) {
  console.log('use client: já presente');
} else {
  writeFileSync(target, `${DIRECTIVE}\n${source}`, 'utf8');
  console.log('use client: recolocada no topo de dist/index.js');
}
