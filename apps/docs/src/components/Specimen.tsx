/**
 * Espécime tipográfico gerado a partir dos papéis semânticos.
 *
 * Percorre `typography.*` na saída do build e renderiza cada papel com os próprios
 * valores — se um degrau da escala mudar, o espécime muda junto. O texto de amostra
 * usa vocabulário do domínio de propósito: é assim que a tipografia vai aparecer.
 */

import { semanticTokens } from '../lib/tokens';

const AMOSTRA: Record<string, string> = {
  'heading.page': 'Gestão de áreas e setores',
  'heading.section': 'Irregularidades do período',
  'heading.sub': 'Setor Centro — 120 vagas',
  'body.lg': 'O veículo permaneceu 47 minutos além da tolerância configurada para a área.',
  'body.md': 'O veículo permaneceu 47 minutos além da tolerância configurada para a área.',
  'body.sm': 'Registrado às 14h32, com foto e coordenadas.',
  'label.md': 'Município',
  'label.sm': 'Período',
  'caption.md': 'A tolerância vale a partir da primeira leitura, não do início da vigência.',
  'code.md': '0048172 · 14:32:05 · R$ 12,40',
};

/** Reagrupa os tokens achatados de volta em papéis: { 'body.md': { size, weight, line-height } }. */
function roles(): Map<string, Record<string, string>> {
  const out = new Map<string, Record<string, string>>();
  for (const token of semanticTokens) {
    if (token.segments[0] !== 'typography') continue;
    const property = token.segments.at(-1)!;
    if (!['size', 'weight', 'line-height'].includes(property)) continue;
    const role = token.segments.slice(1, -1).join('.');
    const entry = out.get(role) ?? {};
    entry[property] = String(token.value);
    out.set(role, entry);
  }
  return out;
}

export function Specimen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--rp-space-lg)', margin: 'var(--rp-space-lg) 0' }}>
      {[...roles().entries()].map(([role, props]) => (
        <div key={role}>
          <div
            style={{
              fontFamily: 'var(--rp-typography-family-mono)',
              fontSize: '0.6875rem',
              color: 'var(--rp-color-text-secondary)',
              marginBottom: 'var(--rp-space-2xs)',
            }}
          >
            typography.{role} · {props.size} · {props.weight} · {props['line-height']}
          </div>
          <div
            style={{
              // O papel `code` é o único que troca de família — é para onde vão
              // números e identificadores.
              fontFamily: role.startsWith('code') ? 'var(--rp-typography-family-mono)' : 'var(--rp-typography-family-default)',
              fontSize: props.size,
              fontWeight: Number(props.weight),
              lineHeight: Number(props['line-height']),
              color: 'var(--rp-color-text-primary)',
            }}
          >
            {AMOSTRA[role] ?? 'O ligeiro cão marrom pula sobre a raposa preguiçosa.'}
          </div>
        </div>
      ))}
    </div>
  );
}
