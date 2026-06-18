import BlogImage from '@/components/BlogImage';
import PageShell, { PageHero } from '@/components/PageShell';
import { getAllPosts } from '@/lib/blog';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Stories on craft spirits, cocktails, and sustainability from the Touch Vodka journal.',
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <PageShell>
      <PageHero
        eyebrow="The Journal"
        title="Journal"
        watermark="Journal"
        lead="Notes on craft, cocktails, and the pursuit of the perfect pour."
      />

      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        {/* Featured story */}
        {featured ? (
          <Link
            href={`/blog/${featured.slug}`}
            className="group mb-14 grid items-center gap-8 overflow-hidden rounded-3xl border border-concrete/60 bg-white shadow-soft transition-all duration-300 ease-brand hover:-translate-y-1 hover:shadow-soft-lg md:grid-cols-2"
          >
            <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:h-full md:min-h-[340px]">
              <BlogImage
                src={featured.image}
                alt={featured.title}
                label={featured.category}
                sizes="(max-width:768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-8 md:p-10">
              <p className="font-mono text-accent text-xs uppercase tracking-[0.2em]">
                {featured.category}
              </p>
              <h2 className="mt-3 font-display text-3xl text-fg uppercase transition-colors group-hover:text-accent md:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-4 line-clamp-3 text-neutral-600 leading-relaxed">
                {featured.excerpt}
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 font-display text-accent text-sm">
                Read more
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ) : null}

        {/* Post grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-concrete/60 bg-white shadow-soft transition-all duration-300 ease-brand hover:-translate-y-1 hover:shadow-soft-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <BlogImage
                  src={post.image}
                  alt={post.title}
                  label={post.category}
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="font-mono text-accent text-xs uppercase tracking-[0.2em]">
                  {post.category}
                </p>
                <h2 className="mt-2 font-display text-xl text-fg uppercase transition-colors group-hover:text-accent">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-neutral-600 text-sm leading-relaxed">
                  {post.excerpt}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 font-display text-accent text-sm">
                  Read more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
