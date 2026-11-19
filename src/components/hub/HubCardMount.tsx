import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import HubCardEmbed from './HubCardEmbed';

export default function HubCardMount() {
  useEffect(() => {
    const roots: Array<{ unmount: () => void }> = [];

    const mountCards = () => {
      const placeholders = document.querySelectorAll<HTMLElement>('[data-hub-card]:not([data-hub-mounted="true"])');
      placeholders.forEach((el) => {
        el.setAttribute('data-hub-mounted', 'true');
        const scriptId = el.getAttribute('data-hub-card') || '';
        const lang = (el.getAttribute('data-lang') || 'ru') as 'ru' | 'en';

        if (!scriptId) return;

        el.innerHTML = '';
        const root = createRoot(el);
        root.render(<HubCardEmbed scriptId={scriptId} lang={lang} />);
        roots.push(root);
      });
    };

    mountCards();
    document.addEventListener('astro:page-load', mountCards);

    return () => {
      document.removeEventListener('astro:page-load', mountCards);
      roots.forEach((r) => {
        try {
          r.unmount();
        } catch {}
      });
    };
  }, []);

  return null;
}
