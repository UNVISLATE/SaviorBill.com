import type { APIContext } from 'astro';
import { generateBlogRss } from '../utils/rss';

export async function GET(context: APIContext) {
  return generateBlogRss(context, 'ru');
}
