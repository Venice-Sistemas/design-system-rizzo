import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * `twMerge` precisa saber do nosso prefixo, senão não reconhece `ds:p-4` como
 * utilitária do Tailwind e para de resolver conflitos — duas classes de padding
 * sobreviveriam e a última do CSS venceria, em vez da última da lista.
 */
const merge = extendTailwindMerge({ prefix: 'ds' });

/** Junta classes resolvendo conflitos do Tailwind. Interno; não é exportado no índice. */
export function cn(...inputs: ClassValue[]): string {
  return merge(clsx(inputs));
}
