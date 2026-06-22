import BlogImage from '@/components/BlogImage';
import PageShell from '@/components/PageShell';
import { getPost, getPostSlugs } from '@/lib/blog';
import { articleJsonLd, breadcrumbJsonLd, jsonLdScript, pageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Concise SEO <title> (Google truncates ~60 chars). The full, keyword-rich title
 * stays as the page <h1>; this clamps only the <title> and is returned as
 * `absolute` so the root "%s | Touch Vodka" template can't push it back over 60.
 */
function blogSeoTitle(post: { title: string; metaTitle?: string }): string {
  if (post.metaTitle) return post.metaTitle.slice(0, 60);
  const suffix = ' | Touch Vodka';
  if (post.title.length + suffix.length <= 60) return post.title + suffix;
  if (post.title.length <= 60) return post.title;
  return `${post.title.slice(0, 57).replace(/\s+\S*$/, '')}…`; // clamp at a word boundary
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Not found' };
  const meta = pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
    ogType: 'article',
    ...(post.image?.trim() ? { images: [{ url: post.image, alt: post.title }] } : {}),
  });
  return { ...meta, title: { absolute: blogSeoTitle(post) } };
}

export default async function BlogDetailPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const path = `/blog/${slug}`;

  return (
    <PageShell>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD; jsonLdScript escapes "<".
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            articleJsonLd({
              title: post.title,
              description: post.excerpt,
              image: post.image?.trim() || undefined,
              path,
              datePublished: post.date || undefined,
              author: post.author || undefined,
            }),
            breadcrumbJsonLd([
              { name: 'Journal', path: '/blog' },
              { name: post.title, path },
            ]),
          ]),
        }}
      />

      <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Link
          href="/blog"
          className="mb-8 inline-block font-display text-accent text-sm transition-transform duration-300 ease-brand hover:-translate-x-0.5"
        >
          ← Back to journal
        </Link>
        <p className="mb-3 font-mono text-accent text-xs uppercase tracking-[0.25em]">
          {post.category}
        </p>
        <h1 className="mb-4 font-display text-4xl text-fg uppercase leading-[0.95] md:text-6xl">
          {post.title}
        </h1>
        <p className="mb-8 font-mono text-neutral-500 text-sm uppercase tracking-widest">
          {post.date} · {post.author}
        </p>

        {/* Article hero image (Figma 55:84). */}
        <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-3xl bg-warm">
          <BlogImage
            src={post.image}
            fallbackSrc="/scenes/blog_featured.webp"
            alt={post.title}
            label={post.category}
            priority
            sizes="(max-width:768px) 100vw, 768px"
            className="object-cover"
          />
        </div>

        <div className="max-w-none font-sans text-neutral-700 leading-relaxed [&_a]:text-accent [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-fg [&_h2]:uppercase [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:text-fg [&_h3]:uppercase [&_li]:my-1 [&_p]:my-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
        </div>
      </article>
    </PageShell>
  );
}
