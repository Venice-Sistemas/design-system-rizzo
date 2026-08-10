import { Component } from '@angular/core';
import { RpButton, type ButtonSize, type ButtonVariant } from '@venice-sistemas/angular';

/**
 * Espelha a página do sandbox Next, de propósito: as duas lado a lado devem ser
 * indistinguíveis. Se divergirem, alguma plataforma acrescentou classe por fora
 * da receita compartilhada — que é o único jeito de isso acontecer.
 */
@Component({
  selector: 'rp-app',
  standalone: true,
  imports: [RpButton],
  host: {
    style:
      'display:block;padding:var(--rp-space-2xl);background:var(--rp-color-surface-page);color:var(--rp-color-text-primary);font-family:var(--rp-typography-family-default);min-height:100vh',
  },
  template: `
    <main style="display:flex;flex-direction:column;gap:var(--rp-space-xl);max-width:52rem">
      <div>
        <h1 style="font-size:var(--rp-typography-heading-page-size);margin:0">Sandbox Angular</h1>
        <p style="color:var(--rp-color-text-secondary);margin-top:var(--rp-space-xs)">
          Angular sem Tailwind, consumindo o mesmo pacote publicado
        </p>
      </div>

      @for (variant of variants; track variant) {
        <div style="display:flex;align-items:center;gap:var(--rp-space-md);flex-wrap:wrap">
          <span
            style="width:9rem;font-family:var(--rp-typography-family-mono);font-size:var(--rp-typography-caption-md-size);color:var(--rp-color-text-secondary)"
          >{{ variant }}</span>

          @for (size of sizes; track size) {
            <rp-button [variant]="variant" [size]="size">Registrar</rp-button>
          }
          <rp-button [variant]="variant" [disabled]="true">Desabilitado</rp-button>
          <rp-button [variant]="variant" [loading]="true">Carregando</rp-button>
        </div>
      }
    </main>
  `,
})
export class App {
  readonly variants: ButtonVariant[] = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];
  readonly sizes: ButtonSize[] = ['default', 'sm', 'lg'];
}
