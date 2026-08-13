'use client';

import type * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn, selectSlots } from '@venice-sistemas/styles';

/**
 * Select — implementa docs/contracts/select.md.
 *
 * Sobre @radix-ui/react-select, e não sobre `<select>` nativo. O nativo acerta
 * teclado e leitor de tela de graça, mas não aceita marca de selecionado nem
 * item desabilitado com aparência própria, e no Windows abre um painel do
 * sistema que ignora o tema — inclusive o escuro.
 */

export function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

export interface SelectTriggerProps
  extends React.ComponentProps<typeof SelectPrimitive.Trigger> {}

export function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(selectSlots.trigger, className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <Chevron />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export interface SelectValueProps
  extends React.ComponentProps<typeof SelectPrimitive.Value> {}

export function SelectValue(props: SelectValueProps) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

export interface SelectContentProps
  extends React.ComponentProps<typeof SelectPrimitive.Content> {}

export function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(selectSlots.content, className)}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport className={selectSlots.viewport}>
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export interface SelectGroupProps
  extends React.ComponentProps<typeof SelectPrimitive.Group> {}

export function SelectGroup({ className, ...props }: SelectGroupProps) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn(selectSlots.group, className)}
      {...props}
    />
  );
}

export interface SelectLabelProps
  extends React.ComponentProps<typeof SelectPrimitive.Label> {}

export function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(selectSlots.label, className)}
      {...props}
    />
  );
}

export interface SelectItemProps
  extends React.ComponentProps<typeof SelectPrimitive.Item> {}

export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(selectSlots.item, className)}
      {...props}
    >
      <span className={selectSlots.itemIndicator}>
        <SelectPrimitive.ItemIndicator>
          <Visto />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(selectSlots.separator, className)}
      {...props}
    />
  );
}

/* Decorativos: o estado vem de `aria-expanded` no gatilho e de `aria-selected`
 * no item, e um glifo anunciado repetiria em palavras o que a ARIA já diz.
 *
 * SVG inline pelo mesmo motivo do Checkbox — uma biblioteca de ícones inteira
 * por dois traços decidiria a estratégia de ícones por acidente. */

function Chevron() {
  return (
    <svg
      data-slot="select-chevron"
      viewBox="0 0 16 16"
      className={selectSlots.chevron}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Visto() {
  return (
    <svg viewBox="0 0 16 16" className={selectSlots.glyph} fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
