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
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
