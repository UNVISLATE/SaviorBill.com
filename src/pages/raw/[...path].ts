import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute } from 'astro';

export function getStaticPaths() {
  const rawDir = path.resolve('src/content/raw');
  if (!fs.existsSync(rawDir)) return [];

  function getAllFiles(dir: string, base = ''): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of list) {
      const relPath = base ? `${base}/${file.name}` : file.name;
      if (file.isDirectory()) {
        results = results.concat(getAllFiles(path.join(dir, file.name), relPath));
      } else {
        results.push(relPath);
      }
    }
    return results;
  }

  const files = getAllFiles(rawDir);
  return files.map((filePath) => ({
    params: { path: filePath }
  }));
}

export const GET: APIRoute = ({ params }) => {
  const filePath = params.path;
  if (!filePath) {
    return new Response('File path not provided', { status: 400 });
  }

  const fullPath = path.resolve('src/content/raw', filePath);
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    return new Response('Not found', { status: 404 });
  }

  const content = fs.readFileSync(fullPath);
  
  // Determine content type
  let contentType = 'text/plain; charset=utf-8';
  if (filePath.endsWith('.json')) contentType = 'application/json; charset=utf-8';
  else if (filePath.endsWith('.sh') || filePath.endsWith('.bash')) contentType = 'text/x-shellscript; charset=utf-8';
  else if (filePath.endsWith('.lua')) contentType = 'text/x-lua; charset=utf-8';
  else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) contentType = 'text/yaml; charset=utf-8';
  else if (filePath.endsWith('.zip')) contentType = 'application/zip';

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
