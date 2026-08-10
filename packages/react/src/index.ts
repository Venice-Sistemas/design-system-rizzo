/**
 * Superfície pública de @venice-sistemas/react.
 *
 * Nada de biblioteca externa é reexportado daqui. O teste, aplicável em revisão:
 * conseguimos trocar a implementação interna de um componente sem que isso seja
 * breaking change para quem consome? Se um tipo de terceiro vazar, a resposta
 * vira não.
 */

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './button/button';
export { Badge, type BadgeProps, type BadgeVariant } from './badge/badge';
export { Skeleton, type SkeletonProps } from './skeleton/skeleton';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  type CardProps,
} from './card/card';
export { Input, type InputProps } from './input/input';
export { Alert, AlertTitle, AlertDescription, type AlertProps, type AlertTone } from './alert/alert';

/**
 * Reexportado de @venice-sistemas/styles por conveniência: quem precisa das classes sem
 * o componente — para estilizar um <a> como botão, por exemplo — não precisa
 * instalar um segundo pacote. A definição vive lá, e é a mesma que o Angular usa.
 */
export { buttonVariants, badgeVariants } from '@venice-sistemas/styles';
