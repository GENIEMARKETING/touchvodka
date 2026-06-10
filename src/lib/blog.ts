/**
 * Blog loader — reads the MDX files in src/content/blog at build time (RSC /
 * server only). The body is rendered as Markdown by the page (react-markdown +
 * remark-gfm); we deliberately avoid a heavy MDX runtime for a content-only blog.
 *
 * MIGRATION NOTE (S6): these posts are the seed for the shared Strapi `Article`
 * content type (site = touch-vodka). Once migrated, swap this fs reader for a
 * `strapiFetch('articles', …)` call — the `BlogPost` shape is the seam.
 *
 * Tiny dependency-free frontmatter parser (no gray-matter): the files use simple
 * `key: "value"` / `key: ["a","b"]` YAML, which is all we emit.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { mediaUrl } from '@/lib/media';

const BLOG_DIR = join(process.cwd(), 'src/content/blog');

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  body: string;
};

function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const [, fm, body] = match;
  const data: Record<string, unknown> = {};
  for (const line of (fm ?? '').split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rawVal] = kv;
    if (!key) continue;
    const val = (rawVal ?? '').trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      data[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else {
      data[key] = val.replace(/^["']|["']$/g, '');
    }
  }
  return { data, body: (body ?? '').trim() };
}

async function readPost(file: string): Promise<BlogPost> {
  const raw = await readFile(join(BLOG_DIR, file), 'utf8');
  const { data, body } = parseFrontmatter(raw);
  return {
    slug: file.replace(/\.mdx?$/, ''),
    title: String(data.title ?? ''),
    date: String(data.date ?? ''),
    excerpt: String(data.excerpt ?? ''),
    author: String(data.author ?? ''),
    category: String(data.category ?? 'General'),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    image: mediaUrl(String(data.image ?? '')),
    body,
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
  const posts = await Promise.all(files.map(readPost));
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostSlugs(): Promise<string[]> {
  const files = await readdir(BLOG_DIR);
  return files
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => f.replace(/\.mdx?$/, ''));
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    return await readPost(`${slug}.mdx`);
  } catch {
    return null;
  }
}
