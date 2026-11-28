import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://saviorbill.com',
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.startsWith('https://saviorbill.com/ru/'),
      customPages: [
        'https://saviorbill.com/llms.txt',
        'https://saviorbill.com/.well-known/ai-catalog.json',
        'https://saviorbill.com/rss.xml',
        'https://saviorbill.com/en/rss.xml'
      ],
      i18n: {
        defaultLocale: 'ru',
        locales: {
          ru: 'ru-RU',
          en: 'en-US'
        }
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
