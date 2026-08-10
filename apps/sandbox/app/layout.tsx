import type { ReactNode } from 'react';

// As duas únicas importações de estilo. Nenhum Tailwind neste app — se o botão
// renderizar certo assim, o Tailwind é ferramenta nossa e não requisito de quem
// consome (PA-9).
import '@venice-sistemas/tokens/css';
import '@venice-sistemas/styles/styles.css';

export const metadata = { title: 'Sandbox — Rizzo Park Design System' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          padding: 'var(--rp-space-2xl)',
          background: 'var(--rp-color-surface-page)',
          color: 'var(--rp-color-text-primary)',
          fontFamily: 'var(--rp-typography-family-default)',
        }}
      >
        {children}
      </body>
    </html>
  );
}
