'use client';

import { useCallback, useRef, type Ref } from 'react';

/**
 * Avisa, em desenvolvimento, quando um controle não tem nome acessível.
 *
 * O caso comum é botão só de ícone sem `aria-label`: invisível para quem enxerga
 * e completamente mudo no leitor de tela. Tornar o caminho inacessível barulhento
 * é o que faz PA-3 valer na prática — acessibilidade é propriedade do componente,
 * não algo que quem consome precisa lembrar.
 *
 * Usa callback ref em vez de efeito porque o conteúdo pode mudar sem remontar, e
 * a checagem precisa acontecer com o nó já no DOM.
 */
export function useAccessibleName<T extends HTMLElement>(forwarded: Ref<T> | undefined, enabled: boolean): Ref<T> {
  const warned = useRef(false);

  return useCallback(
    (node: T | null) => {
      if (typeof forwarded === 'function') forwarded(node);
      else if (forwarded) (forwarded as { current: T | null }).current = node;

      if (!enabled || !node || warned.current) return;

      const hasName = Boolean(
        node.textContent?.trim() || node.getAttribute('aria-label') || node.getAttribute('aria-labelledby'),
      );
      if (!hasName) {
        warned.current = true;
        console.warn(
          '[@venice-sistemas/react] Controle sem nome acessível. Um botão só de ícone precisa de `aria-label` — ' +
            'sem ele o leitor de tela anuncia apenas "botão", e o usuário não tem como saber o que ele faz.',
          node,
        );
      }
    },
    [forwarded, enabled],
  );
}
