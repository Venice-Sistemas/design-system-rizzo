/**
 * Superfície pública de @venice-sistemas/react.
 *
 * Nada de biblioteca externa é reexportado daqui. O teste, aplicável em revisão:
 * conseguimos trocar a implementação interna de um componente sem que isso seja
 * breaking change para quem consome? Se um tipo de terceiro vazar, a resposta
 * vira não.
 */

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './button/button';

/**
 * Reexportado de @venice-sistemas/styles por conveniência: quem precisa das classes sem
 * o componente — para estilizar um <a> como botão, por exemplo — não precisa
 * instalar um segundo pacote. A definição vive lá, e é a mesma que o Angular usa.
 */
export { buttonVariants } from '@venice-sistemas/styles';
