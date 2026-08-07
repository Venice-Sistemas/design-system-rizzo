import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input, output } from '@angular/core';
import { buttonSlots, buttonVariants, cn, type ButtonSize, type ButtonVariant } from '@rizzopark/styles';

/**
 * Button — implementa docs/contracts/button.md.
 *
 * Escrito a partir do contrato. **Nenhuma linha foi copiada de
 * `@rizzopark/react`**, e não precisou: o que define a aparência vem de
 * `@rizzopark/styles`, e o que define o comportamento está no contrato.
 *
 * A prova disso é `button.contract.spec.ts` — as mesmas 27 asserções que rodam
 * contra o React passam aqui.
 *
 * O que é diferente do React, e é natural que seja: `asChild` não existe. É
 * idioma de React (delegar o elemento ao filho). Em Angular o equivalente seria
 * uma diretiva de atributo aplicada a um `<a>`, e isso entra quando houver
 * consumidor — não por simetria.
 */
@Component({
  selector: 'rp-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      data-slot="button"
      [attr.type]="type()"
      [disabled]="disabled()"
      [attr.aria-busy]="loading() ? 'true' : null"
      [attr.data-loading]="loading() ? 'true' : null"
      [class]="rootClass()"
      (click)="handleClick($event)"
    >
      <span [class]="labelClass()"><ng-content /></span>
      @if (loading()) {
        <span aria-hidden="true" [class]="spinnerClass"></span>
      }
    </button>
  `,
})
export class RpButton {
  /** Peso visual da ação. `default` é a cor primária da marca. */
  readonly variant = input<ButtonVariant>('default');

  /** Altura do controle. A área clicável nunca encolhe abaixo do mínimo de toque. */
  readonly size = input<ButtonSize>('default');

  /** Ação em andamento. Diferente de `disabled`: o botão continua focável. */
  readonly loading = input(false);

  readonly disabled = input(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  /** Escape hatch. Se você precisa sempre, falta uma variante. */
  readonly class = input('');

  readonly clicked = output<MouseEvent>();

  protected readonly spinnerClass = buttonSlots.spinner;

  protected rootClass(): string {
    return cn(buttonVariants({ variant: this.variant(), size: this.size() }), this.class());
  }

  protected labelClass(): string {
    return buttonSlots.label(this.loading());
  }

  protected handleClick(event: MouseEvent): void {
    // Carregando ignora o clique sem usar `disabled`: `disabled` tiraria o botão
    // da ordem de tabulação e o foco cairia no body no meio da ação.
    if (this.loading()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit(event);
  }

  private readonly host = inject(ElementRef<HTMLElement>);

  constructor() {
    // Avisa em desenvolvimento quando falta nome acessível. Botão só de ícone sem
    // rótulo é mudo no leitor de tela e parece normal para quem enxerga — o
    // caminho inacessível precisa ser barulhento (PA-3).
    let avisou = false;
    effect(() => {
      this.loading();
      if (avisou || !isDevMode()) return;
      queueMicrotask(() => {
        const node: HTMLButtonElement | null = this.host.nativeElement.querySelector('button');
        if (!node || avisou) return;
        const temNome = Boolean(
          node.textContent?.trim() || node.getAttribute('aria-label') || node.getAttribute('aria-labelledby'),
        );
        if (!temNome) {
          avisou = true;
          console.warn(
            '[@rizzopark/angular] Controle sem nome acessível. Um botão só de ícone precisa de `aria-label` — ' +
              'sem ele o leitor de tela anuncia apenas "botão", e o usuário não tem como saber o que ele faz.',
            node,
          );
        }
      });
    });
  }
}

/** `isDevMode` do Angular exige a app inicializada; em teste isolado nem sempre está. */
function isDevMode(): boolean {
  return typeof ngDevMode === 'undefined' || !!ngDevMode;
}

declare const ngDevMode: boolean | undefined;
