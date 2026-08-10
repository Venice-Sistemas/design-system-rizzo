/**
 * Nenhuma classe `ds:` pode ser escrita fora de @venice-sistemas/styles.
 *
 * A regra já existia em prosa — "toda classe do componente, incluindo as das
 * partes internas" — e nada a verificava. O custo disso apareceu em produção:
 * `ds:sr-only`, `ds:size-4` e `ds:size-3.5` foram escritas direto nos
 * componentes, e o Tailwind do pacote de estilo varre apenas os `.ts` DELE
 * (`@source './**\/*.ts'`).
 *
 * O resultado não foi um erro de build. Foi CSS silenciosamente ausente: o
 * rótulo "Fechar", que deveria estar escondido, apareceu no canto do modal, e o
 * ícone perdeu o tamanho. Nada falhou — só ficou errado na tela.
 *
 * Este teste transforma a convenção em algo que quebra.
 *
 * Arquivos de teste ficam de fora: as classes ali só verificam que `className`
 * chega ao elemento, e não precisam existir no CSS para isso.
 */

import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));

function arquivosDeComponente(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) return arquivosDeComponente(caminho);
    if (!/\.tsx?$/.test(nome)) return [];
    if (/\.test\.tsx?$/.test(nome)) return [];
    return [caminho];
  });
}

describe('classes moram na camada de estilo', () => {
  it('nenhum componente escreve uma classe `ds:` direto', () => {
    const infratores: string[] = [];

    for (const arquivo of arquivosDeComponente(AQUI)) {
      const conteudo = readFileSync(arquivo, 'utf8');
      for (const [, classes] of conteudo.matchAll(/["'`](ds:[^"'`]*)["'`]/g)) {
        infratores.push(`${arquivo.slice(AQUI.length + 1)} → ${classes}`);
      }
    }

    expect(
      infratores,
      'Classe `ds:` escrita fora de @venice-sistemas/styles não é gerada pelo ' +
        'Tailwind, e o sintoma é CSS ausente sem erro nenhum. Mova para a receita ' +
        'do componente:\n' +
        infratores.join('\n'),
    ).toEqual([]);
  });
});
