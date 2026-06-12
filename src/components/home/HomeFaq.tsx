import { BRAND_FAQ, faqJsonLd, jsonLdScript } from '@/lib/seo';

/**
 * Homepage FAQ (T46, AEO) — visible answer-shaped content + the matching FAQPage
 * JSON-LD, both rendered from the single `BRAND_FAQ` source so the structured data
 * always mirrors what's on the page (a Google FAQ requirement). This is a server
 * component, so the Q&A ships in the raw SSR HTML — which is what AI crawlers read.
 */
export default function HomeFaq() {
  return (
    <section id="faq" className="border-black border-b-4">
      <div className="border-black border-b-4 bg-neutral-50 p-8 md:p-12">
        <span className="mb-2 block font-bold text-accent text-sm tracking-[0.3em]">
          {'// 02_FAQ'}
        </span>
        <h2 className="text-5xl md:text-7xl">Common Questions</h2>
      </div>
      <dl className="divide-y-2 divide-black">
        {BRAND_FAQ.map((item) => (
          <div key={item.question} className="p-8 md:p-12">
            <dt className="mb-3 text-2xl md:text-3xl">{item.question}</dt>
            <dd className="max-w-2xl font-mono text-sm opacity-80">{item.answer}</dd>
          </div>
        ))}
      </dl>
      {/* FAQPage structured data — mirrors the visible Q&A above (S4 · T46). */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD; jsonLdScript escapes "<".
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd()) }}
      />
    </section>
  );
}
