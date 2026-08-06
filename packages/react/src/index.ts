/**
 * Superfície pública de @rizzopark/react.
 *
 * Nada de biblioteca externa é reexportado daqui. O teste, aplicável em revisão:
 * conseguimos trocar a implementação interna de um componente sem que isso seja
 * breaking change para quem consome? Se um tipo de terceiro vazar, a resposta
 * vira não.
 */

export { Button, buttonVariants, type ButtonProps, type ButtonVariant, type ButtonSize } from './button/button';
