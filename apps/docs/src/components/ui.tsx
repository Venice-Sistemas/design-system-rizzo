/**
 * Auxiliares de RENDERIZAÇÃO DA DOCUMENTAÇÃO.
 *
 * Nada aqui faz parte do Design System. São componentes descartáveis a serviço
 * da galeria — quando `@venice-sistemas/react` existir, estes continuam aqui e não
 * migram. Se algo daqui parecer promovível, é sinal de que o critério de entrada
 * (§9.1) precisa ser aplicado, não de que basta mover o arquivo.
 *
 * Eles se estilizam com os próprios tokens do sistema, de propósito: a galeria é
 * o primeiro consumidor real do tokens.css, e serve de canário.
 */

import type { CSSProperties, ReactNode } from 'react';
import { check, contrast, WCAG } from '@venice-sistemas/tokens/contrast';
import { isHex, type FlatToken, type Leaf } from '../lib/tokens';

const mono: CSSProperties = { fontFamily: 'var(--rp-typography-family-mono)', fontSize: '0.8125rem' };
const muted: CSSProperties = { color: 'var(--rp-color-text-secondary)' };

export function Stack({ children, gap = 'md' }: { children: ReactNode; gap?: string }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: `var(--rp-space-${gap})` }}>{children}</div>;
}

export function Note({ tone = 'info', children }: { tone?: 'info' | 'warning' | 'danger' | 'success'; children: ReactNode }) {
  return (
    <div
      style={{
        background: `var(--rp-color-feedback-${tone}-surface)`,
        color: `var(--rp-color-feedback-${tone}-text)`,
        borderLeft: `var(--rp-border-width-strong) solid var(--rp-color-feedback-${tone}-border)`,
        padding: 'var(--rp-space-sm) var(--rp-space-md)',
        margin: 'var(--rp-space-md) 0',
        lineHeight: 'var(--rp-typography-body-md-line-height)',
      }}
    >
      {children}
    </div>
  );
}

/** Uma escala primitiva inteira, com o contraste de cada degrau contra branco. */
export function Ramp({ name, steps, anchor }: { name: string; steps: FlatToken[]; anchor?: string }) {
  return (
    <div style={{ margin: 'var(--rp-space-lg) 0' }}>
      <div style={{ ...mono, marginBottom: 'var(--rp-space-2xs)' }}>{name}</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 2 }}>
        {steps.map((step) => {
          const value = String(step.value);
          const isAnchor = anchor && value.toLowerCase() === anchor.toLowerCase();
          return (
            <div key={step.path}>
              <div
                title={`${step.path} — ${value}`}
                style={{
                  height: 56,
                  background: value,
                  border: isAnchor ? '2px solid var(--rp-color-text-primary)' : 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ ...mono, ...muted, fontSize: '0.6875rem', textAlign: 'center', marginTop: 4, lineHeight: 1.4 }}>
                {step.segments.at(-1)}
                <br />
                {contrast(value, '#ffffff').toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Preview({ value }: { value: Leaf }) {
  if (isHex(value)) {
    return (
      <span
        style={{
          display: 'inline-block',
          width: 40,
          height: 20,
          background: value,
          border: '1px solid var(--rp-color-border-default)',
          borderRadius: 'var(--rp-radius-control)',
          verticalAlign: 'middle',
        }}
      />
    );
  }
  if (value === 'transparent') return <span style={{ ...mono, ...muted }}>—</span>;
  return null;
}

/** Tabela genérica de tokens: nome, variável CSS, valor e prévia. */
export function TokenTable({ tokens, preview = true }: { tokens: FlatToken[]; preview?: boolean }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--rp-typography-body-sm-size)' }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--rp-color-border-default)' }}>
          {preview && <th style={{ padding: 'var(--rp-space-xs)', width: 56 }} />}
          <th style={{ padding: 'var(--rp-space-xs)' }}>token</th>
          <th style={{ padding: 'var(--rp-space-xs)' }}>variável CSS</th>
          <th style={{ padding: 'var(--rp-space-xs)' }}>valor</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.path} style={{ borderBottom: '1px solid var(--rp-color-border-subtle)' }}>
            {preview && (
              <td style={{ padding: 'var(--rp-space-xs)' }}>
                <Preview value={token.value} />
              </td>
            )}
            <td style={{ padding: 'var(--rp-space-xs)', ...mono }}>{token.path}</td>
            <td style={{ padding: 'var(--rp-space-xs)', ...mono, ...muted }}>{token.cssVar}</td>
            <td style={{ padding: 'var(--rp-space-xs)', ...mono }}>{String(token.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * `ok` é o VEREDITO (comportou-se como o contrato espera) e define a cor.
 * O operador vem da comparação real, não do veredito — nos pares proibidos os dois
 * divergem de propósito: 2,20:1 é *menor* que 4,5 e isso é o resultado correto.
 * Derivar o operador de `ok` faria a página exibir "2.20:1 ≥ 4.5", que é falso.
 */
export function Verdict({ ok, ratio, min }: { ok: boolean; ratio: number; min: number }) {
  const tone = ok ? 'success' : 'danger';
  const operator = ratio >= min ? '≥' : '<';
  return (
    <span
      style={{
        ...mono,
        background: `var(--rp-color-feedback-${tone}-surface)`,
        color: `var(--rp-color-feedback-${tone}-text)`,
        padding: '2px var(--rp-space-xs)',
        borderRadius: 'var(--rp-radius-pill)',
        whiteSpace: 'nowrap',
      }}
    >
      {ratio.toFixed(2)}:1 {operator} {min}
    </span>
  );
}

export { check, contrast, WCAG };
