/**
 * Conformidade do Button de Angular ao contrato compartilhado.
 *
 * As asserções não estão aqui — são as mesmas de @venice-sistemas/contracts/button que
 * rodam contra o React. Este arquivo só ensina o Angular a montar o componente.
 *
 * É a prova de que a segunda plataforma não precisa ler a primeira: o contrato e
 * a receita de classes bastaram.
 */

import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { runButtonContract } from '@venice-sistemas/contracts/button';
import { RpButton } from './button.component';

/**
 * Hospedeiro genérico. `ng-content` precisa de conteúdo projetado em template, e
 * template é estático em Angular — então o rótulo vem por sinal e o texto é
 * interpolado.
 */
@Component({
  standalone: true,
  imports: [RpButton],
  template: `
    <rp-button
      [variant]="variant()"
      [size]="size()"
      [loading]="loading()"
      [disabled]="disabled()"
      [type]="type()"
      (clicked)="onClick($event)"
    >{{ label() }}</rp-button>
  `,
})
class Host {
  readonly variant = signal<any>('default');
  readonly size = signal<any>('default');
  readonly loading = signal(false);
  readonly disabled = signal(false);
  readonly type = signal<any>('button');
  readonly label = signal<string>('Registrar');
  onClick: (e: MouseEvent) => void = () => {};
}

let fixture: ReturnType<typeof TestBed.createComponent<Host>> | null = null;

runButtonContract({
  nome: 'Button (angular)',

  render(props) {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;

    if (props.variant) host.variant.set(props.variant);
    if (props.size) host.size.set(props.size);
    if (props.type) host.type.set(props.type);
    host.loading.set(Boolean(props.loading));
    host.disabled.set(Boolean(props.disabled));
    host.label.set(typeof props.children === 'string' ? props.children : '');
    if (props.onClick) host.onClick = props.onClick as (e: MouseEvent) => void;

    fixture.detectChanges();
    document.body.append(fixture.nativeElement);

    // `aria-label` não é input do componente: é atributo no elemento renderizado,
    // como um consumidor faria.
    if (props['aria-label']) {
      fixture.nativeElement.querySelector('button')?.setAttribute('aria-label', props['aria-label']);
    }
  },

  cleanup() {
    fixture?.nativeElement.remove();
    fixture?.destroy();
    fixture = null;
    TestBed.resetTestingModule();
  },
});
