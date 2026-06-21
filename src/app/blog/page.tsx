import BlogImage from '@/components/BlogImage';
import PageShell, { PageHero } from '@/components/PageShell';
import { getAllPosts } from '@/lib/blog';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Stories on craft spirits, cocktails, and sustainability from the Touch Vodka journal.',
};

/** Scene fallbacks so the blog looks photographed while real article imagery is pending. */
const BLOG_SCENES = [
  '/scenes/blog_cocktails.webp',
  '/scenes/blog_whatis.webp',
  '/scenes/blog_store.webp',
  '/scenes/banner_cocktails.webp',
];

/** Posts per page in the grid (the featured story sits above page 1 only). */
const PAGE_SIZE = 9;

type Params = { searchParams: Promise<{ page?: string }> };

export default async function BlogPage({ searchParams }: Params) {
  const posts = await getAllPosts();
  const [featured, ...rest] = posts;

  // URL-driven pagination (SSR + SEO-friendly). The featured story is excluded
  // from the paginated set, so the offset math stays clean.
  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const requested = Number.parseInt((await searchParams).page ?? '1', 10);
  const page = Number.isNaN(requested) ? 1 : Math.min(Math.max(requested, 1), totalPages);
  const pageItems = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFirst = page === 1;

  return (
    <PageShell>
      <PageHero
        eyebrow="The Journal"
        title="Journal"
        watermark="Journal"
        lead="Notes on craft, cocktails, and the pursuit of the perfect pour."
      />

      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        {/* Featured story — page 1 only */}
        {isFirst && featured ? (
          <Link
            href={`/blog/${featured.slug}`}
            className="group mb-14 grid items-center gap-8 overflow-hidden rounded-3xl border border-concrete/60 bg-white shadow-soft transition-all duration-300 ease-brand hover:-translate-y-1 hover:shadow-soft-lg md:grid-cols-2"
          >
            <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:h-full md:min-h-[340px]">
              <BlogImage
                src={featured.thumbnail}
                fallbackSrc={featured.image || '/scenes/blog_featured.webp'}
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
          {pageItems.map((post, idx) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-concrete/60 bg-white shadow-soft transition-all duration-300 ease-brand hover:-translate-y-1 hover:shadow-soft-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <BlogImage
                  src={post.thumbnail}
                  fallbackSrc={
                    post.image || BLOG_SCENES[((page - 1) * PAGE_SIZE + idx) % BLOG_SCENES.length]
                  }
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

        {/* Pagination */}
        {totalPages > 1 ? (
          <nav
            aria-label="Blog pages"
            className="mt-14 flex items-center justify-center gap-2 font-display text-sm"
          >
            {page > 1 ? (
              <Link
                href={page - 1 === 1 ? '/blog' : `/blog?page=${page - 1}`}
                rel="prev"
                aria-label="Previous page"
                className="inline-flex items-center gap-1.5 rounded-full border border-concrete px-5 py-2.5 text-fg transition-colors hover:border-fg"
              >
                <ArrowLeft className="h-4 w-4" /> Prev
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-concrete/50 px-5 py-2.5 text-neutral-300">
                <ArrowLeft className="h-4 w-4" /> Prev
              </span>
            )}

            <ul className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <li key={n}>
                  <Link
                    href={n === 1 ? '/blog' : `/blog?page=${n}`}
                    aria-current={n === page ? 'page' : undefined}
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 transition-colors ${
                      n === page
                        ? 'bg-accent text-white'
                        : 'border border-concrete text-fg hover:border-fg'
                    }`}
                  >
                    {n}
                  </Link>
                </li>
              ))}
            </ul>

            {page < totalPages ? (
              <Link
                href={`/blog?page=${page + 1}`}
                rel="next"
                aria-label="Next page"
                className="inline-flex items-center gap-1.5 rounded-full border border-concrete px-5 py-2.5 text-fg transition-colors hover:border-fg"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-concrete/50 px-5 py-2.5 text-neutral-300">
                Next <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </nav>
        ) : null}
      </div>
    </PageShell>
  );
}
