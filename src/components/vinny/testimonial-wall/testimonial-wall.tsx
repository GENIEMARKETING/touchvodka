// Extensionless cross-block import: works in webpack (Next), Vite (Storybook), and
// tsc "Bundler" alike. A `.js` specifier resolves under tsc/NodeNext but Next's
// webpack does NOT map `.js` → `.tsx`, so a vendored composed block would fail
// `next build`. Keep composed-block imports extensionless.
import {
  type Testimonial,
  TestimonialImageCard,
} from '../testimonial-image-card/testimonial-image-card';

/**
 * TestimonialWall — the social-proof showcase: a marquee of `TestimonialImageCard`s
 * that auto-scrolls, pausing on hover/focus. Its "grid" and "marquee" forms are
 * the SAME block in two motion states (not a config variant): when the visitor
 * prefers reduced motion, pure CSS turns off the scroll, hides the loop clone, and
 * the cards wrap into a centered grid. No JS decides this — it resolves at first
 * paint, so there's no hydration flash and no layout shift either way (CLS = 0).
 *
 * Server component (zero client JS): the marquee is CSS, the cards are static.
 *
 * Variant-not-configuration: `heading` + `testimonials`. A *video* wall, or a
 * "logos" trust bar, would be a NEW block — compose alongside, don't add a
 * `type=` prop here.
 */
export type TestimonialWallProps = {
  heading?: string;
  testimonials: Testimonial[];
  className?: string;
};

// Scoped, static CSS so the block stays copy-paste self-contained (no tailwind.config
// keyframe edit needed). `prefers-reduced-motion: reduce` → no animation + wrapped grid.
const WALL_CSS = `
.gm-twall{overflow:hidden}
.gm-twall__viewport{display:flex;width:max-content}
.gm-twall__track{display:flex;flex:none;gap:1.5rem;padding-inline:.75rem;margin:0;list-style:none}
.gm-twall__item{width:min(20rem,80vw);flex:none}
@media (prefers-reduced-motion: no-preference){
  .gm-twall__viewport{animation:gm-twall-scroll 40s linear infinite}
  .gm-twall:hover .gm-twall__viewport,.gm-twall:focus-within .gm-twall__viewport{animation-play-state:paused}
}
@keyframes gm-twall-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media (prefers-reduced-motion: reduce){
  .gm-twall{overflow:visible}
  .gm-twall__viewport{width:100%;flex-wrap:wrap;justify-content:center}
  .gm-twall__track{width:100%;flex-wrap:wrap;justify-content:center}
  .gm-twall__clone{display:none}
}`;

export function TestimonialWall({ heading, testimonials, className }: TestimonialWallProps) {
  if (testimonials.length === 0) return null;
  return (
    <section className={className}>
      <style>{WALL_CSS}</style>
      {heading ? (
        <h2 className="mb-12 px-6 text-center font-bold text-3xl tracking-tight">{heading}</h2>
      ) : null}
      <div className="gm-twall">
        <div className="gm-twall__viewport">
          <ul className="gm-twall__track">
            {testimonials.map((t) => (
              <li key={t.id} className="gm-twall__item">
                <TestimonialImageCard testimonial={t} />
              </li>
            ))}
          </ul>
          {/* Seamless-loop clone — hidden from assistive tech and from the reduced-motion grid. */}
          <ul className="gm-twall__track gm-twall__clone" aria-hidden="true">
            {testimonials.map((t) => (
              <li key={`clone-${t.id}`} className="gm-twall__item">
                <TestimonialImageCard testimonial={t} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
