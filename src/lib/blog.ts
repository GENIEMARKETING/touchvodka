/**
 * Blog loader — reads the MDX files in src/content/blog at build time (RSC /
 * server only). The body is rendered as Markdown by the page (react-markdown +
 * remark-gfm); we deliberately avoid a heavy MDX runtime for a content-only blog.
 *
 * CMS WIRING (S6, 2026-06-13): each loader now tries the shared Strapi `Article`
 * type first (via the tenant-scoped `getArticles`) and falls back to these MDX
 * files when the CMS is unwired/empty — so a brand renders from Strapi the moment
 * its content lands, with zero consumer changes (the `BlogPost` shape is the seam)
 * and no risk to the build pre-migration. Strapi is the source of truth once live.
 *
 * Tiny dependency-free frontmatter parser (no gray-matter): the files use simple
 * `key: "value"` / `key: ["a","b"]` YAML, which is all we emit.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { mediaUrl } from '@/lib/media';
import { type StrapiArticle, getArticles } from '@/lib/strapi';

const BLOG_DIR = join(process.cwd(), 'src/content/blog');

export type BlogPost = {
  slug: string;
  title: string;
  /** Optional concise SEO <title> (≤60 chars). Falls back to a clamped `title`. Fixes title_too_long. */
  metaTitle?: string;
  date: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  /** Bold card thumbnail (auto-blog `<slug>-thumb.png`). Falls back to `image`. */
  thumbnail: string;
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
  const image = mediaUrl(String(data.image ?? ''));
  return {
    slug: file.replace(/\.mdx?$/, ''),
    title: String(data.title ?? ''),
    metaTitle: data.metaTitle ? String(data.metaTitle) : undefined,
    date: String(data.date ?? ''),
    excerpt: String(data.excerpt ?? ''),
    author: String(data.author ?? ''),
    category: String(data.category ?? 'General'),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    image,
    thumbnail: data.thumbnail ? mediaUrl(String(data.thumbnail)) : image,
    body,
  };
}

// ── Strapi `Article` → BlogPost mapping (tolerant of v5/v4 + field-name variants) ──

function str(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  return v == null ? fallback : String(v);
}

/** A Strapi media field → URL, tolerant of v5 object / v4 `{data:{attributes}}` / plain string. */
function mediaField(v: unknown): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return mediaField(v[0]);
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if (typeof o.url === 'string') return o.url; // v5 populated media
    if (o.data && typeof o.data === 'object') {
      const a = (o.data as Record<string, unknown>).attributes as
        | Record<string, unknown>
        | undefined;
      if (a && typeof a.url === 'string') return a.url; // v4 nested
    }
  }
  return '';
}

function mapArticle(rec: StrapiArticle): BlogPost {
  const r = rec as Record<string, unknown>;
  const category = r.category;
  const categoryName =
    typeof category === 'string'
      ? category
      : str((category as Record<string, unknown> | undefined)?.name, 'General');
  const image = mediaUrl(mediaField(r.image ?? r.featured_image ?? r.cover));
  const thumb = mediaField(r.thumbnail);
  return {
    slug: str(r.slug),
    title: str(r.title),
    metaTitle: str(r.metaTitle ?? r.seoTitle ?? r.meta_title) || undefined,
    date: str(r.date ?? r.publishedAt ?? r.published_at),
    excerpt: str(r.excerpt),
    author: str(r.author, 'admin'),
    category: categoryName || 'General',
    tags: Array.isArray(r.tags) ? (r.tags as unknown[]).map((t) => str(t)).filter(Boolean) : [],
    image,
    thumbnail: thumb ? mediaUrl(thumb) : image,
    body: str(r.body ?? r.content),
  };
}

const byDateDesc = (a: BlogPost, b: BlogPost): number => (a.date < b.date ? 1 : -1);

/**
 * Defensive dedupe by slug — keep the first occurrence (newest, after byDateDesc).
 * The CMS should hold one entry per slug, but the content-autopilot can briefly
 * create two docs with the same slug (Strapi `slug` isn't unique), and a duplicate
 * card must never reach the page. Belt-and-suspenders alongside the workflow dedupe.
 */
function dedupeBySlug(posts: BlogPost[]): BlogPost[] {
  const seen = new Set<string>();
  return posts.filter((p) => {
    if (!p.slug || seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
}

async function readMdxPosts(): Promise<BlogPost[]> {
  const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
  const posts = await Promise.all(files.map(readPost));
  return posts.sort(byDateDesc);
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const cms = await getArticles();
  if (cms) return dedupeBySlug(cms.map(mapArticle).sort(byDateDesc));
  return readMdxPosts();
}

export async function getPostSlugs(): Promise<string[]> {
  const cms = await getArticles();
  if (cms) {
    return [...new Set(cms.map((r) => str((r as Record<string, unknown>).slug)).filter(Boolean))];
  }
  const files = await readdir(BLOG_DIR);
  return files
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => f.replace(/\.mdx?$/, ''));
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const cms = await getArticles();
  if (cms) return cms.map(mapArticle).find((p) => p.slug === slug) ?? null;
  try {
    return await readPost(`${slug}.mdx`);
  } catch {
    return null;
  }
}
