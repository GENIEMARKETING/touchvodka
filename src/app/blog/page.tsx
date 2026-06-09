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
        eyebrow="// 03_JOURNAL"
        title="Journal"
        lead="Notes on craft, cocktails, and the pursuit of the perfect pour."
      />
      <div className="grid grid-cols-1 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col border-black border-r-2 border-b-2 p-8 transition-colors hover:bg-neutral-50"
          >
            <span className="mb-3 font-bold text-accent text-xs tracking-widest">
              [ {post.category} ]
            </span>
            <h2 className="mb-3 font-display text-3xl uppercase transition-colors group-hover:text-accent">
              {post.title}
            </h2>
            <p className="mb-6 font-mono text-sm lowercase opacity-70">{post.excerpt}</p>
            <span className="mt-auto font-mono text-xs lowercase opacity-50">{post.date}</span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
