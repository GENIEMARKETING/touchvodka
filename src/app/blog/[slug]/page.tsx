import PageShell from '@/components/PageShell';
import { getPost, getPostSlugs } from '@/lib/blog';
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

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Not found' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: 'article' },
  };
}

export default async function BlogDetailPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/blog"
          className="mb-8 inline-block font-mono text-accent text-sm lowercase hover:underline"
        >
          ← back to journal
        </Link>
        <span className="mb-3 block font-bold text-accent text-xs tracking-widest">
          [ {post.category} ]
        </span>
        <h1 className="mb-4 font-display text-5xl uppercase leading-[0.9] md:text-6xl">
          {post.title}
        </h1>
        <p className="mb-12 font-mono text-sm lowercase opacity-50">
          {post.date} · {post.author}
        </p>
        <div className="prose prose-neutral max-w-none font-mono [&_a]:text-accent [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:uppercase [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:uppercase [&_li]:my-1 [&_p]:my-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
        </div>
      </article>
    </PageShell>
  );
}
