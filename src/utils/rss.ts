import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getLocalePath } from '../i18n/ui';

export async function generateBlogRss(context: APIContext, lang: 'ru' | 'en') {
  const allPosts = await getCollection('blog');
  const langPosts = allPosts
    .filter((post) => post.id.startsWith(`${lang}/`))
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  const siteUrl = (context.site?.toString() || 'https://saviorbill.com').replace(/\/+$/, '');
  const title = lang === 'ru' ? 'SaviorBill — Блог и статьи' : 'SaviorBill — Blog & Engineering Notes';
  const description =
    lang === 'ru'
      ? 'Инженерные разборы, архитектура биллинга, гайды по интеграции и новости платформы SaviorBill.'
      : 'Engineering deep-dives, billing architecture, integration guides, and platform updates.';

  return rss({
    title,
    description,
    site: siteUrl,
    customData: `<language>${lang === 'ru' ? 'ru-RU' : 'en-US'}</language>`,
    items: langPosts.map((post) => {
      const parts = post.id.split('/');
      const slug = parts.slice(1).join('/').replace(/\.(md|mdx)$/, '');
      const link = getLocalePath(`/blog/${slug}`, lang);
      const pubDate = new Date(post.data.date);
      const cover = post.data.cover || `/images/og/${lang}-${slug}.png`;
      const coverUrl = cover.startsWith('http') ? cover : `${siteUrl}${cover}`;

      return {
        title: post.data.title,
        description: post.data.description,
        pubDate,
        link,
        author: post.data.author || 'Andrey UNVI',
        categories: post.data.tags || [],
        customData: `<enclosure url="${coverUrl}" type="image/png" length="0" />`,
      };
    }),
  });
}
