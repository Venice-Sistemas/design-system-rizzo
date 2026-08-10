'use client';

import type * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn, menuItemVariants, menuSlots, type MenuItemVariant } from '@venice-sistemas/styles';

/**
 * DropdownMenu — implementa docs/contracts/dropdown-menu.md.
 *
 * O modelo de teclado é o oposto do resto da biblioteca: dentro de um menu, Tab
 * FECHA e as setas navegam. Um menu cujos itens são alcançáveis por Tab não é um
 * menu — é uma lista de botões numa caixa, e quem usa leitor de tela recebe a
 * promessa de "menu" com o comportamento de outra coisa. O Radix cuida disso.
 *
 * SETE partes, não as quinze do shadcn. Ficaram de fora submenu (`Sub`,
 * `SubTrigger`, `SubContent`), item de rádio, item de checkbox e `Shortcut` —
 * dez partes que nenhuma tela chama e que são a parcela mais complexa de acertar.
 * Entram quando houver demanda, que é a regra do repositório.
 */

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

export interface DropdownMenuContentProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.Content> {}

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  loop = true,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        // O Radix não circula por padrão: a seta para no último item e fica lá,
        // sem sinal de que chegou ao fim. Num menu curto isso é indistinguível
        // de travamento — a pessoa segura a seta e nada acontece.
        //
        // A APG trata circular como opcional; a escolha aqui é deliberada e está
        // no contrato. Menu longo o bastante para desorientar não deveria ser um
        // menu.
        loop={loop}
        className={cn(menuSlots.content, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export interface DropdownMenuItemProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.Item> {
  /** `destructive` destaca com a superfície de perigo, não só com texto vermelho. */
  variant?: MenuItemVariant;
}

export function DropdownMenuItem({ className, variant, ...props }: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant ?? 'default'}
      className={cn(menuItemVariants({ variant }), className)}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn(menuSlots.label, className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(menuSlots.separator, className)}
      {...props}
    />
  );
}
