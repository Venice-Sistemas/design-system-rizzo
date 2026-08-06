/**
 * Amostras visuais das foundations de layout, todas geradas a partir da saída do
 * build. Nenhum tamanho é escrito à mão — os retângulos usam a própria variável CSS.
 */

import { group, semanticTokens } from '../lib/tokens';

const label = {
  fontFamily: 'var(--rp-typography-family-mono)',
  fontSize: '0.6875rem',
  color: 'var(--rp-color-text-secondary)',
  whiteSpace: 'nowrap' as const,
};

const row = { display: 'flex', alignItems: 'center', gap: 'var(--rp-space-md)' } as const;

export function SpaceScale() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--rp-space-xs)', margin: 'var(--rp-space-lg) 0' }}>
      {group(semanticTokens, 'space').map((token) => (
        <div key={token.path} style={row}>
          <span style={{ ...label, width: '7rem' }}>{token.segments.at(-1)}</span>
          <span
            style={{
              display: 'block',
              width: `var(${token.cssVar})`,
              height: 'var(--rp-space-md)',
              background: 'var(--rp-color-action-primary-background-default)',
              minWidth: 1,
            }}
          />
          <span style={label}>{String(token.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function RadiusSamples() {
  return (
    <div style={{ display: 'flex', gap: 'var(--rp-space-lg)', flexWrap: 'wrap', margin: 'var(--rp-space-lg) 0' }}>
      {group(semanticTokens, 'radius').map((token) => (
        <div key={token.path} style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 72,
              height: 72,
              background: 'var(--rp-color-surface-subtle)',
              border: '1px solid var(--rp-color-border-strong)',
              borderRadius: `var(${token.cssVar})`,
            }}
          />
          <div style={{ ...label, marginTop: 'var(--rp-space-2xs)' }}>{token.segments.at(-1)}</div>
          <div style={label}>{String(token.value)}</div>
        </div>
      ))}
    </div>
  );
}

export function SizeSamples() {
  const controls = group(semanticTokens, 'size.control');
  const target = group(semanticTokens, 'size.target')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--rp-space-md)', margin: 'var(--rp-space-lg) 0' }}>
      {controls.map((token) => (
        <div key={token.path} style={row}>
          <span style={{ ...label, width: '10rem' }}>{token.path}</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 var(--rp-space-md)',
              height: `var(${token.cssVar})`,
              background: 'var(--rp-color-action-primary-background-default)',
              color: 'var(--rp-color-action-primary-foreground-default)',
              borderRadius: 'var(--rp-radius-control)',
              fontSize: 'var(--rp-typography-body-sm-size)',
            }}
          >
            Registrar
          </span>
          <span style={label}>{String(token.value)}</span>
        </div>
      ))}

      {target && (
        <div style={row}>
          <span style={{ ...label, width: '10rem' }}>{target.path}</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: `var(${target.cssVar})`,
              height: `var(${target.cssVar})`,
              outline: '1px dashed var(--rp-color-border-focus)',
              outlineOffset: -1,
            }}
          >
            <span
              style={{
                width: 'var(--rp-size-icon-md)',
                height: 'var(--rp-size-icon-md)',
                background: 'var(--rp-color-text-secondary)',
                borderRadius: 'var(--rp-radius-pill)',
              }}
            />
          </span>
          <span style={label}>
            {String(target.value)} — o alvo tracejado é a área clicável; o círculo é o ícone visível
          </span>
        </div>
      )}
    </div>
  );
}

export function ElevationSamples() {
  return (
    <div style={{ display: 'flex', gap: 'var(--rp-space-xl)', flexWrap: 'wrap', margin: 'var(--rp-space-xl) 0' }}>
      {group(semanticTokens, 'elevation').map((token) => (
        <div key={token.path}>
          <div
            style={{
              width: 160,
              height: 88,
              background: 'var(--rp-color-surface-raised)',
              border: '1px solid var(--rp-color-border-subtle)',
              borderRadius: 'var(--rp-radius-container)',
              boxShadow: `var(${token.cssVar})`,
            }}
          />
          <div style={{ ...label, marginTop: 'var(--rp-space-xs)' }}>{token.segments.at(-1)}</div>
        </div>
      ))}
    </div>
  );
}
