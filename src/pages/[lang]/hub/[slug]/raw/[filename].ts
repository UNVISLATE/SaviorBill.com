import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute } from 'astro';

export function getStaticPaths() {
  const languages: ('ru' | 'en')[] = ['ru', 'en'];
  const hubDir = path.resolve('src/content/hub');
  if (!fs.existsSync(hubDir)) return [];

  const paths: { params: { lang: 'ru' | 'en'; slug: string; filename: string } }[] = [];

  const dirs = fs.readdirSync(hubDir, { withFileTypes: true });
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const slug = d.name;
    const scriptDir = path.join(hubDir, slug);
    const files = fs.readdirSync(scriptDir)
      .filter((f) => !f.toLowerCase().startsWith('readme') && !f.startsWith('.') && !f.endsWith('.zip'));

    for (const lang of languages) {
      for (const filename of files) {
        paths.push({
          params: { lang, slug, filename }
        });
      }
    }
  }

  return paths;
}

export const GET: APIRoute = ({ params }) => {
  const { slug, filename } = params;
  if (!slug || !filename) {
    return new Response('File not found', { status: 404 });
  }

  // Prevent directory traversal
  const safeFile = path.basename(filename);
  const filePath = path.resolve('src/content/hub', slug, safeFile);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return new Response('File not found', { status: 404 });
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
