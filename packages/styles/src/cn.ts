import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * `twMerge` precisa conhecer o nosso prefixo, senão não reconhece `ds:p-4` como
 * utilitária do Tailwind e para de resolver conflitos — duas classes de padding
 * sobreviveriam, e venceria a última do CSS em vez da última da lista.
 */
const merge = extendTailwindMerge({ prefix: 'ds' });

/** Junta classes resolvendo conflitos do Tailwind. */
export function cn(...inputs: ClassValue[]): string {
  return merge(clsx(inputs));
}

export type { ClassValue };
