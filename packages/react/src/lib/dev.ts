/**
 * `process.env.NODE_ENV` é substituído estaticamente por Vite, Next e afins, então
 * o aviso some do bundle de produção. Declaramos o mínimo em vez de instalar
 * @types/node inteiro numa biblioteca que roda no navegador.
 */
declare const process: { env?: { NODE_ENV?: string } } | undefined;

export const isDev = typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production';
