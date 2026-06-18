import PageShell, { PageHero } from '@/components/PageShell';
import { getAllPosts } from '@/lib/blog';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Stories on craft spirits, cocktails, and sustainability from the Touch Vodka journal.',
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <PageShell>
      <PageHero
        eyebrow="The Journal"
        title="Journal"
        lead="Notes on craft, cocktails, and the pursuit of the perfect pour."
      />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-20 md:grid-cols-2 md:px-10 md:py-28">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-3xl bg-neutral-50 p-8 shadow-soft transition-all duration-300 ease-brand hover:-translate-y-1 hover:shadow-soft-lg md:p-10"
          >
            <span className="mb-3 font-mono text-accent text-xs uppercase tracking-widest">
              {post.category}
            </span>
            <h2 className="mb-3 font-display text-2xl text-fg uppercase transition-colors group-hover:text-accent md:text-3xl">
              {post.title}
            </h2>
            <p className="mb-6 line-clamp-3 text-neutral-600 leading-relaxed">{post.excerpt}</p>
            <span className="mt-auto text-neutral-400 text-sm">{post.date}</span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
