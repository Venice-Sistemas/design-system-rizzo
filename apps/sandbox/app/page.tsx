import { Button, type ButtonSize, type ButtonVariant } from '@rizzopark/react';

/**
 * Server Component renderizando componentes client — a composição normal do App
 * Router, e a que mais quebra em biblioteca mal empacotada. Note que não há
 * "use client" aqui: se ele fosse necessário, a diretiva não teria sobrevivido ao
 * bundle do pacote.
 */

const VARIANTS: ButtonVariant[] = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];
const SIZES: ButtonSize[] = ['default', 'sm', 'lg'];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--rp-space-md)', flexWrap: 'wrap' }}>
      <span
        style={{
          width: '9rem',
          fontFamily: 'var(--rp-typography-family-mono)',
          fontSize: 'var(--rp-typography-caption-md-size)',
          color: 'var(--rp-color-text-secondary)',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

export default function Page() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: 'var(--rp-space-xl)', maxWidth: '52rem' }}>
      <div>
        <h1 style={{ fontSize: 'var(--rp-typography-heading-page-size)', margin: 0 }}>Sandbox</h1>
        <p style={{ color: 'var(--rp-color-text-secondary)', marginTop: 'var(--rp-space-xs)' }}>
          Next.js sem Tailwind, consumindo o pacote publicado.
        </p>
      </div>

      {VARIANTS.map((variant) => (
        <Row key={variant} label={variant}>
          {SIZES.map((size) => (
            <Button key={size} variant={variant} size={size}>
              Registrar
            </Button>
          ))}
          <Button variant={variant} disabled>
            Desabilitado
          </Button>
          <Button variant={variant} loading>
            Carregando
          </Button>
        </Row>
      ))}

      <Row label="só ícone">
        {/* aria-label obrigatório: sem ele o componente avisa no console em dev. */}
        <Button aria-label="Fechar" variant="ghost">
          ✕
        </Button>
      </Row>
    </main>
  );
}
