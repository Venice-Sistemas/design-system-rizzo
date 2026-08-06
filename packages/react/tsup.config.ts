import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  sourcemap: true,
  // React vem do consumidor — está em peerDependencies.
  external: ['react', 'react-dom'],
  /**
   * A diretiva "use client" NÃO é resolvida aqui. O esbuild remove diretivas de
   * nível de módulo ao empacotar, inclusive a que o `banner` insere — ele entra
   * antes dessa etapa. Ela é recolocada por scripts/preserve-use-client.mjs, que
   * roda depois do tsup.
   *
   * Isto vale enquanto todo o pacote for client-side. No dia em que existir um
   * componente que possa ser server, a diretiva precisa ir por arquivo e o
   * script global passa a ser errado.
   */
  splitting: false,
  outExtension: () => ({ js: '.js' }),
});
