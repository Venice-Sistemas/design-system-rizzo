/**
 * Renderiza contrast-pairs.json com o veredito calculado AO VIVO.
 *
 * Os números desta página têm que ser idênticos aos do teste que roda no CI —
 * as duas coisas leem o mesmo contrato, resolvem contra a mesma saída de build e
 * usam a mesma função de contraste (@venice-sistemas/tokens/contrast). Se divergirem,
 * uma das duas está lendo a fonte errada, e isso é um defeito.
 */

import contract from '@venice-sistemas/tokens/contrast-pairs.json';
import { check } from '@venice-sistemas/tokens/contrast';
import { primitiveTokens, semanticTokens } from '../lib/tokens';
import { Verdict } from './ui';

interface Pair {
  id: string;
  foreground: string;
  background: string;
  min?: number;
  measured: number;
  reason?: string;
}

const lookup = new Map([...semanticTokens, ...primitiveTokens].map((token) => [token.path, String(token.value)]));

function resolve(path: string): string {
  const value = lookup.get(path);
  if (!value) throw new Error(`token não encontrado na saída do build: ${path}`);
  return value;
}

const mono = { fontFamily: 'var(--rp-typography-family-mono)', fontSize: '0.75rem' } as const;
const cell = { padding: 'var(--rp-space-xs)', verticalAlign: 'top' as const };

function Sample({ foreground, background }: { foreground: string; background: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        background,
        color: foreground,
        padding: '4px var(--rp-space-sm)',
        borderRadius: 'var(--rp-radius-control)',
        border: '1px solid var(--rp-color-border-subtle)',
        fontSize: 'var(--rp-typography-body-sm-size)',
        whiteSpace: 'nowrap',
      }}
    >
      Texto
    </span>
  );
}

export function ContrastContract({ kind }: { kind: 'allowed' | 'forbidden' }) {
  const pairs = (contract[kind] ?? []) as Pair[];

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--rp-typography-body-sm-size)' }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--rp-color-border-default)' }}>
          <th style={cell}>amostra</th>
          <th style={cell}>frente / fundo</th>
          <th style={cell}>{kind === 'allowed' ? 'mínimo' : 'motivo'}</th>
        </tr>
      </thead>
      <tbody>
        {pairs.map((pair) => {
          const foreground = resolve(pair.foreground);
          const background = resolve(pair.background);
          // Proibidos são avaliados contra 4.5: o teste assere que continuam ABAIXO,
          // então aqui "reprova" é o resultado correto e esperado.
          const min = pair.min ?? 4.5;
          const result = check(foreground, background, min);
          const asExpected = kind === 'allowed' ? result.passes : !result.passes;

          return (
            <tr key={pair.id} style={{ borderBottom: '1px solid var(--rp-color-border-subtle)' }}>
              <td style={cell}>
                <Sample foreground={foreground} background={background} />
              </td>
              <td style={{ ...cell, ...mono }}>
                {pair.foreground}
                <br />
                <span style={{ color: 'var(--rp-color-text-secondary)' }}>{pair.background}</span>
              </td>
              <td style={cell}>
                <Verdict ok={asExpected} ratio={result.ratio} min={min} />
                {pair.reason && (
                  <div style={{ color: 'var(--rp-color-text-secondary)', marginTop: 4, maxWidth: '32rem' }}>{pair.reason}</div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Resumo de conformidade — o número que interessa para quem só quer saber se está verde. */
export function ContrastSummary() {
  const allowed = (contract.allowed ?? []) as Pair[];
  const forbidden = (contract.forbidden ?? []) as Pair[];
  const failing = allowed.filter((p) => !check(resolve(p.foreground), resolve(p.background), p.min ?? 4.5).passes);
  const leaked = forbidden.filter((p) => check(resolve(p.foreground), resolve(p.background), 4.5).passes);
  const green = failing.length === 0 && leaked.length === 0;

  return (
    <div
      style={{
        background: green ? 'var(--rp-color-feedback-success-surface)' : 'var(--rp-color-feedback-danger-surface)',
        color: green ? 'var(--rp-color-feedback-success-text)' : 'var(--rp-color-feedback-danger-text)',
        borderLeft: `var(--rp-border-width-strong) solid var(--rp-color-feedback-${green ? 'success' : 'danger'}-border)`,
        padding: 'var(--rp-space-sm) var(--rp-space-md)',
        margin: 'var(--rp-space-md) 0',
      }}
    >
      {green ? (
        <>
          <strong>{allowed.length} pares permitidos</strong> atingem o mínimo WCAG, e as{' '}
          <strong>{forbidden.length} combinações proibidas</strong> continuam reprovando. É o mesmo resultado do teste que
          roda no CI.
        </>
      ) : (
        <>
          <strong>{failing.length} par(es) abaixo do mínimo</strong> e <strong>{leaked.length} proibido(s) vazando</strong>.
          O build deveria estar quebrado — se não está, o teste não rodou.
        </>
      )}
    </div>
  );
}
