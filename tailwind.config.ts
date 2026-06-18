import type { Config } from 'tailwindcss';

/**
 * @geniemarketing/ui + @geniemarketing/blocks emit Tailwind utility classes, so their source must
 * be in `content` for those classes to survive purge. Blocks are copied into
 * src/components/vinny (we own them), so the default src glob already covers
 * them. Brand colors are referenced as CSS variables (defined in
 * src/app/globals.css) so a re-skin is one file.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './node_modules/@geniemarketing/ui/dist/**/*.js'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--brand)',
        'brand-fg': 'var(--brand-fg)',
        surface: 'var(--surface)',
        fg: 'var(--fg)',
        // Touch Vodka neo-brutalist accent (alias of --brand).
        accent: 'var(--accent)',
        industrial: 'var(--industrial)',
        concrete: 'var(--concrete)',
        warm: 'var(--warm)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      // Refined Bold: a soft elevation to replace the brutalist hard-offset shadow.
      boxShadow: {
        soft: '0 18px 40px -16px rgb(10 10 10 / 0.20)',
        'soft-lg': '0 32px 64px -24px rgb(10 10 10 / 0.28)',
        'brand-glow': '0 16px 48px -12px rgb(0 85 255 / 0.32)',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
